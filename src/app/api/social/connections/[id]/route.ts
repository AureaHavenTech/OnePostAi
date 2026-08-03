// /api/social/connections/[id] — DELETE a single platform connection by id
import { NextResponse } from "next/server";
import {
  requireAuthedUserIdAsync,
  getConnectionById,
  deleteConnection,
} from "@/lib/services/social-connections";

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
    return NextResponse.json(
      { error: "MISSING_ID", message: "Connection id is required." },
      { status: 400 }
    );
  }

  const existing = getConnectionById(id, auth.userId);
  if (!existing) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Connection not found." },
      { status: 404 }
    );
  }

  const ok = deleteConnection(auth.userId, id);
  if (!ok) {
    return NextResponse.json(
      { error: "DELETE_FAILED", message: "Could not delete the connection." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Disconnected from ${existing.platform}.`,
    disconnectedPlatform: existing.platform,
    connectionId: id,
  });
}
