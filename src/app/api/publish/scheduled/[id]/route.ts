// /api/publish/scheduled/[id] — DELETE: cancel a scheduled post.
import { NextResponse } from "next/server";
import { requireAuthedUserIdAsync } from "@/lib/services/social-connections";
import { cancelScheduled } from "@/lib/services/publishing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "MISSING_ID", message: "id is required." }, { status: 400 });
  }
  const ok = cancelScheduled(auth.userId, id);
  if (!ok) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Scheduled post not found or already cancelled." },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, message: "Scheduled post cancelled.", id });
}
