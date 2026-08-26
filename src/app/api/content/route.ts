// /api/content — GET (optional ?brand=<id>&limit=<n>)
//
// Returns the dashboard's unified list of generated content items.
// Both dashboard pages (`/dashboard/calendar` and `/dashboard/publish`)
// fetch this endpoint and look up each content row by its `id` to
// resolve the scheduled post's brand, hook, body, and media type.
//
// Source: the `content_items` table, which is populated by:
//   • /api/brands/[id]/content (per-brand AI generation)
//   • /api/chat and /api/generate (when the user creates content through
//     the conversational or "Generate" flow).
//
// Response shape (stable contract):
//   { data: Array<{ id, brand, hook, content, mediaType, captions?, hashtags?, platform?, prompt?, status, created_at }>, total, brand?, limit }
//
// Defensive guarantees:
//   • 200 with `{ data: [], total: 0 }` when the table is empty or missing
//     (so the dashboard can render an empty state instead of 404-ing).
//   • Cached for 30s in-memory (the dashboard re-fetches on each mount).
//   • 120 req/min rate limit via withApi().
//   • Auth-aware: prefers authenticated user, falls back to 'user'
//     (matches the rest of the dashboard, which is single-user in dev).
import { NextRequest } from "next/server";
import { withApi } from "@/lib/api-utils";
import { requireAuthedUserIdAsync } from "@/lib/services/social-connections";
// ---- team-db helpers (same pattern as /api/brands, /api/brand-kit, /api/schedule/calendar) ----
function teamDbQuery<T = any>(sql: string): T[] {
  try {
    const { execSync } = require("child_process");
    const out = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
function teamDbExec(sql: string): void {
  try {
    const { execSync } = require("child_process");
    execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8", stdio: "ignore" });
  } catch (e) {
    // non-fatal — queries will just return [] if the table can't be created
  }
}
function ensureSchema() {
  // The brands/content pipeline owns content_items. We re-create here
  // defensively so this route never 500s on a fresh install where the
  // table hasn't been touched yet.
  teamDbExec(
    `CREATE TABLE IF NOT EXISTS content_items (id TEXT PRIMARY KEY, brand TEXT, prompt TEXT, script TEXT, captions TEXT, hashtags TEXT, status TEXT DEFAULT 'generated', content_type TEXT, media_type TEXT, created_at TEXT DEFAULT (datetime('now')))`
  );
}
// ---- safe JSON parsing for the script/captions/hashtags string columns ----
function safeParse<T = any>(raw: any, fallback: T): T {
  if (raw == null) return fallback;
  if (typeof raw === "object") return raw as T;
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    return fallback;
  }
}
function inferMediaType(row: any): "image" | "video" {
  // 1. Explicit column if a future migration adds one.
  const explicit = (row.media_type || row.mediaType || "").toString().toLowerCase();
  if (explicit === "video" || explicit === "image") return explicit;
  // 2. Explicit content_type column.
  const ct = (row.content_type || "").toString().toLowerCase();
  if (ct.includes("video") || ct.includes("reel") || ct.includes("tiktok") || ct.includes("short")) return "video";
  // 3. Heuristic from the prompt.
  const prompt = (row.prompt || "").toString().toLowerCase();
  if (/\bvideo\b|\bunboxing\b|\breel\b|\bshort\b|\btiktok\b/.test(prompt)) return "video";
  return "image";
}
function firstSentence(text: string, maxLen = 120): string {
  if (!text) return "";
  const t = text.trim();
  // Take the first sentence (split on . ! ? followed by whitespace or end).
  const match = t.match(/^[^.!?\n]+[.!?]?/);
  const candidate = match ? match[0] : t;
  return candidate.length > maxLen ? candidate.slice(0, maxLen - 1) + "…" : candidate;
}
function rowToContent(row: any): any {
  const scripts = safeParse<Record<string, string>>(row.script, {});
  // The script object is keyed by platform ("tiktok", "instagram", ...).
  // Pick the first non-empty script as the canonical `content`, and grab
  // the first sentence as the `hook` the dashboard chips display.
  const firstScript = Object.values(scripts).find((v) => typeof v === "string" && v.trim()) as string | undefined;
  const captions = safeParse<Record<string, string>>(row.captions, {});
  const hashtags = safeParse<Record<string, string[]> | string[]>(row.hashtags, {});
  return {
    id: row.id,
    brand: row.brand || "Untitled",
    hook: firstScript ? firstSentence(firstScript) : firstSentence(row.prompt || ""),
    content: firstScript || row.prompt || "",
    mediaType: inferMediaType(row),
    captions,
    hashtags,
    prompt: row.prompt || "",
    status: row.status || "generated",
    created_at: row.created_at || "",
  };
}
// ---- in-memory cache (30s TTL, keyed by brand+limit) ----
type CacheEntry = { data: any[]; ts: number };
const CACHE_TTL_MS = 30_000;
const _cache = new Map<string, CacheEntry>();
function cacheKey(brand: string | null, limit: number, userId: string) {
  return `${userId}:${brand || "_all"}:${limit}`;
}
export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s edge cache; in-memory cache below is tighter
    rateLimit: { windowMs: 60_000, max: 120 },
    validate: () => true,
  },
  async (req: NextRequest) => {
    ensureSchema();
    // Query params: ?brand=<id>&limit=<n> (both optional)
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand");
    const limitRaw = parseInt(searchParams.get("limit") || "100", 10);
    const limit = Math.max(1, Math.min(Number.isFinite(limitRaw) ? limitRaw : 100, 500));
    // Auth: prefer authenticated user; fall back to 'user' (matches the rest
    // of the dashboard, which is single-user in dev). Errors during auth
    // resolution are non-fatal — the content list still works for
    // unauthenticated read-only previews.
    let userId = "user";
    try {
      const auth = await requireAuthedUserIdAsync(req);
      if (auth?.userId) userId = auth.userId;
    } catch (e) {
      // swallow — public/dashboard-preview mode
    }
    // Cache hit?
    const ck = cacheKey(brand, limit, userId);
    const cached = _cache.get(ck);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return {
        data: cached.data,
        total: cached.data.length,
        brand: brand || undefined,
        limit,
        cached: true,
      };
    }
    // Build the SELECT. Always order newest first.
    // The `content_items` table is shared across all users/brands; the
    // dashboard only filters when `brand` is supplied.
    let rows: any[] = [];
    try {
      const sql = brand
        ? `SELECT id, brand, prompt, script, captions, hashtags, status, content_type, media_type, created_at FROM content_items WHERE brand='${brand.replace(/'/g, "''")}' ORDER BY created_at DESC LIMIT ${limit}`
        : `SELECT id, brand, prompt, script, captions, hashtags, status, content_type, media_type, created_at FROM content_items ORDER BY created_at DESC LIMIT ${limit}`;
      rows = teamDbQuery<any[]>(sql);
    } catch (e) {
      rows = [];
    }
    const data = rows.map(rowToContent);
    _cache.set(ck, { data, ts: Date.now() });
    // Trim cache to avoid unbounded growth.
    if (_cache.size > 50) {
      const firstKey = _cache.keys().next().value;
      if (firstKey) _cache.delete(firstKey);
    }
    return {
      data,
      total: data.length,
      brand: brand || undefined,
      limit,
      cached: false,
    };
  }
);
