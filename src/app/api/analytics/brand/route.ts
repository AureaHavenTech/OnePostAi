// /api/analytics/brand — per-brand analytics (totals, engagement, follower growth, top content types)
// GET ?brandId=X&days=30 — single brand
// GET ?list=1 — list all brands (one summary row each)
// POST — record a brand follower snapshot
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { getBrandAnalytics, listBrandAnalytics, recordBrandFollowers } from "@/lib/services/analytics";
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
    cache: "short", // 30s
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    const brandId = (body?.brandId as string) || undefined;
    const days = body?.days ? parseInt(String(body.days), 10) : 30;
    const list = body?.list === "1" || body?.list === "true" || body?.list === true;

    if (list) {
      const all = listBrandAnalytics(days);
      return {
        success: true,
        brands: all,
        total: all.length,
        days,
        source: all.length > 0 && all[0].totalPosts > 0 ? "platform_api" : "demo",
        meta: {
          liveModeNote: "Once platform API keys are connected, real per-brand data is returned. Until then, demo data is returned so the dashboard never goes blank.",
          generatedAt: new Date().toISOString(),
        },
      };
    }

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: "brandId query param is required (or use ?list=1 for all brands)" },
        { status: 400 }
      );
    }

    const brand = getBrandAnalytics({ brandId, days });
    return {
      success: true,
      ...brand,
      source: brand.totalPosts > 0 ? "platform_api" : "demo",
      meta: {
        liveModeNote: "Once platform API keys are connected, real per-brand data is returned. Until then, demo data is returned so the dashboard never goes blank.",
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
      if (!b?.brandId) return "brandId is required";
      if (!b?.platform) return "platform is required";
      if (!(PLATFORMS as readonly string[]).includes(String(b.platform))) {
        return `platform must be one of: ${PLATFORMS.join(", ")}`;
      }
      if (b?.followers === undefined || b?.followers === null) return "followers is required";
      const f = Number(b.followers);
      if (!Number.isFinite(f) || f < 0) return "followers must be a non-negative number";
      return true;
    },
  },
  async (req, body) => {
    const out = recordBrandFollowers({
      brandId: body.brandId,
      brandName: body.brandName,
      platform: body.platform,
      followers: Number(body.followers),
    });
    return NextResponse.json(out, { status: out.persisted ? 201 : 202 });
  }
);
