# 🚀 SiteGround / cPanel Deployment Guide

## Step-by-Step Instructions for File Manager Upload

---

## 📋 Pre-Upload Checklist

Before uploading, ensure you have:
- [ ] SiteGround or cPanel access
- [ ] Your domain configured
- [ ] SSL certificate active (required for Google OAuth)

---

## 🔧 STEP 1: Prepare Your Configuration

### 1.1 Create Your auth-config.js File

**IMPORTANT:** The package includes `auth-config.example.js` as a template.
You MUST create your own `auth-config.js` with your actual credentials.

1. Find `auth-config.example.js` in the package
2. Make a copy and rename it to `auth-config.js`
3. Edit `auth-config.js` with your settings:

```javascript
window.AUTH_CONFIG = {
    // Replace with YOUR Google OAuth Client ID
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    
    // Your admin emails (full access)
    ADMIN_EMAILS: [
        'your-admin@yourcompany.com'
    ],
    
    // Your corporate domains (auto-approved users)
    CORPORATE_DOMAINS: [
        'yourcompany.com'
    ],
    
    // Pre-approved personal emails (optional)
    WHITELISTED_EMAILS: [],
    
    // Blocked emails/domains (optional)
    BLOCKED_EMAILS: [],
    BLOCKED_DOMAINS: [],
    
    // Feature settings
    FEATURES: {
        TEAM_SHARING_ENABLED: true,
        PERSONAL_USERS_ENABLED: false,
        ACTIVITY_LOG_ENABLED: true,
        ACTIVITY_LOG_RETENTION_DAYS: 360,
        AI_ADAPTER_ENABLED: true,
        SESSION_DURATION_DAYS: 30,
        ITEMS_PER_PAGE: 24
    }
};
```

---

## 🔧 STEP 2: Set Up Google OAuth

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name: `Creative Asset Validator`
4. Click **Create**

### 2.2 Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - ✅ **Google Identity Services API** (required)
   - ✅ **Google Drive API** (for Drive integration)
   - ✅ **Gmail API** (for email scanning)
   - ✅ **Google Sheets API** (for spreadsheet scanning)

### 2.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - App name: `Creative Asset Validator`
   - User support email: `your-email@yourcompany.com`
   - Developer contact: `your-email@yourcompany.com`
4. Click **Save and Continue**
5. Add scopes (click "Add or Remove Scopes"):
   - `openid`
   - `email`  
   - `profile`
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/spreadsheets.readonly`
6. Click **Save and Continue**

### 2.4 Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `Creative Asset Validator Web`
5. **Authorized JavaScript origins** - Add ALL of these:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   http://localhost:8800
   ```
6. Leave "Authorized redirect URIs" empty
7. Click **Create**
8. **Copy the Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)

### 2.5 Update Your auth-config.js

Replace `YOUR_CLIENT_ID` with the Client ID you just copied:

```javascript
GOOGLE_CLIENT_ID: '123456789-abc.apps.googleusercontent.com',
```

---

## 🔧 STEP 3: Upload to SiteGround/cPanel

### 3.1 Access File Manager

**SiteGround:**
1. Log in to SiteGround
2. Go to **Site Tools** → **Site** → **File Manager**

**cPanel:**
1. Log in to cPanel
2. Click **File Manager**

### 3.2 Navigate to Your Web Root

Navigate to:
- **SiteGround:** `public_html` or your domain folder
- **cPanel:** `public_html` or `www`

### 3.3 Create App Folder (Recommended)

1. Click **New Folder**
2. Name it: `creative-validator` (or your preferred name)
3. Click **Create**
4. **Enter the new folder**

### 3.4 Upload All Files

1. Click **Upload** (usually top toolbar)
2. Select **ALL files** from the package:

```
📁 Required Files (MUST UPLOAD):
├── index.html              ← Main application
├── auth-config.js          ← YOUR configured file (create from example)
├── validator.css           ← All styling
├── security-core.js        ← Security module
├── validator-app.js        ← Core library

📁 Feature Modules (MUST UPLOAD):
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
├── data-models.js

📁 Documentation (Optional):
├── README.md
├── FEATURES.md
├── DEPLOYMENT.md
├── SETUP-GUIDE.md
├── auth-config.example.js  ← Template only, keep for reference
```

3. Wait for all uploads to complete (green checkmarks)

### 3.5 Verify File Permissions

Most files should be `644` (rw-r--r--). If needed:
1. Select all files
2. Right-click → **Change Permissions** / **Chmod**
3. Set to: `644`
4. Click **Change**

---

## 🔧 STEP 4: Test Your Deployment

### 4.1 Access Your Site

Open in browser:
```
https://yourdomain.com/creative-validator/
```

Or if uploaded to root:
```
https://yourdomain.com/
```

### 4.2 Check for Errors

1. Open **Developer Tools** (F12 or Cmd+Option+I)
2. Go to **Console** tab
3. Look for red errors:
   - ❌ `auth-config.js not found` → File missing, re-upload
   - ❌ `GOOGLE_CLIENT_ID not set` → Edit auth-config.js
   - ❌ `Mixed content` → Need HTTPS

### 4.3 Test Sign-In

1. Click **"Sign in with Google"**
2. Complete Google OAuth flow
3. Verify you're logged in with your admin email
4. Check that you have Admin access

### 4.4 Test Core Features

- [ ] Upload an image
- [ ] Run AI Analysis
- [ ] Create a CRM company
- [ ] Open Admin Dashboard
- [ ] Add a new user

---

## 🔧 STEP 5: Configure AI Providers (Optional)

After signing in, go to **Settings** (⚙️ icon) and add your API keys:

| Provider | Purpose | Get Key From |
|----------|---------|--------------|
| **Google Gemini** | Image/video generation | [aistudio.google.com](https://aistudio.google.com) |
| **OpenAI** | Vision analysis | [platform.openai.com](https://platform.openai.com) |
| **Anthropic Claude** | Strategy analysis | [console.anthropic.com](https://console.anthropic.com) |
| **SearchAPI** | Research features | [searchapi.io](https://searchapi.io) |

**Note:** API keys are stored encrypted in your browser. They never leave your device except to call the respective AI provider.

---

## 🆘 Troubleshooting

### "Sign in with Google" shows blank/error

**Cause:** Your domain isn't authorized in Google Cloud Console

**Fix:**
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your OAuth Client ID
3. Under "Authorized JavaScript origins", add:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
4. Click **Save**
5. **Wait 5-10 minutes** for changes to propagate
6. Try again

### "Access Denied" after signing in

**Cause:** Your email isn't in ADMIN_EMAILS or CORPORATE_DOMAINS

**Fix:**
1. Edit `auth-config.js` on your server
2. Add your email to `ADMIN_EMAILS` or your domain to `CORPORATE_DOMAINS`
3. Save and refresh

### Files not loading / 404 errors

**Cause:** Files not uploaded or wrong folder

**Fix:**
1. Check File Manager for all required files
2. Verify you're in the correct folder
3. Check file permissions (should be 644)

### Mixed Content warnings

**Cause:** Site using HTTP instead of HTTPS

**Fix:**
1. Enable SSL certificate in SiteGround/cPanel
2. Force HTTPS redirect
3. Update Google OAuth origins to use HTTPS

---

## 📁 Complete File List

| File | Size | Required |
|------|------|----------|
| index.html | ~280 KB | ✅ Yes |
| validator.css | ~180 KB | ✅ Yes |
| validator-app.js | ~90 KB | ✅ Yes |
| security-core.js | ~25 KB | ✅ Yes |
| auth-config.js | ~5 KB | ✅ Yes (create from example) |
| crm.js | ~85 KB | ✅ Yes |
| integrations.js | ~100 KB | ✅ Yes |
| ai-library-integration.js | ~90 KB | ✅ Yes |
| analyze-module.js | ~50 KB | ✅ Yes |
| strategy-module.js | ~50 KB | ✅ Yes |
| learn-module.js | ~65 KB | ✅ Yes |
| logo-generator.js | ~50 KB | ✅ Yes |
| ai-studio.js | ~60 KB | ✅ Yes |
| ai-adapter.js | ~30 KB | ✅ Yes |
| ai-orchestrator.js | ~18 KB | ✅ Yes |
| ai-intelligence-engine.js | ~20 KB | ✅ Yes |
| ai-library-manager.js | ~22 KB | ✅ Yes |
| settings-module.js | ~65 KB | ✅ Yes |
| auto-fix.js | ~22 KB | ✅ Yes |
| advanced-features.js | ~45 KB | ✅ Yes |
| advanced-toolbar.js | ~6 KB | ✅ Yes |
| data-models.js | ~15 KB | ✅ Yes |
| auth-config.example.js | ~5 KB | 📋 Reference |
| README.md | ~15 KB | 📋 Optional |
| FEATURES.md | ~20 KB | 📋 Optional |
| DEPLOYMENT.md | ~8 KB | 📋 Optional |
| SETUP-GUIDE.md | This file | 📋 Optional |

**Total:** ~1.4 MB (all files)

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Site loads at your URL
- [ ] Sign in with Google works
- [ ] You have Admin access
- [ ] Can upload images
- [ ] Can create CRM companies
- [ ] Admin Dashboard works
- [ ] Can add new users

---

## 📞 Need Help?

- Check the **Console** (F12) for error messages
- Review this guide's Troubleshooting section
- Check DEPLOYMENT.md for additional details

---

**Version:** 4.1.1  
**Last Updated:** December 28, 2025

