// /api/analytics/performance — per-post performance metrics (views, engagement, shares, clicks, etc.)
// GET: list post performance, optionally filtered by brand/platform/post
// POST: record a new performance snapshot (used by the publish pipeline when
//       real platform metrics arrive, or by manual entry in dev mode)
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { getContentPerformance, recordContentPerformance } from "@/lib/services/analytics";
import type { Platform } from "@/lib/openai";

const PLATFORMS: Platform[] = [
  "tiktok",
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
  "snapchat",
  "pinterest",
];

export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s — data updates as new metrics arrive
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    const brandId = (body?.brandId as string) || undefined;
    const platform = body?.platform as Platform | undefined;
    const postId = (body?.postId as string) || undefined;
    const days = body?.days ? parseInt(String(body.days), 10) : 30;
    const limit = body?.limit ? parseInt(String(body.limit), 10) : 50;
    const offset = body?.offset ? parseInt(String(body.offset), 10) : 0;

    // Validate platform if provided
    let validatedPlatform: Platform | undefined = undefined;
    if (platform) {
      if (!PLATFORMS.includes(platform)) {
        return NextResponse.json(
          { success: false, error: `Invalid platform. Must be one of: ${PLATFORMS.join(", ")}` },
          { status: 400 }
        );
      }
      validatedPlatform = platform;
    }

    const result = getContentPerformance({
      brandId,
      platform: validatedPlatform,
      postId,
      days,
      limit,
      offset,
    });

    // Summary aggregates
    const totals = result.posts.reduce(
      (acc, p) => {
        acc.views += p.views;
        acc.likes += p.likes;
        acc.comments += p.comments;
        acc.shares += p.shares;
        acc.saves += p.saves;
        acc.clicks += p.clicks;
        acc.reach += p.reach;
        acc.impressions += p.impressions;
        acc.followersGained += p.followersGained;
        acc.revenueUsd += p.revenueUsd;
        return acc;
      },
      { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, reach: 0, impressions: 0, followersGained: 0, revenueUsd: 0 }
    );
    const totalEngagements = totals.likes + totals.comments + totals.shares + totals.saves;
    const averageEngagementRate = totals.views > 0 ? totalEngagements / totals.views : 0;

    return {
      success: true,
      data: result.posts,
      total: result.total,
      days: result.days,
      source: result.source,
      filters: { brandId: brandId || null, platform: validatedPlatform || null, postId: postId || null },
      summary: {
        ...totals,
        revenueUsd: Math.round(totals.revenueUsd * 100) / 100,
        totalEngagements,
        averageEngagementRate: Math.round(averageEngagementRate * 10000) / 10000,
      },
      meta: {
        liveModeNote: "Once platform API keys are connected (TIKTOK_API_KEY, INSTAGRAM_API_KEY, YOUTUBE_API_KEY), this endpoint will return live data stamped with source: 'platform_api'.",
        generatedAt: new Date().toISOString(),
      },
    };
  }
);

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 60 },
    validate: (b) => {
      if (!b?.postId) return "postId is required";
      if (!b?.platform) return "platform is required";
      if (!(PLATFORMS as readonly string[]).includes(String(b.platform))) {
        return `platform must be one of: ${PLATFORMS.join(", ")}`;
      }
      return true;
    },
  },
  async (req, body) => {
    const out = recordContentPerformance({
      postId: body.postId,
      postSource: body.postSource,
      brandId: body.brandId,
      brandName: body.brandName,
      platform: body.platform,
      contentType: body.contentType,
      views: body.views,
      likes: body.likes,
      comments: body.comments,
      shares: body.shares,
      saves: body.saves,
      clicks: body.clicks,
      reach: body.reach,
      impressions: body.impressions,
      followersGained: body.followersGained,
      revenueUsd: body.revenueUsd,
      source: body.source,
    });
    return NextResponse.json(out, { status: out.persisted ? 201 : 202 });
  }
);
