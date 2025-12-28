# 🚀 Creative Asset Validator - SaaS Transformation Roadmap

## Current State: Client-Side Web Application
- All data stored in browser (IndexedDB)
- No backend server
- No real-time sync
- No persistent storage
- Video resizing NOT implemented

---

## Phase 1: Backend Foundation (Week 1-2)
### Add PHP/Node.js Backend on SiteGround

**Option A: PHP (Easier on SiteGround)**
```
/api/
├── auth.php          # Validate Google OAuth tokens
├── users.php         # User CRUD operations
├── assets.php        # Asset upload/metadata
├── teams.php         # Team management
├── sync.php          # Data synchronization
└── config.php        # Database connection
```

**Option B: Node.js (More Powerful)**
```
/backend/
├── server.js         # Express server
├── routes/
│   ├── auth.js
│   ├── assets.js
│   └── teams.js
├── models/
│   ├── User.js
│   └── Asset.js
└── services/
    ├── storage.js    # File uploads
    └── sync.js       # WebSocket sync
```

### Database Schema (MySQL on SiteGround)
```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  domain VARCHAR(255),
  role ENUM('admin', 'editor', 'viewer'),
  google_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Teams table
CREATE TABLE teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table (metadata only - files in storage)
CREATE TABLE assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  team_id INT,
  filename VARCHAR(255),
  file_path VARCHAR(500),
  file_type ENUM('image', 'video'),
  file_size BIGINT,
  width INT,
  height INT,
  duration INT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Asset shares (for team collaboration)
CREATE TABLE asset_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT,
  shared_with_user_id INT,
  shared_with_team_id INT,
  access_level ENUM('view', 'edit', 'full'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- CRM tables
CREATE TABLE crm_companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT,
  name VARCHAR(255),
  domain VARCHAR(255),
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT,
  name VARCHAR(255),
  status VARCHAR(50),
  settings JSON,
  FOREIGN KEY (company_id) REFERENCES crm_companies(id)
);
```

---

## Phase 2: File Storage (Week 2-3)

### SiteGround Storage Structure
```
/public_html/tools/asset-validator/
├── uploads/              # User uploads (OUTSIDE web root ideally)
│   ├── {user_id}/
│   │   ├── originals/
│   │   ├── thumbnails/
│   │   └── derivatives/
│   └── temp/             # Processing queue
├── api/                  # Backend APIs
└── app/                  # Frontend (current code)
```

### Upload API (PHP Example)
```php
<?php
// /api/upload.php
header('Content-Type: application/json');

// Validate auth token
$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$user = validateToken($token);
if (!$user) {
    http_response_code(401);
    exit(json_encode(['error' => 'Unauthorized']));
}

// Handle file upload
if ($_FILES['file']) {
    $file = $_FILES['file'];
    $maxSize = 500 * 1024 * 1024; // 500MB
    
    if ($file['size'] > $maxSize) {
        exit(json_encode(['error' => 'File too large']));
    }
    
    $uploadDir = "../uploads/{$user['id']}/originals/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $filename = uniqid() . '_' . basename($file['name']);
    $filepath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Save to database
        $assetId = saveAssetToDb($user['id'], $filename, $filepath, $file);
        
        echo json_encode([
            'success' => true,
            'asset_id' => $assetId,
            'url' => "/uploads/{$user['id']}/originals/$filename"
        ]);
    }
}
?>
```

---

## Phase 3: Video Processing (Week 3-4)

### Option A: FFmpeg on SiteGround (Limited)
SiteGround shared hosting may not have FFmpeg. You'd need:
- VPS or Cloud hosting for full FFmpeg support
- OR use external API services

### Option B: External Video Processing APIs

| Service | Purpose | Pricing |
|---------|---------|---------|
| **Cloudinary** | Resize, crop, transcode | Free tier + pay-per-use |
| **AWS MediaConvert** | Professional transcoding | ~$0.015/min |
| **Mux** | Video processing + delivery | $0.007/min |
| **api.video** | Simple video API | Free tier available |

### Recommended: Cloudinary Integration
```javascript
// Video resize via Cloudinary
async function resizeVideo(videoUrl, targetWidth, targetHeight) {
    const cloudName = 'your-cloud-name';
    const uploadPreset = 'your-preset';
    
    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', videoUrl);
    formData.append('upload_preset', uploadPreset);
    
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: 'POST', body: formData }
    );
    
    const data = await response.json();
    
    // Get resized URL with transformation
    const resizedUrl = data.secure_url.replace(
        '/upload/',
        `/upload/c_fill,w_${targetWidth},h_${targetHeight}/`
    );
    
    return resizedUrl;
}
```

---

## Phase 4: Real-Time Team Sync (Week 4-5)

### Option A: WebSockets (Best)
```javascript
// server.js (Node.js with Socket.io)
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    const user = authenticateSocket(socket);
    
    // Join team room
    socket.join(`team:${user.teamId}`);
    
    // Broadcast asset changes
    socket.on('asset:create', (asset) => {
        socket.to(`team:${user.teamId}`).emit('asset:created', asset);
    });
    
    socket.on('asset:update', (asset) => {
        socket.to(`team:${user.teamId}`).emit('asset:updated', asset);
    });
    
    socket.on('asset:delete', (assetId) => {
        socket.to(`team:${user.teamId}`).emit('asset:deleted', assetId);
    });
});
```

### Option B: Polling (Simpler, works on SiteGround)
```javascript
// Frontend: Poll for changes every 5 seconds
setInterval(async () => {
    const lastSync = localStorage.getItem('lastSyncTimestamp');
    const changes = await fetch(`/api/sync.php?since=${lastSync}`);
    
    if (changes.length > 0) {
        applyChanges(changes);
        localStorage.setItem('lastSyncTimestamp', Date.now());
    }
}, 5000);
```

### Option C: Firebase Realtime Database (Easiest)
```javascript
import { getDatabase, ref, onValue } from 'firebase/database';

const db = getDatabase();
const teamAssetsRef = ref(db, `teams/${teamId}/assets`);

onValue(teamAssetsRef, (snapshot) => {
    const assets = snapshot.val();
    updateLocalAssets(assets);
});
```

---

## Phase 5: Authentication Hardening (Week 5-6)

### Server-Side Token Validation
```php
<?php
// /api/auth.php
function validateGoogleToken($idToken) {
    $client = new Google_Client(['client_id' => GOOGLE_CLIENT_ID]);
    $payload = $client->verifyIdToken($idToken);
    
    if ($payload) {
        $userId = $payload['sub'];
        $email = $payload['email'];
        $domain = explode('@', $email)[1];
        
        // Check if user exists, create if not
        $user = getOrCreateUser($userId, $email, $domain);
        
        // Generate session token
        $sessionToken = bin2hex(random_bytes(32));
        saveSession($user['id'], $sessionToken);
        
        return [
            'token' => $sessionToken,
            'user' => $user
        ];
    }
    
    return null;
}
?>
```

---

## Cost Estimates

| Component | Free Tier | Paid |
|-----------|-----------|------|
| **SiteGround Hosting** | - | ~$15/mo (GrowBig) |
| **MySQL Database** | ✅ Included | - |
| **Cloudinary Video** | 25GB/mo | ~$89/mo |
| **Firebase Realtime DB** | 1GB | ~$25/mo |
| **Total** | ~$15/mo | ~$130/mo |

---

## Implementation Priority

### Must Have (MVP)
1. ✅ Backend API (PHP on SiteGround)
2. ✅ MySQL database
3. ✅ Server file storage
4. ✅ Server-validated auth

### Should Have
5. 🔲 Real-time sync (polling or Firebase)
6. 🔲 Video resizing (Cloudinary)
7. 🔲 Email notifications

### Nice to Have
8. 🔲 WebSocket real-time
9. 🔲 Mobile app
10. 🔲 White-label capability

---

## Quick Win: Hybrid Approach

Keep current browser-based system but ADD:
1. **Backup API** - Save data to server as backup
2. **Asset CDN** - Upload large files to Cloudinary
3. **Sync endpoint** - Pull latest data on load

This gives you reliability without full rewrite.

---

## Next Steps

1. **Decide**: Full SaaS rebuild or Hybrid approach?
2. **Create**: MySQL database on SiteGround
3. **Build**: Basic PHP API endpoints
4. **Integrate**: Cloudinary for video processing
5. **Add**: Sync mechanism for team collaboration

Would you like me to implement any of these phases?

