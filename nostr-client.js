// Nostr Client Integration for Discussions
class NostrClient {
    constructor() {
        this.relays = NOSTR_CONFIG.DEFAULT_RELAYS;
        this.relayPool = null;
        this.connectedRelays = new Set();
        this.publicKey = null;
        this.privateKey = null;
        this.whitelistedUsers = new Set();
        this.isConnected = false;
        
        this.initializeRelayPool();
        this.loadWhitelistedUsers();
    }

    async initializeRelayPool() {
        try {
            // Initialize relay pool using nostr-tools
            this.relayPool = new NostrTools.SimplePool();
            
            // Connect to relays
            for (const relay of this.relays) {
                try {
                    await this.relayPool.ensureRelay(relay);
                    this.connectedRelays.add(relay);
                    console.log(`Connected to relay: ${relay}`);
                } catch (error) {
                    console.error(`Failed to connect to relay ${relay}:`, error);
                }
            }
        } catch (error) {
            console.error('Failed to initialize relay pool:', error);
        }
    }

    async loadWhitelistedUsers() {
        try {
            // Load the NIP-05 whitelist from our site's nostr.json
            const response = await fetch('/.well-known/nostr.json');
            const nip05Data = await response.json();
            
            // Add all users from the NIP-05 file to whitelist
            if (nip05Data.names) {
                Object.values(nip05Data.names).forEach(pubkey => {
                    this.whitelistedUsers.add(pubkey);
                });
            }
            
            console.log(`Loaded ${this.whitelistedUsers.size} whitelisted users`);
        } catch (error) {
            console.error('Failed to load whitelisted users:', error);
        }
    }

    async connectWithExtension() {
        try {
            if (!window.nostr) {
                throw new Error('No Nostr extension found. Please install a Nostr browser extension like nos2x or Alby.');
            }

            // Get public key from extension
            this.publicKey = await window.nostr.getPublicKey();
            this.isConnected = true;
            
            console.log('Connected to Nostr with pubkey:', this.publicKey);
            return true;
        } catch (error) {
            console.error('Failed to connect with extension:', error);
            throw error;
        }
    }

    async sendDirectMessage(recipientPubkey, content) {
        try {
            if (!this.isConnected || !window.nostr) {
                throw new Error('Not connected to Nostr');
            }

            // Create DM event
            const dmEvent = {
                kind: 4, // Direct Message
                created_at: Math.floor(Date.now() / 1000),
                tags: [['p', recipientPubkey]],
                content: content,
            };

            // Sign and send the event using extension
            const signedEvent = await window.nostr.signEvent(dmEvent);
            
            // Publish to relays
            await this.relayPool.publish(Array.from(this.connectedRelays), signedEvent);
            
            return signedEvent;
        } catch (error) {
            console.error('Failed to send DM:', error);
            throw error;
        }
    }

    async sendAccessRequest(name, reason, requestPubkey = null) {
        try {
            const userPubkey = requestPubkey || this.publicKey;
            if (!userPubkey) {
                throw new Error('No public key available');
            }

            const requestContent = `
🌾 WHITELIST REQUEST - Shenandoah Datacenter Festival

Name: ${name}
Public Key: ${userPubkey}
Domain: ${NOSTR_CONFIG.SITE_INFO.domain}

Reason for joining:
${reason}

Please add this user to the NIP-05 whitelist at ${NOSTR_CONFIG.SITE_INFO.domain}/.well-known/nostr.json

This is an automated request from the festival website.
            `.trim();

            // Convert admin npub to hex if needed
            let adminPubkey = NOSTR_CONFIG.ADMIN_NPUB;
            if (adminPubkey.startsWith('npub1')) {
                // Convert npub to hex using nostr-tools
                adminPubkey = NostrTools.nip19.decode(adminPubkey).data;
            }

            await this.sendDirectMessage(adminPubkey, requestContent);
            return true;
        } catch (error) {
            console.error('Failed to send access request:', error);
            throw error;
        }
    }

    async publishPost(content) {
        try {
            if (!this.isConnected || !window.nostr) {
                throw new Error('Not connected to Nostr');
            }

            if (!this.isWhitelisted(this.publicKey)) {
                throw new Error('Not whitelisted for posting');
            }

            // Create note event
            const noteEvent = {
                kind: 1, // Text Note
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ['t', 'frederick-county'],
                    ['t', 'agriculture'],
                    ['t', 'shenandoah-datacenter-festival']
                ],
                content: content,
            };

            // Sign and send the event
            const signedEvent = await window.nostr.signEvent(noteEvent);
            await this.relayPool.publish(Array.from(this.connectedRelays), signedEvent);
            
            return signedEvent;
        } catch (error) {
            console.error('Failed to publish post:', error);
            throw error;
        }
    }

    async loadRecentPosts(limit = 20) {
        try {
            if (!this.relayPool || this.connectedRelays.size === 0) {
                return [];
            }

            // Create filter for posts from whitelisted users
            const whitelistedArray = Array.from(this.whitelistedUsers);
            
            const filter = {
                kinds: [1], // Text notes only
                authors: whitelistedArray,
                '#t': ['frederick-county', 'agriculture', 'shenandoah-datacenter-festival'],
                limit: limit
            };

            // Query relays
            const events = await this.relayPool.list(Array.from(this.connectedRelays), [filter]);
            
            // Sort by creation time (newest first)
            events.sort((a, b) => b.created_at - a.created_at);
            
            return events;
        } catch (error) {
            console.error('Failed to load posts:', error);
            return [];
        }
    }

    async loadCommentsForPost(postId, limit = 50) {
        try {
            const filter = {
                kinds: [1], // Text notes
                '#e': [postId], // Replies to the post
                limit: limit
            };

            const events = await this.relayPool.list(Array.from(this.connectedRelays), [filter]);
            
            // Filter to only whitelisted users
            const whitelistedComments = events.filter(event => 
                this.isWhitelisted(event.pubkey)
            );
            
            // Sort by creation time
            whitelistedComments.sort((a, b) => a.created_at - b.created_at);
            
            return whitelistedComments;
        } catch (error) {
            console.error('Failed to load comments:', error);
            return [];
        }
    }

    async publishComment(postId, content) {
        try {
            if (!this.isConnected || !window.nostr) {
                throw new Error('Not connected to Nostr');
            }

            if (!this.isWhitelisted(this.publicKey)) {
                throw new Error('Not whitelisted for commenting');
            }

            // Create reply event
            const replyEvent = {
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ['e', postId], // Reply to post
                    ['t', 'frederick-county'],
                    ['t', 'agriculture']
                ],
                content: content,
            };

            const signedEvent = await window.nostr.signEvent(replyEvent);
            await this.relayPool.publish(Array.from(this.connectedRelays), signedEvent);
            
            return signedEvent;
        } catch (error) {
            console.error('Failed to publish comment:', error);
            throw error;
        }
    }

    isWhitelisted(pubkey) {
        return this.whitelistedUsers.has(pubkey);
    }

    isConnectedUser() {
        return this.isConnected && this.publicKey;
    }

    canPost() {
        return this.isConnectedUser() && this.isWhitelisted(this.publicKey);
    }

    disconnect() {
        this.isConnected = false;
        this.publicKey = null;
        this.privateKey = null;
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString();
    }

    getUserDisplayName(pubkey) {
        // This would typically fetch from user profile events
        // For now, return a truncated pubkey
        return pubkey ? `${pubkey.substring(0, 8)}...` : 'Anonymous';
    }

    getUserNip05(pubkey) {
        // Check our local NIP-05 mapping
        try {
            // This would be loaded from the nostr.json
            // For now, return generic format
            return `${pubkey.substring(0, 8)}@${NOSTR_CONFIG.SITE_INFO.domain}`;
        } catch {
            return null;
        }
    }
}

// Global instance
window.nostrClient = new NostrClient();