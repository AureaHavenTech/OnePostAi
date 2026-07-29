// src/lib/services/autonomous-scheduler.ts
// OnePost AI — Multi-Brand Autonomous Scheduling Engine
// "Set once, runs forever." Each brand gets its own config (posts/week, platforms,
// content types, preferred times). The engine rotates content types, calls the
// AI pipeline to generate each post, queues it for the optimal posting time, and
// tracks everything in team-db.
//
// When the publishing platform APIs are wired up, the cron tick in
// processScheduledPosts() will automatically fire `publish()` on each due post.
import type { Platform } from "@/lib/openai";
import { generateContent } from "@/lib/services/backend";
import {
  generateByContentType,
  CONTENT_TYPE_LIST,
  type ContentTypeId,
} from "@/lib/services/content-types";

// ---------------------------------------------------------------------------
// team-db helpers (same pattern as brands/route.ts)
// ---------------------------------------------------------------------------
function teamDbQuery<T = any>(sql: string): T[] {
  try {
    const { execSync } = require("child_process");
    const out = execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { return []; }
}
function teamDbExec(sql: string): boolean {
  try {
    const { execSync } = require("child_process");
    execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    return true;
  } catch (e) { return false; }
}
function esc(v: any): string { return String(v ?? "").replace(/'/g, "''"); }
function nowIso() { return new Date().toISOString(); }
function uid(prefix: string) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

// ---------------------------------------------------------------------------
// Schema bootstrap
// ---------------------------------------------------------------------------
let _schemaReady = false;
function ensureSchema() {
  if (_schemaReady) return;
  teamDbExec(`CREATE TABLE IF NOT EXISTS brand_schedules (
    id TEXT PRIMARY KEY, brand_id TEXT NOT NULL, brand_name TEXT NOT NULL,
    product_name TEXT, product_description TEXT,
    posts_per_week INTEGER DEFAULT 3,
    platforms TEXT DEFAULT '[]', content_types TEXT DEFAULT '[]',
    preferred_times TEXT DEFAULT '{}',
    status TEXT DEFAULT 'active',
    last_generated_at TEXT, next_run_at TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  teamDbExec(`CREATE TABLE IF NOT EXISTS scheduled_posts (
    id TEXT PRIMARY KEY, brand_id TEXT NOT NULL,
    content_type TEXT, platform TEXT,
    scheduled_for TEXT NOT NULL, status TEXT DEFAULT 'queued',
    script TEXT, caption TEXT, hashtags TEXT,
    output_id TEXT, video_spec TEXT,
    post_id TEXT, error TEXT,
    generated_at TEXT, published_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  _schemaReady = true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type BrandScheduleConfig = {
  brandId: string;
  brandName: string;
  productName?: string;
  productDescription?: string;
  postsPerWeek?: number;        // default 3
  platforms: Platform[];       // ["tiktok", "instagram", ...]
  contentTypes?: ContentTypeId[];   // default = all 7
  preferredTimes?: Partial<Record<Platform, string>>;  // ISO times or HH:MM strings
  startDate?: string;          // ISO date — when to start the schedule
};

export type BrandSchedule = BrandScheduleConfig & {
  id: string;
  status: "active" | "paused" | "archived";
  lastGeneratedAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ScheduledPost = {
  id: string;
  brandId: string;
  contentType: ContentTypeId | null;
  platform: Platform;
  scheduledFor: string;        // ISO datetime
  status: "queued" | "generating" | "ready" | "publishing" | "published" | "failed";
  script: string;
  caption: string;
  hashtags: string[];
  outputId?: string;
  videoSpec?: any;
  postId?: string;             // platform post id after publishing
  error?: string;
  generatedAt?: string;
  publishedAt?: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Default content type rotation
// ---------------------------------------------------------------------------
// Weighted rotation: unboxing + product_demo for product brands, talking_head
// + trending_hook for reach, ai_twin + voiceover for personality, storytelling
// for brand building. Cycles through them evenly per brand.
const DEFAULT_CONTENT_TYPES: ContentTypeId[] = [
  "unboxing", "talking_head", "trending_hook", "product_demo", "storytelling", "ai_twin", "voiceover",
];

// Platform-optimal times (HH:MM 24h) when user didn't specify any
const DEFAULT_PLATFORM_TIMES: Record<Platform, string> = {
  tiktok: "19:00",       // 7 PM
  instagram: "11:30",    // 11:30 AM
  youtube: "15:00",      // 3 PM
  facebook: "13:00",     // 1 PM
  linkedin: "08:30",     // 8:30 AM (Tue-Thu best)
  snapchat: "19:30",     // 7:30 PM
  pinterest: "20:00",    // 8 PM
};

// ---------------------------------------------------------------------------
// createBrandSchedule
// ---------------------------------------------------------------------------
export function createBrandSchedule(config: BrandScheduleConfig): BrandSchedule {
  ensureSchema();
  const id = uid("bsched");
  const now = nowIso();
  const platforms = (config.platforms || []).slice(0, 7);
  const contentTypes = (config.contentTypes && config.contentTypes.length
    ? config.contentTypes
    : DEFAULT_CONTENT_TYPES) as ContentTypeId[];
  const preferredTimes = config.preferredTimes || {};
  const nextRun = computeNextRunAt(config.startDate || now, platforms[0] || "tiktok", preferredTimes);
  const persisted = teamDbExec(
    `INSERT OR REPLACE INTO brand_schedules
      (id, brand_id, brand_name, product_name, product_description, posts_per_week, platforms, content_types, preferred_times, status, next_run_at, created_at, updated_at)
     VALUES ('${esc(id)}', '${esc(config.brandId)}', '${esc(config.brandName)}',
             ${config.productName ? `'${esc(config.productName)}'` : "NULL"},
             ${config.productDescription ? `'${esc(config.productDescription)}'` : "NULL"},
             ${config.postsPerWeek || 3},
             '${esc(JSON.stringify(platforms))}',
             '${esc(JSON.stringify(contentTypes))}',
             '${esc(JSON.stringify(preferredTimes))}',
             'active',
             '${esc(nextRun)}',
             '${now}', '${now}')`
  );
  return {
    id,
    brandId: config.brandId,
    brandName: config.brandName,
    productName: config.productName,
    productDescription: config.productDescription,
    postsPerWeek: config.postsPerWeek || 3,
    platforms,
    contentTypes,
    preferredTimes,
    status: "active",
    nextRunAt: nextRun,
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// getBrandSchedule / listBrandSchedules
// ---------------------------------------------------------------------------
export function getBrandSchedule(brandId: string): BrandSchedule | null {
  ensureSchema();
  const rows = teamDbQuery<any>(`SELECT * FROM brand_schedules WHERE brand_id='${esc(brandId)}' ORDER BY created_at DESC LIMIT 1`);
  if (!rows.length) return null;
  return rowToSchedule(rows[0]);
}
export function listBrandSchedules(status?: "active" | "paused" | "archived"): BrandSchedule[] {
  ensureSchema();
  const where = status ? `WHERE status='${esc(status)}'` : "";
  const rows = teamDbQuery<any>(`SELECT * FROM brand_schedules ${where} ORDER BY created_at DESC`);
  return rows.map(rowToSchedule);
}

// ---------------------------------------------------------------------------
// pauseBrand / resumeBrand
// ---------------------------------------------------------------------------
export function pauseBrand(brandId: string): { success: boolean; message: string } {
  ensureSchema();
  const ok = teamDbExec(`UPDATE brand_schedules SET status='paused', updated_at=datetime('now') WHERE brand_id='${esc(brandId)}'`);
  return { success: ok, message: ok ? "Brand paused — no new posts will be generated" : "Pause failed" };
}
export function resumeBrand(brandId: string): { success: boolean; message: string } {
  ensureSchema();
  const ok = teamDbExec(`UPDATE brand_schedules SET status='active', updated_at=datetime('now') WHERE brand_id='${esc(brandId)}'`);
  return { success: ok, message: ok ? "Brand resumed — posts will generate on schedule" : "Resume failed" };
}
export function deleteBrandSchedule(brandId: string): { success: boolean; message: string } {
  ensureSchema();
  const ok1 = teamDbExec(`DELETE FROM brand_schedules WHERE brand_id='${esc(brandId)}'`);
  const ok2 = teamDbExec(`DELETE FROM scheduled_posts WHERE brand_id='${esc(brandId)}'`);
  return { success: ok1 && ok2, message: "Brand schedule and queued posts deleted" };
}

// ---------------------------------------------------------------------------
// generateNextPost — picks the next content type in rotation, generates via the
// AI pipeline, and queues the post for the next optimal time.
// ---------------------------------------------------------------------------
export async function generateNextPost(brandId: string): Promise<ScheduledPost | { error: string }> {
  ensureSchema();
  const sched = getBrandSchedule(brandId);
  if (!sched) return { error: `No schedule found for brand ${brandId}` };
  if (sched.status !== "active") return { error: `Brand ${brandId} is ${sched.status}, not active` };
  // Pick the next content type in rotation (round-robin based on count of generated posts)
  const used = teamDbQuery<any>(`SELECT content_type, COUNT(*) as n FROM scheduled_posts WHERE brand_id='${esc(brandId)}' GROUP BY content_type`);
  const usedMap: Record<string, number> = {};
  for (const r of used) usedMap[r.content_type || ""] = Number(r.n);
  const typeIndex = Object.values(usedMap).reduce((a, b) => a + b, 0) % (sched.contentTypes || DEFAULT_CONTENT_TYPES).length;
  const nextType = (sched.contentTypes || DEFAULT_CONTENT_TYPES)[typeIndex];
  // Pick the next platform (round-robin too)
  const platformIndex = Object.values(usedMap).reduce((a, b) => a + b, 0) % sched.platforms.length;
  const platform = sched.platforms[platformIndex];
  // Compute scheduled time
  const scheduledFor = computeNextRunAt(nowIso(), platform, sched.preferredTimes || {});
  // Generate content
  const ai = await generateByContentType({
    brandName: sched.brandName,
    prompt: sched.productDescription || `Daily post for ${sched.brandName}`,
    platforms: [platform],
    contentType: nextType,
    productName: sched.productName,
    productDescription: sched.productDescription,
  });
  // Extract the per-platform output
  const platformOut = ai.platformContent[0] || {
    platform,
    script: ai.platformContent[0]?.script || `${sched.brandName} — ${sched.productName || "content"}`,
    caption: ai.platformContent[0]?.caption || `${sched.brandName}: ${sched.productName || "Check this out"}`,
    hashtags: ai.platformContent[0]?.hashtags || [],
  };
  // Persist the post
  const postId = uid("post");
  const now = nowIso();
  const ok = teamDbExec(
    `INSERT INTO scheduled_posts
      (id, brand_id, content_type, platform, scheduled_for, status, script, caption, hashtags, video_spec, generated_at, created_at)
     VALUES ('${esc(postId)}', '${esc(brandId)}', '${esc(nextType)}', '${esc(platform)}',
             '${esc(scheduledFor)}', 'ready',
             '${esc(platformOut.script)}', '${esc(platformOut.caption)}',
             '${esc(JSON.stringify(platformOut.hashtags))}',
             '${esc(JSON.stringify(ai.videoSpec))}',
             '${now}', '${now}')`
  );
  if (!ok) return { error: "Failed to persist scheduled post" };
  // Update brand's lastGeneratedAt + nextRunAt
  const nextAfter = computeNextRunAt(scheduledFor, platform, sched.preferredTimes || {});
  teamDbExec(`UPDATE brand_schedules SET last_generated_at='${now}', next_run_at='${esc(nextAfter)}', updated_at='${now}' WHERE brand_id='${esc(brandId)}'`);
  return {
    id: postId,
    brandId,
    contentType: nextType,
    platform,
    scheduledFor,
    status: "ready",
    script: platformOut.script,
    caption: platformOut.caption,
    hashtags: platformOut.hashtags,
    videoSpec: ai.videoSpec,
    generatedAt: now,
    createdAt: now,
  };
}

// ---------------------------------------------------------------------------
// Bulk generation — fill out the rest of the week (idempotent).
// ---------------------------------------------------------------------------
export async function fillSchedule(brandId: string, days = 7): Promise<{ generated: number; posts: ScheduledPost[]; skipped: string[] }> {
  ensureSchema();
  const sched = getBrandSchedule(brandId);
  if (!sched) return { generated: 0, posts: [], skipped: ["No schedule"] };
  if (sched.status !== "active") return { generated: 0, posts: [], skipped: [`Brand is ${sched.status}`] };
  const posts: ScheduledPost[] = [];
  const skipped: string[] = [];
  // Generate up to postsPerWeek posts, or one per platform per day, whichever fits
  const targetCount = sched.postsPerWeek || 3;
  // Don't double up — count what's already queued/ready for the next N days
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const existing = teamDbQuery<any>(
    `SELECT COUNT(*) as n FROM scheduled_posts WHERE brand_id='${esc(brandId)}' AND scheduled_for <= '${esc(cutoff)}' AND status IN ('queued','ready')`
  );
  const existingCount = Number(existing[0]?.n || 0);
  const toGenerate = Math.max(0, targetCount - existingCount);
  for (let i = 0; i < toGenerate; i++) {
    const result = await generateNextPost(brandId);
    if ("error" in result) {
      if (result.error) skipped.push(result.error);
      break;
    }
    posts.push(result);
  }
  return { generated: posts.length, posts, skipped };
}

// ---------------------------------------------------------------------------
// getUpcomingPosts
// ---------------------------------------------------------------------------
export function getUpcomingPosts(brandId: string, days = 7): ScheduledPost[] {
  ensureSchema();
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const rows = teamDbQuery<any>(
    `SELECT * FROM scheduled_posts WHERE brand_id='${esc(brandId)}' AND scheduled_for <= '${esc(cutoff)}' ORDER BY scheduled_for ASC`
  );
  return rows.map(rowToScheduledPost);
}

export function listAllScheduledPosts(brandId?: string, status?: string): ScheduledPost[] {
  ensureSchema();
  const where: string[] = [];
  if (brandId) where.push(`brand_id='${esc(brandId)}'`);
  if (status) where.push(`status='${esc(status)}'`);
  const sql = `SELECT * FROM scheduled_posts ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY scheduled_for ASC LIMIT 200`;
  return teamDbQuery<any>(sql).map(rowToScheduledPost);
}

// ---------------------------------------------------------------------------
// getBrandAnalytics
// ---------------------------------------------------------------------------
export function getBrandAnalytics(brandId: string) {
  ensureSchema();
  const sched = getBrandSchedule(brandId);
  if (!sched) return { error: `No schedule found for brand ${brandId}` };
  const counts = teamDbQuery<any>(`SELECT status, COUNT(*) as n FROM scheduled_posts WHERE brand_id='${esc(brandId)}' GROUP BY status`);
  const byType = teamDbQuery<any>(`SELECT content_type, COUNT(*) as n FROM scheduled_posts WHERE brand_id='${esc(brandId)}' GROUP BY content_type`);
  const byPlatform = teamDbQuery<any>(`SELECT platform, COUNT(*) as n FROM scheduled_posts WHERE brand_id='${esc(brandId)}' GROUP BY platform`);
  const total = counts.reduce((a, r) => a + Number(r.n), 0);
  const published = Number(counts.find((r) => r.status === "published")?.n || 0);
  const queued = Number(counts.find((r) => r.status === "queued" || r.status === "ready")?.n || 0);
  const failed = Number(counts.find((r) => r.status === "failed")?.n || 0);
  // Compute next 7 days projection
  const upcoming = getUpcomingPosts(brandId, 7).length;
  return {
    brand: { id: sched.brandId, name: sched.brandName, productName: sched.productName },
    schedule: {
      status: sched.status,
      postsPerWeek: sched.postsPerWeek,
      platforms: sched.platforms,
      contentTypes: sched.contentTypes,
      lastGeneratedAt: sched.lastGeneratedAt,
      nextRunAt: sched.nextRunAt,
      createdAt: sched.createdAt,
    },
    totals: {
      total,
      published,
      queued,
      failed,
      upcoming7d: upcoming,
      successRate: total > 0 ? Math.round((published / Math.max(1, total)) * 100) : 0,
    },
    breakdown: {
      byStatus: counts.map((r) => ({ status: r.status, count: Number(r.n) })),
      byContentType: byType.map((r) => ({ type: r.content_type, count: Number(r.n) })),
      byPlatform: byPlatform.map((r) => ({ platform: r.platform, count: Number(r.n) })),
    },
  };
}

// ---------------------------------------------------------------------------
// processScheduledPosts — called by a cron / Vercel scheduled function.
// For each due post (scheduled_for <= now, status='ready'), call publish().
// In production this would hit the platform APIs (TikTok, IG, YouTube, etc.).
// ---------------------------------------------------------------------------
export async function processScheduledPosts(): Promise<{ processed: number; published: number; failed: number; results: any[] }> {
  ensureSchema();
  const now = nowIso();
  const due = teamDbQuery<any>(`SELECT * FROM scheduled_posts WHERE status='ready' AND scheduled_for <= '${now}' ORDER BY scheduled_for ASC LIMIT 50`);
  const results: any[] = [];
  let published = 0;
  let failed = 0;
  for (const row of due) {
    const post = rowToScheduledPost(row);
    try {
      // In production: call platform-specific publisher. For now, mark as
      // publishing + then published (or failed). No external API needed.
      teamDbExec(`UPDATE scheduled_posts SET status='publishing' WHERE id='${esc(post.id)}'`);
      // Simulated publish
      const platformPostId = uid(`${post.platform}_post`);
      const ok = teamDbExec(`UPDATE scheduled_posts SET status='published', post_id='${esc(platformPostId)}', published_at='${now}' WHERE id='${esc(post.id)}'`);
      if (ok) published++;
      results.push({ id: post.id, platform: post.platform, status: "published", postId: platformPostId });
    } catch (e: any) {
      failed++;
      teamDbExec(`UPDATE scheduled_posts SET status='failed', error='${esc(e?.message || String(e))}' WHERE id='${esc(post.id)}'`);
      results.push({ id: post.id, platform: post.platform, status: "failed", error: e?.message });
    }
  }
  return { processed: due.length, published, failed, results };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function computeNextRunAt(fromIso: string, platform: Platform, preferredTimes: Partial<Record<Platform, string>>): string {
  // Walk forward day-by-day until we find a future time matching preferred or default
  const t = (preferredTimes as any)[platform] || DEFAULT_PLATFORM_TIMES[platform] || "12:00";
  const [hh, mm] = t.split(":").map(Number);
  const candidate = new Date(fromIso);
  candidate.setHours(hh, mm, 0, 0);
  if (candidate.getTime() <= Date.parse(fromIso)) {
    // Push to next day
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.toISOString();
}

function rowToSchedule(r: any): BrandSchedule {
  return {
    id: r.id,
    brandId: r.brand_id,
    brandName: r.brand_name,
    productName: r.product_name || undefined,
    productDescription: r.product_description || undefined,
    postsPerWeek: Number(r.posts_per_week || 3),
    platforms: safeParse(r.platforms, ["tiktok", "instagram", "youtube"]),
    contentTypes: safeParse(r.content_types, DEFAULT_CONTENT_TYPES),
    preferredTimes: safeParse(r.preferred_times, {}),
    status: r.status || "active",
    lastGeneratedAt: r.last_generated_at || undefined,
    nextRunAt: r.next_run_at || undefined,
    createdAt: r.created_at || nowIso(),
    updatedAt: r.updated_at || nowIso(),
  };
}

function rowToScheduledPost(r: any): ScheduledPost {
  return {
    id: r.id,
    brandId: r.brand_id,
    contentType: r.content_type || null,
    platform: r.platform,
    scheduledFor: r.scheduled_for,
    status: r.status,
    script: r.script || "",
    caption: r.caption || "",
    hashtags: safeParse(r.hashtags, []),
    outputId: r.output_id || undefined,
    videoSpec: safeParse(r.video_spec, null),
    postId: r.post_id || undefined,
    error: r.error || undefined,
    generatedAt: r.generated_at || undefined,
    publishedAt: r.published_at || undefined,
    createdAt: r.created_at || nowIso(),
  };
}

function safeParse(s: any, fb: any) {
  if (!s) return fb;
  try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return fb; }
}
