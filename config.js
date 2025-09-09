// Nostr Configuration for Site Administration
const NOSTR_CONFIG = {
    // Admin npub for receiving whitelist requests
    ADMIN_NPUB: 'npub160t5zfxalddaccdc7xx30sentwa5lrr3rq4rtm38x99ynf8t0vwsvzyjc9',
    
    // Default relays for the site
    DEFAULT_RELAYS: [
        'wss://relay.damus.io',
        'wss://relay.primal.net'
    ],
    
    // Site information
    SITE_INFO: {
        domain: 'shenandoahdatacenterfestival.com',
        name: 'Shenandoah Datacenter Festival',
        description: 'Where Silicon Meets Silo - A satirical exploration of Frederick County\'s agricultural vs. digital future'
    },
    
    // Discussion settings
    DISCUSSION_CONFIG: {
        // Only allow whitelisted users to post
        requireWhitelist: true,
        // Allow anonymous viewing
        allowAnonymousViewing: true,
        // Maximum post length
        maxPostLength: 280,
        // Enable comment threading
        enableThreads: true
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NOSTR_CONFIG;
}