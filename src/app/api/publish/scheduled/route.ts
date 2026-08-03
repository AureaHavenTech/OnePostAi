// /api/publish/scheduled — GET list of scheduled (not yet published) posts
// for the authenticated user. Only shows rows with status IN ('queued','pending').
import { NextResponse } from "next/server";
import { requireAuthedUserIdAsync } from "@/lib/services/social-connections";
import { listScheduled } from "@/lib/services/publishing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;
  const items = listScheduled(auth.userId);
  return NextResponse.json({ scheduled: items, count: items.length });
}
