# Creative Asset Validator v5.0.0 - SaaS Deployment Guide

## 🚀 What's New in v5.0.0

This version transforms the tool from a client-side app to a full **SaaS platform** with:

- ✅ **MySQL Backend** on SiteGround for persistent storage
- ✅ **Real-Time Sync** across all devices
- ✅ **Cloudinary Integration** for video/image resizing
- ✅ **Super Admin Settings** for API key management (not hardcoded!)
- ✅ **GPT-5.2 & Claude 4.5** as default AI models

---

## 📋 Prerequisites

1. **SiteGround hosting** with:
   - PHP 8.0+ (8.2 recommended)
   - MySQL 8.0+
   - SSL certificate (HTTPS)

2. **Cloudinary account** (free tier works):
   - Cloud name
   - API Key
   - API Secret

3. **Google Cloud Console** project with:
   - OAuth 2.0 Client ID configured

---

## 🗄️ Step 1: Create MySQL Database

### In SiteGround Site Tools:

1. Go to **Site → MySQL** in Site Tools
2. You already have: `dbl5tvsio9ogwd` (creativeassetvalidator)
3. Create a database user if you don't have one:
   - Click **Users** tab
   - Add user (save the password!)
   - Assign user to database with **All Privileges**

### Import Schema:

1. Go to **phpMyAdmin** (access from Site Tools → MySQL → phpMyAdmin)
2. Select database `dbl5tvsio9ogwd`
3. Click **Import** tab
4. Upload `api/database/schema.sql`
5. Click **Go**

You should see these tables created:
- `users`
- `user_sessions`
- `teams`
- `team_members`
- `companies`
- `projects`
- `assets`
- `asset_shares`
- `asset_transforms`
- `brand_kits`
- `sync_log`
- `usage_tracking`
- `user_api_keys`
- `platform_specs`
- `swipe_files`
- `system_settings`

---

## ⚙️ Step 2: Configure API Backend

### Edit `api/config/config.php`:

```php
'database' => [
    'host' => 'localhost',
    'name' => 'dbl5tvsio9ogwd',
    'user' => 'YOUR_DB_USER',      // ← Change this
    'pass' => 'YOUR_DB_PASSWORD',  // ← Change this
    'charset' => 'utf8mb4',
    'port' => 3306,
],

'google' => [
    'client_id' => 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    'allowed_domains' => ['*'],
],

'security' => [
    // Generate new encryption key: bin2hex(random_bytes(32))
    'encryption_key' => 'YOUR_64_CHAR_HEX_KEY',
    
    'super_admins' => [
        'your-email@yourcompany.com',  // ← Your email
    ],
],

'cors' => [
    'allowed_origins' => [
        'https://yourdomain.com',
        'https://www.yourdomain.com',
    ],
],
```

### Generate Encryption Key:

In PHP or via terminal:
```php
echo bin2hex(random_bytes(32));
// Output: a1b2c3d4...64 characters
```

---

## 📁 Step 3: Upload Files to SiteGround

### File Structure:

```
/public_html/tools/asset-validator/
├── index.html
├── validator.css
├── validator-app.js
├── sync-engine.js          ← NEW
├── cloudinary-client.js    ← NEW
├── crm.js
├── settings-module.js
├── ... (all other JS files)
├── api/                    ← NEW FOLDER
│   ├── index.php
│   ├── .htaccess
│   ├── config/
│   │   └── config.php
│   ├── core/
│   │   ├── Database.php
│   │   ├── Auth.php
│   │   └── Router.php
│   ├── services/
│   │   ├── CloudinaryService.php
│   │   └── SyncService.php
│   ├── database/
│   │   └── schema.sql
│   └── logs/               ← CREATE THIS (empty)
├── auth-config.js
├── .htaccess
└── sw.js
```

### Upload via File Manager or FTP:

1. Use **Site Tools → Site → File Manager**
2. Navigate to `/public_html/tools/asset-validator/`
3. Upload all files, maintaining the folder structure
4. Create the `api/logs/` folder (empty)

---

## 🔐 Step 4: Set File Permissions

In File Manager or via SSH:

```bash
# Make logs directory writable
chmod 755 api/logs/

# Protect config file
chmod 644 api/config/config.php
```

---

## ☁️ Step 5: Configure Cloudinary (After First Login)

**Cloudinary credentials are NOT hardcoded!**

They are configured via the Super Admin UI:

1. Open the app: `https://yourdomain.com/tools/asset-validator/?dev=1`
2. Sign in with your Google account (must be in `super_admins` list)
3. Go to **Settings** (gear icon)
4. Click **Platform Admin** tab (only visible to super admins)
5. Enter your Cloudinary credentials:
   - Cloud Name: `drqvu2lrs`
   - API Key: `462481466637115`
   - API Secret: (your secret)
6. Click **Save Cloudinary Settings**

The credentials are encrypted and stored in the MySQL database.

---

## ✅ Step 6: Test the Deployment

### Test API Health:

```
https://yourdomain.com/tools/asset-validator/api/health
```

Expected response:
```json
{
    "status": "healthy",
    "database": "connected",
    "version": "5.0.0"
}
```

### Test App:

1. Go to `https://yourdomain.com/tools/asset-validator/`
2. Sign in with Google
3. Upload an asset
4. Check that it syncs (look for console messages)

### Test Video Resize:

1. Upload a video
2. Go to Strategy tab
3. Click a platform (e.g., TikTok)
4. Click "Resize" button
5. Should use Cloudinary to resize

---

## 🔧 Troubleshooting

### Database Connection Failed

1. Check `config.php` credentials
2. Verify database user has access
3. Check that database exists

### 401 Unauthorized

1. Google OAuth token may be expired
2. Clear localStorage and re-authenticate
3. Check that your email is in `super_admins`

### CORS Errors

1. Add your domain to `cors.allowed_origins` in config.php
2. Make sure you're using HTTPS

### Video Resize Not Working

1. Check Cloudinary credentials in Platform Admin
2. Verify quota hasn't been exceeded
3. Check browser console for errors

### Sync Not Working

1. Check API health endpoint
2. Verify session token exists in localStorage
3. Check browser console for sync errors

---

## 📊 Super Admin Features

As a super admin, you have access to:

| Feature | Location |
|---------|----------|
| **Platform Admin Settings** | Settings → Platform Admin |
| **Cloudinary Configuration** | Platform Admin → Cloudinary |
| **Shared AI Keys** | Platform Admin → OpenAI/Anthropic |
| **User Management** | Admin Dashboard → Users |
| **Sync Status** | Platform Admin → Sync Status |
| **Force Sync** | Platform Admin → Force Sync Now |

---

## 🔄 Updating

To update the app:

1. Upload new files (overwrite existing)
2. Clear browser cache (Ctrl+Shift+R)
3. The app should automatically pick up new versions

Database migrations (if any) will be provided in future release notes.

---

## 📞 Support

- Check browser console for errors
- Check `api/logs/app.log` for server errors
- Verify all configuration is correct

---

*Document Version: 5.0.0*
*Last Updated: December 2024*

