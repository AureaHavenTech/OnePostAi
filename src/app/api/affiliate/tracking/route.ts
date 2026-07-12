import { NextRequest, NextResponse } from "next/server";

const COMMISSION_RATE = 0.10;
const inMemory: Record<string, any> = {};

// team-db wrapper that gracefully falls back to in-memory if the table is missing
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

function dbExec(sql: string): boolean {
  try {
    const { execSync } = require("child_process");
    execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    return true;
  } catch (e) {
    return false;
  }
}

function esc(v: any): string {
  return String(v ?? "").replace(/'/g, "''");
}

export async function GET() {
  try {
    const rows = dbQuery("SELECT * FROM affiliates ORDER BY created_at DESC");
    const affiliates = rows.length > 0
      ? rows
      : Object.values(inMemory);
    const totalEarnings = affiliates.reduce((s: number, a: any) => s + Number(a.earnings || 0), 0);
    return NextResponse.json({
      success: true,
      affiliates,
      summary: {
        totalAffiliates: affiliates.length,
        totalReferrals: affiliates.reduce((s: number, a: any) => s + Number(a.referrals || 0), 0),
        totalActiveSubscribers: affiliates.reduce((s: number, a: any) => s + Number(a.active_subscribers || a.activeSubscribers || 0), 0),
        totalEarnings,
        pendingPayouts: Math.round(totalEarnings * 0.8 * 100) / 100,
        commissionRate: "10% lifetime",
      },
      settings: {
        commissionRate: COMMISSION_RATE,
        commissionType: "lifetime",
        payoutThreshold: 50,
        payoutMethod: "Stripe",
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to load affiliates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, email, referralCode, amount, affiliateCode, affiliateId } = body;

    if (action === "signup") {
      if (!name || !email) return NextResponse.json({ error: "Name and email required" }, { status: 400 });
      const code = referralCode || `OP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const aff = {
        id: `aff_${Date.now()}`,
        name,
        email,
        referral_code: code,
        referralCode: code,
        referrals: 0,
        active_subscribers: 0,
        activeSubscribers: 0,
        earnings: 0,
        status: "active",
        created_at: new Date().toISOString(),
      };
      inMemory[aff.id] = aff;
      const persisted = dbExec(
        `INSERT OR REPLACE INTO affiliates (id, name, email, referral_code, referrals, active_subscribers, earnings, status, created_at) VALUES ('${esc(aff.id)}', '${esc(aff.name)}', '${esc(aff.email)}', '${esc(aff.referral_code)}', 0, 0, 0, 'active', datetime('now'))`
      );
      return NextResponse.json({
        success: true,
        affiliate: aff,
        referralLink: `https://onepost.ai/ref/${code}`,
        commission: "10% lifetime",
        persisted,
      });
    }

    if (action === "track") {
      if (!affiliateCode || !amount) return NextResponse.json({ error: "affiliateCode and amount required" }, { status: 400 });
      const commission = Number(amount) * COMMISSION_RATE;
      const rows = dbQuery(`SELECT * FROM affiliates WHERE referral_code = '${esc(affiliateCode)}' LIMIT 1`);
      let aff: any = rows[0];
      if (!aff && inMemory[Object.keys(inMemory).find((k) => inMemory[k].referralCode === affiliateCode) || ""]) {
        aff = inMemory[Object.keys(inMemory).find((k) => inMemory[k].referralCode === affiliateCode) || ""];
      }
      if (!aff) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
      aff.referrals = Number(aff.referrals || 0) + 1;
      aff.active_subscribers = Number(aff.active_subscribers || 0) + 1;
      aff.activeSubscribers = aff.active_subscribers;
      aff.earnings = Number(aff.earnings || 0) + commission;
      inMemory[aff.id] = aff;
      dbExec(`UPDATE affiliates SET referrals = referrals + 1, active_subscribers = active_subscribers + 1, earnings = earnings + ${commission} WHERE referral_code = '${esc(affiliateCode)}'`);
      return NextResponse.json({ success: true, commission, totalEarnings: aff.earnings, affiliate: aff });
    }

    if (action === "payout") {
      if (!affiliateId) return NextResponse.json({ error: "affiliateId required" }, { status: 400 });
      const aff = inMemory[affiliateId] || dbQuery(`SELECT * FROM affiliates WHERE id = '${esc(affiliateId)}' LIMIT 1`)[0];
      if (!aff) return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
      const payout = Number(aff.earnings || 0);
      inMemory[affiliateId] = { ...aff, earnings: 0 };
      dbExec(`UPDATE affiliates SET earnings = 0 WHERE id = '${esc(affiliateId)}'`);
      return NextResponse.json({ success: true, payout, message: `Payout of $${payout.toFixed(2)} processed` });
    }

    if (action === "stats") {
      const rows = dbQuery("SELECT * FROM affiliates");
      const totalEarnings = rows.reduce((s: number, a: any) => s + Number(a.earnings || 0), 0);
      return NextResponse.json({
        success: true,
        stats: {
          totalAffiliates: rows.length,
          totalReferrals: rows.reduce((s: number, a: any) => s + Number(a.referrals || 0), 0),
          activeSubscribers: rows.reduce((s: number, a: any) => s + Number(a.active_subscribers || 0), 0),
          totalEarnings,
          pendingPayouts: Math.round(totalEarnings * 0.8 * 100) / 100,
          commissionRate: "10% lifetime",
        },
      });
    }

    return NextResponse.json({ error: "Unknown action. Use: signup, track, payout, stats" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Affiliate error" }, { status: 500 });
  }
}
