// /api/analytics/overview — top-line dashboard summary
// GET ?days=30 — full overview with totals, averages, breakdowns, top brands
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { getOverview } from "@/lib/services/analytics";

export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    const days = body?.days ? parseInt(String(body.days), 10) : 30;
    const overview = getOverview({ days });
    return {
      success: true,
      ...overview,
      meta: {
        liveModeNote: "Once platform API keys + Stripe + affiliate tracking are wired, this returns real data. Until then, demo data is returned so the dashboard never goes blank.",
        days,
        generatedAt: new Date().toISOString(),
      },
    };
  }
);
