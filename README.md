# Shenandoah Datacenter Festival

A satirical website template with integrated Nostr discussions, highlighting the tension between agricultural heritage and datacenter development.

## About

This template creates satirical festival websites as a creative way to draw attention to land use issues. The Shenandoah Datacenter Festival example addresses datacenter development impacts on rural communities in Frederick County, Virginia.

The site combines satirical festival marketing with serious information about development impacts and decentralized community discussions powered by Nostr.

## Features

### Core Template Features
- **Satirical Festival Marketing**: Complete with fictional events and professional design
- **Serious Information Pages**: Real data about land use impacts
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive Elements**: Smooth scrolling, animations, and Easter eggs

### Nostr Integration
- **Decentralized Discussions**: Community conversations powered by Nostr protocol
- **NIP-05 Identity Verification**: Whitelisted users verified through domain
- **Admin Whitelist System**: DM-based access request system
- **Facebook-style Interface**: Familiar social media UX with decentralized backend
- **Real-time Feed**: Live updates from Nostr relays
- **Comment Threading**: Full discussion capabilities

## Using This Template

### Quick Start
1. Click "Use this template" on GitHub
2. Update `config.js` with your admin npub and site details
3. Modify `.well-known/nostr.json` with your initial whitelist
4. Customize the festival content for your cause
5. Deploy to GitHub Pages

### Configuration

#### Admin Setup
```javascript
// config.js - Update with your details
ADMIN_NPUB: 'your-admin-npub-here', // Receives whitelist requests
SITE_INFO: {
    domain: 'yoursite.com',
    name: 'Your Festival Name',
    description: 'Your cause description'
}
```

#### NIP-05 Whitelist
```json
// .well-known/nostr.json - Add approved users
{
    "names": {
        "username1": "user1-hex-pubkey",
        "username2": "user2-hex-pubkey"
    }
}
```

## File Structure

- `index.html` - Main festival marketing page (satirical)
- `discussions.html` - Nostr-powered community discussions
- `facts.html` - Serious information page
- `config.js` - Nostr and site configuration
- `nostr-client.js` - Nostr protocol integration
- `discussions.js` - Discussion interface logic
- `styles.css` & `discussions.css` - Styling
- `.well-known/nostr.json` - NIP-05 identity verification

## Deployment

### GitHub Pages Setup
1. Enable GitHub Pages in repository settings
2. Choose "GitHub Actions" as source (automatic with included workflow)
3. Set custom domain in Pages settings
4. Configure DNS A records for your domain

## Purpose

This website aims to:
1. Raise awareness about agricultural land preservation
2. Encourage community engagement in local land use decisions  
3. Provide factual information about datacenter development impacts
4. Use humor and satire to make serious topics more accessible

Festival dates mirror the 2026 Shenandoah Apple Blossom Festival (April 24 - May 3, 2026) for maximum satirical impact.

## Disclaimer

This is a work of satire intended to promote discussion about land use and agricultural preservation. It is not affiliated with any actual datacenter companies or agricultural organizations.