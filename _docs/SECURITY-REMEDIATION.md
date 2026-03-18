# Security Remediation Guide

## Critical: Hardcoded Secrets in Source Control

The following credentials are currently hardcoded in client-side JavaScript files and visible in the public GitHub repo. They need to be:
1. **Removed** from source code
2. **Rotated** (generate new keys, invalidate old ones)
3. **Loaded** from environment variables or server-side configuration

---

## Issue 1: Dropbox App Secret (CRITICAL)

**File:** `integrations.js`, line 213
**Value:** `appSecret: 'REDACTED_DROPBOX_SECRET'`

**Risk:** Client-side secrets can be used to impersonate the Dropbox app, access user tokens, and perform unauthorized API calls.

**Fix:**
1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps) → regenerate app secret
2. Remove `appSecret` from `integrations.js`
3. Move Dropbox API calls that require the secret to a server-side function (Supabase Edge Function or PHP API)

---

## Issue 2: Supabase URL + Anon Key (HIGH)

**Files:**
- `supabase-backend.js` — URL + anon key
- `supabase-video-client.js` — URL
- `supabase-full-integration.js` — URL
- `video-intelligence-client.js` — URL + anon key

**Risk:** While Supabase anon keys are designed for client use, they should not be in source control for a public repo. Anyone can use these to hit your Supabase project. RLS policies are the real protection, but exposure increases attack surface.

**Fix:**
1. Replace hardcoded values with a config loader:
   ```javascript
   const SUPABASE_URL = window.__CAV_CONFIG__?.SUPABASE_URL || '';
   const SUPABASE_ANON_KEY = window.__CAV_CONFIG__?.SUPABASE_ANON_KEY || '';
   ```
2. Inject config at deployment time (Netlify/Vercel env vars → build-time injection)
3. Rotate the Supabase anon key after removal

---

## Issue 3: Google OAuth Client ID (MEDIUM)

**File:** `auth-config.production.js`, line with `clientId`
**Value:** `[REDACTED — Google OAuth Client ID]`

**Risk:** OAuth client IDs are semi-public (they appear in redirect URLs), but the admin email list is also exposed. The file should be loaded from environment config, not committed.

**Fix:**
1. Add `auth-config.production.js` to `.gitignore`
2. Keep `auth-config.example.js` as the template
3. Load client ID from deployment environment

---

## Issue 4: XOR Encryption for API Keys (MEDIUM)

**File:** `supabase-backend.js`
**Code:** `encryptKey()` / `decryptKey()` using XOR

**Risk:** XOR is trivially reversible. Shared API keys stored in Supabase are not meaningfully encrypted.

**Fix:** Replace XOR with AES-256-GCM (which is already implemented in `security-core.js`).

---

## Remediation Steps

### Immediate (Before Next Push)

1. Create `.env` from `.env.example` with real values
2. Remove `appSecret` from `integrations.js` line 213
3. Add `auth-config.production.js` to `.gitignore`

### Short-Term (This Sprint)

4. Replace hardcoded Supabase URLs with config-injected values
5. Rotate all exposed credentials (Dropbox, Supabase)
6. Replace XOR encryption with AES

### Long-Term

7. Move all server-requiring operations to Supabase Edge Functions
8. Implement proper CSP without `unsafe-inline` / `unsafe-eval`
9. Add automated secret scanning to CI (e.g., GitHub secret scanning, truffleHog)

---

## Files to Add to .gitignore

```
auth-config.production.js
.env
.env.local
.env.production
```
