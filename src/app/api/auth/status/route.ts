/**
 * GET /api/auth/status — Current session + cross-app SSO status
 *
 * Returns the current user session (if any) and SSO URLs for sister apps.
 * The frontend uses this to show "Logged into both apps" indicator.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb, getSession } from "@/lib/db";
import { getSisterApps, type AppKey } from "@/lib/sso";

const CURRENT_APP: AppKey = "onepostai";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const sessionToken = request.cookies.get("session_token")?.value;

    let user = null;
    if (sessionToken) {
      const session = getSession(sessionToken);
      if (session) {
        const u = db
          .prepare("SELECT * FROM users WHERE id = ?")
          .get(session.userId) as any;
        if (u) {
          const sub = db
            .prepare("SELECT * FROM subscriptions WHERE user_id = ?")
            .get(u.id) as any;
          user = {
            id: u.id,
            email: u.email,
            name: u.name,
            is_admin: u.is_admin || 0,
            subscription: sub
              ? { tier: sub.tier, status: sub.status }
              : null,
          };
        }
      }
    }

    const sisters = getSisterApps(CURRENT_APP);

    return NextResponse.json({
      success: true,
      loggedIn: !!user,
      user,
      currentApp: CURRENT_APP,
      sisterApps: sisters.map((s) => ({
        name: s.name,
        url: s.url,
        ssoEndpoint: s.ssoEndpoint,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
