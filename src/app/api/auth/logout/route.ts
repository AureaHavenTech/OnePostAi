// /api/auth/logout — POST → clears the session cookie
import { NextResponse } from "next/server";
import { buildClearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Signed out." });
  res.headers.set("Set-Cookie", buildClearSessionCookie());
  return res;
}
