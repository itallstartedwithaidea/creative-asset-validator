# 🚀 Deployment Guide: Creative Asset Validator v4.1.1

This guide walks you through deploying Creative Asset Validator to your website for live user access.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Web hosting with HTTPS (SSL certificate required for OAuth)
- [ ] Google Cloud Console account (for OAuth setup)
- [ ] FTP/SFTP access or hosting control panel
- [ ] Domain name configured

---

## 🔧 Step 1: Configure Google OAuth

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select existing project
3. Name it (e.g., "Creative Asset Validator")

### 1.2 Enable APIs

Enable these APIs in your project:
- **Google Identity Services API** (required for sign-in)
- **Google Drive API** (for Drive integration)
- **Gmail API** (for email scanning)
- **Google Sheets API** (for spreadsheet scanning)

### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Choose "External" user type
3. Fill in:
   - App name: "Creative Asset Validator"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/spreadsheets.readonly`

### 1.4 Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "Creative Asset Validator Web"
5. Add **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
6. Copy the **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

---

## 🔧 Step 2: Update Configuration

### 2.1 Copy and Edit auth-config.js

First, copy the example template:

```bash
cp auth-config.example.js auth-config.js
```

Then open `auth-config.js` and update:

```javascript
window.AUTH_CONFIG = {
    // Replace with your Client ID from Step 1.4
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    
    // Your corporate domains (users with these emails get auto-approved)
    CORPORATE_DOMAINS: [
        'yourdomain.com',
        'yourcompany.com'
    ],
    
    // Super admin emails (full access to everything)
    ADMIN_EMAILS: [
        'admin@yourdomain.com',
        'john@yourdomain.com'
    ],
    
    // Pre-approved personal emails (optional)
    WHITELISTED_EMAILS: [],
    
    // Feature toggles
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: false,  // Block personal emails
        ACTIVITY_LOG_ENABLED: true,
        AI_ADAPTER_ENABLED: true,
        SESSION_DURATION_DAYS: 30,
        ITEMS_PER_PAGE: 24
    }
};
```

### 2.2 (Optional) Configure AI Providers

Users can add their own API keys in Settings, or you can pre-configure shared keys:

```javascript
// In settings-module.js or via admin panel
// These are entered through the UI, not hardcoded
```

---

## 🔧 Step 3: Upload Files

### Required Files (All must be uploaded)

```
/your-app-folder/
├── index.html              # Main application
├── validator.css           # All styling
├── security-core.js        # Security module (REQUIRED)
├── auth-config.js          # Your configuration
├── validator-app.js        # Core library
├── ai-adapter.js
├── ai-intelligence-engine.js
├── ai-library-integration.js
├── ai-library-manager.js
├── ai-orchestrator.js
├── ai-studio.js
├── analyze-module.js
├── strategy-module.js
├── learn-module.js
├── crm.js
├── integrations.js
├── logo-generator.js
├── auto-fix.js
├── advanced-features.js
├── advanced-toolbar.js
├── settings-module.js
└── data-models.js
```

### Upload Methods

**Via FTP/SFTP:**
1. Connect to your server
2. Navigate to public_html or www folder
3. Create subfolder (e.g., `/creative-validator/`)
4. Upload all files

**Via cPanel/Plesk:**
1. Open File Manager
2. Navigate to public_html
3. Create new folder
4. Upload all files

**Via Git (if supported):**
```bash
git clone your-repo
cd your-repo
# Files are ready
```

---

## 🔧 Step 4: Test Deployment

### 4.1 Verify File Access

Visit in browser:
- `https://yourdomain.com/creative-validator/index.html`

### 4.2 Check Console for Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Common issues:
   - "Mixed content" = Use HTTPS
   - "CORS error" = Check OAuth origins
   - "File not found" = Verify upload

### 4.3 Test Sign-In

1. Click "Sign in with Google"
2. Complete OAuth flow
3. Verify you're logged in
4. Check role assignment (Admin/Editor/Viewer)

### 4.4 Test Core Features

- [ ] Upload an image
- [ ] Run AI Analysis
- [ ] Create a CRM company
- [ ] Connect Google Drive
- [ ] Generate Brand Kit

---

## 🔒 Security Recommendations

### Domain Restrictions

For production, ensure only your domains can access:

```javascript
// In auth-config.js
CORPORATE_DOMAINS: ['yourdomain.com'],
PERSONAL_USERS_ENABLED: false,  // Block Gmail, Yahoo, etc.
```

### HTTPS Required

OAuth only works on HTTPS. Ensure your SSL certificate is valid.

### Content Security Policy (Optional)

Add to your server configuration or HTML:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://generativelanguage.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://www.googleapis.com https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com;
">
```

---

## 📊 Monitoring & Analytics

### Built-in Activity Logging

The app logs all user activity locally. View in Admin Dashboard.

### Add Google Analytics (Optional)

Add to index.html before closing `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

---

## 🔄 Updates

To update the application:

1. Backup current files
2. Upload new files (overwrite)
3. Clear browser cache or use incognito
4. Test core functionality

---

## 🆘 Troubleshooting

### "Sign-in popup blocked"
- Allow popups for your domain
- Use Chrome or Firefox

### "OAuth redirect mismatch"
- Verify exact domain in Google Console
- Include both www and non-www versions

### "API key not working"
- Check key is entered correctly
- Verify API is enabled in Google Console
- Check usage quotas

### "Assets not saving"
- Check browser IndexedDB storage
- Try incognito mode
- Clear site data and re-login

---

## 📞 Support

- **Documentation:** README.md, FEATURES.md
- **Admin:** Configure in auth-config.js → ADMIN_EMAILS

---

**Deployed with ❤️ - Creative Asset Validator v4.1.1**

