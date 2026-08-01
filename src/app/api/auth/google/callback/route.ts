// /api/auth/google/callback — Google OAuth redirect handler
// Exchanges the auth code for tokens, fetches the profile, creates/links the user,
// sets the session cookie, and redirects to the dashboard.
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

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export async function GET(req: Request) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url), 302);
  }
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");
  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/login?error=google_${encodeURIComponent(errorParam)}`, req.url),
      302
    );
  }
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=google_no_code", req.url), 302);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // Exchange code → tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });
    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      console.error("[auth/google/callback] token exchange failed:", txt);
      return NextResponse.redirect(new URL("/login?error=google_token", req.url), 302);
    }
    const tokens = await tokenRes.json();

    // Fetch userinfo
    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google_profile", req.url), 302);
    }
    const profile = await profileRes.json();
    if (!profile?.sub || !profile?.email) {
      return NextResponse.redirect(new URL("/login?error=google_invalid", req.url), 302);
    }

    // Find or create the user
    let user = getUserByProvider("google", profile.sub);
    if (!user) {
      user = await createUser({
        email: profile.email,
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

    const dest = new URL("/dashboard", req.url);
    const res = NextResponse.redirect(dest, 302);
    res.headers.set("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (e) {
    console.error("[auth/google/callback] error:", e);
    return NextResponse.redirect(new URL("/login?error=google_internal", req.url), 302);
  }
}
