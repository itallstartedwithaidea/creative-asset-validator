# Creative Asset Validator - Master Plan

## Project Overview

Transform the Creative Asset Validator from a standalone browser tool into a Cloudinary MCP-powered platform with educational content, advertising-specific examples, and selective integration into googleadsagent.ai.

---

## Workstream 1: Slack Response for Alisa / Trex Team

### What Makes This Uniquely Valuable vs Generic Resize Tools

**For Alisa's request** — here's the bulleted list of features built/developed that are uniquely valuable compared to a local crop/resize tool (like the Windows app Taylor shared):

1. **Advertising-Aware Validation** — Not just resize. Validates assets against 50+ platform specs simultaneously (YouTube, TikTok, Meta, Google Ads, DV360, The Trade Desk, CTV). Knows the exact pixel dimensions, aspect ratios, file size limits, and duration constraints for each placement.

2. **AI Generative Fill (Not Just Crop)** — Uses Cloudinary's `b_gen_fill` and Google Gemini outpainting to *extend* images to new aspect ratios without losing content. A 1:1 image becomes a 16:9 asset with AI-generated background — not a cropped version with missing content.

3. **One-Click "Fix All"** — Upload one image, click "AI Fix All 163" (as shown in screenshots), and the tool generates correctly-sized derivatives for every off-size channel simultaneously. The Windows tool does one image at a time manually.

4. **Image-to-Video (Animate)** — Converts still images to video ads using Google Veo 3.1. Produces 4-10 second motion creative from a single image. No local tool can do this.

5. **Cloud-Based via Cloudinary** — All processing happens via Cloudinary URL transformations and CDN. No local install, no OS dependency, works on any device. Assets are stored, transformed, and delivered via Cloudinary's global CDN.

6. **Multi-Platform Ad Spec Packages** — Pre-built packages for "GDN Essential" (all Google Display sizes), "TTD Complete" (The Trade Desk), "DV360 Complete", and "Universal Display". One click generates all sizes for an entire platform buy.

7. **Brand Kit Generator** — Upload one logo → generate 100+ format variations (social profiles, covers, Google Ads banners, favicons, email signatures). Uses Cloudinary smart-crop and auto-padding.

8. **Video Intelligence** — Multi-model AI analysis of video ads (hook scoring, CTA detection, brand compliance, performance prediction). Uses Gemini, GPT-5.2, and Claude for comprehensive creative analysis.

9. **Browser-Based, No Backend Required** — Unlike the Windows app (local install, Windows-only), this runs in any browser. Could be embedded as a Cloudinary-powered widget for any client.

10. **Cloudinary MCP-Ready** — Can be extended into an MCP server so AI agents (Claude, Cursor, Copilot) can validate and resize assets via natural language. "Resize this image for all Meta placements" becomes a single prompt.

### Key Differentiator Summary

> The Windows tool is a **local crop/resize utility**. This is an **advertising creative intelligence platform** that uses Cloudinary for cloud processing, AI for content-aware resizing, and knows the exact specs for every major ad platform. It answers: "Is this asset ready for my campaign?" — not just "What size is this image?"

---

## Workstream 2: Cloudinary MCP Integration

### Current State

Cloudinary already has official MCP servers (Beta):
- **Asset Management** — Upload, manage, transform, search (`@cloudinary/asset-management`)
- **Environment Config** — Upload presets, named transformations, webhooks
- **Structured Metadata** — Metadata fields and rules
- **Analysis** — AI-powered tagging, moderation, object detection

### The Gap / Opportunity

The official Cloudinary MCP handles generic media operations. **What's missing is advertising-specific intelligence:**

- "Resize this image for all Google Ads Display placements" (needs ad spec knowledge)
- "Is this video compliant for TikTok?" (needs platform spec validation)
- "Generate all Meta placement derivatives from this master creative" (needs batch resize + specs)
- "Score this creative for hook effectiveness" (needs AI creative analysis)

### Proposed: Ad Creative MCP Server

Build a **custom MCP server** (`@itallstartedwithaidea/ad-creative-mcp`) that:

1. **Wraps the Cloudinary MCP** for media operations (upload, transform, CDN)
2. **Adds ad platform specs** (50+ channels with exact requirements)
3. **Exposes advertising-specific tools:**

| MCP Tool | Description |
|----------|-------------|
| `validate_asset` | Check an asset against all platform specs, return compatible/off-size channels |
| `resize_for_platform` | Resize an asset for a specific platform using Cloudinary transforms + gen fill |
| `batch_resize` | Generate all derivatives for a platform package (e.g., "GDN Essential") |
| `analyze_creative` | AI analysis of creative effectiveness (hook, CTA, brand compliance) |
| `generate_brand_kit` | Upload logo → generate all format variations via Cloudinary |
| `animate_image` | Convert still image to video using Veo 3.1 |
| `get_platform_specs` | Return specs for any supported advertising platform |
| `check_compliance` | Validate asset against platform-specific policies |

### Architecture

```
┌─────────────────────────────────────────┐
│         Ad Creative MCP Server          │
│  (@itallstartedwithaidea/ad-creative)   │
├─────────────────────────────────────────┤
│  Tools:                                 │
│  - validate_asset                       │
│  - resize_for_platform                  │
│  - batch_resize                         │
│  - analyze_creative                     │
│  - generate_brand_kit                   │
│  - animate_image                        │
│  - get_platform_specs                   │
│  - check_compliance                     │
├─────────────────────────────────────────┤
│  Resources:                             │
│  - Platform spec database               │
│  - Transformation rules                 │
│  - Ad policy references                 │
├─────────────────────────────────────────┤
│  Dependencies:                          │
│  - Cloudinary SDK (upload, transform)   │
│  - Google GenAI (Gemini, Veo)           │
│  - Channel specs (extracted from app)   │
└─────────────────────────────────────────┘
```

### Implementation Plan

1. Extract `CHANNEL_SPECS` from `ai-library-integration.js` into standalone JSON
2. Extract Cloudinary transform logic from `cloudinary-client.js` into Node.js module
3. Build MCP server using `@modelcontextprotocol/sdk`
4. Publish to npm as `@itallstartedwithaidea/ad-creative-mcp`
5. Add to Cloudinary MCP ecosystem documentation

---

## Workstream 3: Educational Material

### Target Audience

Non-technical advertising professionals (per Alisa's note: "for an audience that isn't highly technical")

### Content Plan

#### Tutorial 1: "Cloudinary MCP for Google Ads Creative"

**Scenario**: You have one hero image and need all Google Ads Display sizes.

**Steps**:
1. Set up Cloudinary MCP in Cursor/Claude Desktop
2. Upload master creative via MCP
3. "Generate all Google Ads Display sizes from my uploaded image"
4. MCP calls: upload → validate → batch_resize (300x250, 728x90, 160x600, 336x280, etc.)
5. Download all derivatives or get CDN URLs

**Spec Coverage**:
- Responsive Display: 1.91:1, 1:1, 4:5
- Standard Display: 300x250, 728x90, 160x600, 336x280, 300x600, 320x50, 320x100
- PMax: All responsive sizes + video 16:9, 1:1, 9:16

#### Tutorial 2: "Cloudinary MCP for Facebook/Meta Campaigns"

**Scenario**: Prepare creative for a full Meta campaign.

**Steps**:
1. Upload source creative
2. "Validate this image for all Meta placements"
3. "Generate derivatives for Facebook Feed, Stories, Reels, Instagram Feed, Stories"
4. MCP generates: 1:1 (Feed), 9:16 (Stories/Reels), 16:9 (In-stream), 1.91:1 (Marketplace)
5. AI analysis of each derivative for hook/CTA effectiveness

**Spec Coverage**:
- Facebook: Feed (1:1, 4:5), Stories (9:16), In-stream (16:9), Marketplace (1:1)
- Instagram: Feed (1:1, 4:5), Stories (9:16), Reels (9:16), Explore (1:1)
- Audience Network: Banner (16:9), Interstitial (1:1)

#### Tutorial 3: "Cloudinary MCP for Programmatic Display"

**Scenario**: Prepare creative for multi-DSP programmatic buy.

**Steps**:
1. Upload master creative
2. "Generate all standard IAB display sizes using Cloudinary"
3. "Also generate sizes for The Trade Desk and DV360"
4. MCP generates 20+ exact pixel sizes with gen fill
5. Validate file sizes are under platform limits

**Spec Coverage**:
- IAB Standard: 300x250, 728x90, 160x600, 300x600, 320x50, 970x250, 970x90
- The Trade Desk: All IAB + CTV (1920x1080)
- DV360: All IAB + YouTube companion sizes
- CTV: 1920x1080, 1280x720

### Delivery Format

- GitHub Wiki pages (step-by-step with screenshots)
- README examples in the MCP server repo
- Blog-ready markdown for cloudinary.com
- Video script outlines for each tutorial

---

## Workstream 4: Security Remediation

### Critical Issues to Fix

| Priority | File | Issue | Fix |
|----------|------|-------|-----|
| CRITICAL | `integrations.js` | Dropbox app secret in client code | Remove; move to backend/env |
| HIGH | `supabase-backend.js` | Supabase URL + anon key hardcoded | Move to env vars |
| HIGH | `supabase-video-client.js` | Same Supabase credentials | Move to env vars |
| HIGH | `supabase-full-integration.js` | Same Supabase credentials | Move to env vars |
| MEDIUM | `auth-config.production.js` | Admin emails visible | Move to env or server-side |
| MEDIUM | `supabase-backend.js` | XOR encryption for API keys | Replace with AES |
| LOW | `security-production.js` | CSP uses unsafe-inline/eval | Strengthen CSP |

### Approach

1. Create `.env.example` with all required env vars
2. Replace hardcoded values with runtime config loading
3. Add `auth-config.production.js` to `.gitignore`
4. Document environment setup in wiki

---

## Workstream 5: GitHub Wiki

### Proposed Wiki Structure

```
Home.md
├── Getting-Started.md
├── Architecture.md
├── Features/
│   ├── Asset-Validation.md
│   ├── AI-Fix-All.md
│   ├── Animate.md
│   ├── Brand-Kit-Generator.md
│   ├── AI-Studio.md
│   ├── Video-Analysis.md
│   ├── CRM.md
│   └── Integrations.md
├── Cloudinary-Integration/
│   ├── Overview.md
│   ├── MCP-Setup.md
│   ├── Transformation-Reference.md
│   └── BYOK-Configuration.md
├── MCP-Tutorials/
│   ├── Google-Ads-Creative.md
│   ├── Facebook-Meta-Creative.md
│   └── Programmatic-Display.md
├── Platform-Specs/
│   ├── Social-Platforms.md
│   ├── Display-Advertising.md
│   ├── Video-Platforms.md
│   └── CTV.md
├── Security.md
├── Deployment.md
└── API-Reference.md
```

---

## Workstream 6: googleadsagent.ai Integration

### Scope

Only add these three features to googleadsagent.ai:
1. **Asset Resizer** — Upload → resize for ad platforms
2. **Asset Validator** — Check asset compliance against platform specs
3. **Animate** — Image-to-video conversion

### Access Control
- Requires Google login (already in place on googleadsagent.ai)
- Requires credits (needs credit system implementation)
- Uses Cloudinary for processing (BYOK or shared credentials)

### Implementation Approach

1. Extract resizer/validator/animate as standalone ES modules
2. Create `/tools/creative-validator/` route on googleadsagent.ai
3. Embed as iframe or import modules directly
4. Gate behind auth + credit check
5. Cloudinary processing uses shared org credentials with per-user quotas

### Module Extraction Plan

From `ai-library-integration.js`:
- `CHANNEL_SPECS` → `specs.json`
- `analyzeAsset()` → `validator.js`
- `createResizedVersion()` → `resizer.js`
- `openAnimationPanel()` + `generateVideoWithVeo()` → `animate.js`

From `cloudinary-client.js`:
- `resize()` → `cloudinary-resize.js`
- `resizeImageWithGenFill()` → `cloudinary-genfill.js`
- `resizeVideo()` → `cloudinary-video.js`

---

## Timeline / Priority Order

1. **Immediate** — Slack response for Alisa (unique value bullets)
2. **Week 1** — Security remediation (remove secrets from repo)
3. **Week 1-2** — GitHub Wiki (core pages + Cloudinary integration docs)
4. **Week 2-3** — MCP server build (ad-creative-mcp)
5. **Week 3-4** — Educational tutorials (Google Ads, Facebook, Display)
6. **Week 4-5** — googleadsagent.ai integration (resizer, validator, animate)

---

## Key Dependencies

- Cloudinary account with appropriate plan (for gen_fill, AI features)
- Google AI Studio API key (for Gemini/Veo)
- GitHub wiki enabled on the repo
- Access to googleadsagent.ai codebase for integration work
