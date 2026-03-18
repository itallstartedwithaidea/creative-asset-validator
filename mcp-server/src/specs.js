export const CHANNEL_SPECS = {
  // ─── Facebook / Meta ───────────────────────────────────────────
  "Facebook Profile Picture": { type: "image", aspectRatios: ["1:1"], recommendedSize: "180x180", icon: "meta", category: "social" },
  "Facebook Cover Desktop": { type: "image", aspectRatios: ["3:2"], recommendedSize: "851x315", icon: "meta", category: "social" },
  "Facebook Cover Mobile": { type: "image", aspectRatios: ["16:9"], recommendedSize: "640x360", icon: "meta", category: "social" },
  "Facebook Feed Square": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1080x1080", icon: "meta", category: "social" },
  "Facebook Feed Landscape": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1200x630", icon: "meta", category: "social" },
  "Facebook Feed Portrait": { type: "image", aspectRatios: ["4:5"], recommendedSize: "1080x1350", icon: "meta", category: "social" },
  "Facebook Stories": { type: "both", aspectRatios: ["9:16"], recommendedSize: "1080x1920", minDuration: 1, maxDuration: 120, icon: "meta", category: "social" },
  "Facebook Carousel": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1080x1080", icon: "meta", category: "social" },
  "Facebook Event Cover": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1920x1005", icon: "meta", category: "social" },
  "Facebook Ad Feed": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1080x1080", icon: "meta", category: "social" },
  "Facebook Ad Stories": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "meta", category: "social" },

  // ─── Instagram ─────────────────────────────────────────────────
  "Instagram Profile Picture": { type: "image", aspectRatios: ["1:1"], recommendedSize: "320x320", icon: "instagram", category: "social" },
  "Instagram Feed Square": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1080x1080", icon: "instagram", category: "social" },
  "Instagram Feed Portrait": { type: "image", aspectRatios: ["4:5"], recommendedSize: "1080x1350", icon: "instagram", category: "social" },
  "Instagram Feed Tall": { type: "image", aspectRatios: ["3:4"], recommendedSize: "1080x1440", icon: "instagram", category: "social" },
  "Instagram Feed Landscape": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1080x566", icon: "instagram", category: "social" },
  "Instagram Stories": { type: "both", aspectRatios: ["9:16"], recommendedSize: "1080x1920", minDuration: 3, maxDuration: 60, icon: "instagram", category: "social" },
  "Instagram Reels Cover": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "instagram", category: "social" },
  "Instagram Carousel": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1080x1080", icon: "instagram", category: "social" },
  "Instagram Reels": { type: "video", aspectRatios: ["9:16"], recommendedSize: "1080x1920", minDuration: 3, maxDuration: 90, icon: "instagram", category: "social" },
  "Instagram Ad Feed": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1080x1080", icon: "instagram", category: "social" },
  "Instagram Ad Stories": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "instagram", category: "social" },

  // ─── Threads ───────────────────────────────────────────────────
  "Threads Post Square": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1080x1080", icon: "threads", category: "social" },
  "Threads Post Portrait": { type: "image", aspectRatios: ["4:5"], recommendedSize: "1080x1350", icon: "threads", category: "social" },
  "Threads Post Landscape": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1200x627", icon: "threads", category: "social" },
  "Threads Post Vertical": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "threads", category: "social" },

  // ─── X (Twitter) ──────────────────────────────────────────────
  "X Profile Picture": { type: "image", aspectRatios: ["1:1"], recommendedSize: "400x400", icon: "twitter", category: "social" },
  "X Header Banner": { type: "image", aspectRatios: ["3:1"], recommendedSize: "1500x500", icon: "twitter", category: "social" },
  "X In-Stream Image": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1600x900", icon: "twitter", category: "social" },
  "X Card Image": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1200x628", icon: "twitter", category: "social" },
  "X Ad Landscape": { type: "image", aspectRatios: ["16:9"], recommendedSize: "800x418", icon: "twitter", category: "social" },
  "X Ad Square": { type: "image", aspectRatios: ["1:1"], recommendedSize: "800x800", icon: "twitter", category: "social" },

  // ─── LinkedIn ──────────────────────────────────────────────────
  "LinkedIn Profile": { type: "image", aspectRatios: ["1:1"], recommendedSize: "400x400", icon: "linkedin", category: "social" },
  "LinkedIn Personal Cover": { type: "image", aspectRatios: ["4:1"], recommendedSize: "1584x396", icon: "linkedin", category: "social" },
  "LinkedIn Company Logo": { type: "image", aspectRatios: ["1:1"], recommendedSize: "300x300", icon: "linkedin", category: "social" },
  "LinkedIn Company Cover": { type: "image", aspectRatios: ["6:1"], recommendedSize: "1128x191", icon: "linkedin", category: "social" },
  "LinkedIn Post/Link": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1200x627", icon: "linkedin", category: "social" },
  "LinkedIn Post Square": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1200x1200", icon: "linkedin", category: "social" },
  "LinkedIn Ad Horizontal": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1200x628", icon: "linkedin", category: "social" },
  "LinkedIn Ad Square": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1200x1200", icon: "linkedin", category: "social" },
  "LinkedIn Ad Vertical": { type: "image", aspectRatios: ["9:16"], recommendedSize: "628x1200", icon: "linkedin", category: "social" },

  // ─── YouTube ───────────────────────────────────────────────────
  "YouTube Profile Picture": { type: "image", aspectRatios: ["1:1"], recommendedSize: "800x800", icon: "youtube", category: "social" },
  "YouTube Channel Banner": { type: "image", aspectRatios: ["16:9"], recommendedSize: "2560x1440", icon: "youtube", category: "social" },
  "YouTube Video Thumbnail": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1280x720", icon: "youtube", category: "social" },
  "YouTube Shorts Thumbnail": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "youtube", category: "social" },
  "YouTube Standard": { type: "video", aspectRatios: ["16:9"], minDuration: 6, maxDuration: null, icon: "youtube", category: "social" },
  "YouTube Shorts": { type: "video", aspectRatios: ["9:16"], minDuration: null, maxDuration: 60, icon: "youtube", category: "social" },

  // ─── TikTok ────────────────────────────────────────────────────
  "TikTok Profile Picture": { type: "image", aspectRatios: ["1:1"], recommendedSize: "200x200", icon: "tiktok", category: "social" },
  "TikTok Video/Stories": { type: "video", aspectRatios: ["9:16"], recommendedSize: "1080x1920", minDuration: 5, maxDuration: 60, icon: "tiktok", category: "social" },
  "TikTok Carousel": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "tiktok", category: "social" },
  "TikTok Ad": { type: "video", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "tiktok", category: "social" },

  // ─── Pinterest ─────────────────────────────────────────────────
  "Pinterest Standard Pin": { type: "image", aspectRatios: ["2:3"], recommendedSize: "1000x1500", icon: "pinterest", category: "social" },
  "Pinterest Square Pin": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1000x1000", icon: "pinterest", category: "social" },
  "Pinterest Story Pin": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "pinterest", category: "social" },
  "Pinterest Ad": { type: "image", aspectRatios: ["2:3"], recommendedSize: "1000x1500", icon: "pinterest", category: "social" },

  // ─── Snapchat ──────────────────────────────────────────────────
  "Snapchat Snap/Story": { type: "both", aspectRatios: ["9:16"], recommendedSize: "1080x1920", maxDuration: 60, icon: "snapchat", category: "social" },
  "Snapchat Snap Ad": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "snapchat", category: "social" },

  // ─── Bluesky ───────────────────────────────────────────────────
  "Bluesky Post Square": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1080x1080", icon: "bluesky", category: "social" },
  "Bluesky Post Portrait": { type: "image", aspectRatios: ["4:5"], recommendedSize: "1080x1350", icon: "bluesky", category: "social" },
  "Bluesky Post Landscape": { type: "image", aspectRatios: ["16:9"], recommendedSize: "1200x627", icon: "bluesky", category: "social" },
  "Bluesky Banner/Header": { type: "image", aspectRatios: ["3:1"], recommendedSize: "1500x500", icon: "bluesky", category: "social" },

  // ─── Reddit ────────────────────────────────────────────────────
  "Reddit Post Image": { type: "image", aspectRatios: ["4:3"], recommendedSize: "1200x900", icon: "reddit", category: "social" },
  "Reddit Profile Banner": { type: "image", aspectRatios: ["5:1"], recommendedSize: "1920x384", icon: "reddit", category: "social" },

  // ─── WhatsApp ──────────────────────────────────────────────────
  "WhatsApp Status Image": { type: "image", aspectRatios: ["9:16"], recommendedSize: "1080x1920", icon: "whatsapp", category: "social" },
  "WhatsApp Profile Picture": { type: "image", aspectRatios: ["1:1"], recommendedSize: "500x500", icon: "whatsapp", category: "social" },

  // ─── Google Business ───────────────────────────────────────────
  "Google Business Logo": { type: "image", aspectRatios: ["1:1"], recommendedSize: "720x720", icon: "google", category: "social" },
  "Google Business Post": { type: "image", aspectRatios: ["1:1"], recommendedSize: "720x720", icon: "google", category: "social" },

  // ─── GDN (Google Display Network) ──────────────────────────────
  "GDN Leaderboard": { type: "image", exactSize: { width: 728, height: 90 }, aspectRatios: ["728:90"], icon: "google", category: "gdn", platform: "GDN", popular: true },
  "GDN Large Leaderboard": { type: "image", exactSize: { width: 970, height: 90 }, aspectRatios: ["97:9"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Banner": { type: "image", exactSize: { width: 468, height: 60 }, aspectRatios: ["39:5"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Billboard": { type: "image", exactSize: { width: 970, height: 250 }, aspectRatios: ["97:25"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Medium Rectangle": { type: "image", exactSize: { width: 300, height: 250 }, aspectRatios: ["6:5"], icon: "google", category: "gdn", platform: "GDN", popular: true },
  "GDN Large Rectangle": { type: "image", exactSize: { width: 336, height: 280 }, aspectRatios: ["6:5"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Square": { type: "image", exactSize: { width: 250, height: 250 }, aspectRatios: ["1:1"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Small Square": { type: "image", exactSize: { width: 200, height: 200 }, aspectRatios: ["1:1"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Wide Skyscraper": { type: "image", exactSize: { width: 160, height: 600 }, aspectRatios: ["4:15"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Skyscraper": { type: "image", exactSize: { width: 120, height: 600 }, aspectRatios: ["1:5"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Half-Page": { type: "image", exactSize: { width: 300, height: 600 }, aspectRatios: ["1:2"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Portrait": { type: "image", exactSize: { width: 300, height: 1050 }, aspectRatios: ["2:7"], icon: "google", category: "gdn", platform: "GDN" },
  "GDN Mobile Leaderboard": { type: "image", exactSize: { width: 320, height: 50 }, aspectRatios: ["32:5"], icon: "google", category: "gdn", platform: "GDN", mobile: true, popular: true },
  "GDN Large Mobile Banner": { type: "image", exactSize: { width: 320, height: 100 }, aspectRatios: ["16:5"], icon: "google", category: "gdn", platform: "GDN", mobile: true },
  "GDN Mobile Rectangle": { type: "image", exactSize: { width: 320, height: 250 }, aspectRatios: ["32:25"], icon: "google", category: "gdn", platform: "GDN", mobile: true },
  "GDN Mobile Interstitial": { type: "image", exactSize: { width: 320, height: 480 }, aspectRatios: ["2:3"], icon: "google", category: "gdn", platform: "GDN", mobile: true },

  // ─── TTD (The Trade Desk) ──────────────────────────────────────
  "TTD Leaderboard": { type: "image", exactSize: { width: 728, height: 90 }, aspectRatios: ["728:90"], icon: "ttd", category: "ttd", platform: "TTD", popular: true },
  "TTD Super Leaderboard": { type: "image", exactSize: { width: 970, height: 90 }, aspectRatios: ["97:9"], icon: "ttd", category: "ttd", platform: "TTD" },
  "TTD Billboard": { type: "image", exactSize: { width: 970, height: 250 }, aspectRatios: ["97:25"], icon: "ttd", category: "ttd", platform: "TTD" },
  "TTD Medium Rectangle": { type: "image", exactSize: { width: 300, height: 250 }, aspectRatios: ["6:5"], icon: "ttd", category: "ttd", platform: "TTD", popular: true },
  "TTD Large Rectangle": { type: "image", exactSize: { width: 336, height: 280 }, aspectRatios: ["6:5"], icon: "ttd", category: "ttd", platform: "TTD" },
  "TTD Wide Skyscraper": { type: "image", exactSize: { width: 160, height: 600 }, aspectRatios: ["4:15"], icon: "ttd", category: "ttd", platform: "TTD" },
  "TTD Half-Page": { type: "image", exactSize: { width: 300, height: 600 }, aspectRatios: ["1:2"], icon: "ttd", category: "ttd", platform: "TTD" },
  "TTD Portrait": { type: "image", exactSize: { width: 300, height: 1050 }, aspectRatios: ["2:7"], icon: "ttd", category: "ttd", platform: "TTD" },
  "TTD Mobile Leaderboard": { type: "image", exactSize: { width: 320, height: 50 }, aspectRatios: ["32:5"], icon: "ttd", category: "ttd", platform: "TTD", mobile: true },
  "TTD Large Mobile Banner": { type: "image", exactSize: { width: 320, height: 100 }, aspectRatios: ["16:5"], icon: "ttd", category: "ttd", platform: "TTD", mobile: true },
  "TTD Mobile Interstitial": { type: "image", exactSize: { width: 320, height: 480 }, aspectRatios: ["2:3"], icon: "ttd", category: "ttd", platform: "TTD", mobile: true },

  // ─── DV360 ─────────────────────────────────────────────────────
  "DV360 Leaderboard": { type: "image", exactSize: { width: 728, height: 90 }, aspectRatios: ["728:90"], icon: "dv360", category: "dv360", platform: "DV360", popular: true },
  "DV360 Super Leaderboard": { type: "image", exactSize: { width: 970, height: 90 }, aspectRatios: ["97:9"], icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Billboard": { type: "image", exactSize: { width: 970, height: 250 }, aspectRatios: ["97:25"], icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Medium Rectangle": { type: "image", exactSize: { width: 300, height: 250 }, aspectRatios: ["6:5"], icon: "dv360", category: "dv360", platform: "DV360", popular: true },
  "DV360 Large Rectangle": { type: "image", exactSize: { width: 336, height: 280 }, aspectRatios: ["6:5"], icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Wide Skyscraper": { type: "image", exactSize: { width: 160, height: 600 }, aspectRatios: ["4:15"], icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Half-Page": { type: "image", exactSize: { width: 300, height: 600 }, aspectRatios: ["1:2"], icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Portrait": { type: "image", exactSize: { width: 300, height: 1050 }, aspectRatios: ["2:7"], icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Mobile Leaderboard": { type: "image", exactSize: { width: 320, height: 50 }, aspectRatios: ["32:5"], icon: "dv360", category: "dv360", platform: "DV360", mobile: true },
  "DV360 Large Mobile Banner": { type: "image", exactSize: { width: 320, height: 100 }, aspectRatios: ["16:5"], icon: "dv360", category: "dv360", platform: "DV360", mobile: true },
  "DV360 Native Landscape": { type: "image", aspectRatios: ["1.91:1"], recommendedSize: "1200x628", icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Native Square": { type: "image", aspectRatios: ["1:1"], recommendedSize: "1200x1200", icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Video 16:9": { type: "video", aspectRatios: ["16:9"], minDuration: 6, maxDuration: 120, icon: "dv360", category: "dv360", platform: "DV360" },
  "DV360 Video Vertical": { type: "video", aspectRatios: ["9:16"], minDuration: 6, maxDuration: 60, icon: "dv360", category: "dv360", platform: "DV360" },

  // ─── CTV ───────────────────────────────────────────────────────
  "CTV Standard": { type: "video", aspectRatios: ["16:9"], minDuration: 15, maxDuration: 120, icon: "ctv", category: "ctv", platform: "CTV" },

  // ─── Google Ads (Generic) ──────────────────────────────────────
  "Google Ads Display": { type: "image", aspectRatios: ["16:9", "1:1"], icon: "google", category: "gdn", platform: "GDN" },
  "Google Ads Video": { type: "video", aspectRatios: ["16:9", "1:1", "9:16"], minDuration: 10, icon: "google", category: "gdn", platform: "GDN" },
};

export const PLATFORM_PACKAGES = {
  "GDN Essential": [
    "GDN Medium Rectangle", "GDN Leaderboard", "GDN Wide Skyscraper",
    "GDN Large Rectangle", "GDN Half-Page", "GDN Mobile Leaderboard",
    "GDN Large Mobile Banner", "GDN Billboard"
  ],
  "TTD Complete": [
    "TTD Medium Rectangle", "TTD Leaderboard", "TTD Super Leaderboard",
    "TTD Billboard", "TTD Large Rectangle", "TTD Wide Skyscraper",
    "TTD Half-Page", "TTD Portrait", "TTD Mobile Leaderboard",
    "TTD Large Mobile Banner", "TTD Mobile Interstitial"
  ],
  "DV360 Complete": [
    "DV360 Medium Rectangle", "DV360 Leaderboard", "DV360 Super Leaderboard",
    "DV360 Billboard", "DV360 Large Rectangle", "DV360 Wide Skyscraper",
    "DV360 Half-Page", "DV360 Portrait", "DV360 Mobile Leaderboard",
    "DV360 Large Mobile Banner", "DV360 Native Landscape", "DV360 Native Square"
  ],
  "Meta Complete": [
    "Facebook Feed Square", "Facebook Feed Portrait", "Facebook Feed Landscape",
    "Facebook Stories", "Facebook Carousel", "Facebook Ad Feed", "Facebook Ad Stories",
    "Instagram Feed Square", "Instagram Feed Portrait", "Instagram Stories",
    "Instagram Reels Cover", "Instagram Carousel", "Instagram Ad Feed", "Instagram Ad Stories"
  ],
  "Universal Display": [
    "GDN Medium Rectangle", "GDN Leaderboard", "GDN Large Leaderboard",
    "GDN Billboard", "GDN Wide Skyscraper", "GDN Skyscraper",
    "GDN Half-Page", "GDN Portrait", "GDN Square", "GDN Small Square",
    "GDN Banner", "GDN Mobile Leaderboard", "GDN Large Mobile Banner",
    "GDN Mobile Rectangle", "GDN Mobile Interstitial"
  ]
};

export function parseAspectRatio(ratioStr) {
  const parts = ratioStr.split(':').map(Number);
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
    return parts[0] / parts[1];
  }
  return null;
}

export function getAssetAspectRatio(width, height) {
  return width / height;
}

export function checkChannelCompatibility(asset, channelName) {
  const spec = CHANNEL_SPECS[channelName];
  if (!spec) return { compatible: false, reason: `Unknown channel: ${channelName}` };

  const { width, height, type, duration, fileSizeMB } = asset;
  const assetRatio = getAssetAspectRatio(width, height);
  const issues = [];

  if (spec.type !== 'both' && spec.type !== type) {
    return { compatible: false, reason: `Channel requires ${spec.type}, asset is ${type}` };
  }

  if (spec.exactSize) {
    if (width !== spec.exactSize.width || height !== spec.exactSize.height) {
      issues.push({
        type: 'exact_size',
        message: `Needs ${spec.exactSize.width}x${spec.exactSize.height}, asset is ${width}x${height}`,
        targetWidth: spec.exactSize.width,
        targetHeight: spec.exactSize.height
      });
    }
  } else if (spec.aspectRatios) {
    const TOLERANCE = 0.05;
    const ratioMatch = spec.aspectRatios.some(ratioStr => {
      const targetRatio = parseAspectRatio(ratioStr);
      return targetRatio && Math.abs(assetRatio - targetRatio) <= TOLERANCE;
    });
    if (!ratioMatch) {
      issues.push({
        type: 'aspect_ratio',
        message: `Needs ${spec.aspectRatios.join(' or ')}, asset is ${width}:${height} (${assetRatio.toFixed(2)})`,
        targetRatios: spec.aspectRatios
      });
    }
  }

  if (type === 'video' && duration != null) {
    if (spec.minDuration && duration < spec.minDuration) {
      issues.push({ type: 'duration_short', message: `Min duration ${spec.minDuration}s, asset is ${duration}s` });
    }
    if (spec.maxDuration && duration > spec.maxDuration) {
      issues.push({ type: 'duration_long', message: `Max duration ${spec.maxDuration}s, asset is ${duration}s` });
    }
  }

  if (spec.maxFileSizeMB && fileSizeMB && fileSizeMB > spec.maxFileSizeMB) {
    issues.push({ type: 'file_size', message: `Max ${spec.maxFileSizeMB}MB, asset is ${fileSizeMB}MB` });
  }

  return {
    compatible: issues.length === 0,
    issues,
    spec,
    channelName
  };
}

export function validateAsset(asset) {
  const results = {
    compatible: [],
    offSize: [],
    incompatible: []
  };

  for (const [name, spec] of Object.entries(CHANNEL_SPECS)) {
    const result = checkChannelCompatibility(asset, name);
    if (result.compatible) {
      results.compatible.push({ channel: name, ...result });
    } else if (result.reason) {
      results.incompatible.push({ channel: name, ...result });
    } else {
      results.offSize.push({ channel: name, ...result });
    }
  }

  return results;
}
