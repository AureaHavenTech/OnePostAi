import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from "@/lib/services/monetization";
import { PRICING, BRAND } from "@/lib/shared/brand-config";

function dbQuery(sql: string): any[] {
  try {
    const { execSync } = require("child_process");
    const out = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function dbScalar(sql: string, fallback: number = 0): number {
  const rows = dbQuery(sql);
  const v = rows[0] ? Object.values(rows[0])[0] : fallback;
  return Number(v || fallback);
}

export async function GET() {
  try {
    const stats = {
      totalUsers: dbScalar("SELECT COUNT(*) as count FROM user_management", 0),
      activeSubscribers: dbScalar("SELECT COUNT(*) as count FROM user_management WHERE subscription_tier IN ('pro','agency')", 0),
      mrr: 0,
      totalRevenue: dbScalar("SELECT COALESCE(SUM(amount), 0) as total FROM invoices WHERE status = 'paid'", 0),
      affiliateSignups: dbScalar("SELECT COUNT(*) as count FROM affiliates", 0),
      affiliatePayouts: 0,
      totalContentGenerated: dbScalar("SELECT COUNT(*) as count FROM content_items", 0),
      totalPostsScheduled: dbScalar("SELECT COUNT(*) as count FROM schedule", 0),
      totalPostsPublished: dbScalar("SELECT COUNT(*) as count FROM schedule WHERE status = 'posted'", 0),
      usageMetrics: {
        apiCallsToday: dbScalar("SELECT COALESCE(SUM(calls), 0) as calls FROM usage_metrics WHERE date = date('now')", 0),
        avgPostsPerUser: 0,
        topPlatforms: ["tiktok", "instagram", "youtube"],
      },
    };
    stats.mrr = stats.activeSubscribers * 49;

    return NextResponse.json({
      success: true,
      stats,
      subscriptionPlans: SUBSCRIPTION_PLANS,
      creditPackages: CREDIT_PACKAGES,
      pricing: [
        { plan: "Basic", price: PRICING.onepost.basic.price },
        { plan: "Pro", price: PRICING.onepost.pro.price },
        { plan: "Agency", price: PRICING.onepost.agency.price },
      ],
      brand: { name: BRAND.trademarks.onepost, parent: BRAND.parent },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load dashboard" }, { status: 500 });
  }
}
