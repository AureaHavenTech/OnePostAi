// /api/publish/history — GET ?limit=20&offset=0&platform=&fromDate=&toDate=&status=
// Returns the publishing history for the authenticated user. Filterable +
// paginated. Ordered by published_at desc.
import { NextResponse } from "next/server";
import { requireAuthedUserIdAsync } from "@/lib/services/social-connections";
import { listHistory } from "@/lib/services/publishing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;
  const url = new URL(req.url);
  const opts = {
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 20,
    offset: url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : 0,
    platform: url.searchParams.get("platform") || undefined,
    fromDate: url.searchParams.get("fromDate") || undefined,
    toDate: url.searchParams.get("toDate") || undefined,
    status: url.searchParams.get("status") || undefined,
  };
  const result = listHistory(auth.userId, opts);
  return NextResponse.json(result);
}
