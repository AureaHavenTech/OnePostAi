// /api/analytics/revenue — revenue from all sources: Stripe, affiliates, credits, lifetime
// GET ?days=30 — full revenue analytics
// POST — record a revenue transaction (called by Stripe webhook + affiliate tracker)
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { getRevenueAnalytics, recordRevenue } from "@/lib/services/analytics";

const VALID_TYPES = ["subscription", "affiliate", "credits", "lifetime"] as const;
const VALID_STATUS = ["completed", "pending", "refunded"] as const;

export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async (req, body) => {
    const days = body?.days ? parseInt(String(body.days), 10) : 30;
    const result = getRevenueAnalytics({ days });

    // Per-day average, peak day, etc.
    const peakDay = result.byDay.length > 0
      ? result.byDay.reduce((best, d) => (d.amount > best.amount ? d : best), result.byDay[0])
      : null;
    const averageDaily = result.byDay.length > 0
      ? result.byDay.reduce((a, d) => a + d.amount, 0) / result.byDay.length
      : 0;
    const totalTransactions = result.byDay.reduce((a, d) => a + d.transactionCount, 0);

    return {
      success: true,
      data: result,
      summary: {
        ...result.totals,
        averageDailyRevenue: Math.round(averageDaily * 100) / 100,
        peakDay: peakDay ? { date: peakDay.date, amount: peakDay.amount } : null,
        totalTransactions,
        currency: "USD",
      },
      meta: {
        liveModeNote: "Once Stripe webhook + affiliate tracking is wired, this returns live revenue. Until then, demo data is returned.",
        pricingContext: {
          basic: 19,
          pro: 49,
          agency: 99,
          lifetime: 299,
          affiliateCommission: "10% lifetime",
        },
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
      if (!b?.type) return "type is required";
      if (!VALID_TYPES.includes(String(b.type))) {
        return `type must be one of: ${VALID_TYPES.join(", ")}`;
      }
      if (b?.amountUsd === undefined || b?.amountUsd === null) return "amountUsd is required";
      const amt = Number(b.amountUsd);
      if (!Number.isFinite(amt)) return "amountUsd must be a number";
      if (b?.status && !VALID_STATUS.includes(String(b.status))) {
        return `status must be one of: ${VALID_STATUS.join(", ")}`;
      }
      return true;
    },
  },
  async (req, body) => {
    const out = recordRevenue({
      type: body.type,
      source: body.source,
      amountUsd: Number(body.amountUsd),
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      plan: body.plan,
      affiliateId: body.affiliateId,
      affiliateReferralCode: body.affiliateReferralCode,
      description: body.description,
      status: body.status,
    });
    return NextResponse.json(out, { status: out.persisted ? 201 : 202 });
  }
);
