# Creative Asset Validator

## Enterprise-Grade Creative Intelligence Platform

<div align="center">

![Version](https://img.shields.io/badge/version-5.4.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Platform](https://img.shields.io/badge/platform-Web-green.svg)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)

**The complete solution for validating, organizing, and optimizing advertising creative assets across 50+ platforms.**

[Quick Start](#quick-start) | [Features](#core-features) | [Architecture](#architecture) | [Deployment](#deployment)

</div>

---

## The Problem We Solve

In digital advertising, creative teams face a daily challenge: ensuring that every asset meets the exact specifications required by dozens of different platforms. A single wrong-sized creative can result in rejected ads, wasted campaign budgets, and missed market opportunities.

Traditional workflows involve:
- Manual dimension checking against scattered documentation
- Creating endless resize variations for each platform
- Losing track of which clients need which formats
- Searching through disorganized folder structures
- Missing brand guidelines and compliance requirements

These inefficiencies cost agencies and marketing teams thousands of hours annually.

## Our Solution

Creative Asset Validator is a comprehensive platform that automates the entire creative asset workflow. Built for marketing teams, agencies, and enterprises, it validates assets against platform specifications, organizes them intelligently, and leverages AI to optimize creative performance.

The platform runs entirely in the browser with optional cloud synchronization, requiring no complex backend infrastructure while delivering enterprise-grade security and collaboration features.

---

## Core Features

### Asset Library and Validation

The central hub for all creative assets. Upload images and videos via drag-and-drop, and the system automatically validates them against specifications for over 50 advertising platforms including YouTube, TikTok, Meta, Google Ads, DV360, The Trade Desk, and connected TV networks.

- Automatic dimension and format validation
- File size and duration compliance checking
- Visual status indicators for each platform
- Folder organization with tags and favorites
- Personal and team storage separation

### AI-Powered Creative Analysis

Leverage multiple AI providers to analyze creative effectiveness:

- **Hook Analysis**: Score the opening seconds for attention capture
- **CTA Detection**: Evaluate call-to-action clarity and placement
- **Brand Compliance**: Verify logo placement, colors, and guidelines
- **Performance Prediction**: Estimate engagement, CTR, and conversion potential

The system orchestrates Claude, GPT-4, and Gemini to provide comprehensive analysis from multiple perspectives.

### Brand Kit Generator

Transform a single logo into a complete brand asset package. Upload one high-resolution logo and generate over 100 format variations:

- Social media profile images and covers
- Google Ads banner sizes
- Favicons and app icons
- Email signatures
- Print-ready formats

Each variation maintains proper aspect ratios and includes AI upscaling for low-resolution sources.

### AI Studio

Direct access to AI generation capabilities:

- **Text-to-Image**: Generate visuals from descriptions using Gemini
- **Image-to-Video**: Convert still images to motion with Veo 3.1
- **Outpainting**: Extend images to new aspect ratios
- **Background Removal**: Isolate subjects instantly

### Strategy Module

Plan campaigns with confidence:

- **Placement Matrix**: Visual grid showing all platform requirements
- **Derivative Roadmap**: Map all variations needed from master assets
- **A/B Test Planner**: Design hypothesis-driven creative tests
- **Creative Fatigue Prediction**: Know when assets need refreshing

### CRM Integration

Built-in client and project management eliminates the need for separate tools:

- Company profiles with brand guidelines
- Project tracking with timelines and budgets
- Asset linking and version history
- Team sharing with granular access levels (View, Edit, Full)
- Domain-based automatic sharing

### Integration Hub

Connect to your existing ecosystem:

- **Google Drive**: Browse folders, scan for assets, import directly
- **Google Sheets**: Extract image URLs from spreadsheets
- **Gmail**: Scan attachments for creative assets
- **Dropbox**: Folder synchronization
- **Slack**: Channel file scanning

Each integration includes eligibility analysis, showing which assets meet requirements and which need attention.

---

## Architecture

### SaaS-Ready Infrastructure

The platform includes a complete backend architecture for production deployment:

**Database Layer (MySQL)**
- User and team management with role-based access
- Asset metadata with validation results
- CRM entities (companies, projects, contacts)
- Sync tracking for offline-first operation
- Usage analytics and audit logging

**API Layer (PHP)**
- RESTful endpoints for all operations
- Google OAuth token validation
- Session management with encryption
- Cloudinary integration for asset processing

**Sync Engine (JavaScript)**
- Bidirectional synchronization between browser and server
- Conflict resolution with version tracking
- Offline queue for pending changes
- Real-time status updates

**Storage Options**
- Local: IndexedDB for browser-based storage
- Cloud: Cloudinary for image/video processing and CDN delivery
- Hybrid: Automatic sync between local and cloud

### Security Implementation

| Layer | Implementation |
|-------|----------------|
| Session Encryption | AES-256-GCM with PBKDF2 key derivation |
| Authentication | Google SSO with JWT validation |
| Domain Enforcement | Configurable corporate domain requirements |
| Device Binding | Sessions tied to browser fingerprints |
| Anti-Tampering | HMAC-SHA256 signature verification |
| Activity Logging | 360-day audit trail with export |
| Data Isolation | User-specific encrypted storage |
| Role-Based Access | Super Admin, Domain Admin, Editor, Viewer |

---

## Technical Specifications

### Codebase

| Component | Lines | Purpose |
|-----------|-------|---------|
| index.html | 7,300+ | Application shell and routing |
| validator-app.js | 4,200+ | Core asset management |
| validator.css | 14,000+ | Complete styling system |
| integrations.js | 5,700+ | External service connections |
| security-core.js | 970+ | Encryption and sessions |
| Additional modules | 20,000+ | AI, CRM, Strategy, Learn |
| **Total** | **65,000+** | **Complete platform** |

### Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 14+ |
| Edge | 80+ |

### Storage

| Type | Technology | Capacity |
|------|------------|----------|
| Assets | IndexedDB | Browser limit (~2GB typical) |
| Videos | IndexedDB | 100MB per file recommended |
| Metadata | localStorage | ~5MB |
| Cloud | Cloudinary | Based on plan |

---

## Deployment

### Prerequisites

1. Web server (Apache, Nginx, or static hosting)
2. Google Cloud Console project with OAuth credentials
3. Optional: MySQL database for multi-user sync
4. Optional: Cloudinary account for cloud processing

### Quick Start

```bash
# Clone the repository
git clone https://github.com/itallstartedwithaidea/creative-asset-validator.git
cd creative-asset-validator

# Configure authentication
cp auth-config.example.js auth-config.js
# Edit auth-config.js with your settings

# Start local server
python3 -m http.server 8800

# Access the application
open http://localhost:8800
```

### Production Deployment

1. Upload all files to your web server
2. Configure `auth-config.js` with production values
3. Set up Google OAuth with your domain
4. Optional: Configure MySQL database using provided schema
5. Optional: Add Cloudinary credentials for cloud processing

### Required Configuration

```javascript
// auth-config.js
window.AUTH_CONFIG = {
    GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com',
    ADMIN_EMAILS: ['admin@yourcompany.com'],
    CORPORATE_DOMAINS: ['yourcompany.com'],
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: false,
        AI_ADAPTER_ENABLED: true
    }
};
```

### Google OAuth Setup

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google Identity API
4. Create OAuth 2.0 credentials (Web application type)
5. Add authorized JavaScript origins:
   - `http://localhost:8800` for development
   - `https://yourdomain.com` for production
6. Copy the Client ID to your configuration

### AI Provider Configuration

Configure API keys through the Settings panel:

| Provider | Purpose | Registration |
|----------|---------|--------------|
| Google Gemini | Image/video generation | aistudio.google.com |
| OpenAI | Vision analysis | platform.openai.com |
| Anthropic Claude | Strategy analysis | console.anthropic.com |
| SearchAPI | Research features | searchapi.io |

All keys are encrypted and stored locally. They are transmitted only to the respective AI provider endpoints.

---

## File Structure

```
creative-asset-validator/
|-- index.html                 # Main application
|-- validator-app.js           # Core library
|-- validator.css              # Styling
|-- security-core.js           # Security module
|-- auth-config.example.js     # Configuration template
|
|-- AI Modules
|   |-- ai-adapter.js          # Image adaptation
|   |-- ai-studio.js           # Generation studio
|   |-- ai-library-integration.js
|   |-- ai-orchestrator.js     # Multi-provider routing
|   |-- ai-intelligence-engine.js
|   |-- ai-library-manager.js
|
|-- Feature Modules
|   |-- analyze-module.js      # Creative analysis
|   |-- strategy-module.js     # Campaign planning
|   |-- learn-module.js        # Swipe file and research
|   |-- crm.js                 # Client management
|   |-- integrations.js        # External services
|   |-- logo-generator.js      # Brand kit creation
|   |-- auto-fix.js            # Automated resizing
|   |-- settings-module.js     # Configuration UI
|
|-- Backend (Optional)
|   |-- api/
|       |-- index.php          # API router
|       |-- core/              # Auth, Database, Router
|       |-- services/          # Cloudinary, Sync
|       |-- database/          # MySQL schema
|
|-- Sync and Storage
|   |-- sync-engine.js         # Bidirectional sync
|   |-- cloudinary-client.js   # Cloud processing
|   |-- data-models.js         # Data structures
|
|-- Documentation
    |-- README.md              # This file
    |-- FEATURES.md            # Detailed feature docs
    |-- DEPLOYMENT.md          # Deployment guide
    |-- SAAS-ROADMAP.md        # Future development
```

---

## Version History

### Version 5.4.0 (Current)
- Enhanced video resizing with Cloudinary integration
- Improved responsive design across all modules
- Updated platform specifications database
- Performance optimizations for large asset libraries

### Version 5.0.0
- SaaS architecture with MySQL backend
- Bidirectional sync engine
- Cloudinary integration for cloud processing
- Usage tracking and quota management

### Version 4.1.0
- Admin Dashboard with user management
- CRM sharing with access levels
- Domain-scoped permissions
- Visual sharing indicators

### Version 4.0.0
- Integration Hub (Google Drive, Sheets, Gmail, Dropbox, Slack)
- Asset eligibility analysis
- CRM import functionality
- Enhanced folder navigation

### Version 3.0.0
- Enterprise security overhaul
- AES-256 session encryption
- Device fingerprinting
- Domain enforcement
- Activity logging

---

## Support and Documentation

- **Feature Documentation**: See FEATURES.md for detailed feature descriptions
- **Deployment Guide**: See DEPLOYMENT.md for hosting instructions
- **SaaS Roadmap**: See SAAS-ROADMAP.md for planned enhancements
- **Issues**: Open a GitHub issue for bug reports or feature requests

---

## License

Proprietary Software - All Rights Reserved

Copyright 2024-2025 It All Started With An Idea

This software is provided under license to authorized users only. Unauthorized copying, modification, distribution, or use is strictly prohibited.

---

<div align="center">

**Creative Asset Validator**

*Validate. Organize. Optimize.*

Built for creative teams who demand precision and efficiency.

</div>
