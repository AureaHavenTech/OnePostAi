// /api/social/connections — GET (list), POST (upsert) the user's social media connections.
// Auth: requires a valid session cookie. Returns 401 otherwise.
import { NextResponse } from "next/server";
import {
  requireAuthedUserIdAsync,
  listConnections,
  createOrUpdateConnection,
  isValidPlatformId,
  type PlatformId,
} from "@/lib/services/social-connections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;
  const conns = listConnections(auth.userId);
  return NextResponse.json({ connections: conns, count: conns.length });
}

export async function POST(req: Request) {
  const auth = await requireAuthedUserIdAsync(req);
  if ("response" in auth) return auth.response;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Request body must be JSON." },
      { status: 400 }
    );
  }

  const platform = String(body?.platform || "").trim().toLowerCase();
  const accessToken = String(body?.accessToken || body?.access_token || "").trim();
  if (!isValidPlatformId(platform)) {
    return NextResponse.json(
      {
        error: "INVALID_PLATFORM",
        message: `platform must be one of: tiktok, instagram, facebook, youtube, linkedin, snapchat, pinterest.`,
      },
      { status: 400 }
    );
  }
  if (!accessToken || accessToken.length < 4) {
    return NextResponse.json(
      { error: "MISSING_ACCESS_TOKEN", message: "accessToken is required." },
      { status: 400 }
    );
  }

  try {
    const conn = createOrUpdateConnection(auth.userId, {
      platform: platform as PlatformId,
      accessToken,
      refreshToken: body?.refreshToken || body?.refresh_token || undefined,
      platformUserId: body?.platformUserId || body?.platform_user_id || undefined,
      username: body?.username || undefined,
      avatar: body?.avatar || undefined,
      scopes: Array.isArray(body?.scopes) ? body.scopes : undefined,
      expiresAt: body?.expiresAt || body?.expires_at || undefined,
      status: body?.status || "active",
    });
    return NextResponse.json({ success: true, connection: conn });
  } catch (e: any) {
    console.error("[social/connections POST] error:", e);
    return NextResponse.json(
      { error: "INTERNAL", message: "Could not save connection." },
      { status: 500 }
    );
  }
}
