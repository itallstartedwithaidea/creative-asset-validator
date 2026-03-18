#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { v2 as cloudinary } from 'cloudinary';
import {
  CHANNEL_SPECS,
  PLATFORM_PACKAGES,
  validateAsset,
  checkChannelCompatibility,
  parseAspectRatio,
} from './specs.js';

const server = new Server(
  { name: 'ad-creative-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Tools ───────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'validate_asset',
      description: 'Validate an image or video asset against 50+ advertising platform specs. Returns compatible channels, off-size channels with fix suggestions, and incompatible channels.',
      inputSchema: {
        type: 'object',
        properties: {
          width: { type: 'number', description: 'Asset width in pixels' },
          height: { type: 'number', description: 'Asset height in pixels' },
          type: { type: 'string', enum: ['image', 'video'], description: 'Asset type' },
          duration: { type: 'number', description: 'Video duration in seconds (video only)' },
          fileSizeMB: { type: 'number', description: 'File size in MB' },
          filterCategory: { type: 'string', enum: ['social', 'gdn', 'ttd', 'dv360', 'ctv', 'all'], description: 'Filter results by platform category' },
        },
        required: ['width', 'height', 'type'],
      },
    },
    {
      name: 'resize_for_platform',
      description: 'Generate a Cloudinary transformation URL to resize an asset for a specific advertising platform/channel. Uses AI generative fill for aspect ratios that differ significantly from the source.',
      inputSchema: {
        type: 'object',
        properties: {
          publicId: { type: 'string', description: 'Cloudinary public_id of the source asset' },
          channel: { type: 'string', description: 'Target channel name (e.g., "GDN Medium Rectangle", "Facebook Stories")' },
          sourceWidth: { type: 'number', description: 'Source asset width' },
          sourceHeight: { type: 'number', description: 'Source asset height' },
          useGenFill: { type: 'boolean', description: 'Force AI generative fill (default: auto-detect based on aspect ratio difference)' },
        },
        required: ['publicId', 'channel'],
      },
    },
    {
      name: 'batch_resize',
      description: 'Generate Cloudinary transformation URLs for an entire platform package (e.g., "GDN Essential", "Meta Complete", "TTD Complete"). Returns all URLs at once.',
      inputSchema: {
        type: 'object',
        properties: {
          publicId: { type: 'string', description: 'Cloudinary public_id of the source asset' },
          package: { type: 'string', enum: Object.keys(PLATFORM_PACKAGES), description: 'Platform package name' },
          sourceWidth: { type: 'number', description: 'Source asset width' },
          sourceHeight: { type: 'number', description: 'Source asset height' },
        },
        required: ['publicId', 'package'],
      },
    },
    {
      name: 'get_platform_specs',
      description: 'Get the exact specifications for an advertising platform or channel. Includes dimensions, aspect ratios, file size limits, and duration constraints.',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string', description: 'Channel name (e.g., "Facebook Feed Square") or platform category (e.g., "gdn", "social", "ttd")' },
        },
        required: ['channel'],
      },
    },
    {
      name: 'generate_transform_url',
      description: 'Generate a Cloudinary transformation URL with specific parameters. Use this for custom transforms not covered by resize_for_platform.',
      inputSchema: {
        type: 'object',
        properties: {
          publicId: { type: 'string', description: 'Cloudinary public_id' },
          width: { type: 'number', description: 'Target width' },
          height: { type: 'number', description: 'Target height' },
          crop: { type: 'string', enum: ['fill', 'fit', 'limit', 'pad', 'scale', 'crop'], description: 'Crop mode' },
          gravity: { type: 'string', description: 'Gravity (auto, auto:faces, center, north, south, etc.)' },
          background: { type: 'string', description: 'Background (gen_fill, blurred, auto, or hex color)' },
          format: { type: 'string', description: 'Output format (auto, jpg, png, webp)' },
          quality: { type: 'string', description: 'Quality (auto, auto:best, auto:good, auto:eco, or 1-100)' },
        },
        required: ['publicId', 'width', 'height'],
      },
    },
    {
      name: 'list_packages',
      description: 'List all available platform packages with the channels included in each package.',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'validate_asset': {
      const results = validateAsset(args);

      if (args.filterCategory && args.filterCategory !== 'all') {
        const filter = (arr) => arr.filter(r => {
          const spec = CHANNEL_SPECS[r.channel];
          return spec && spec.category === args.filterCategory;
        });
        results.compatible = filter(results.compatible);
        results.offSize = filter(results.offSize);
        results.incompatible = filter(results.incompatible);
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            summary: {
              compatible: results.compatible.length,
              offSize: results.offSize.length,
              incompatible: results.incompatible.length,
              total: results.compatible.length + results.offSize.length + results.incompatible.length,
            },
            asset: { width: args.width, height: args.height, type: args.type, aspectRatio: (args.width / args.height).toFixed(2) },
            compatible: results.compatible.map(r => r.channel),
            offSize: results.offSize.map(r => ({
              channel: r.channel,
              issues: r.issues,
            })),
            incompatible: results.incompatible.map(r => ({
              channel: r.channel,
              reason: r.reason,
            })),
          }, null, 2),
        }],
      };
    }

    case 'resize_for_platform': {
      const spec = CHANNEL_SPECS[args.channel];
      if (!spec) {
        return { content: [{ type: 'text', text: `Unknown channel: ${args.channel}. Use get_platform_specs to see available channels.` }] };
      }

      let targetWidth, targetHeight;
      if (spec.exactSize) {
        targetWidth = spec.exactSize.width;
        targetHeight = spec.exactSize.height;
      } else if (spec.recommendedSize) {
        const [w, h] = spec.recommendedSize.split('x').map(Number);
        targetWidth = w;
        targetHeight = h;
      } else if (spec.aspectRatios && spec.aspectRatios.length > 0) {
        const ratio = parseAspectRatio(spec.aspectRatios[0]);
        targetWidth = ratio >= 1 ? 1200 : Math.round(1200 * ratio);
        targetHeight = ratio >= 1 ? Math.round(1200 / ratio) : 1200;
      }

      let shouldGenFill = args.useGenFill;
      if (shouldGenFill === undefined && args.sourceWidth && args.sourceHeight) {
        const sourceRatio = args.sourceWidth / args.sourceHeight;
        const targetRatio = targetWidth / targetHeight;
        shouldGenFill = Math.abs(sourceRatio - targetRatio) > 0.3;
      }

      const transformations = [];
      transformations.push(`w_${targetWidth}`);
      transformations.push(`h_${targetHeight}`);
      transformations.push(shouldGenFill ? 'c_pad' : 'c_fill');
      transformations.push('g_auto');
      if (shouldGenFill) transformations.push('b_gen_fill');
      transformations.push('f_auto');
      transformations.push('q_auto:best');

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(',')}/${args.publicId}`;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            channel: args.channel,
            targetSize: `${targetWidth}x${targetHeight}`,
            method: shouldGenFill ? 'AI Generative Fill (c_pad,b_gen_fill)' : 'Smart Crop (c_fill,g_auto)',
            transformationUrl: url,
            transformation: transformations.join(','),
            spec,
          }, null, 2),
        }],
      };
    }

    case 'batch_resize': {
      const channels = PLATFORM_PACKAGES[args.package];
      if (!channels) {
        return { content: [{ type: 'text', text: `Unknown package: ${args.package}. Available: ${Object.keys(PLATFORM_PACKAGES).join(', ')}` }] };
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const results = channels.map(channelName => {
        const spec = CHANNEL_SPECS[channelName];
        if (!spec) return { channel: channelName, error: 'Spec not found' };

        let targetWidth, targetHeight;
        if (spec.exactSize) {
          targetWidth = spec.exactSize.width;
          targetHeight = spec.exactSize.height;
        } else if (spec.recommendedSize) {
          const [w, h] = spec.recommendedSize.split('x').map(Number);
          targetWidth = w;
          targetHeight = h;
        } else {
          return { channel: channelName, error: 'No size info in spec' };
        }

        let shouldGenFill = false;
        if (args.sourceWidth && args.sourceHeight) {
          const sourceRatio = args.sourceWidth / args.sourceHeight;
          const targetRatio = targetWidth / targetHeight;
          shouldGenFill = Math.abs(sourceRatio - targetRatio) > 0.3;
        }

        const transforms = [
          `w_${targetWidth}`, `h_${targetHeight}`,
          shouldGenFill ? 'c_pad' : 'c_fill',
          'g_auto',
          ...(shouldGenFill ? ['b_gen_fill'] : []),
          'f_auto', 'q_auto:best'
        ];

        return {
          channel: channelName,
          size: `${targetWidth}x${targetHeight}`,
          method: shouldGenFill ? 'gen_fill' : 'smart_crop',
          url: `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${args.publicId}`,
        };
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            package: args.package,
            channelCount: results.length,
            results,
          }, null, 2),
        }],
      };
    }

    case 'get_platform_specs': {
      const { channel } = args;

      if (CHANNEL_SPECS[channel]) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ [channel]: CHANNEL_SPECS[channel] }, null, 2),
          }],
        };
      }

      const categoryResults = {};
      for (const [name, spec] of Object.entries(CHANNEL_SPECS)) {
        if (spec.category === channel || spec.platform === channel) {
          categoryResults[name] = spec;
        }
      }

      if (Object.keys(categoryResults).length > 0) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              category: channel,
              channelCount: Object.keys(categoryResults).length,
              channels: categoryResults,
            }, null, 2),
          }],
        };
      }

      const fuzzy = Object.keys(CHANNEL_SPECS).filter(n =>
        n.toLowerCase().includes(channel.toLowerCase())
      );
      return {
        content: [{
          type: 'text',
          text: fuzzy.length > 0
            ? `Did you mean one of these? ${fuzzy.join(', ')}`
            : `Channel "${channel}" not found. Categories: social, gdn, ttd, dv360, ctv`,
        }],
      };
    }

    case 'generate_transform_url': {
      const transforms = [];
      transforms.push(`w_${args.width}`);
      transforms.push(`h_${args.height}`);
      transforms.push(`c_${args.crop || 'fill'}`);
      transforms.push(`g_${args.gravity || 'auto'}`);
      if (args.background) transforms.push(`b_${args.background}`);
      transforms.push(`f_${args.format || 'auto'}`);
      transforms.push(`q_${args.quality || 'auto'}`);

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const url = `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(',')}/${args.publicId}`;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ url, transformation: transforms.join(',') }, null, 2),
        }],
      };
    }

    case 'list_packages': {
      const packagesInfo = {};
      for (const [name, channels] of Object.entries(PLATFORM_PACKAGES)) {
        packagesInfo[name] = {
          channelCount: channels.length,
          channels: channels.map(ch => {
            const spec = CHANNEL_SPECS[ch];
            return {
              name: ch,
              size: spec?.exactSize
                ? `${spec.exactSize.width}x${spec.exactSize.height}`
                : spec?.recommendedSize || 'varies',
            };
          }),
        };
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(packagesInfo, null, 2),
        }],
      };
    }

    default:
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
  }
});

// ─── Resources ───────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'ad-creative://specs/all',
      name: 'All Platform Specs',
      description: 'Complete database of 50+ advertising platform specifications',
      mimeType: 'application/json',
    },
    {
      uri: 'ad-creative://specs/social',
      name: 'Social Platform Specs',
      description: 'Facebook, Instagram, TikTok, YouTube, LinkedIn, X, Pinterest, etc.',
      mimeType: 'application/json',
    },
    {
      uri: 'ad-creative://specs/display',
      name: 'Display Ad Specs',
      description: 'GDN, TTD, DV360 standard display sizes',
      mimeType: 'application/json',
    },
    {
      uri: 'ad-creative://packages',
      name: 'Platform Packages',
      description: 'Pre-built packages: GDN Essential, Meta Complete, TTD Complete, etc.',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'ad-creative://specs/all':
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(CHANNEL_SPECS, null, 2) }] };

    case 'ad-creative://specs/social': {
      const social = Object.fromEntries(
        Object.entries(CHANNEL_SPECS).filter(([, s]) => s.category === 'social')
      );
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(social, null, 2) }] };
    }

    case 'ad-creative://specs/display': {
      const display = Object.fromEntries(
        Object.entries(CHANNEL_SPECS).filter(([, s]) => ['gdn', 'ttd', 'dv360'].includes(s.category))
      );
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(display, null, 2) }] };
    }

    case 'ad-creative://packages':
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(PLATFORM_PACKAGES, null, 2) }] };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// ─── Start ───────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
