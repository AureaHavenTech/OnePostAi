// /lib/services/social-connections.ts — Social Media Connection Hub backend
//
// Persists a user's OAuth connections to the 7 supported platforms in
// team-db (table: social_connections). Tokens are encrypted at rest with
// AES-256-GCM using a key derived from AUTH_SECRET. The OAuth handshake
// itself is frontend-driven; this module stores and retrieves the
// resulting tokens, and is the single source of truth for "which
// platforms is this user connected to?".
//
// Exports:
//   - Platform metadata (PLATFORMS list with id, name, icon, color)
//   - encryptToken / decryptToken (AES-256-GCM, key from AUTH_SECRET)
//   - listConnections, getConnection, createOrUpdateConnection,
//     deleteConnection, disconnectAll, ensureSchema
//   - requireAuthedUserIdAsync(req) — verifies JWT cookie, returns userId

import { execSync } from "child_process";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { readSessionCookieFromHeader, verifySessionToken } from "@/lib/auth-edge";

// ─── team-db helpers (single-quoted shell arg, $ ! safe) ─────────
function teamDbQuery<T = any>(sql: string): T[] {
  try {
    const escaped = sql.replace(/'/g, "'\\''");
    const out = execSync(`team-db '${escaped}'`, { encoding: "utf8" });
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[social-conn] teamDbQuery failed:", String(e).slice(0, 200));
    return [];
  }
}

function teamDbExec(sql: string): boolean {
  try {
    const escaped = sql.replace(/'/g, "'\\''");
    execSync(`team-db '${escaped}'`, { encoding: "utf8" });
    return true;
  } catch (e) {
    console.error("[social-conn] teamDbExec failed:", String(e).slice(0, 200));
    return false;
  }
}

function esc(v: any): string {
  return String(v ?? "").replace(/'/g, "''");
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── AES-256-GCM token encryption ────────────────────────────────
function getKey(): Buffer {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "onepost-ai-dev-secret-please-override-in-production-min-32-chars";
  return scryptSync(secret, "onepost-social-connections-v1", 32);
}

export function encryptToken(plain: string): string {
  if (!plain) return "";
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptToken(blob: string): string {
  if (!blob) return "";
  try {
    const parts = blob.split(":");
    if (parts.length !== 4 || parts[0] !== "v1") return "";
    const key = getKey();
    const iv = Buffer.from(parts[1], "hex");
    const tag = Buffer.from(parts[2], "hex");
    const ct = Buffer.from(parts[3], "hex");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
    return dec.toString("utf8");
  } catch {
    return "";
  }
}

// ─── Platform metadata (the 7 supported platforms) ──────────────
export type PlatformId =
  | "tiktok"
  | "instagram"
  | "facebook"
  | "youtube"
  | "linkedin"
  | "snapchat"
  | "pinterest";

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  icon: string;
  color: string;
  charLimit: number;
  videoMaxSec: number;
  aspectRatio: string;
  scopes: string[];
  docs: string;
}

export const PLATFORMS: PlatformMeta[] = [
  {
    id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000",
    charLimit: 2200, videoMaxSec: 180, aspectRatio: "9:16",
    scopes: ["user.info.basic", "video.upload", "video.publish"],
    docs: "https://developers.tiktok.com/doc/tiktok-api-v2-video-publish/",
  },
  {
    id: "instagram", name: "Instagram", icon: "📸", color: "#E1306C",
    charLimit: 2200, videoMaxSec: 90, aspectRatio: "9:16",
    scopes: ["instagram_basic", "instagram_content_publish"],
    docs: "https://developers.facebook.com/docs/instagram-api/",
  },
  {
    id: "facebook", name: "Facebook", icon: "📘", color: "#1877F2",
    charLimit: 63206, videoMaxSec: 240, aspectRatio: "1:1, 4:5, 9:16, 16:9",
    scopes: ["pages_manage_posts", "pages_read_engagement"],
    docs: "https://developers.facebook.com/docs/pages-api/",
  },
  {
    id: "youtube", name: "YouTube", icon: "▶️", color: "#FF0000",
    charLimit: 5000, videoMaxSec: 60, aspectRatio: "9:16",
    scopes: ["youtube.upload", "youtube.readonly"],
    docs: "https://developers.google.com/youtube/v3/guides/uploading",
  },
  {
    id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2",
    charLimit: 3000, videoMaxSec: 600, aspectRatio: "1:1, 16:9",
    scopes: ["w_member_social", "r_liteprofile"],
    docs: "https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api",
  },
  {
    id: "snapchat", name: "Snapchat", icon: "👻", color: "#FFFC00",
    charLimit: 250, videoMaxSec: 60, aspectRatio: "9:16",
    scopes: ["snapchat-marketing-api"],
    docs: "https://marketingapi.snapchat.com/doc/",
  },
  {
    id: "pinterest", name: "Pinterest", icon: "📌", color: "#E60023",
    charLimit: 500, videoMaxSec: 60, aspectRatio: "1:1, 2:3, 1:2",
    scopes: ["pins:read", "pins:write"],
    docs: "https://developers.pinterest.com/api/v5/",
  },
];

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id);

export function isValidPlatformId(id: string): id is PlatformId {
  return (PLATFORM_IDS as string[]).includes(id);
}

// ─── Connection record shape ────────────────────────────────────
export interface SocialConnection {
  id: string;
  userId: string;
  platform: PlatformId;
  platformUserId?: string | null;
  username?: string | null;
  avatar?: string | null;
  status: "active" | "expired" | "revoked" | "error";
  connectedAt: string;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
}

interface RawConnection {
  id: string; user_id: string; platform: string;
  access_token: string | null; refresh_token: string | null;
  platform_user_id: string | null; username: string | null; avatar: string | null;
  status: string; connected_at: string;
  expires_at: string | null; last_used_at: string | null;
}

function toPublicConnection(r: RawConnection): SocialConnection {
  return {
    id: r.id,
    userId: r.user_id,
    platform: r.platform as PlatformId,
    platformUserId: r.platform_user_id,
    username: r.username,
    avatar: r.avatar,
    status: (r.status as SocialConnection["status"]) || "active",
    connectedAt: r.connected_at,
    expiresAt: r.expires_at,
    lastUsedAt: r.last_used_at,
    hasAccessToken: !!(r.access_token && r.access_token.length > 0),
    hasRefreshToken: !!(r.refresh_token && r.refresh_token.length > 0),
  };
}

// ─── Schema bootstrap ───────────────────────────────────────────
let _schemaReady = false;
export function ensureSchema(): void {
  if (_schemaReady) return;
  teamDbExec(
    `CREATE TABLE IF NOT EXISTS social_connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      platform_user_id TEXT,
      username TEXT,
      avatar TEXT,
      scopes TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      connected_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT,
      last_used_at TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, platform)
    )`
  );
  teamDbExec(
    `CREATE INDEX IF NOT EXISTS idx_social_connections_user ON social_connections(user_id)`
  );
  _schemaReady = true;
}

// ─── DB: read helpers ────────────────────────────────────────────
export function listConnections(userId: string): SocialConnection[] {
  ensureSchema();
  const rows = teamDbQuery<RawConnection>(
    `SELECT id, user_id, platform, access_token, refresh_token, platform_user_id,
            username, avatar, status, connected_at, expires_at, last_used_at
     FROM social_connections WHERE user_id = '${esc(userId)}' ORDER BY connected_at DESC`
  );
  return rows.map(toPublicConnection);
}

export function getConnection(userId: string, platform: PlatformId): SocialConnection | null {
  ensureSchema();
  const rows = teamDbQuery<RawConnection>(
    `SELECT id, user_id, platform, access_token, refresh_token, platform_user_id,
            username, avatar, status, connected_at, expires_at, last_used_at
     FROM social_connections WHERE user_id = '${esc(userId)}' AND platform = '${esc(platform)}' LIMIT 1`
  );
  if (rows.length === 0) return null;
  return toPublicConnection(rows[0]);
}

export function getConnectionById(id: string, userId: string): SocialConnection | null {
  ensureSchema();
  const rows = teamDbQuery<RawConnection>(
    `SELECT id, user_id, platform, access_token, refresh_token, platform_user_id,
            username, avatar, status, connected_at, expires_at, last_used_at
     FROM social_connections WHERE id = '${esc(id)}' AND user_id = '${esc(userId)}' LIMIT 1`
  );
  if (rows.length === 0) return null;
  return toPublicConnection(rows[0]);
}

export function getDecryptedAccessToken(userId: string, platform: PlatformId): string {
  const rows = teamDbQuery<{ access_token: string | null }>(
    `SELECT access_token FROM social_connections
     WHERE user_id = '${esc(userId)}' AND platform = '${esc(platform)}' LIMIT 1`
  );
  if (rows.length === 0 || !rows[0].access_token) return "";
  return decryptToken(rows[0].access_token);
}

// ─── DB: write helpers ───────────────────────────────────────────
export interface UpsertConnectionInput {
  platform: PlatformId;
  accessToken: string;
  refreshToken?: string;
  platformUserId?: string;
  username?: string;
  avatar?: string;
  scopes?: string[];
  expiresAt?: string;
  status?: SocialConnection["status"];
}

export function createOrUpdateConnection(userId: string, input: UpsertConnectionInput): SocialConnection {
  ensureSchema();
  const encAccess = encryptToken(input.accessToken);
  const encRefresh = input.refreshToken ? encryptToken(input.refreshToken) : null;
  const scopesJson = JSON.stringify(input.scopes || []);
  const status = input.status || "active";
  const existing = getConnection(userId, input.platform);
  if (existing) {
    teamDbExec(
      `UPDATE social_connections
       SET access_token = '${esc(encAccess)}',
           refresh_token = ${encRefresh ? `'${esc(encRefresh)}'` : "NULL"},
           platform_user_id = ${input.platformUserId ? `'${esc(input.platformUserId)}'` : "NULL"},
           username = ${input.username ? `'${esc(input.username)}'` : "NULL"},
           avatar = ${input.avatar ? `'${esc(input.avatar)}'` : "NULL"},
           scopes = '${esc(scopesJson)}',
           status = '${esc(status)}',
           expires_at = ${input.expiresAt ? `'${esc(input.expiresAt)}'` : "expires_at"},
           updated_at = datetime('now')
       WHERE id = '${esc(existing.id)}'`
    );
  } else {
    const id = uid("soc");
    teamDbExec(
      `INSERT INTO social_connections
         (id, user_id, platform, access_token, refresh_token, platform_user_id,
          username, avatar, scopes, status, expires_at, updated_at)
       VALUES
         ('${esc(id)}', '${esc(userId)}', '${esc(input.platform)}', '${esc(encAccess)}',
          ${encRefresh ? `'${esc(encRefresh)}'` : "NULL"},
          ${input.platformUserId ? `'${esc(input.platformUserId)}'` : "NULL"},
          ${input.username ? `'${esc(input.username)}'` : "NULL"},
          ${input.avatar ? `'${esc(input.avatar)}'` : "NULL"},
          '${esc(scopesJson)}', '${esc(status)}',
          ${input.expiresAt ? `'${esc(input.expiresAt)}'` : "NULL"},
          datetime('now'))`
    );
  }
  return getConnection(userId, input.platform)!;
}

export function deleteConnection(userId: string, id: string): boolean {
  ensureSchema();
  const existing = getConnectionById(id, userId);
  if (!existing) return false;
  teamDbExec(`DELETE FROM social_connections WHERE id = '${esc(id)}' AND user_id = '${esc(userId)}'`);
  return true;
}

export function disconnectAll(userId: string): number {
  ensureSchema();
  const conns = listConnections(userId);
  if (conns.length === 0) return 0;
  teamDbExec(`DELETE FROM social_connections WHERE user_id = '${esc(userId)}'`);
  return conns.length;
}

export function markUsed(userId: string, platform: PlatformId): void {
  ensureSchema();
  teamDbExec(
    `UPDATE social_connections SET last_used_at = datetime('now') WHERE user_id = '${esc(userId)}' AND platform = '${esc(platform)}'`
  );
}

// ─── Auth helper for API routes (Node runtime) ───────────────────
export async function requireAuthedUserIdAsync(
  req: Request
): Promise<{ userId: string } | { response: Response }> {
  const cookieHeader = req.headers.get("cookie");
  const token = readSessionCookieFromHeader(cookieHeader);
  if (!token) {
    return {
      response: new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Not signed in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
  const payload = await verifySessionToken(token);
  if (!payload) {
    return {
      response: new Response(
        JSON.stringify({ error: "INVALID_SESSION", message: "Session expired or invalid. Please sign in again." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    };
  }
  return { userId: payload.userId };
}

// ─── Platform list with per-user connection status ──────────────
export interface PlatformWithStatus extends PlatformMeta {
  connected: boolean;
  username?: string | null;
  avatar?: string | null;
  connectedAt?: string | null;
  status?: string | null;
  connectionId?: string | null;
}

export function listPlatformsWithStatus(userId: string): PlatformWithStatus[] {
  const conns = listConnections(userId);
  const byPlatform = new Map<string, SocialConnection>();
  for (const c of conns) byPlatform.set(c.platform, c);
  return PLATFORMS.map((p) => {
    const c = byPlatform.get(p.id);
    return {
      ...p, connected: !!c,
      username: c?.username ?? null,
      avatar: c?.avatar ?? null,
      connectedAt: c?.connectedAt ?? null,
      status: c?.status ?? null,
      connectionId: c?.id ?? null,
    };
  });
}
