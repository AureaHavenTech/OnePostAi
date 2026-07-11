import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS, CREDIT_PACKAGES } from "@/lib/services/monetization";
import { PRICING, BRAND } from "@/lib/shared/brand-config";

export async function GET() {
  try {
    const stats = {
      totalUsers: 0,
      activeSubscribers: 0,
      mrr: 0,
      totalRevenue: 0,
      affiliateSignups: 0,
      affiliatePayouts: 0,
      totalContentGenerated: 0,
      totalPostsScheduled: 0,
      totalPostsPublished: 0,
      usageMetrics: { apiCallsToday: 0, avgPostsPerUser: 0, topPlatforms: [] as string[] },
    };

    try {
      const { execSync } = require("child_process");
      const cc = JSON.parse(execSync('team-db "SELECT COUNT(*) as count FROM content_items"', { encoding: "utf8" }));
      stats.totalContentGenerated = cc[0]?.count || 0;
      const sc = JSON.parse(execSync('team-db "SELECT COUNT(*) as count FROM schedule"', { encoding: "utf8" }));
      stats.totalPostsScheduled = sc[0]?.count || 0;
      const pc = JSON.parse(execSync("team-db \"SELECT COUNT(*) as count FROM schedule WHERE status = 'posted'\"", { encoding: "utf8" }));
      stats.totalPostsPublished = pc[0]?.count || 0;
    } catch (e) {}

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