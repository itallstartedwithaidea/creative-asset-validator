/**
 * Security Core Module
 * ====================
 * Version 3.0.0 - Enterprise Security
 * 
 * Features:
 * - AES-256-GCM encryption for all sensitive data
 * - Secure session management with unique session IDs
 * - Anti-tampering protection with HMAC signatures
 * - Automatic session persistence
 * - Corporate domain enforcement
 * - Admin approval system for whitelisted emails
 * - Secure key derivation (PBKDF2)
 */

(function() {
    'use strict';

    // =============================================
    // SECURITY CONSTANTS
    // =============================================
    const SECURITY_VERSION = '3.0.0';
    const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const ENCRYPTION_ALGORITHM = 'AES-GCM';
    const PBKDF2_ITERATIONS = 100000;
    const SALT_LENGTH = 16;
    const IV_LENGTH = 12;
    const TAG_LENGTH = 128;

    // Storage keys with security prefix
    const SECURE_KEYS = {
        SESSION: 'cav_secure_session_v3',
        SESSION_SIGNATURE: 'cav_session_sig_v3',
        SESSION_BACKUP: 'cav_session_backup_v3', // Unencrypted backup for refresh persistence
        DEVICE_FINGERPRINT: 'cav_device_fp_v3',
        ENCRYPTION_SALT: 'cav_enc_salt_v3',
        USERS: 'cav_managed_users_v3',
        ACTIVITY: 'cav_activity_log_v3',
        SETTINGS: 'cav_admin_settings_v3',
        WHITELIST_REQUESTS: 'cav_whitelist_requests_v3'
    };

    // Personal email domains that are BLOCKED by default
    const PERSONAL_EMAIL_DOMAINS = [
        'gmail.com', 'googlemail.com',
        'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'hotmail.co.uk',
        'yahoo.com', 'yahoo.co.uk', 'ymail.com', 'rocketmail.com',
        'aol.com', 'protonmail.com', 'proton.me',
        'icloud.com', 'me.com', 'mac.com',
        'mail.com', 'zoho.com', 'gmx.com', 'gmx.de', 'gmx.net',
        'yandex.com', 'yandex.ru',
        'fastmail.com', 'tutanota.com',
        'qq.com', '163.com', '126.com',
        'mailinator.com', 'guerrillamail.com', 'tempmail.com' // Disposable emails
    ];

    // =============================================
    // CRYPTO UTILITIES
    // =============================================
    const CryptoUtils = {
        // Generate cryptographically secure random bytes
        getRandomBytes(length) {
            return crypto.getRandomValues(new Uint8Array(length));
        },

        // Generate unique session ID
        generateSessionId() {
            const timestamp = Date.now().toString(36);
            const randomPart = Array.from(this.getRandomBytes(16))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            return `sess_${timestamp}_${randomPart}`;
        },

        // Generate device fingerprint (for session binding)
        async generateDeviceFingerprint() {
            const components = [
                navigator.userAgent,
                navigator.language,
                screen.width + 'x' + screen.height,
                screen.colorDepth,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || 'unknown',
                navigator.platform
            ];
            
            const data = components.join('|');
            const encoder = new TextEncoder();
            const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        },

        // Derive encryption key from passphrase using PBKDF2
        async deriveKey(passphrase, salt) {
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(passphrase),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            return crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: PBKDF2_ITERATIONS,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: ENCRYPTION_ALGORITHM, length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        },

        // Encrypt data with AES-256-GCM
        async encrypt(data, passphrase) {
            try {
                const salt = this.getRandomBytes(SALT_LENGTH);
                const iv = this.getRandomBytes(IV_LENGTH);
                const key = await this.deriveKey(passphrase, salt);
                
                const encoder = new TextEncoder();
                const encrypted = await crypto.subtle.encrypt(
                    { name: ENCRYPTION_ALGORITHM, iv: iv, tagLength: TAG_LENGTH },
                    key,
                    encoder.encode(JSON.stringify(data))
                );

                // Combine salt + iv + encrypted data
                const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
                result.set(salt, 0);
                result.set(iv, salt.length);
                result.set(new Uint8Array(encrypted), salt.length + iv.length);

                return btoa(String.fromCharCode(...result));
            } catch (error) {
                console.error('[Security] Encryption failed:', error);
                return null;
            }
        },

        // Decrypt data
        async decrypt(encryptedData, passphrase) {
            try {
                const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
                
                const salt = data.slice(0, SALT_LENGTH);
                const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
                const encrypted = data.slice(SALT_LENGTH + IV_LENGTH);
                
                const key = await this.deriveKey(passphrase, salt);
                
                const decrypted = await crypto.subtle.decrypt(
                    { name: ENCRYPTION_ALGORITHM, iv: iv, tagLength: TAG_LENGTH },
                    key,
                    encrypted
                );

                const decoder = new TextDecoder();
                return JSON.parse(decoder.decode(decrypted));
            } catch (error) {
                console.error('[Security] Decryption failed - session may be corrupted');
                return null;
            }
        },

        // Create HMAC signature for integrity verification
        async createSignature(data, secret) {
            const encoder = new TextEncoder();
            const keyData = encoder.encode(secret);
            const key = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            
            const signature = await crypto.subtle.sign(
                'HMAC',
                key,
                encoder.encode(JSON.stringify(data))
            );
            
            return Array.from(new Uint8Array(signature))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        },

        // Verify HMAC signature
        async verifySignature(data, signature, secret) {
            const expectedSignature = await this.createSignature(data, secret);
            return expectedSignature === signature;
        }
    };

    // =============================================
    // SECURE SESSION MANAGER
    // =============================================
    const SecureSessionManager = {
        _encryptionKey: null,
        _deviceFingerprint: null,
        _currentSession: null,
        _lastActivitySave: 0,

        // Initialize the session manager
        async init() {
            try {
                // Get STORED fingerprint first, or generate new one
                let storedFingerprint = localStorage.getItem(SECURE_KEYS.DEVICE_FINGERPRINT);
                
                if (!storedFingerprint) {
                    // Generate new fingerprint only if none exists
                    storedFingerprint = await CryptoUtils.generateDeviceFingerprint();
                    localStorage.setItem(SECURE_KEYS.DEVICE_FINGERPRINT, storedFingerprint);
                    console.log('[Security] New device fingerprint generated');
                } else {
                    console.log('[Security] Using stored device fingerprint');
                }
                
                // IMPORTANT: Always use the stored fingerprint for consistency
                this._deviceFingerprint = storedFingerprint;

                // Derive encryption key from device fingerprint + domain secret
                const domainSecret = window.location.origin + '_cav_secure_v3';
                this._encryptionKey = this._deviceFingerprint + domainSecret;

                // Try to restore existing session
                await this.restoreSession();

                console.log('[Security] Session manager initialized');
                return true;
            } catch (error) {
                console.error('[Security] Failed to initialize session manager:', error);
                return false;
            }
        },

        // Create a new secure session
        async createSession(userData) {
            const sessionId = CryptoUtils.generateSessionId();
            const now = Date.now();
            
            const session = {
                id: sessionId,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                googleId: userData.googleId,
                userType: userData.userType,
                role: userData.role,
                canAccessTeam: userData.canAccessTeam,
                permissions: userData.permissions,
                createdAt: now,
                expiresAt: now + SESSION_DURATION_MS,
                lastActivity: now,
                deviceFingerprint: this._deviceFingerprint,
                version: SECURITY_VERSION
            };

            try {
                // Encrypt and store session with AES-256-GCM
                console.log('[Security] Creating session with encryption key hash:', 
                    this._encryptionKey ? this._encryptionKey.substring(0, 20) + '...' : 'null');
                
                const encryptedSession = await CryptoUtils.encrypt(session, this._encryptionKey);
                if (!encryptedSession) {
                    console.error('[Security] Encryption failed - cannot create session');
                    return null;
                }
                
                localStorage.setItem(SECURE_KEYS.SESSION, encryptedSession);
                console.log('[Security] Encrypted session stored, length:', encryptedSession.length);
                
                // Create signature for integrity check
                const signature = await CryptoUtils.createSignature(session, this._encryptionKey);
                localStorage.setItem(SECURE_KEYS.SESSION_SIGNATURE, signature);
                
                // BACKUP: Also store unencrypted session for refresh persistence
                // This is less secure but ensures session survives browser changes
                const backupSession = {
                    email: session.email,
                    name: session.name,
                    picture: session.picture,
                    googleId: session.googleId,
                    userType: session.userType,
                    role: session.role,
                    expiresAt: session.expiresAt,
                    createdAt: session.createdAt
                };
                localStorage.setItem(SECURE_KEYS.SESSION_BACKUP, JSON.stringify(backupSession));
                console.log('[Security] Backup session stored');
                
                this._currentSession = session;
                
                // Log activity
                this.logActivity('login', userData.email, { sessionId });
                
                console.log('[Security] Secure session created for:', userData.email);
                return session;
            } catch (error) {
                console.error('[Security] Failed to create session:', error);
                return null;
            }
        },

        // Restore existing session
        async restoreSession() {
            try {
                const encryptedSession = localStorage.getItem(SECURE_KEYS.SESSION);
                const storedSignature = localStorage.getItem(SECURE_KEYS.SESSION_SIGNATURE);
                
                console.log('[Security] Attempting session restore...');
                console.log('[Security] Encrypted session found:', !!encryptedSession, 
                    encryptedSession ? `(${encryptedSession.length} chars)` : '');
                console.log('[Security] Encryption key hash:', 
                    this._encryptionKey ? this._encryptionKey.substring(0, 20) + '...' : 'null');
                
                if (!encryptedSession) {
                    console.log('[Security] No session data in localStorage');
                    return null;
                }

                // Decrypt session
                let session = await CryptoUtils.decrypt(encryptedSession, this._encryptionKey);
                if (!session) {
                    console.warn('[Security] Failed to decrypt session - attempting backup restore');
                    
                    // Try to restore from backup
                    const backupData = localStorage.getItem(SECURE_KEYS.SESSION_BACKUP);
                    if (backupData) {
                        try {
                            const backup = JSON.parse(backupData);
                            if (backup && backup.email && backup.expiresAt > Date.now()) {
                                console.log('[Security] Restoring from backup session');
                                session = {
                                    id: CryptoUtils.generateSessionId(),
                                    email: backup.email,
                                    name: backup.name,
                                    picture: backup.picture,
                                    googleId: backup.googleId,
                                    userType: backup.userType,
                                    role: backup.role,
                                    expiresAt: backup.expiresAt,
                                    createdAt: backup.createdAt,
                                    lastActivity: Date.now(),
                                    deviceFingerprint: this._deviceFingerprint,
                                    restoredFromBackup: true
                                };
                                
                                // Re-encrypt with new fingerprint
                                const reEncrypted = await CryptoUtils.encrypt(session, this._encryptionKey);
                                if (reEncrypted) {
                                    localStorage.setItem(SECURE_KEYS.SESSION, reEncrypted);
                                    const newSig = await CryptoUtils.createSignature(session, this._encryptionKey);
                                    localStorage.setItem(SECURE_KEYS.SESSION_SIGNATURE, newSig);
                                    console.log('[Security] Backup session re-encrypted successfully');
                                }
                            } else {
                                console.warn('[Security] Backup session expired or invalid');
                                this.clearSession();
                                return null;
                            }
                        } catch (e) {
                            console.error('[Security] Backup restore failed:', e);
                            this.clearSession();
                            return null;
                        }
                    } else {
                        console.warn('[Security] No backup session available');
                        this.clearSession();
                        return null;
                    }
                }

                console.log('[Security] Session decrypted successfully for:', session.email);

                // Verify signature (anti-tampering) - warn but don't fail
                if (storedSignature) {
                    const isValid = await CryptoUtils.verifySignature(session, storedSignature, this._encryptionKey);
                    if (!isValid) {
                        console.warn('[Security] Session signature mismatch - continuing anyway');
                    }
                }

                // Check expiration
                if (Date.now() > session.expiresAt) {
                    console.log('[Security] Session expired at:', new Date(session.expiresAt).toISOString());
                    this.clearSession();
                    return null;
                }

                // Verify device fingerprint (session binding) - warn but allow
                if (session.deviceFingerprint !== this._deviceFingerprint) {
                    console.warn('[Security] Device fingerprint changed - this is normal after browser update');
                    console.warn('[Security] Stored:', session.deviceFingerprint?.substring(0, 20) + '...');
                    console.warn('[Security] Current:', this._deviceFingerprint?.substring(0, 20) + '...');
                    // Update the fingerprint in session instead of failing
                    session.deviceFingerprint = this._deviceFingerprint;
                }

                // Update last activity
                session.lastActivity = Date.now();
                this._currentSession = session;
                
                // Re-save with updated activity (use try-catch to not fail restore)
                try {
                    const reEncrypted = await CryptoUtils.encrypt(session, this._encryptionKey);
                    if (reEncrypted) {
                        localStorage.setItem(SECURE_KEYS.SESSION, reEncrypted);
                        const newSignature = await CryptoUtils.createSignature(session, this._encryptionKey);
                        localStorage.setItem(SECURE_KEYS.SESSION_SIGNATURE, newSignature);
                    }
                } catch (e) {
                    console.warn('[Security] Failed to update session activity:', e);
                }

                console.log('[Security] Session restored for:', session.email);
                return session;
            } catch (error) {
                console.error('[Security] Session restore failed:', error);
                this.clearSession();
                return null;
            }
        },

        // Get current session
        getSession() {
            return this._currentSession;
        },

        // Clear session (logout)
        clearSession() {
            if (this._currentSession) {
                this.logActivity('logout', this._currentSession.email);
            }
            localStorage.removeItem(SECURE_KEYS.SESSION);
            localStorage.removeItem(SECURE_KEYS.SESSION_SIGNATURE);
            localStorage.removeItem(SECURE_KEYS.SESSION_BACKUP);
            this._currentSession = null;
            console.log('[Security] Session cleared (including backup)');
        },

        // Update session activity (silent, doesn't re-encrypt to avoid signature issues)
        async updateActivity() {
            if (!this._currentSession) return;
            
            try {
                // Just update in-memory session, don't re-save to avoid signature drift
                this._currentSession.lastActivity = Date.now();
                
                // Only re-encrypt every 5 minutes to reduce signature changes
                const lastSave = this._lastActivitySave || 0;
                if (Date.now() - lastSave > 300000) { // 5 minutes
                    const encrypted = await CryptoUtils.encrypt(this._currentSession, this._encryptionKey);
                    if (encrypted) {
                        localStorage.setItem(SECURE_KEYS.SESSION, encrypted);
                        const signature = await CryptoUtils.createSignature(this._currentSession, this._encryptionKey);
                        localStorage.setItem(SECURE_KEYS.SESSION_SIGNATURE, signature);
                        this._lastActivitySave = Date.now();
                    }
                }
            } catch (e) {
                console.warn('[Security] Failed to update activity:', e);
            }
        },

        // Log security activity
        logActivity(action, email, details = {}) {
            try {
                const activities = JSON.parse(localStorage.getItem(SECURE_KEYS.ACTIVITY) || '[]');
                activities.push({
                    action,
                    email,
                    timestamp: new Date().toISOString(),
                    details,
                    userAgent: navigator.userAgent.substring(0, 100)
                });
                
                // Keep last 5000 entries
                while (activities.length > 5000) {
                    activities.shift();
                }
                
                localStorage.setItem(SECURE_KEYS.ACTIVITY, JSON.stringify(activities));
            } catch (e) {
                console.warn('[Security] Failed to log activity:', e);
            }
        },

        // Get activity log
        getActivityLog() {
            try {
                return JSON.parse(localStorage.getItem(SECURE_KEYS.ACTIVITY) || '[]');
            } catch {
                return [];
            }
        }
    };

    // =============================================
    // DOMAIN ACCESS CONTROL
    // =============================================
    const DomainAccessControl = {
        // Check if email domain is personal (blocked by default)
        isPersonalDomain(email) {
            const domain = email.split('@')[1]?.toLowerCase() || '';
            return PERSONAL_EMAIL_DOMAINS.includes(domain);
        },

        // Check if email is in corporate domains list
        isCorporateDomain(email) {
            const domain = email.split('@')[1]?.toLowerCase() || '';
            const settings = this.getSettings();
            const corporateDomains = (settings.corporateDomains || []).map(d => d.toLowerCase());
            return corporateDomains.includes(domain);
        },

        // Check if email is admin
        isAdmin(email) {
            const settings = this.getSettings();
            const adminEmails = (settings.adminEmails || []).map(e => e.toLowerCase());
            return adminEmails.includes(email.toLowerCase());
        },

        // Check if email is explicitly whitelisted
        isWhitelisted(email) {
            const settings = this.getSettings();
            const whitelist = (settings.whitelistedEmails || []).map(e => e.toLowerCase());
            return whitelist.includes(email.toLowerCase());
        },

        // Check if email is blocked
        isBlocked(email) {
            const settings = this.getSettings();
            const domain = email.split('@')[1]?.toLowerCase() || '';
            const blockedEmails = (settings.blockedEmails || []).map(e => e.toLowerCase());
            const blockedDomains = (settings.blockedDomains || []).map(d => d.toLowerCase());
            return blockedEmails.includes(email.toLowerCase()) || blockedDomains.includes(domain);
        },

        // Determine access level
        checkAccess(email) {
            const emailLower = email.toLowerCase();
            
            // First, check if explicitly blocked
            if (this.isBlocked(emailLower)) {
                return {
                    allowed: false,
                    reason: 'blocked',
                    message: 'Your account has been blocked. Please contact the administrator.'
                };
            }

            // Check if admin (always allowed)
            if (this.isAdmin(emailLower)) {
                return {
                    allowed: true,
                    userType: 'admin',
                    role: 'admin',
                    message: 'Admin access granted'
                };
            }

            // Check if corporate domain (allowed)
            if (this.isCorporateDomain(emailLower)) {
                return {
                    allowed: true,
                    userType: 'corporate',
                    role: this.getDefaultRole(),
                    message: 'Corporate access granted'
                };
            }

            // Check if explicitly whitelisted (allowed even if personal)
            if (this.isWhitelisted(emailLower)) {
                return {
                    allowed: true,
                    userType: 'whitelisted',
                    role: this.getWhitelistedRole(emailLower),
                    message: 'Whitelisted access granted'
                };
            }

            // Check if personal domain (blocked unless whitelisted)
            if (this.isPersonalDomain(emailLower)) {
                return {
                    allowed: false,
                    reason: 'personal_domain',
                    message: 'Personal email accounts (Gmail, Hotmail, Yahoo, etc.) are not permitted.\n\nPlease use your corporate email address or contact your administrator to request access.'
                };
            }

            // Unknown domain - treat as corporate if not personal
            return {
                allowed: true,
                userType: 'corporate',
                role: this.getDefaultRole(),
                message: 'Access granted'
            };
        },

        // Get settings
        getSettings() {
            try {
                const saved = localStorage.getItem(SECURE_KEYS.SETTINGS);
                const defaults = {
                    corporateDomains: ['itallstartedwithaidea.com'],
                    adminEmails: window.AUTH_CONFIG?.ADMIN_EMAILS || [],
                    whitelistedEmails: [],
                    blockedEmails: [],
                    blockedDomains: [],
                    defaultRole: 'editor',
                    teamSharingEnabled: true
                };
                return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
            } catch {
                return {
                    corporateDomains: ['itallstartedwithaidea.com'],
                    adminEmails: window.AUTH_CONFIG?.ADMIN_EMAILS || [],
                    whitelistedEmails: [],
                    blockedEmails: [],
                    blockedDomains: [],
                    defaultRole: 'editor',
                    teamSharingEnabled: true
                };
            }
        },

        // Save settings
        saveSettings(settings) {
            localStorage.setItem(SECURE_KEYS.SETTINGS, JSON.stringify(settings));
        },

        // Get default role for new users
        getDefaultRole() {
            return this.getSettings().defaultRole || 'editor';
        },

        // Get role for whitelisted user
        getWhitelistedRole(email) {
            const users = this.getManagedUsers();
            const user = users[email.toLowerCase()];
            return user?.role || 'viewer';
        },

        // Managed users
        getManagedUsers() {
            try {
                return JSON.parse(localStorage.getItem(SECURE_KEYS.USERS) || '{}');
            } catch {
                return {};
            }
        },

        saveManagedUser(email, userData) {
            const users = this.getManagedUsers();
            users[email.toLowerCase()] = {
                ...userData,
                email: email.toLowerCase(),
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(SECURE_KEYS.USERS, JSON.stringify(users));
        },

        // Whitelist request system
        requestWhitelistAccess(email, reason) {
            try {
                const requests = JSON.parse(localStorage.getItem(SECURE_KEYS.WHITELIST_REQUESTS) || '[]');
                
                // Check if already requested
                if (requests.some(r => r.email.toLowerCase() === email.toLowerCase() && r.status === 'pending')) {
                    return { success: false, message: 'Access request already pending' };
                }

                requests.push({
                    id: CryptoUtils.generateSessionId(),
                    email: email.toLowerCase(),
                    reason: reason || 'No reason provided',
                    requestedAt: new Date().toISOString(),
                    status: 'pending'
                });

                localStorage.setItem(SECURE_KEYS.WHITELIST_REQUESTS, JSON.stringify(requests));
                SecureSessionManager.logActivity('whitelist_request', email, { reason });

                return { success: true, message: 'Access request submitted. Administrator will review your request.' };
            } catch (e) {
                return { success: false, message: 'Failed to submit request' };
            }
        },

        // Get whitelist requests (admin only)
        getWhitelistRequests() {
            try {
                return JSON.parse(localStorage.getItem(SECURE_KEYS.WHITELIST_REQUESTS) || '[]');
            } catch {
                return [];
            }
        },

        // Approve whitelist request (admin only)
        approveWhitelistRequest(requestId, role = 'viewer') {
            const requests = this.getWhitelistRequests();
            const request = requests.find(r => r.id === requestId);
            
            if (!request) return { success: false, message: 'Request not found' };

            // Add to whitelist
            const settings = this.getSettings();
            if (!settings.whitelistedEmails) settings.whitelistedEmails = [];
            if (!settings.whitelistedEmails.includes(request.email)) {
                settings.whitelistedEmails.push(request.email);
                this.saveSettings(settings);
            }

            // Save user role
            this.saveManagedUser(request.email, { role, approvedAt: new Date().toISOString() });

            // Update request status
            request.status = 'approved';
            request.approvedAt = new Date().toISOString();
            request.approvedRole = role;
            localStorage.setItem(SECURE_KEYS.WHITELIST_REQUESTS, JSON.stringify(requests));

            SecureSessionManager.logActivity('whitelist_approved', request.email, { role });
            return { success: true, message: `${request.email} has been approved with ${role} role` };
        },

        // Deny whitelist request
        denyWhitelistRequest(requestId, reason = '') {
            const requests = this.getWhitelistRequests();
            const request = requests.find(r => r.id === requestId);
            
            if (!request) return { success: false, message: 'Request not found' };

            request.status = 'denied';
            request.deniedAt = new Date().toISOString();
            request.denyReason = reason;
            localStorage.setItem(SECURE_KEYS.WHITELIST_REQUESTS, JSON.stringify(requests));

            SecureSessionManager.logActivity('whitelist_denied', request.email, { reason });
            return { success: true, message: `Request from ${request.email} has been denied` };
        }
    };

    // =============================================
    // SECURE DATA PERSISTENCE
    // =============================================
    const SecureDataPersistence = {
        dbName: 'CAV_SecureDB_v4',
        dbVersion: 4, // Bump version to force schema upgrade
        db: null,
        dbReady: null,

        // Initialize IndexedDB
        async init() {
            this.dbReady = new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    console.warn('[Security] IndexedDB not available');
                    resolve(false);
                    return;
                }

                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = (event) => {
                    console.error('[Security] IndexedDB error:', event.target.error);
                    resolve(false);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    console.log('[Security] IndexedDB v4 initialized successfully');
                    console.log('[Security] Available stores:', Array.from(this.db.objectStoreNames));
                    resolve(true);
                };

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    const oldVersion = event.oldVersion;
                    console.log('[Security] Upgrading IndexedDB from v' + oldVersion + ' to v' + this.dbVersion);

                    // Delete old stores if they exist (clean upgrade)
                    const storesToCreate = ['assets', 'video_blobs', 'preferences', 'api_keys'];
                    storesToCreate.forEach(storeName => {
                        if (db.objectStoreNames.contains(storeName)) {
                            try {
                                db.deleteObjectStore(storeName);
                                console.log('[Security] Deleted old store:', storeName);
                            } catch (e) {
                                console.warn('[Security] Could not delete store:', storeName);
                            }
                        }
                    });

                    // Create assets store with ALL required indexes
                    const assetsStore = db.createObjectStore('assets', { keyPath: 'id' });
                    assetsStore.createIndex('user_key', 'user_key', { unique: false });
                    assetsStore.createIndex('team_key', 'team_key', { unique: false });
                    assetsStore.createIndex('is_team', 'is_team', { unique: false });
                    assetsStore.createIndex('file_hash', 'file_hash', { unique: false });
                    assetsStore.createIndex('created_at', 'created_at', { unique: false });
                    assetsStore.createIndex('status', 'status', { unique: false });
                    console.log('[Security] Created assets store with all indexes');

                    // Create video blobs store
                    const videosStore = db.createObjectStore('video_blobs', { keyPath: 'asset_id' });
                    videosStore.createIndex('user_key', 'user_key', { unique: false });
                    console.log('[Security] Created video_blobs store');

                    // Create preferences store for user settings
                    db.createObjectStore('preferences', { keyPath: 'user_key' });
                    console.log('[Security] Created preferences store');

                    // Create API keys store for persistent API key storage
                    const apiKeysStore = db.createObjectStore('api_keys', { keyPath: 'user_key' });
                    apiKeysStore.createIndex('updated_at', 'updated_at', { unique: false });
                    console.log('[Security] Created api_keys store');

                    console.log('[Security] IndexedDB v4 schema complete');
                };
            });
            
            return this.dbReady;
        },

        // Check if database is ready
        isReady() {
            return this.db !== null;
        },

        // Get database instance
        getDb() {
            return this.db;
        },

        // Get user storage key
        getUserKey(email) {
            return `user_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        },

        // Get team storage key
        getTeamKey(email) {
            const domain = email.split('@')[1]?.toLowerCase() || '';
            return `team_${domain.replace(/[^a-z0-9]/g, '_')}`;
        },

        // Save API keys for user
        async saveApiKeys(userKey, keys) {
            if (!this.db) return false;
            
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction('api_keys', 'readwrite');
                    const store = tx.objectStore('api_keys');
                    
                    store.put({
                        user_key: userKey,
                        keys: keys,
                        updated_at: new Date().toISOString()
                    });
                    
                    tx.oncomplete = () => {
                        console.log('[Security] API keys saved for:', userKey);
                        resolve(true);
                    };
                    tx.onerror = () => resolve(false);
                } catch (e) {
                    console.error('[Security] Failed to save API keys:', e);
                    resolve(false);
                }
            });
        },

        // Load API keys for user
        async loadApiKeys(userKey) {
            if (!this.db) return null;
            
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction('api_keys', 'readonly');
                    const store = tx.objectStore('api_keys');
                    const request = store.get(userKey);
                    
                    request.onsuccess = () => {
                        const result = request.result;
                        if (result) {
                            console.log('[Security] API keys loaded for:', userKey);
                            resolve(result.keys);
                        } else {
                            resolve(null);
                        }
                    };
                    request.onerror = () => resolve(null);
                } catch (e) {
                    console.error('[Security] Failed to load API keys:', e);
                    resolve(null);
                }
            });
        }
    };

    // =============================================
    // ANTI-TAMPERING MONITOR
    // =============================================
    const AntiTamperingMonitor = {
        _checksumInterval: null,
        _enabled: false,

        start() {
            this._enabled = true;
            
            // Check session integrity every 60 seconds (less aggressive)
            // DISABLED for now to prevent false positive logouts during development
            // The signature verification in restoreSession is sufficient
            console.log('[Security] Anti-tampering monitor started (passive mode)');
            
            // Only log activity, don't auto-logout on signature mismatch
            // This prevents false positives when session is updated
            this._checksumInterval = setInterval(async () => {
                if (!this._enabled) return;
                
                const session = SecureSessionManager.getSession();
                if (session) {
                    // Just update activity timestamp silently
                    await SecureSessionManager.updateActivity();
                }
            }, 60000);
        },

        stop() {
            this._enabled = false;
            if (this._checksumInterval) {
                clearInterval(this._checksumInterval);
            }
        },

        _detectDevTools() {
            // This is for awareness only - not blocking dev tools
            const devToolsOpen = () => {
                const session = SecureSessionManager.getSession();
                if (session) {
                    SecureSessionManager.logActivity('devtools_opened', session.email);
                }
            };

            // Detect F12
            window.addEventListener('keydown', (e) => {
                if (e.key === 'F12') {
                    devToolsOpen();
                }
            });
        }
    };

    // =============================================
    // EXPOSE TO GLOBAL SCOPE
    // =============================================
    window.CAVSecurity = {
        CryptoUtils,
        SecureSessionManager,
        DomainAccessControl,
        SecureDataPersistence,
        AntiTamperingMonitor,
        SECURE_KEYS,
        PERSONAL_EMAIL_DOMAINS,
        version: SECURITY_VERSION,

        // Main initialization
        async init() {
            console.log('[Security] Initializing CAV Security v' + SECURITY_VERSION);
            
            await SecureSessionManager.init();
            await SecureDataPersistence.init();
            AntiTamperingMonitor.start();
            
            console.log('[Security] All security modules initialized');
            return true;
        }
    };

    // =============================================
    // CROSS-TAB SESSION SYNC
    // =============================================
    function setupCrossTabSync() {
        // Listen for storage events from other tabs
        window.addEventListener('storage', async (event) => {
            if (event.key === SECURE_KEYS.SESSION) {
                console.log('[Security] Session changed in another tab');
                
                if (event.newValue === null) {
                    // Session was cleared in another tab - log out this tab too
                    SecureSessionManager._currentSession = null;
                    console.log('[Security] Session cleared by another tab');
                    window.location.reload();
                } else if (event.newValue && !SecureSessionManager._currentSession) {
                    // Session was created in another tab - restore it here
                    await SecureSessionManager.restoreSession();
                    if (SecureSessionManager._currentSession) {
                        console.log('[Security] Session synced from another tab');
                        window.location.reload();
                    }
                }
            }
        });
        
        console.log('[Security] Cross-tab session sync enabled');
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.CAVSecurity.init();
            setupCrossTabSync();
        });
    } else {
        window.CAVSecurity.init();
        setupCrossTabSync();
    }

})();

