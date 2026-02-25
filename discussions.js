// Discussions Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    let currentUser = null;
    let posts = [];
    let isLoading = false;

    // DOM Elements
    const elements = {
        // Auth elements
        notAuthenticated: document.getElementById('not-authenticated'),
        authenticated: document.getElementById('authenticated'),
        requestAccessForm: document.getElementById('request-access-form'),
        connectNostrBtn: document.getElementById('connect-nostr'),
        requestAccessBtn: document.getElementById('request-access'),
        disconnectBtn: document.getElementById('disconnect'),
        cancelRequestBtn: document.getElementById('cancel-request'),
        
        // User info elements
        userName: document.getElementById('user-name'),
        userNip05: document.getElementById('user-nip05'),
        verificationStatus: document.getElementById('verification-status'),
        
        // Post creation
        postCreation: document.getElementById('post-creation'),
        postContent: document.getElementById('post-content'),
        submitPost: document.getElementById('submit-post'),
        charCount: document.querySelector('.char-count'),
        
        // Feed elements
        postsContainer: document.getElementById('posts-container'),
        loadingPosts: document.getElementById('loading-posts'),
        noPosts: document.getElementById('no-posts'),
        refreshFeed: document.getElementById('refresh-feed'),
        sortPosts: document.getElementById('sort-posts'),
        
        // Modal elements
        nostrHelpModal: document.getElementById('nostr-help-modal'),
        closeHelp: document.getElementById('close-help'),
        
        // Form elements
        accessRequestForm: document.getElementById('access-request-form'),
        requestNpub: document.getElementById('request-npub'),
        requestName: document.getElementById('request-name'),
        requestReason: document.getElementById('request-reason')
    };

    // Initialize
    init();

    async function init() {
        setupEventListeners();
        checkAuthState();
        
        console.log('Discussions page initialized - waiting for relays...');
        
        // Set up auto-refresh every 30 seconds
        setInterval(async () => {
            console.log('Auto-refreshing feed...');
            await loadFeed();
        }, 30000); // 30 seconds
    }
    
    // Called when relays are ready
    async function onRelaysReady() {
        console.log('Relays are ready! Loading initial feed...');
        await loadFeed();
        console.log('Initial feed loaded. Auto-refresh active every 30 seconds.');
    }

    function setupEventListeners() {
        // Auth buttons
        elements.connectNostrBtn?.addEventListener('click', connectNostr);
        elements.requestAccessBtn?.addEventListener('click', showRequestForm);
        elements.disconnectBtn?.addEventListener('click', disconnect);
        elements.cancelRequestBtn?.addEventListener('click', hideRequestForm);
        
        // Post creation
        elements.postContent?.addEventListener('input', updateCharCount);
        elements.postContent?.addEventListener('input', checkPostValidity);
        elements.submitPost?.addEventListener('click', publishPost);
        
        // Feed controls
        elements.refreshFeed?.addEventListener('click', refreshFeed);
        elements.sortPosts?.addEventListener('change', sortFeed);
        
        // Help modal
        document.querySelector('.help-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showNostrHelp();
        });
        elements.closeHelp?.addEventListener('click', hideNostrHelp);
        
        // Access request form
        elements.accessRequestForm?.addEventListener('submit', submitAccessRequest);
        
        // Modal backdrop click
        elements.nostrHelpModal?.addEventListener('click', (e) => {
            if (e.target === elements.nostrHelpModal) {
                hideNostrHelp();
            }
        });
    }

    function checkAuthState() {
        if (window.nostrClient?.isConnectedUser()) {
            currentUser = {
                pubkey: window.nostrClient.publicKey,
                canPost: window.nostrClient.canPost()
            };
            showAuthenticatedState();
        } else {
            showUnauthenticatedState();
        }
    }

    function showAuthenticatedState() {
        elements.notAuthenticated.style.display = 'none';
        elements.requestAccessForm.style.display = 'none';
        elements.authenticated.style.display = 'block';
        
        // Update user info
        const displayName = window.nostrClient.getUserDisplayName(currentUser.pubkey);
        const nip05 = window.nostrClient.getUserNip05(currentUser.pubkey);
        const isVerified = window.nostrClient.isWhitelisted(currentUser.pubkey);
        
        elements.userName.textContent = displayName;
        
        if (nip05) {
            elements.userNip05.textContent = nip05;
            elements.userNip05.style.display = 'block';
        } else {
            elements.userNip05.style.display = 'none';
        }
        
        // Update verification status
        if (elements.verificationStatus) {
            if (isVerified) {
                elements.verificationStatus.innerHTML = '<span class="verified-icon">✅</span> NIP-05 Verified';
                elements.verificationStatus.className = 'verification-badge verified';
            } else {
                elements.verificationStatus.innerHTML = '<span class="unverified-icon">❌</span> Not Verified';
                elements.verificationStatus.className = 'verification-badge unverified';
            }
        }
        
        // Show/hide post creation based on whitelist status
        if (currentUser.canPost) {
            elements.postCreation.style.display = 'block';
        } else {
            elements.postCreation.style.display = 'none';
            showNotification('You are not in the NIP-05 verified users list. Request access below.', 'warning');
        }
    }

    function showUnauthenticatedState() {
        elements.notAuthenticated.style.display = 'block';
        elements.authenticated.style.display = 'none';
        elements.requestAccessForm.style.display = 'none';
        elements.postCreation.style.display = 'none';
    }

    async function connectNostr() {
        try {
            showLoading('Connecting to Nostr...');
            
            await window.nostrClient.connectWithExtension();
            currentUser = {
                pubkey: window.nostrClient.publicKey,
                canPost: window.nostrClient.canPost()
            };
            
            showAuthenticatedState();
            showNotification('Successfully connected to Nostr!', 'success');
            
        } catch (error) {
            console.error('Connection failed:', error);
            showNotification(error.message || 'Failed to connect to Nostr', 'error');
        } finally {
            hideLoading();
        }
    }

    function disconnect() {
        window.nostrClient.disconnect();
        currentUser = null;
        showUnauthenticatedState();
        showNotification('Disconnected from Nostr', 'info');
    }

    function showRequestForm() {
        elements.notAuthenticated.style.display = 'none';
        elements.requestAccessForm.style.display = 'block';
        
        // Pre-fill npub if connected
        if (window.nostrClient.isConnectedUser()) {
            // Convert hex pubkey to npub format
            try {
                const npub = NostrTools.nip19.npubEncode(window.nostrClient.publicKey);
                elements.requestNpub.value = npub;
            } catch (error) {
                elements.requestNpub.value = window.nostrClient.publicKey;
            }
        }
    }

    function hideRequestForm() {
        elements.requestAccessForm.style.display = 'none';
        elements.notAuthenticated.style.display = 'block';
    }

    async function submitAccessRequest(event) {
        event.preventDefault();
        
        try {
            showLoading('Sending access request...');
            
            const name = elements.requestName.value.trim();
            const reason = elements.requestReason.value.trim();
            let npub = elements.requestNpub.value.trim();
            
            if (!name || !reason || !npub) {
                throw new Error('Please fill in all fields');
            }
            
            // Convert npub to hex if needed
            let pubkeyHex = npub;
            if (npub.startsWith('npub1')) {
                try {
                    pubkeyHex = NostrTools.nip19.decode(npub).data;
                } catch (error) {
                    throw new Error('Invalid npub format');
                }
            }
            
            await window.nostrClient.sendAccessRequest(name, reason, pubkeyHex);
            
            showNotification('NIP-05 verification request sent successfully! You will be notified when approved.', 'success');
            hideRequestForm();
            
        } catch (error) {
            console.error('Failed to send access request:', error);
            showNotification(error.message || 'Failed to send verification request', 'error');
        } finally {
            hideLoading();
        }
    }

    function updateCharCount() {
        const content = elements.postContent.value;
        const remaining = 280 - content.length;
        
        elements.charCount.textContent = remaining;
        elements.charCount.classList.toggle('warning', remaining < 20);
    }

    function checkPostValidity() {
        const content = elements.postContent.value.trim();
        const isValid = content.length > 0 && content.length <= 280;
        
        elements.submitPost.disabled = !isValid;
    }

    async function publishPost() {
        try {
            showLoading('Publishing post...');
            
            const content = elements.postContent.value.trim();
            if (!content) {
                throw new Error('Post content cannot be empty');
            }
            
            const event = await window.nostrClient.publishPost(content);
            
            // Add the new post to the beginning of the feed
            posts.unshift(event);
            renderPosts();
            
            // Clear the form
            elements.postContent.value = '';
            updateCharCount();
            checkPostValidity();
            
            showNotification('Post published successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to publish post:', error);
            showNotification(error.message || 'Failed to publish post', 'error');
        } finally {
            hideLoading();
        }
    }

    async function loadFeed() {
        try {
            isLoading = true;
            showLoadingState();
            
            posts = await window.nostrClient.loadRecentPosts(50);
            renderPosts();
            
        } catch (error) {
            console.error('Failed to load feed:', error);
            showNotification('Failed to load discussions', 'error');
        } finally {
            isLoading = false;
            hideLoadingState();
        }
    }

    async function refreshFeed() {
        if (isLoading) return;
        
        elements.refreshFeed.disabled = true;
        elements.refreshFeed.innerHTML = '🔄 Refreshing...';
        
        await loadFeed();
        
        elements.refreshFeed.disabled = false;
        elements.refreshFeed.innerHTML = '🔄 Refresh';
        
        showNotification('Feed refreshed', 'info');
    }

    function sortFeed() {
        const sortType = elements.sortPosts.value;
        
        switch (sortType) {
            case 'recent':
                posts.sort((a, b) => b.created_at - a.created_at);
                break;
            case 'popular':
                // Sort by engagement (likes + comments) - placeholder implementation
                posts.sort((a, b) => (b.reactions || 0) - (a.reactions || 0));
                break;
            case 'discussed':
                // Sort by comment count - placeholder implementation
                posts.sort((a, b) => (b.comments || 0) - (a.comments || 0));
                break;
        }
        
        renderPosts();
    }

    function renderPosts() {
        if (posts.length === 0) {
            elements.noPosts.style.display = 'block';
            elements.postsContainer.innerHTML = '';
            return;
        }
        
        elements.noPosts.style.display = 'none';
        
        console.log('Rendering posts with current user state:', {
            currentUser: currentUser,
            isConnected: currentUser?.pubkey,
            canPost: currentUser?.canPost,
            isWhitelisted: currentUser ? window.nostrClient.isWhitelisted(currentUser.pubkey) : false
        });
        
        const postsHtml = posts.map(post => createPostElement(post)).join('');
        elements.postsContainer.innerHTML = postsHtml;
        
        // Add event listeners to new post elements
        attachPostEventListeners();
    }

    function createPostElement(post) {
        const displayName = window.nostrClient.getUserDisplayName(post.pubkey);
        const nip05 = window.nostrClient.getUserNip05(post.pubkey);
        const timestamp = window.nostrClient.formatTimestamp(post.created_at);
        const isOwnPost = currentUser && currentUser.pubkey === post.pubkey;
        const isVerified = window.nostrClient.isWhitelisted(post.pubkey);
        
        // All posts in the main feed are top-level posts (no replies shown here)
        console.log(`Creating top-level post element for:`, post.id.substring(0, 8), post.content.substring(0, 50));
        
        return `
            <div class="post-card top-level-post" data-post-id="${post.id}" data-post-type="top-level">
                <div class="post-header-info">
                    <div class="user-avatar">👤</div>
                    <div>
                        <div class="post-author-name">
                            ${displayName}
                            ${isVerified ? '<span class="verified-badge">✅</span>' : ''}
                        </div>
                        ${nip05 ? `<div class="post-author-nip05">${nip05}</div>` : ''}
                    </div>
                    <div class="post-timestamp">${timestamp}</div>
                </div>
                
                <div class="post-content">${escapeHtml(post.content)}</div>
                
                <div class="post-actions">
                    <button class="action-btn like-btn" data-post-id="${post.id}">
                        👍 <span class="like-count">0</span>
                    </button>
                    <button class="action-btn comment-btn" data-post-id="${post.id}">
                        💬 <span class="comment-count">0</span> <span class="comment-text">Comments</span>
                    </button>
                    <button class="action-btn share-btn" data-post-id="${post.id}">
                        🔄 Share
                    </button>
                </div>
                
                <div class="comments-section" data-post-id="${post.id}" style="display: none;">
                    <div class="comments-loading">Loading comments...</div>
                    <div class="comments-list"></div>
                    ${currentUser && currentUser.canPost ? `
                        <div class="comment-form">
                            <textarea placeholder="Write a comment about this post..." rows="2"></textarea>
                            <button class="btn btn-primary comment-submit">Post Comment</button>
                        </div>
                    ` : `
                        <div class="comment-form-disabled">
                            ${!currentUser ? 
                                '<p class="auth-message">🔐 <a href="#" class="connect-link">Connect your Nostr extension</a> to comment</p>' : 
                                '<p class="auth-message">⚠️ You need NIP-05 verification to comment. <a href="#" class="request-verification-link">Request verification</a></p>'
                            }
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    function attachPostEventListeners() {
        // Comment button listeners
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', toggleComments);
        });
        
        // Like button listeners
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', toggleLike);
        });
        
        // Share button listeners
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', sharePost);
        });
        
        // Comment submission listeners
        document.querySelectorAll('.comment-submit').forEach(btn => {
            btn.addEventListener('click', submitComment);
        });
        
        // Auth links in comment sections
        document.querySelectorAll('.connect-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                connectNostr();
            });
        });
        
        document.querySelectorAll('.request-verification-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showRequestForm();
            });
        });
    }

    async function toggleComments(event) {
        const postId = event.target.getAttribute('data-post-id');
        const commentsSection = document.querySelector(`.comments-section[data-post-id="${postId}"]`);
        
        if (commentsSection.style.display === 'none') {
            commentsSection.style.display = 'block';
            await loadCommentsForPost(postId);
        } else {
            commentsSection.style.display = 'none';
        }
    }

    async function loadCommentsForPost(postId) {
        const commentsSection = document.querySelector(`.comments-section[data-post-id="${postId}"]`);
        const commentsList = commentsSection.querySelector('.comments-list');
        const commentsLoading = commentsSection.querySelector('.comments-loading');
        
        try {
            commentsLoading.style.display = 'block';
            
            const comments = await window.nostrClient.loadCommentsForPost(postId);
            
            commentsLoading.style.display = 'none';
            
            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
                return;
            }
            
            const commentsHtml = comments.map(comment => createCommentElement(comment)).join('');
            commentsList.innerHTML = commentsHtml;
            
            // Update comment count
            const commentCount = document.querySelector(`.comment-btn[data-post-id="${postId}"] .comment-count`);
            if (commentCount) {
                commentCount.textContent = comments.length;
            }
            
        } catch (error) {
            console.error('Failed to load comments:', error);
            commentsLoading.style.display = 'none';
            commentsList.innerHTML = '<p class="error">Failed to load comments</p>';
        }
    }

    function createCommentElement(comment) {
        const displayName = window.nostrClient.getUserDisplayName(comment.pubkey);
        const nip05 = window.nostrClient.getUserNip05(comment.pubkey);
        const timestamp = window.nostrClient.formatTimestamp(comment.created_at);
        const isVerified = window.nostrClient.isWhitelisted(comment.pubkey);
        
        return `
            <div class="comment">
                <div class="user-avatar">👤</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">
                            ${displayName}
                            ${isVerified ? '<span class="verified-badge">✅</span>' : ''}
                        </span>
                        ${nip05 ? `<span class="comment-nip05">${nip05}</span>` : ''}
                        <span class="comment-timestamp">${timestamp}</span>
                    </div>
                    <div class="comment-text">${escapeHtml(comment.content)}</div>
                </div>
            </div>
        `;
    }

    async function submitComment(event) {
        const postId = event.target.closest('.comments-section').getAttribute('data-post-id');
        const textarea = event.target.closest('.comment-form').querySelector('textarea');
        const content = textarea.value.trim();
        
        if (!content) return;
        
        try {
            event.target.disabled = true;
            event.target.textContent = 'Posting...';
            
            await window.nostrClient.publishComment(postId, content);
            
            textarea.value = '';
            await loadCommentsForPost(postId); // Refresh comments
            
            showNotification('Comment posted!', 'success');
            
        } catch (error) {
            console.error('Failed to post comment:', error);
            showNotification('Failed to post comment', 'error');
        } finally {
            event.target.disabled = false;
            event.target.textContent = 'Comment';
        }
    }

    function toggleLike(event) {
        // Placeholder implementation
        const likeBtn = event.target.closest('.like-btn');
        const likeCount = likeBtn.querySelector('.like-count');
        const currentCount = parseInt(likeCount.textContent) || 0;
        
        if (likeBtn.classList.contains('active')) {
            likeBtn.classList.remove('active');
            likeCount.textContent = Math.max(0, currentCount - 1);
        } else {
            likeBtn.classList.add('active');
            likeCount.textContent = currentCount + 1;
        }
    }

    function sharePost(event) {
        const postId = event.target.getAttribute('data-post-id');
        const postUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Agricultural Discussion - SDCF',
                url: postUrl
            });
        } else {
            navigator.clipboard.writeText(postUrl);
            showNotification('Post URL copied to clipboard!', 'info');
        }
    }

    function showNostrHelp() {
        elements.nostrHelpModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function hideNostrHelp() {
        elements.nostrHelpModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function showLoadingState() {
        elements.loadingPosts.style.display = 'block';
        elements.noPosts.style.display = 'none';
    }

    function hideLoadingState() {
        elements.loadingPosts.style.display = 'none';
    }

    function showLoading(message) {
        // Simple loading implementation
        console.log('Loading:', message);
    }

    function hideLoading() {
        console.log('Loading complete');
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#4facfe'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Add slide-in animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Global functions for external access
    window.discussionsApp = {
        refreshFeed,
        loadFeed,
        currentUser: () => currentUser,
        isLoading: () => isLoading,
        onRelaysReady, // Add callback for when relays are ready
        // Test function for the specific event we're looking for
        async testSpecificEvent() {
            const eventId = '8fbdef5105b89e4d5ac43b1081a17395243f2d2db543bfe7b82efc4027eaf493';
            const author = 'd3d74124ddfb5bdc61b8f18d17c3335bbb4f8c71182a35ee27314a49a4eb7b1d';
            
            console.log('=== TESTING SPECIFIC MISSING EVENT ===');
            console.log('Event ID:', eventId);
            console.log('Author:', author);
            console.log('Is author whitelisted?', window.nostrClient.isWhitelisted(author));
            
            return await window.nostrClient.testEventQuery(eventId, author);
        }
    };
});