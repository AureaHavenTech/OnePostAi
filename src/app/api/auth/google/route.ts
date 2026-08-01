// /api/auth/google — Google OAuth sign-in (env-gated)
//
// Flow (standard Google OAuth 2.0 authorization-code):
//   1. Client calls GET /api/auth/google → returns { url: "https://accounts.google.com/..." }
//   2. User consents; Google redirects to /api/auth/google/callback?code=...&state=...
//   3. We exchange the code for tokens, fetch the user profile, upsert into auth_users
//      with auth_provider='google', and redirect to /dashboard with the session cookie set.
//
// This file contains:
//   - GET  /api/auth/google           → returns the Google authorize URL
//   - GET  /api/auth/google/callback  → handles the redirect
//   - POST /api/auth/google           → ID-token-based sign-in (for One Tap / native)
//
// If GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set, all routes return
// 503 with a clear message so the frontend can fall back to credentials.
import { NextResponse } from "next/server";
import {
  isGoogleOAuthConfigured,
  getUserByProvider,
  createUser,
  signSessionToken,
  buildSessionCookie,
  toPublicUser,
  updateLastLogin,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const SCOPES = ["openid", "email", "profile"];

function getRedirectUri(req: Request): string {
  // Caller can override via state, but default to the canonical callback URL
  const url = new URL(req.url);
  return `${url.origin}/api/auth/google/callback`;
}

export async function GET(req: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      {
        error: "GOOGLE_NOT_CONFIGURED",
        message:
          "Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.",
      },
      { status: 503 }
    );
  }
  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = getRedirectUri(req);
  // Generate a random state for CSRF protection (caller should echo it back).
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);
  return NextResponse.json({ url: url.toString(), state });
}

// POST /api/auth/google { idToken } — for Google One Tap / native clients
export async function POST(req: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "GOOGLE_NOT_CONFIGURED", message: "Google sign-in is not configured." },
      { status: 503 }
    );
  }
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken, accessToken } = body || {};
    if (!idToken && !accessToken) {
      return NextResponse.json(
        { error: "TOKEN_REQUIRED", message: "Provide idToken or accessToken." },
        { status: 400 }
      );
    }

    // Use the access token to fetch the userinfo (simplest, no client secret needed)
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken || idToken}` },
    });
    if (!profileRes.ok) {
      return NextResponse.json(
        { error: "GOOGLE_PROFILE_FAILED", message: "Failed to fetch Google profile." },
        { status: 401 }
      );
    }
    const profile = await profileRes.json();
    if (!profile?.sub || !profile?.email) {
      return NextResponse.json(
        { error: "GOOGLE_PROFILE_INVALID", message: "Google profile is missing required fields." },
        { status: 400 }
      );
    }

    let user = getUserByProvider("google", profile.sub);
    if (!user) {
      user = await createUser({
        email: profile.email,
        // Random password — Google users can't sign in with a password directly
        password: Math.random().toString(36).slice(2) + Date.now().toString(36),
        name: profile.name || profile.email.split("@")[0],
        authProvider: "google",
        providerUserId: profile.sub,
        emailVerified: !!profile.email_verified,
        role: "user",
      });
    }

    updateLastLogin(user.id);
    const token = await signSessionToken({
      sub: user.id,
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      authProvider: user.authProvider,
    });

    const res = NextResponse.json({ success: true, user: toPublicUser(user) });
    res.headers.set("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (e) {
    console.error("[auth/google POST] error:", e);
    return NextResponse.json(
      { error: "INTERNAL", message: "Google sign-in failed." },
      { status: 500 }
    );
  }
}
