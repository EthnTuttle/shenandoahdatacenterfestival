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
        this.relaysReady = false;
        
        this.initializeRelayPool();
        this.loadWhitelistedUsers();
    }

    async initializeRelayPool() {
        try {
            // Initialize relay pool using nostr-tools
            this.relayPool = new NostrTools.SimplePool();
            
            // Connect to relays
            const connectionPromises = this.relays.map(async (relay) => {
                try {
                    await this.relayPool.ensureRelay(relay);
                    this.connectedRelays.add(relay);
                    console.log(`Connected to relay: ${relay}`);
                    return true;
                } catch (error) {
                    console.error(`Failed to connect to relay ${relay}:`, error);
                    return false;
                }
            });
            
            // Wait for all connection attempts
            await Promise.all(connectionPromises);
            
            // Mark relays as ready
            this.relaysReady = true;
            console.log(`Relays ready! Connected to ${this.connectedRelays.size} relays`);
            
            // Notify that relays are ready
            setTimeout(() => {
                if (window.discussionsApp && window.discussionsApp.onRelaysReady) {
                    console.log('Calling onRelaysReady callback...');
                    window.discussionsApp.onRelaysReady();
                } else {
                    console.log('discussionsApp not ready yet, will load on auto-refresh');
                }
            }, 100); // Small delay to ensure discussionsApp is initialized
            
        } catch (error) {
            console.error('Failed to initialize relay pool:', error);
        }
    }

    async loadWhitelistedUsers() {
        try {
            // Load the NIP-05 whitelist from our site's nostr.json
            const response = await fetch('/.well-known/nostr.json');
            const nip05Data = await response.json();
            
            // Store the NIP-05 data for later use
            this.nip05Data = nip05Data;
            
            // Add all users from the NIP-05 file to whitelist
            if (nip05Data.names) {
                Object.values(nip05Data.names).forEach(pubkey => {
                    this.whitelistedUsers.add(pubkey);
                });
            }
            
            console.log(`Loaded ${this.whitelistedUsers.size} whitelisted users from NIP-05:`, Array.from(this.whitelistedUsers));
            console.log('NIP-05 names mapping:', nip05Data.names);
        } catch (error) {
            console.error('Failed to load whitelisted users:', error);
            // Fallback: ensure we have basic functionality even if nostr.json fails
            this.whitelistedUsers.clear();
            this.nip05Data = { names: {}, relays: {} };
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
🌾 NIP-05 VERIFICATION REQUEST - Shenandoah Datacenter Festival

Name: ${name}
Public Key: ${userPubkey}
Domain: ${NOSTR_CONFIG.SITE_INFO.domain}

Reason for verification:
${reason}

Please add this user to the NIP-05 verification list at ${NOSTR_CONFIG.SITE_INFO.domain}/.well-known/nostr.json

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
                console.warn('No relay pool or connected relays available');
                return [];
            }
            
            if (!this.relaysReady) {
                console.log('Relays not ready yet, waiting...');
                // Wait up to 10 seconds for relays to be ready
                for (let i = 0; i < 100; i++) {
                    if (this.relaysReady) break;
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                if (!this.relaysReady) {
                    console.error('Timeout waiting for relays to be ready');
                    return [];
                }
            }

            // Create filter for posts from whitelisted users
            const whitelistedArray = Array.from(this.whitelistedUsers);
            console.log('Loading posts from whitelisted users:', whitelistedArray);
            
            if (whitelistedArray.length === 0) {
                console.warn('No whitelisted users found - loading all recent posts with required tags');
                const requiredTags = ['frederick-county', 'agriculture', 'shenandoah-datacenter-festival'];
                
                const fallbackFilter = {
                    kinds: [1], // Text notes only
                    '#t': requiredTags,
                    limit: limit,
                    since: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) // Last 30 days
                };
                
                try {
                    const events = await this.relayPool.querySync(Array.from(this.connectedRelays), fallbackFilter);
                    console.log('Loaded events (no whitelist):', events.length);
                    events.sort((a, b) => b.created_at - a.created_at);
                    return events;
                } catch (error) {
                    console.error('Fallback query failed:', error.message);
                    return [];
                }
            }
            
            // Only get events that have the EXACT same tags we use when posting
            // This ensures consistency and relevance to our festival discussions
            const requiredTags = ['frederick-county', 'agriculture', 'shenandoah-datacenter-festival'];
            
            const filter = {
                kinds: [1],
                authors: whitelistedArray,
                '#t': requiredTags, // Must have at least one of our tags
                limit: limit,
                since: Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60) // Last 90 days
            };
            
            const filters = [filter];
            
            console.log('Querying relays with filters:', filters);

            // Query relays - use the correct API method
            let events = [];
            const relayUrls = Array.from(this.connectedRelays);
            
            console.log('Querying relays:', relayUrls, 'with filter:', filter);
            
            try {
                // Use querySync which is the correct method for SimplePool
                events = await this.relayPool.querySync(relayUrls, filter);
                console.log('Successfully queried relays, got', events.length, 'events');
            } catch (error) {
                console.error('Failed to query relays:', error.message);
                // Try the get method for single events
                try {
                    const singleEvent = await this.relayPool.get(relayUrls, filter);
                    if (singleEvent) {
                        events = [singleEvent];
                        console.log('Got single event via get() method');
                    }
                } catch (altError) {
                    console.error('All query methods failed:', altError.message);
                    return [];
                }
            }
            
            // Remove duplicates based on event id
            const uniqueEvents = events.filter((event, index, self) => 
                index === self.findIndex(e => e.id === event.id)
            );
            console.log('Loaded unique events from whitelisted users:', uniqueEvents.length);
            
            // Separate top-level posts from replies
            const topLevelPosts = uniqueEvents.filter(event => {
                // Top-level posts don't have 'e' tags (not replies to other posts)
                return !event.tags.some(tag => tag[0] === 'e');
            });
            
            console.log('Filtered to top-level posts only:', topLevelPosts.length, 'of', uniqueEvents.length, 'total events');
            
            // Sort by creation time (newest first)
            topLevelPosts.sort((a, b) => b.created_at - a.created_at);
            
            return topLevelPosts;
        } catch (error) {
            console.error('Failed to load posts:', error);
            return [];
        }
    }

    async loadCommentsForPost(postId, limit = 50) {
        try {
            if (!this.relaysReady) {
                console.log('Relays not ready for comment loading, waiting...');
                for (let i = 0; i < 50; i++) {
                    if (this.relaysReady) break;
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                if (!this.relaysReady) {
                    console.error('Timeout waiting for relays for comment loading');
                    return [];
                }
            }

            const filter = {
                kinds: [1], // Text notes
                '#e': [postId], // Replies to the post
                limit: limit,
                since: Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60) // Last 90 days
            };

            console.log('Loading comments for post:', postId, 'with filter:', filter);

            let events = [];
            try {
                events = await this.relayPool.querySync(Array.from(this.connectedRelays), filter);
                console.log('Successfully loaded', events.length, 'raw comments for post', postId.substring(0, 8));
            } catch (error) {
                console.error('Comment query failed:', error.message);
                return [];
            }
            
            // Filter to only whitelisted users and events that are actually replies to this post
            const whitelistedComments = events.filter(event => {
                const isWhitelisted = this.isWhitelisted(event.pubkey);
                const isReplyToPost = event.tags.some(tag => 
                    tag[0] === 'e' && tag[1] === postId
                );
                
                console.log(`Comment ${event.id.substring(0, 8)}: whitelisted=${isWhitelisted}, isReply=${isReplyToPost}`);
                return isWhitelisted && isReplyToPost;
            });
            
            console.log('Filtered to', whitelistedComments.length, 'valid comments');
            
            // Sort by creation time (oldest first for comments)
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
                    ['t', 'agriculture'],
                    ['t', 'shenandoah-datacenter-festival']
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
        // Check if we have a name mapping in our NIP-05 data
        if (this.nip05Data && this.nip05Data.names) {
            for (const [name, mappedPubkey] of Object.entries(this.nip05Data.names)) {
                if (mappedPubkey === pubkey) {
                    return name;
                }
            }
        }
        
        // Fallback to truncated pubkey
        return pubkey ? `${pubkey.substring(0, 8)}...` : 'Anonymous';
    }

    getUserNip05(pubkey) {
        // Check our local NIP-05 mapping
        if (this.nip05Data && this.nip05Data.names) {
            for (const [name, mappedPubkey] of Object.entries(this.nip05Data.names)) {
                if (mappedPubkey === pubkey) {
                    return `${name}@${NOSTR_CONFIG.SITE_INFO.domain}`;
                }
            }
        }
        
        // Return null if not found in our NIP-05 mapping
        return null;
    }

    // Debug function for testing specific events
    async testEventQuery(eventId = null, author = null) {
        console.log('=== DEBUG EVENT QUERY ===');
        console.log('Event ID:', eventId);
        console.log('Author:', author);
        console.log('Connected relays:', Array.from(this.connectedRelays));
        console.log('Whitelisted users:', Array.from(this.whitelistedUsers));
        
        const testFilters = [];
        
        if (eventId) {
            testFilters.push({ kinds: [1], ids: [eventId] });
        }
        
        if (author) {
            testFilters.push({ 
                kinds: [1], 
                authors: [author], 
                limit: 50 
            });
        }
        
        // General test filter
        testFilters.push({ 
            kinds: [1], 
            limit: 20,
            since: Math.floor(Date.now() / 1000) - (180 * 24 * 60 * 60) // 6 months
        });
        
        for (let i = 0; i < testFilters.length; i++) {
            const filter = testFilters[i];
            console.log(`Testing filter ${i + 1}:`, filter);
            
            try {
                let events = [];
                try {
                    events = await this.relayPool.querySync(
                        Array.from(this.connectedRelays), 
                        filter
                    );
                } catch (error) {
                    console.error(`Debug query failed:`, error.message);
                    events = [];
                }
                console.log(`Filter ${i + 1} results:`, events.length, 'events');
                events.forEach(event => {
                    console.log(`- Event ${event.id.substring(0, 8)}... by ${event.pubkey.substring(0, 8)}... at ${new Date(event.created_at * 1000).toLocaleString()}`);
                    console.log(`  Tags:`, event.tags);
                    console.log(`  Content:`, event.content.substring(0, 100) + '...');
                });
            } catch (error) {
                console.error(`Filter ${i + 1} error:`, error);
            }
        }
        
        return true;
    }
}

// Global instance
window.nostrClient = new NostrClient();