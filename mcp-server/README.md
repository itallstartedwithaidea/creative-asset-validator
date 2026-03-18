# Ad Creative MCP Server

An MCP (Model Context Protocol) server that validates, resizes, and optimizes advertising creative assets across 50+ platforms using Cloudinary.

## What It Does

Upload one image. Get correctly-sized derivatives for every advertising platform — Google Ads, Facebook/Meta, TikTok, YouTube, DV360, The Trade Desk, CTV, and more.

- **validate_asset** — Check an asset against all 50+ platform specs instantly
- **resize_for_platform** — Generate a Cloudinary transform URL for any channel
- **batch_resize** — Generate all sizes for a platform package (e.g., "GDN Essential")
- **get_platform_specs** — Look up exact specs for any advertising platform
- **generate_transform_url** — Build custom Cloudinary transformation URLs
- **list_packages** — See all available platform packages

## Quick Start

### 1. Install in Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ad-creative": {
      "command": "node",
      "args": ["/path/to/creative-asset-validator/mcp-server/src/index.js"],
      "env": {
        "CLOUDINARY_CLOUD_NAME": "your_cloud_name",
        "CLOUDINARY_API_KEY": "your_api_key",
        "CLOUDINARY_API_SECRET": "your_api_secret"
      }
    }
  }
}
```

### 2. Install in Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ad-creative": {
      "command": "node",
      "args": ["/path/to/creative-asset-validator/mcp-server/src/index.js"],
      "env": {
        "CLOUDINARY_CLOUD_NAME": "your_cloud_name",
        "CLOUDINARY_API_KEY": "your_api_key",
        "CLOUDINARY_API_SECRET": "your_api_secret"
      }
    }
  }
}
```

## Example Prompts

### Validate an Asset

> "I have a 640x600 image. What platforms is it compatible with?"

The server checks against all specs and returns compatible channels, off-size channels with fix suggestions, and incompatible channels.

### Generate Google Ads Display Sizes

> "Generate all GDN Essential sizes from my uploaded image at campaigns/hero"

Returns Cloudinary transformation URLs for: 300x250, 728x90, 160x600, 336x280, 300x600, 320x50, 320x100, 970x250.

### Resize for Facebook Stories

> "Resize my image for Facebook Stories"

Returns a URL with `c_pad,b_gen_fill` to extend the image to 9:16 with AI-generated content.

### Get Platform Specs

> "What are the specs for TikTok?"

Returns all TikTok channel specs including dimensions, aspect ratios, and duration limits.

## Platform Packages

| Package | Channels |
|---------|----------|
| GDN Essential | 8 core Google Display sizes |
| TTD Complete | 11 Trade Desk sizes |
| DV360 Complete | 12 DV360 sizes including native |
| Meta Complete | 14 Facebook + Instagram placements |
| Universal Display | 15 IAB standard sizes |

## Works With

- Cursor
- Claude Desktop
- Claude Code
- VS Code (with Copilot)
- Windsurf
- Any MCP-compatible client

## Pairs With Cloudinary MCP

This server complements the [official Cloudinary MCP servers](https://cloudinary.com/documentation/cloudinary_llm_mcp) by adding advertising-specific intelligence. Use both together:

1. **Cloudinary MCP** — Upload, manage, and transform media assets
2. **Ad Creative MCP** — Validate against ad platform specs and generate platform-specific derivatives

## License

MIT
