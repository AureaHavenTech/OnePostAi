// /api/social/platforms — GET the 7 supported platforms with per-user connection status
import { NextResponse } from "next/server";
import {
  requireAuthedUserIdAsync,
  listPlatformsWithStatus,
} from "@/lib/services/social-connections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;
  const platforms = listPlatformsWithStatus(auth.userId);
  return NextResponse.json({
    platforms,
    total: platforms.length,
    connected: platforms.filter((p) => p.connected).length,
  });
}
