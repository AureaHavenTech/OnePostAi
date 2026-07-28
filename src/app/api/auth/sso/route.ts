/**
 * POST /api/auth/sso — Cross-app single sign-on exchange endpoint
 *
 * Receives an SSO token from a sister app, validates it,
 * and creates/finds a matching user with a local session.
 *
 * CORS: allows sister app origins so the browser can POST with credentials.
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb, createSession } from "@/lib/db";
import { verifySSOToken, SSO_APPS, type AppKey } from "@/lib/sso";

// Allowed origins for CORS (sister apps)
const ALLOWED_ORIGINS = Object.values(SSO_APPS).map((a) => a.url);

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin === o);

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "SSO token is required" },
        {
          status: 400,
          headers: corsHeaders(origin, isAllowed),
        }
      );
    }

    // Verify the SSO token
    const result = verifySSOToken(token);
    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        {
          status: 401,
          headers: corsHeaders(origin, isAllowed),
        }
      );
    }

    const { userId, email, name, app } = result.payload;
    const db = getDb();

    // Find or create the user locally
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;

    if (!user) {
      // Create a new local user mirroring the sister app's user
      const localId = "user_sso_" + Math.random().toString(36).substring(2, 11);
      db.prepare(
        "INSERT INTO users (id, email, name, is_admin) VALUES (?, ?, ?, ?)"
      ).run(localId, email, name, 0);

      // Give starter subscription
      const subId = "sub_" + Math.random().toString(36).substring(2, 11);
      db.prepare(
        "INSERT INTO subscriptions (id, user_id, tier, status) VALUES (?, ?, ?, ?)"
      ).run(subId, localId, "starter", "active");

      user = db.prepare("SELECT * FROM users WHERE id = ?").get(localId);
    }

    // Create session
    const session = createSession(user.id);

    const response = NextResponse.json(
      {
        success: true,
        message: `SSO from ${app} — logged into ${getCurrentAppName()}`,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          is_admin: user.is_admin || 0,
        },
      },
      { headers: corsHeaders(origin, isAllowed) }
    );

    // Set session cookie
    response.cookies.set("session_token", session.token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
      secure: true,
    });

    return response;
  } catch (error: any) {
    console.error("[sso] Exchange error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      {
        status: 500,
        headers: corsHeaders(origin, isAllowed),
      }
    );
  }
}

// OPTIONS preflight for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin === o);
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, isAllowed),
  });
}

function corsHeaders(origin: string, isAllowed: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
  if (isAllowed) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function getCurrentAppName(): string {
  // Default for OnePost AI — overridden in Axel AI's copy
  return "OnePost AI";
}
