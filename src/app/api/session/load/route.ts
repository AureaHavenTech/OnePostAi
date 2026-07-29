// /api/session/load — Load a saved session by id
// GET ?id=sess_xxx
// DELETE ?id=sess_xxx
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { loadSession, deleteSession } from "@/lib/services/utility-apis";

export const GET = withApi(
  {
    method: "GET",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 240 },
    validate: (b) => (!b?.id ? "id query param is required" : true),
  },
  async (req, body) => {
    const session = loadSession(String(body.id));
    if (!session) {
      return NextResponse.json(
        { success: false, error: `Session not found: ${body.id}` },
        { status: 404 }
      );
    }
    return { success: true, session };
  }
);

export const DELETE = withApi(
  {
    method: "DELETE",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 60 },
    validate: (b) => (!b?.id ? "id is required" : true),
  },
  async (req, body) => {
    const out = deleteSession(String(body.id));
    return out;
  }
);
