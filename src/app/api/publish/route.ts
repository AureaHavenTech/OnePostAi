import { NextResponse } from "next/server";

// Social API Pipeline — works in DEMO mode (simulated) or PRODUCTION mode (real APIs)
// Set NEXT_PUBLIC_SOCIAL_API_MODE=production to use real API keys
const MODE = process.env.NEXT_PUBLIC_SOCIAL_API_MODE || "demo";

interface PublishResult {
  success: boolean;
  platform: string;
  status: "published" | "scheduled" | "simulated" | "failed";
  postId: string;
  url?: string;
  message?: string;
}

// Platform API configurations
const PLATFORM_CONFIGS: Record<string, {
  name: string;
  apiEndpoint: string;
  apiVersion: string;
  requires: string[];
  docs: string;
}> = {
  instagram: {
    name: "Instagram",
    apiEndpoint: "https://graph.facebook.com/v18.0/{ig-user-id}/media",
    apiVersion: "v18.0",
    requires: ["accessToken", "igUserId"],
    docs: "https://developers.facebook.com/docs/instagram-api/reference/ig-user/media"
  },
  facebook: {
    name: "Facebook",
    apiEndpoint: "https://graph.facebook.com/v18.0/{page-id}/feed",
    apiVersion: "v18.0",
    requires: ["accessToken", "pageId"],
    docs: "https://developers.facebook.com/docs/pages/publishing"
  },
  tiktok: {
    name: "TikTok",
    apiEndpoint: "https://open-api.tiktok.com/video/publish/",
    apiVersion: "v2",
    requires: ["accessToken", "openId"],
    docs: "https://developers.tiktok.com/doc/video-publish"
  },
  youtube: {
    name: "YouTube",
    apiEndpoint: "https://www.googleapis.com/upload/youtube/v3/videos",
    apiVersion: "v3",
    requires: ["accessToken"],
    docs: "https://developers.google.com/youtube/v3/guides/uploading_video"
  },
  linkedin: {
    name: "LinkedIn",
    apiEndpoint: "https://api.linkedin.com/v2/ugcPosts",
    apiVersion: "v2",
    requires: ["accessToken", "personId"],
    docs: "https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares"
  },
  pinterest: {
    name: "Pinterest",
    apiEndpoint: "https://api.pinterest.com/v5/pins",
    apiVersion: "v5",
    requires: ["accessToken"],
    docs: "https://developers.pinterest.com/docs/api/v5/pins/create"
  },
  twitter: {
    name: "Twitter/X",
    apiEndpoint: "https://api.twitter.com/2/tweets",
    apiVersion: "2",
    requires: ["accessToken"],
    docs: "https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets"
  },
  threads: {
    name: "Threads",
    apiEndpoint: "https://graph.threads.net/v1.0/{user-id}/threads",
    apiVersion: "v1.0",
    requires: ["accessToken", "userId"],
    docs: "https://developers.facebook.com/docs/threads-api"
  },
  bluesky: {
    name: "Bluesky",
    apiEndpoint: "https://bsky.social/xrpc/com.atproto.repo.createRecord",
    apiVersion: "atproto",
    requires: ["token"],
    docs: "https://docs.bsky.app/docs/api/com-atproto-repo-create-record"
  }
};

// Demo mode responses that simulate real API behavior
function generateDemoResponse(platform: string, caption: string, hashtags?: string[], scheduledFor?: string): PublishResult {
  const postId = `${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const isScheduled = !!scheduledFor && new Date(scheduledFor) > new Date();
  
  const demoUrls: Record<string, string> = {
    instagram: `https://instagram.com/p/${postId}`,
    facebook: `https://facebook.com/posts/${postId}`,
    tiktok: `https://tiktok.com/@aurahaven/video/${postId}`,
    youtube: `https://youtube.com/watch?v=${postId}`,
    linkedin: `https://linkedin.com/feed/update/${postId}`,
    pinterest: `https://pinterest.com/pin/${postId}`,
    twitter: `https://x.com/aurahaven/status/${postId}`,
    threads: `https://threads.net/@aurahaven/post/${postId}`,
    bluesky: `https://bsky.app/profile/aurahaven.bsky.social/post/${postId}`,
  };

  return {
    success: true,
    platform,
    status: isScheduled ? "scheduled" : "simulated",
    postId,
    url: demoUrls[platform] || `https://${platform}.com/post/${postId}`,
    message: isScheduled
      ? `✅ Scheduled for ${new Date(scheduledFor!).toLocaleString()} on ${platform}`
      : `✅ Published (Demo) — ${demoUrls[platform] || `https://${platform}.com/post/${postId}`}`
  };
}

// Real API integration — called when mode=production and proper credentials exist
async function publishToRealAPI(platform: string, data: any): Promise<PublishResult> {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) {
    return { success: false, platform, status: "failed", postId: "", message: `Unsupported platform: ${platform}` };
  }

  try {
    let response;
    switch (platform) {
      case "instagram":
      case "facebook": {
        // Meta Graph API
        response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${data.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            media_type: data.mediaUrl?.endsWith(".mp4") ? "VIDEO" : "IMAGE",
            media_url: data.mediaUrl,
            caption: data.caption + (data.hashtags?.length ? "\n\n" + data.hashtags.map((h: string) => `#${h}`).join(" ") : "")
          })
        });
        break;
      }
      case "tiktok": {
        response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "access-token": data.accessToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            source_info: { source: "FILE_UPLOAD", video_url: data.mediaUrl },
            post_info: { title: data.title || data.caption.substring(0, 100), privacy_level: "PUBLIC" }
          })
        });
        break;
      }
      case "pinterest": {
        response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${data.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: data.title || data.caption.substring(0, 100),
            description: data.caption,
            link: data.link || "",
            media_source: { source_type: "image_url", url: data.mediaUrl }
          })
        });
        break;
      }
      default: {
        // Generic REST API call
        response = await fetch(config.apiEndpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${data.accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: data.caption,
            media: data.mediaUrl ? [data.mediaUrl] : []
          })
        });
      }
    }

    const result = await response.json();
    return {
      success: response.ok,
      platform,
      status: response.ok ? "published" : "failed",
      postId: result.id || `real_${Date.now()}`,
      url: response.ok ? `https://${platform}.com/post/${result.id || Date.now()}` : undefined,
      message: response.ok ? `✅ Published to ${config.name}` : `❌ ${result.error?.message || response.statusText}`
    };
  } catch (error: any) {
    return {
      success: false,
      platform,
      status: "failed",
      postId: "",
      message: `API Error: ${error.message}`
    };
  }
}

// POST /api/publish — Publish content to social platforms
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, mediaUrl, caption, title, hashtags, accessToken, scheduledFor, link } = body;

    if (!platform) {
      return NextResponse.json(
        { success: false, error: "Platform is required" },
        { status: 400 }
      );
    }
    if (!caption && !mediaUrl) {
      return NextResponse.json(
        { success: false, error: "At least one of caption or mediaUrl is required" },
        { status: 400 }
      );
    }

    // Production mode: call real APIs
    if (MODE === "production" && accessToken) {
      const result = await publishToRealAPI(platform, { mediaUrl, caption, title, hashtags, accessToken, link });
      return NextResponse.json(result);
    }

    // Demo mode: simulate successful publishing
    const result = generateDemoResponse(platform, caption, hashtags, scheduledFor);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Publishing error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish content" },
      { status: 500 }
    );
  }
}

// GET /api/publish — Get platform info
export async function GET() {
  return NextResponse.json({
    mode: MODE,
    platforms: Object.entries(PLATFORM_CONFIGS).map(([id, config]) => ({
      id,
      name: config.name,
      api: config.apiEndpoint,
      docs: config.docs,
      status: MODE === "production" ? "ready" : "demo"
    })),
    note: MODE === "demo" 
      ? "Running in demo mode — posts are simulated. Set NEXT_PUBLIC_SOCIAL_API_MODE=production and provide API keys to publish to real platforms."
      : "Production mode — posts go to real social platforms."
  });
}
