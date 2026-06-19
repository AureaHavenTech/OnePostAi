import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { action, ambassadorId, referralCode } = await req.json();

    if (action === "signup") {
      return NextResponse.json({
        success: true,
        ambassador: {
          id: `amb_${Date.now()}`,
          referralCode: referralCode || `ONEPOST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          commissionRate: "10% lifetime",
          referralLink: `https://onepost.ai/ref/${referralCode || "demo"}`,
          earnings: "$0.00",
          status: "active",
        },
      });
    }

    if (action === "stats") {
      return NextResponse.json({
        success: true,
        stats: {
          totalReferrals: 0,
          activeSubscribers: 0,
          totalEarned: "$0.00",
          pendingCommission: "$0.00",
          conversionRate: "0%",
        },
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Affiliate error" }, { status: 500 });
  }
}