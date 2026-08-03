// /api/social/disconnect-all — POST: drop every social connection for the
// authenticated user. Used as an emergency kill-switch.
import { NextResponse } from "next/server";
import {
  requireAuthedUserIdAsync,
  disconnectAll,
  listConnections,
} from "@/lib/services/social-connections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;
  const before = listConnections(auth.userId).map((c) => c.platform);
  const removed = disconnectAll(auth.userId);
  return NextResponse.json({
    success: true,
    message:
      removed === 0
        ? "No connections to remove."
        : `Disconnected from ${removed} platform${removed === 1 ? "" : "s"}.`,
    removed,
    platforms: before,
  });
}
