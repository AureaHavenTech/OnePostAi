// /api/publish/single — POST { platform, content: { caption, mediaUrls, hashtags } }
// Publishes to a single platform. TikTok + Instagram use real API calls;
// the other 5 are structured mocks that return realistic success shapes.
// Reads the OAuth access token from the social_connections table.
import { NextResponse } from "next/server";
import { requireAuthedUserIdAsync } from "@/lib/services/social-connections";
import {
  publishToPlatform,
  recordPublishedPost,
  recordFailedPost,
  type PublishRequest,
} from "@/lib/services/publishing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "INVALID_JSON", message: "Body must be JSON." }, { status: 400 });
  }
  if (!body?.platform || !body?.content?.caption) {
    return NextResponse.json(
      { error: "MISSING_FIELDS", message: "platform and content.caption are required." },
      { status: 400 }
    );
  }

  const publishReq: PublishRequest = {
    platform: body.platform,
    content: {
      caption: body.content.caption,
      mediaUrls: Array.isArray(body.content.mediaUrls) ? body.content.mediaUrls : [],
      hashtags: Array.isArray(body.content.hashtags) ? body.content.hashtags : [],
      scheduledAt: body.content.scheduledAt,
    },
    platformConfig: body.platformConfig || {},
  };

  try {
    const res = await publishToPlatform(auth.userId, publishReq);
    if (res.success) {
      const record = recordPublishedPost(auth.userId, res, publishReq.content);
      return NextResponse.json({ success: true, result: res, record });
    } else {
      recordFailedPost(auth.userId, res.platform, publishReq.content, res.error || "publish failed");
      return NextResponse.json({ success: false, result: res }, { status: 400 });
    }
  } catch (e: any) {
    console.error("[publish/single] error:", e);
    return NextResponse.json({ error: "INTERNAL", message: e?.message || "Publish failed" }, { status: 500 });
  }
}
