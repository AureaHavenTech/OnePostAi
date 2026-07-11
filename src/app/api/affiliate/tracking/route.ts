import { NextResponse } from "next/server";

const COMMISSION_RATE = 0.10;
const affiliates: Record<string, any> = {};

export async function GET() {
  try {
    const all = Object.values(affiliates);
    const totalEarnings = all.reduce((s: number, a: any) => s + a.earnings, 0);
    return NextResponse.json({
      success: true,
      affiliates: all,
      summary: {
        totalAffiliates: all.length,
        totalReferrals: all.reduce((s: number, a: any) => s + a.referrals, 0),
        totalActiveSubscribers: all.reduce((s: number, a: any) => s + a.activeSubscribers, 0),
        totalEarnings,
        pendingPayouts: totalEarnings * 0.8,
        commissionRate: "10% lifetime",
      },
      settings: { commissionRate: COMMISSION_RATE, commissionType: "lifetime", payoutThreshold: 50, payoutMethod: "Stripe" },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to load affiliates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, name, email, referralCode, amount, affiliateCode, affiliateId } = body;

    if (action === "signup") {
      if (!name || !email) return NextResponse.json({ error: "Name and email required" }, { status: 400 });
      const code = referralCode || `OP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const aff = { id: `aff_${Date.now()}`, name, email, referralCode: code, referrals: 0, activeSubscribers: 0, earnings: 0, status: "active" };
      affiliates[aff.id] = aff;
      return NextResponse.json({ success: true, affiliate: aff, referralLink: `https://onepost.ai/ref/${code}`, commission: "10% lifetime" });
    }

    if (action === "track") {
      if (!affiliateCode || !amount) return NextResponse.json({ error: "affiliateCode and amount required" }, { status: 400 });
      const aff = Object.values(affiliates).find((a: any) => a.referralCode === affiliateCode);
      if (!aff) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
      const commission = amount * COMMISSION_RATE;
      aff.referrals += 1;
      aff.activeSubscribers += 1;
      aff.earnings += commission;
      return NextResponse.json({ success: true, commission, totalEarnings: aff.earnings, affiliate: aff });
    }

    if (action === "payout") {
      if (!affiliateId) return NextResponse.json({ error: "affiliateId required" }, { status: 400 });
      const aff = affiliates[affiliateId];
      if (!aff) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
      const amount = aff.earnings;
      aff.earnings = 0;
      return NextResponse.json({ success: true, payout: amount, message: `Payout of $${amount.toFixed(2)} processed` });
    }

    return NextResponse.json({ error: "Unknown action. Use: signup, track, payout" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Affiliate error" }, { status: 500 });
  }
}