// /api/auth/me — GET → { user } (alias of /api/auth/session, more discoverable)
import { NextResponse } from "next/server";
import {
  readSessionCookieFromHeader,
  verifySessionToken,
  buildClearSessionCookie,
} from "@/lib/auth-edge";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const token = readSessionCookieFromHeader(cookieHeader);
  if (!token) return NextResponse.json({ user: null });
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
