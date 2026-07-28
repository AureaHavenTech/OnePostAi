// /api/analytics/record — generic write endpoint for batch-recording performance snapshots
// POST { records: [...] } — bulk record
// Useful for cron jobs that pull platform data once per day and bulk insert.
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { recordContentPerformance, recordRevenue, recordBrandFollowers } from "@/lib/services/analytics";
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

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 10 },
    validate: (b) => {
      if (!b?.records || !Array.isArray(b.records) || b.records.length === 0) {
        return "records must be a non-empty array";
      }
      if (b.records.length > 500) {
        return "records array cannot exceed 500 entries per request";
      }
      for (const r of b.records) {
        if (!r?.type) return "each record must have a `type` field (performance|revenue|followers)";
        if (!["performance", "revenue", "followers"].includes(String(r.type))) {
          return `record.type must be one of: performance, revenue, followers`;
        }
      }
      return true;
    },
  },
  async (req, body) => {
    const results: Array<{ type: string; success: boolean; id: string; persisted: boolean; error?: string }> = [];
    let successCount = 0;
    let failureCount = 0;

    for (const r of body.records) {
      try {
        if (r.type === "performance") {
          if (!r?.postId || !r?.platform) {
            results.push({ type: "performance", success: false, id: "", persisted: false, error: "postId and platform required" });
            failureCount++;
            continue;
          }
          if (!PLATFORMS.includes(String(r.platform))) {
            results.push({ type: "performance", success: false, id: "", persisted: false, error: `invalid platform: ${r.platform}` });
            failureCount++;
            continue;
          }
          const out = recordContentPerformance({
            postId: r.postId,
            postSource: r.postSource,
            brandId: r.brandId,
            brandName: r.brandName,
            platform: r.platform,
            contentType: r.contentType,
            views: r.views,
            likes: r.likes,
            comments: r.comments,
            shares: r.shares,
            saves: r.saves,
            clicks: r.clicks,
            reach: r.reach,
            impressions: r.impressions,
            followersGained: r.followersGained,
            revenueUsd: r.revenueUsd,
            source: r.source,
          });
          results.push({ type: "performance", ...out });
          if (out.persisted) successCount++;
          else failureCount++;
        } else if (r.type === "revenue") {
          if (!r?.revenueType || r?.amountUsd === undefined) {
            results.push({ type: "revenue", success: false, id: "", persisted: false, error: "revenueType and amountUsd required" });
            failureCount++;
            continue;
          }
          const out = recordRevenue({
            type: r.revenueType,
            source: r.source,
            amountUsd: Number(r.amountUsd),
            customerEmail: r.customerEmail,
            customerName: r.customerName,
            plan: r.plan,
            affiliateId: r.affiliateId,
            affiliateReferralCode: r.affiliateReferralCode,
            description: r.description,
            status: r.status,
          });
          results.push({ type: "revenue", ...out });
          if (out.persisted) successCount++;
          else failureCount++;
        } else if (r.type === "followers") {
          if (!r?.brandId || !r?.platform || r?.followers === undefined) {
            results.push({ type: "followers", success: false, id: "", persisted: false, error: "brandId, platform, followers required" });
            failureCount++;
            continue;
          }
          if (!PLATFORMS.includes(String(r.platform))) {
            results.push({ type: "followers", success: false, id: "", persisted: false, error: `invalid platform: ${r.platform}` });
            failureCount++;
            continue;
          }
          const out = recordBrandFollowers({
            brandId: r.brandId,
            brandName: r.brandName,
            platform: r.platform,
            followers: Number(r.followers),
          });
          results.push({ type: "followers", ...out });
          if (out.persisted) successCount++;
          else failureCount++;
        }
      } catch (e: any) {
        results.push({ type: r?.type || "unknown", success: false, id: "", persisted: false, error: e?.message || "Unknown error" });
        failureCount++;
      }
    }

    return NextResponse.json(
      {
        success: successCount > 0,
        totalRecords: body.records.length,
        successCount,
        failureCount,
        results,
      },
      { status: successCount > 0 ? 201 : 400 }
    );
  }
);
