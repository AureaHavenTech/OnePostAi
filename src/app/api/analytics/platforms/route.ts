// /api/analytics/platforms — side-by-side comparison of all 7 platforms
// GET ?days=30 — comparison table
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { getPlatformBreakdown, PLATFORMS } from "@/lib/services/analytics";

export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    const days = body?.days ? parseInt(String(body.days), 10) : 30;
    const result = getPlatformBreakdown({ days });

    // Per-platform summary
    const totals = result.platforms.reduce(
      (acc, p) => {
        acc.posts += p.posts;
        acc.views += p.views;
        acc.likes += p.likes;
        acc.comments += p.comments;
        acc.shares += p.shares;
        acc.saves += p.saves;
        acc.clicks += p.clicks;
        acc.reach += p.reach;
        acc.followers += p.followers;
        acc.followerGrowth += p.followerGrowth;
        return acc;
      },
      { posts: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, reach: 0, followers: 0, followerGrowth: 0 }
    );

    const topPerformer = result.platforms.find((p) => p.isTopPerformer);
    const topByViews = [...result.platforms].sort((a, b) => b.views - a.views)[0];
    const topByEngagement = [...result.platforms].sort((a, b) => b.engagementRate - a.engagementRate)[0];

    return {
      success: true,
      data: result.platforms,
      days: result.days,
      source: result.source,
      totals: {
        ...totals,
        averageEngagementRate:
          totals.views > 0
            ? Math.round(((totals.likes + totals.comments + totals.shares + totals.saves) / totals.views) * 10000) / 10000
            : 0,
      },
      insights: {
        topPerformer: topPerformer ? { platform: topPerformer.platform, engagementRate: topPerformer.engagementRate } : null,
        topByViews: topByViews ? { platform: topByViews.platform, views: topByViews.views } : null,
        topByEngagement: topByEngagement ? { platform: topByEngagement.platform, engagementRate: topByEngagement.engagementRate } : null,
      },
      supportedPlatforms: PLATFORMS,
      meta: {
        liveModeNote: "Once platform API keys are connected, this returns live per-platform metrics. Until then, demo data is returned so the dashboard never goes blank.",
        generatedAt: new Date().toISOString(),
      },
    };
  }
);
