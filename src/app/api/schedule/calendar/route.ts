// /api/schedule/calendar — GET ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//
// Returns scheduled posts for a date range in the format the dashboard
// Calendar page expects: { data: { "YYYY-MM-DD": ScheduleEntry[] }, total, start, end }.
//
// Sources:
//   1. scheduled_posts (from /api/auto-schedule, brand-schedule worker) — the
//      primary table the dashboard calendar reads from.
//   2. user_scheduled_posts (from /api/publish/schedule) — the publishing
//      pipeline's "future-dated" posts.
//
// Both tables are queried and merged by `scheduled_for` date. If neither
// returns any rows, the route still responds 200 with `data: {}` so the
// dashboard can render an empty state without 404-ing.
import { NextRequest } from "next/server";
import { withApi } from "@/lib/api-utils";
import { requireAuthedUserIdAsync } from "@/lib/services/social-connections";

// ---- team-db helpers (same pattern as /api/brands, /api/brand-kit) ----
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
function esc(v: any): string {
  return String(v ?? "").replace(/'/g, "''");
}
function ensureSchema() {
  // The publishing pipeline owns user_scheduled_posts. The autonomous
  // scheduler owns brand_schedules + scheduled_posts. Both should exist
  // if the other routes have been hit at least once, but we re-create
  // here defensively so the calendar never 500s on a fresh install.
  try {
    const { execSync } = require("child_process");
    execSync(
      `team-db "CREATE TABLE IF NOT EXISTS scheduled_posts (id TEXT PRIMARY KEY, brand_id TEXT NOT NULL, content_type TEXT, platform TEXT, scheduled_for TEXT NOT NULL, status TEXT DEFAULT 'queued', script TEXT, caption TEXT, hashtags TEXT, output_id TEXT, video_spec TEXT, post_id TEXT, error TEXT, generated_at TEXT, published_at TEXT, created_at TEXT DEFAULT (datetime('now')))"`,
      { encoding: "utf8", stdio: "ignore" }
    );
    execSync(
      `team-db "CREATE TABLE IF NOT EXISTS user_scheduled_posts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, platform TEXT NOT NULL, content TEXT, hashtags TEXT, media_urls TEXT, scheduled_at TEXT NOT NULL, status TEXT DEFAULT 'queued', result_id TEXT, error TEXT, created_at TEXT DEFAULT (datetime('now')))"`,
      { encoding: "utf8", stdio: "ignore" }
    );
  } catch (e) {
    // non-fatal — queries will just return [] if tables are missing
  }
}
// ---- in-memory cache (30s TTL, keyed by date-range) ----
type CacheEntry = { data: Record<string, any[]>; ts: number };
const CACHE_TTL_MS = 30_000;
const _cache = new Map<string, CacheEntry>();
function cacheKey(start: string, end: string, userId: string) {
  return `${userId}:${start}:${end}`;
}
function dateOnly(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
function toEntry(row: any, source: "scheduler" | "user"): any {
  const when = source === "scheduler" ? row.scheduled_for : row.scheduled_at;
  const date = dateOnly(when);
  return {
    id: row.id,
    date,
    time: (typeof when === "string" ? when : "")?.slice(11, 16) || "00:00",
    platform: row.platform || "tiktok",
    contentType: row.content_type || row.contentType || "post",
    status: row.status || "queued",
    caption: row.caption || row.content || "",
    hashtags: row.hashtags || "",
    postId: row.post_id || row.postId || undefined,
    error: row.error || undefined,
    source,
  };
}
export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s edge cache; in-memory cache below is tighter
    rateLimit: { windowMs: 60_000, max: 120 },
    validate: (b) => {
      // body is unused for GET; we validate query params inside the handler
      return true;
    },
  },
  async (req: NextRequest) => {
    // Auth: prefer authenticated user; fall back to 'user' (matches the rest
    // of the dashboard, which is single-user in dev).
    let userId = "user";
    try {
      const auth = await requireAuthedUserIdAsync(req);
      if (!("response" in auth)) userId = auth.userId;
    } catch {
      // non-fatal — calendar still works for unauthenticated read-only previews
    }
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate") || "";
    const endDate = url.searchParams.get("endDate") || "";
    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return { error: "INVALID_START_DATE", message: "startDate must be YYYY-MM-DD", data: {}, total: 0, start: startDate, end: endDate };
    }
    if (!endDate || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return { error: "INVALID_END_DATE", message: "endDate must be YYYY-MM-DD", data: {}, total: 0, start: startDate, end: endDate };
    }
    // Cache hit?
    const key = cacheKey(startDate, endDate, userId);
    const now = Date.now();
    const cached = _cache.get(key);
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return { data: cached.data, total: Object.values(cached.data).reduce((s, v) => s + v.length, 0), start: startDate, end: endDate, cached: true };
    }
    ensureSchema();
    // Read both tables. The scheduled_posts table uses scheduled_for; the
    // user_scheduled_posts table uses scheduled_at. Both are ISO date-times.
    const schedRows = teamDbQuery<any>(
      `SELECT id, brand_id, content_type, platform, scheduled_for, status, script, caption, hashtags, post_id, error FROM scheduled_posts WHERE scheduled_for >= '${esc(startDate)}' AND scheduled_for <= '${esc(endDate + "T23:59:59")}' ORDER BY scheduled_for ASC`
    );
    const userRows = teamDbQuery<any>(
      `SELECT id, user_id, platform, content, hashtags, media_urls, scheduled_at, status, result_id, error FROM user_scheduled_posts WHERE user_id='${esc(userId)}' AND scheduled_at >= '${esc(startDate)}' AND scheduled_at <= '${esc(endDate + "T23:59:59")}' ORDER BY scheduled_at ASC`
    );
    // Bucket by YYYY-MM-DD so the dashboard can index data[date] in O(1).
    const data: Record<string, any[]> = {};
    for (const row of schedRows) {
      const entry = toEntry(row, "scheduler");
      if (!entry.date) continue;
      (data[entry.date] ||= []).push(entry);
    }
    for (const row of userRows) {
      const entry = toEntry(row, "user");
      if (!entry.date) continue;
      (data[entry.date] ||= []).push(entry);
    }
    // Cache and return
    _cache.set(key, { data, ts: now });
    const total = Object.values(data).reduce((s, v) => s + v.length, 0);
    return { data, total, start: startDate, end: endDate, cached: false };
  }
);
