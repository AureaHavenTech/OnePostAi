// /api/auth/session — GET → returns the current session user, or null
// /api/auth/session — DELETE → also clears the cookie (alias of /logout)
import { NextResponse } from "next/server";
import {
  readSessionCookieFromHeader,
  verifySessionToken,
  buildClearSessionCookie,
} from "@/lib/auth-edge";

export const runtime = "edge"; // Edge-safe: only uses crypto
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const token = readSessionCookieFromHeader(cookieHeader);
  if (!token) {
    return NextResponse.json({ user: null });
  }
  const payload = await verifySessionToken(token);
  if (!payload) {
    const res = NextResponse.json({ user: null });
    res.headers.set("Set-Cookie", buildClearSessionCookie());
    return res;
  }
  return NextResponse.json({
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
  });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.headers.set("Set-Cookie", buildClearSessionCookie());
  return res;
}
