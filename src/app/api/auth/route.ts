/**
 * /api/auth — Base auth endpoint
 * GET: Returns session status. Redirect to /api/auth/session for full user data.
 * POST: Delegates to /api/auth/login for sign-in.
 */

import { NextResponse } from "next/server";
import {
  readSessionCookieFromHeader,
  verifySessionToken,
} from "@/lib/auth-edge";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const token = readSessionCookieFromHeader(cookieHeader);

  if (!token) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      message: "No active session. Use POST /api/auth/login to sign in.",
    });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      message: "Session expired or invalid. Please sign in again.",
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.sub,
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      subscriptionTier: payload.subscriptionTier,
      authProvider: payload.authProvider,
      emailVerified: true,
    },
    endpoints: {
      login: "/api/auth/login",
      signup: "/api/auth/signup",
      logout: "/api/auth/logout",
      session: "/api/auth/session",
      me: "/api/auth/me",
    },
  });
}
