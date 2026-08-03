// /api/publish/batch — POST { platforms: ["tiktok","instagram","facebook"], contentPerPlatform: { tiktok: {...}, instagram: {...}, ... }, scheduledAt? }
// Publishes to multiple platforms in parallel using Promise.allSettled so
// a single platform failure doesn't poison the whole batch.
import { NextResponse } from "next/server";
import { requireAuthedUserIdAsync, isValidPlatformId } from "@/lib/services/social-connections";
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

  const platforms: string[] = Array.isArray(body?.platforms) ? body.platforms : [];
  if (platforms.length === 0) {
    return NextResponse.json(
      { error: "MISSING_PLATFORMS", message: "platforms[] is required (non-empty)." },
      { status: 400 }
    );
  }

  // Validate all platforms up front so we 400 the whole batch on a typo
  const bad = platforms.filter((p) => !isValidPlatformId(p));
  if (bad.length > 0) {
    return NextResponse.json(
      { error: "INVALID_PLATFORMS", message: `Unknown platforms: ${bad.join(", ")}` },
      { status: 400 }
    );
  }

  const cpp = body?.contentPerPlatform || {};
  const scheduledAt = body?.scheduledAt;

  // Build per-platform publish requests
  const jobs = platforms.map((p) => {
    const c = cpp[p] || cpp["default"] || {
      caption: cpp?.caption || "",
      mediaUrls: cpp?.mediaUrls,
      hashtags: cpp?.hashtags,
      scheduledAt,
    };
    return {
      platform: p,
      publishReq: {
        platform: p,
        content: {
          caption: c.caption || "",
          mediaUrls: Array.isArray(c.mediaUrls) ? c.mediaUrls : [],
          hashtags: Array.isArray(c.hashtags) ? c.hashtags : [],
          scheduledAt,
        },
        platformConfig: c.platformConfig || {},
      } as PublishRequest,
    };
  });

  // Run all in parallel. allSettled means one rejection doesn't kill the rest.
  const settled = await Promise.allSettled(
    jobs.map((j) => publishToPlatform(auth.userId, j.publishReq))
  );

  const results = settled.map((s, i) => {
    const job = jobs[i];
    if (s.status === "fulfilled") {
      const r = s.value;
      if (r.success) {
        const record = recordPublishedPost(auth.userId, r, job.publishReq.content);
        return { platform: job.platform, ...r, record };
      } else {
        recordFailedPost(auth.userId, job.platform, job.publishReq.content, r.error || "failed");
        return { platform: job.platform, ...r };
      }
    } else {
      const errMsg = (s.reason as any)?.message || "unknown";
      recordFailedPost(auth.userId, job.platform, job.publishReq.content, errMsg);
      return {
        platform: job.platform, success: false, publishedAt: new Date().toISOString(),
        error: errMsg, code: "EXCEPTION",
      };
    }
  });

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.length - succeeded;
  return NextResponse.json({
    results,
    total: results.length,
    succeeded,
    failed,
  });
}
