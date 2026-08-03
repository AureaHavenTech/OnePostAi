// /api/publish/schedule — POST { platforms, contentPerPlatform, scheduledAt }
// Stores a future-dated post in user_scheduled_posts. A separate worker
// (cron / Vercel scheduled function / future enhancement) picks rows up
// when scheduledAt is in the past and runs them through publishToPlatform.
import { NextResponse } from "next/server";
import { requireAuthedUserIdAsync, isValidPlatformId } from "@/lib/services/social-connections";
import { schedulePost } from "@/lib/services/publishing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "INVALID_JSON", message: "Body must be JSON." }, { status: 400 });
  }

  const platforms: string[] = Array.isArray(body?.platforms) ? body.platforms : [];
  const scheduledAt: string = body?.scheduledAt;
  const cpp = body?.contentPerPlatform || {};

  if (platforms.length === 0) {
    return NextResponse.json({ error: "MISSING_PLATFORMS", message: "platforms[] is required." }, { status: 400 });
  }
  if (!scheduledAt) {
    return NextResponse.json({ error: "MISSING_SCHEDULED_AT", message: "scheduledAt (ISO date) is required." }, { status: 400 });
  }
  const when = new Date(scheduledAt);
  if (isNaN(when.getTime())) {
    return NextResponse.json({ error: "INVALID_SCHEDULED_AT", message: "scheduledAt must be a valid ISO date." }, { status: 400 });
  }
  if (when.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "SCHEDULED_AT_IN_PAST", message: "scheduledAt must be in the future." },
      { status: 400 }
    );
  }
  const bad = platforms.filter((p) => !isValidPlatformId(p));
  if (bad.length > 0) {
    return NextResponse.json(
      { error: "INVALID_PLATFORMS", message: `Unknown platforms: ${bad.join(", ")}` },
      { status: 400 }
    );
  }

  const scheduled = platforms.map((p) => {
    const c = cpp[p] || cpp["default"] || { caption: cpp?.caption || "" };
    return schedulePost(
      auth.userId,
      p as any,
      {
        caption: c.caption || "",
        mediaUrls: Array.isArray(c.mediaUrls) ? c.mediaUrls : [],
        hashtags: Array.isArray(c.hashtags) ? c.hashtags : [],
        scheduledAt,
      },
      scheduledAt
    );
  });

  return NextResponse.json({ scheduled, count: scheduled.length, scheduledAt });
}
