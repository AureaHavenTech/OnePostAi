// src/lib/services/trends.ts
// OnePost AI — Trending Content Scraper + Viral Analysis Engine
// Architecture ready for social platform API keys (TikTok, Instagram, YouTube Shorts).
// Until those keys arrive, fetchTrendingFormats() returns a curated template set
// stamped with `source: "template"` so the rest of the system (autonomous
// scheduler, content generation) can use the engine end-to-end.
//
// When keys are set, swap the template path for real platform calls in
// fetchTrendingFormats() — the rest of the API stays the same.
import type { Platform } from "@/lib/openai";

// ---------------------------------------------------------------------------
// team-db helpers
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
function safeParse(s: any, fb: any) {
  if (!s) return fb;
  try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return fb; }
}
function uid(prefix: string) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function nowIso() { return new Date().toISOString(); }

// ---------------------------------------------------------------------------
// Schema bootstrap
// ---------------------------------------------------------------------------
let _schemaReady = false;
function ensureSchema() {
  if (_schemaReady) return;
  teamDbExec(`CREATE TABLE IF NOT EXISTS trending_formats (
    id TEXT PRIMARY KEY, platform TEXT NOT NULL, format_type TEXT NOT NULL,
    title TEXT NOT NULL, description TEXT, hook_pattern TEXT,
    typical_duration_sec INTEGER, hashtag_cluster TEXT,
    growth_score INTEGER DEFAULT 0, view_count INTEGER DEFAULT 0,
    niche TEXT, source TEXT DEFAULT 'api',
    scraped_at TEXT DEFAULT (datetime('now')), expires_at TEXT
  )`);
  teamDbExec(`CREATE TABLE IF NOT EXISTS trending_hooks (
    id TEXT PRIMARY KEY, hook TEXT NOT NULL, category TEXT, platform TEXT,
    format_type TEXT, growth_score INTEGER DEFAULT 0, usage_count INTEGER DEFAULT 0,
    scraped_at TEXT DEFAULT (datetime('now'))
  )`);
  teamDbExec(`CREATE TABLE IF NOT EXISTS trending_hashtags (
    id TEXT PRIMARY KEY, hashtag TEXT NOT NULL, platform TEXT, niche TEXT,
    growth_24h REAL DEFAULT 0, growth_7d REAL DEFAULT 0,
    post_count INTEGER DEFAULT 0, competition TEXT,
    scraped_at TEXT DEFAULT (datetime('now'))
  )`);
  teamDbExec(`CREATE TABLE IF NOT EXISTS trend_reports (
    id TEXT PRIMARY KEY, niche TEXT NOT NULL, summary TEXT,
    top_formats TEXT, top_hooks TEXT, recommendations TEXT,
    generated_at TEXT DEFAULT (datetime('now'))
  )`);
  _schemaReady = true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TrendingFormat = {
  id: string;
  platform: Platform;
  formatType: string;          // "unboxing" | "talking_head" | "trending_hook" | "trending_audio" | "tutorial" | "storytime" | "pov" | "duet" | "challenge"
  title: string;
  description: string;
  hookPattern?: string;
  typicalDurationSec?: number;
  hashtagCluster: string[];
  growthScore: number;         // 0-100, higher = more viral right now
  viewCount?: number;
  niche?: string;
  source: "api" | "template" | "manual";
  scrapedAt: string;
  expiresAt?: string;
};

export type TrendingHook = {
  id: string;
  hook: string;
  category: string;            // "pattern_interrupt" | "curiosity_gap" | "social_proof" | "tutorial" | "controversy" | "pov"
  platform?: Platform;
  formatType?: string;
  growthScore: number;
  usageCount: number;
  scrapedAt: string;
};

export type TrendingHashtag = {
  id: string;
  hashtag: string;             // without the #
  platform?: Platform;
  niche?: string;
  growth24h: number;           // % change in last 24h
  growth7d: number;            // % change in last 7d
  postCount?: number;
  competition: "low" | "medium" | "high";
  scrapedAt: string;
};

export type ViralPattern = {
  type: "hook_structure" | "length" | "hashtag_cluster" | "audio" | "cta";
  pattern: string;
  frequency: number;           // how many trends match this
  examples: string[];
  platforms: Platform[];
  growthScore: number;
};

export type TrendReport = {
  id: string;
  niche: string;
  summary: string;
  topFormats: TrendingFormat[];
  topHooks: TrendingHook[];
  topHashtags: TrendingHashtag[];
  recommendations: string[];
  patterns: ViralPattern[];
  generatedAt: string;
  source: "live" | "template";
};

// ---------------------------------------------------------------------------
// Template dataset — used when social platform API keys are missing.
// Curated to be realistic and USEFUL in dev. Stamped with source='template'.
// ---------------------------------------------------------------------------
const TEMPLATE_FORMATS: Omit<TrendingFormat, "id" | "scrapedAt">[] = [
  {
    platform: "tiktok", formatType: "trending_audio",
    title: "POV: relatable micro-moment",
    description: "A 6-10 second skit using a trending audio. One character. One reaction. Cuts on the beat.",
    hookPattern: "POV: you just {action} and {twist}",
    typicalDurationSec: 8, growthScore: 96, viewCount: 45_000_000, niche: "lifestyle",
    hashtagCluster: ["pov", "fyp", "relatable", "viral", "trending"], source: "template",
  },
  {
    platform: "tiktok", formatType: "tutorial",
    title: "Save-this hack (60-second tutorial)",
    description: "3 quick steps solving a hyper-specific problem. The kind people screenshot.",
    hookPattern: "Stop doing {common_thing}. Do this instead.",
    typicalDurationSec: 22, growthScore: 91, viewCount: 28_000_000, niche: "lifestyle",
    hashtagCluster: ["hack", "tutorial", "lifehack", "learnontiktok", "diy"], source: "template",
  },
  {
    platform: "tiktok", formatType: "unboxing",
    title: "First-impression reaction",
    description: "Hold the package. Open in real time. Genuine reaction. ASMR-style cuts.",
    hookPattern: "I finally got {product} — let me show you",
    typicalDurationSec: 35, growthScore: 88, viewCount: 19_000_000, niche: "product",
    hashtagCluster: ["unboxing", "tiktokmademebuyit", "asmr", "review"], source: "template",
  },
  {
    platform: "tiktok", formatType: "talking_head",
    title: "Three-things listicle",
    description: "Direct to camera. Bold opener. 3 numbered points. Save CTA.",
    hookPattern: "3 things I wish I knew before {topic}",
    typicalDurationSec: 28, growthScore: 87, viewCount: 14_000_000, niche: "education",
    hashtagCluster: ["tips", "advice", "learnontiktok", "creatortips"], source: "template",
  },
  {
    platform: "tiktok", formatType: "storytime",
    title: "Storytime with a twist",
    description: "In medias res opening. Story arc. Unexpected reveal at the end.",
    hookPattern: "A year ago I almost {action}...",
    typicalDurationSec: 52, growthScore: 82, viewCount: 11_000_000, niche: "lifestyle",
    hashtagCluster: ["storytime", "fyp", "relateable", "viralstory"], source: "template",
  },
  {
    platform: "instagram", formatType: "tutorial",
    title: "Carousel: 5-slide value bomb",
    description: "First slide is the hook. Each slide is one point. Final slide is the CTA.",
    hookPattern: "5 {things} that {transform} your {area}",
    typicalDurationSec: 0, growthScore: 93, viewCount: 8_000_000, niche: "education",
    hashtagCluster: ["carousel", "reels", "instagrowth", "instagramtips"], source: "template",
  },
  {
    platform: "instagram", formatType: "talking_head",
    title: "Reels: pattern interrupt + save CTA",
    description: "Open with a visual surprise. Talk fast. Tell them to save.",
    hookPattern: "Wait — {unexpected_reveal}",
    typicalDurationSec: 15, growthScore: 89, viewCount: 22_000_000, niche: "lifestyle",
    hashtagCluster: ["reels", "explorepage", "viral", "trending"], source: "template",
  },
  {
    platform: "youtube", formatType: "tutorial",
    title: "Shorts: speedrun tutorial",
    description: "60 seconds. One skill. 3-4 quick steps. End card to long-form video.",
    hookPattern: "How to {skill} in 60 seconds",
    typicalDurationSec: 58, growthScore: 85, viewCount: 12_000_000, niche: "education",
    hashtagCluster: ["shorts", "tutorial", "howto", "learn"], source: "template",
  },
  {
    platform: "youtube", formatType: "trending_audio",
    title: "Shorts: trending remix",
    description: "Use a trending audio. Add commentary. End with a question to drive comments.",
    hookPattern: "POV: {relatable_scenario}",
    typicalDurationSec: 25, growthScore: 80, viewCount: 6_500_000, niche: "lifestyle",
    hashtagCluster: ["shorts", "trending", "viral"], source: "template",
  },
  {
    platform: "linkedin", formatType: "tutorial",
    title: "Carousel: lessons learned",
    description: "5-7 slide professional insight carousel. Strong opening hook. CTA = follow for more.",
    hookPattern: "I learned {N} things the hard way about {topic}",
    typicalDurationSec: 0, growthScore: 78, viewCount: 3_200_000, niche: "business",
    hashtagCluster: ["linkedin", "careergrowth", "leadership", "productivity"], source: "template",
  },
];

const TEMPLATE_HOOKS: Omit<TrendingHook, "id" | "scrapedAt">[] = [
  { hook: "Stop scrolling — this changes everything", category: "pattern_interrupt", platform: "tiktok", formatType: "talking_head", growthScore: 96, usageCount: 124_000 },
  { hook: "3 things nobody tells you about {topic}", category: "curiosity_gap", platform: "tiktok", formatType: "talking_head", growthScore: 93, usageCount: 87_000 },
  { hook: "POV: you just {action} and {twist}", category: "pov", platform: "tiktok", formatType: "trending_audio", growthScore: 95, usageCount: 210_000 },
  { hook: "I tried {thing} for 30 days — here's what happened", category: "social_proof", platform: "instagram", formatType: "storytime", growthScore: 88, usageCount: 42_000 },
  { hook: "Wait — {unexpected_reveal}", category: "pattern_interrupt", platform: "instagram", formatType: "talking_head", growthScore: 91, usageCount: 68_000 },
  { hook: "If you're still doing {common_thing}, stop.", category: "controversy", platform: "tiktok", formatType: "talking_head", growthScore: 89, usageCount: 35_000 },
  { hook: "How to {skill} in 60 seconds", category: "tutorial", platform: "youtube", formatType: "tutorial", growthScore: 84, usageCount: 51_000 },
  { hook: "5 {things} that {transform} your {area}", category: "listicle", platform: "instagram", formatType: "tutorial", growthScore: 86, usageCount: 73_000 },
  { hook: "I was today years old when I learned this", category: "curiosity_gap", platform: "tiktok", formatType: "trending_audio", growthScore: 84, usageCount: 39_000 },
  { hook: "Tell me you {do_thing} without telling me", category: "pov", platform: "tiktok", formatType: "trending_audio", growthScore: 92, usageCount: 156_000 },
  { hook: "The truth about {topic} nobody talks about", category: "controversy", platform: "linkedin", formatType: "tutorial", growthScore: 79, usageCount: 18_000 },
  { hook: "Day 1 vs Day 30 of {transformation}", category: "social_proof", platform: "tiktok", formatType: "tutorial", growthScore: 87, usageCount: 64_000 },
  { hook: "I'm a {profession} and I need you to stop {bad_habit}", category: "controversy", platform: "tiktok", formatType: "talking_head", growthScore: 90, usageCount: 28_000 },
  { hook: "Watch this before you {common_action}", category: "curiosity_gap", platform: "tiktok", formatType: "tutorial", growthScore: 85, usageCount: 31_000 },
];

const TEMPLATE_HASHTAGS: Omit<TrendingHashtag, "id" | "scrapedAt">[] = [
  { hashtag: "fyp", platform: "tiktok", growth24h: 0, growth7d: 2, postCount: 1_200_000_000, competition: "high" },
  { hashtag: "viral", platform: "tiktok", growth24h: 5, growth7d: 18, postCount: 800_000_000, competition: "high" },
  { hashtag: "tiktokmademebuyit", platform: "tiktok", growth24h: 22, growth7d: 87, postCount: 12_400_000, competition: "medium" },
  { hashtag: "pov", platform: "tiktok", growth24h: 12, growth7d: 45, postCount: 95_000_000, competition: "high" },
  { hashtag: "unboxing", platform: "tiktok", growth24h: 18, growth7d: 62, postCount: 28_000_000, competition: "medium" },
  { hashtag: "reels", platform: "instagram", growth24h: 8, growth7d: 31, postCount: 320_000_000, competition: "high" },
  { hashtag: "explorepage", platform: "instagram", growth24h: 4, growth7d: 19, postCount: 180_000_000, competition: "high" },
  { hashtag: "instagrowth", platform: "instagram", growth24h: 14, growth7d: 48, postCount: 4_200_000, competition: "low" },
  { hashtag: "reeltips", platform: "instagram", growth24h: 28, growth7d: 92, postCount: 1_800_000, competition: "low" },
  { hashtag: "shorts", platform: "youtube", growth24h: 6, growth7d: 22, postCount: 410_000_000, competition: "high" },
  { hashtag: "youtubeshorts", platform: "youtube", growth24h: 9, growth7d: 34, postCount: 120_000_000, competition: "high" },
  { hashtag: "linkedin", platform: "linkedin", growth24h: 3, growth7d: 11, postCount: 95_000_000, competition: "medium" },
  { hashtag: "careergrowth", platform: "linkedin", growth24h: 11, growth7d: 38, postCount: 4_800_000, competition: "low" },
  { hashtag: "facelesscreator", platform: "tiktok", growth24h: 35, growth7d: 124, postCount: 2_100_000, competition: "low" },
  { hashtag: "aitools", platform: "instagram", growth24h: 27, growth7d: 89, postCount: 3_400_000, competition: "medium" },
  { hashtag: "ugc", platform: "tiktok", growth24h: 19, growth7d: 56, postCount: 18_000_000, competition: "medium" },
  { hashtag: "trending", platform: "tiktok", growth24h: 7, growth7d: 28, postCount: 420_000_000, competition: "high" },
];

// ---------------------------------------------------------------------------
// fetchTrendingFormats — the heart of the engine
// In production: call platform APIs. In dev: returns template data.
// ---------------------------------------------------------------------------
export async function fetchTrendingFormats(opts?: { platform?: Platform; niche?: string; limit?: number; force?: boolean }): Promise<{ formats: TrendingFormat[]; source: "api" | "template"; cached: boolean }> {
  ensureSchema();
  const platform = opts?.platform;
  const niche = opts?.niche;
  const limit = opts?.limit || 20;
  // Try to read cached rows that are still fresh (scraped in last 4h, not expired)
  if (!opts?.force) {
    const cached = teamDbQuery<any>(
      `SELECT * FROM trending_formats WHERE (expires_at IS NULL OR expires_at > datetime('now')) AND scraped_at > datetime('now', '-4 hours')`
        + (platform ? ` AND platform='${esc(platform)}'` : "")
        + (niche ? ` AND (niche='${esc(niche)}' OR niche IS NULL)` : "")
        + ` ORDER BY growth_score DESC LIMIT ${Math.max(limit, 50)}`
    );
    if (cached.length >= Math.min(limit, 10)) {
      return { formats: cached.map(rowToFormat), source: (cached[0].source as any) || "api", cached: true };
    }
  }
  // No fresh cache — check if API keys are configured
  const useRealAPI = Boolean(
    process.env.TIKTOK_API_KEY || process.env.INSTAGRAM_API_KEY || process.env.YOUTUBE_API_KEY
  );
  if (useRealAPI) {
    // TODO: When keys arrive, replace this block with real platform API calls.
    // For now, fall through to the template path so the system stays alive.
  }
  // Template path — insert + return
  const data: TrendingFormat[] = [];
  for (const t of TEMPLATE_FORMATS) {
    if (platform && t.platform !== platform) continue;
    if (niche && t.niche && t.niche !== niche) continue;
    const id = uid("trend");
    const row: TrendingFormat = { ...t, id, scrapedAt: nowIso(), expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() };
    data.push(row);
    teamDbExec(
      `INSERT OR REPLACE INTO trending_formats (id, platform, format_type, title, description, hook_pattern, typical_duration_sec, hashtag_cluster, growth_score, view_count, niche, source, scraped_at, expires_at)
       VALUES ('${esc(row.id)}', '${esc(row.platform)}', '${esc(row.formatType)}', '${esc(row.title)}', '${esc(row.description)}',
               ${row.hookPattern ? `'${esc(row.hookPattern)}'` : "NULL"},
               ${row.typicalDurationSec || "NULL"},
               '${esc(JSON.stringify(row.hashtagCluster))}',
               ${row.growthScore},
               ${row.viewCount || 0},
               ${row.niche ? `'${esc(row.niche)}'` : "NULL"},
               '${esc(row.source)}', '${esc(row.scrapedAt)}',
               ${row.expiresAt ? `'${esc(row.expiresAt)}'` : "NULL"})`
    );
  }
  return { formats: data.slice(0, limit), source: "template", cached: false };
}

// ---------------------------------------------------------------------------
// analyzeViralPatterns — find common patterns across trends
// ---------------------------------------------------------------------------
export function analyzeViralPatterns(opts?: { platform?: Platform; niche?: string }): ViralPattern[] {
  const { formats } = await_(() => fetchTrendingFormats({ platform: opts?.platform, niche: opts?.niche, limit: 50 }));
  // Bucket by hook opening words
  const hookBuckets: Record<string, { count: number; examples: string[]; platforms: Set<Platform>; growth: number[] }> = {};
  for (const f of formats) {
    if (!f.hookPattern) continue;
    // Extract the opening 1-3 words as a pattern key
    const words = f.hookPattern.split(" ").slice(0, 3).join(" ").toLowerCase();
    const key = words;
    if (!hookBuckets[key]) hookBuckets[key] = { count: 0, examples: [], platforms: new Set(), growth: [] };
    hookBuckets[key].count++;
    hookBuckets[key].examples.push(f.hookPattern);
    hookBuckets[key].platforms.add(f.platform);
    hookBuckets[key].growth.push(f.growthScore);
  }
  // Bucket by hashtag clusters
  const hashBuckets: Record<string, number> = {};
  for (const f of formats) {
    for (const tag of f.hashtagCluster || []) {
      hashBuckets[tag] = (hashBuckets[tag] || 0) + 1;
    }
  }
  // Bucket by duration
  const durBuckets: Record<string, { count: number; examples: string[]; growth: number[] }> = {
    "ultra_short_5_10s": { count: 0, examples: [], growth: [] },
    "short_15_30s": { count: 0, examples: [], growth: [] },
    "medium_30_60s": { count: 0, examples: [], growth: [] },
    "long_form_carousel": { count: 0, examples: [], growth: [] },
  };
  for (const f of formats) {
    const d = f.typicalDurationSec || 0;
    const k = d === 0 ? "long_form_carousel" : d <= 10 ? "ultra_short_5_10s" : d <= 30 ? "short_15_30s" : "medium_30_60s";
    durBuckets[k].count++;
    durBuckets[k].examples.push(f.title);
    durBuckets[k].growth.push(f.growthScore);
  }
  const patterns: ViralPattern[] = [];
  // Hook patterns
  for (const [key, b] of Object.entries(hookBuckets)) {
    if (b.count < 1) continue;
    const avgGrowth = b.growth.reduce((a, x) => a + x, 0) / b.growth.length;
    patterns.push({
      type: "hook_structure",
      pattern: `Opens with "${key}…"`,
      frequency: b.count,
      examples: b.examples.slice(0, 3),
      platforms: Array.from(b.platforms),
      growthScore: Math.round(avgGrowth),
    });
  }
  // Hashtag patterns
  const topHashes = Object.entries(hashBuckets).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [tag, count] of topHashes) {
    patterns.push({
      type: "hashtag_cluster",
      pattern: `#${tag} appears in ${count} trending formats`,
      frequency: count,
      examples: [tag],
      platforms: ["tiktok", "instagram", "youtube"],
      growthScore: 90,
    });
  }
  // Duration patterns
  for (const [k, b] of Object.entries(durBuckets)) {
    if (b.count === 0) continue;
    const avgGrowth = b.growth.reduce((a, x) => a + x, 0) / Math.max(1, b.growth.length);
    const label = k === "ultra_short_5_10s" ? "5-10s" : k === "short_15_30s" ? "15-30s" : k === "medium_30_60s" ? "30-60s" : "Carousel / long-form";
    patterns.push({
      type: "length",
      pattern: `${label} videos are trending`,
      frequency: b.count,
      examples: b.examples.slice(0, 2),
      platforms: ["tiktok", "instagram", "youtube"],
      growthScore: Math.round(avgGrowth),
    });
  }
  return patterns.sort((a, b) => b.growthScore - a.growthScore);
}

// ---------------------------------------------------------------------------
// getOptimalHashtags — niche + platform aware hashtag recommendations
// ---------------------------------------------------------------------------
export function getOptimalHashtags(opts: { niche?: string; platform?: Platform; count?: number }): TrendingHashtag[] {
  ensureSchema();
  const { niche, platform, count = 10 } = opts;
  // Try cache
  const cached = teamDbQuery<any>(
    `SELECT * FROM trending_hashtags WHERE growth_7d > 0`
      + (platform ? ` AND platform='${esc(platform)}'` : "")
      + (niche ? ` AND (niche='${esc(niche)}' OR niche IS NULL)` : "")
      + ` ORDER BY growth_7d DESC LIMIT 100`
  );
  let pool: TrendingHashtag[] = cached.length ? cached.map(rowToHashtag) : TEMPLATE_HASHTAGS.filter(t => !platform || t.platform === platform).map((t, i) => ({ ...t, id: `hash_${i}`, scrapedAt: nowIso() }));
  if (!cached.length) {
    // Seed cache (best-effort)
    for (const t of pool) {
      teamDbExec(
        `INSERT OR IGNORE INTO trending_hashtags (id, hashtag, platform, niche, growth_24h, growth_7d, post_count, competition, scraped_at)
         VALUES ('${esc(t.id)}', '${esc(t.hashtag)}', '${esc(t.platform || "")}', ${t.niche ? `'${esc(t.niche)}'` : "NULL"},
                 ${t.growth24h}, ${t.growth7d}, ${t.postCount || 0}, '${esc(t.competition)}', '${esc(t.scrapedAt)}')`
      );
    }
  }
  // Diversify: 3 high-growth, 4 mid, 3 niche
  const sorted = [...pool].sort((a, b) => b.growth7d - a.growth7d);
  const diversified: TrendingHashtag[] = [];
  const high = sorted.filter(t => t.growth7d > 50);
  const mid = sorted.filter(t => t.growth7d >= 20 && t.growth7d <= 50);
  const low = sorted.filter(t => t.growth7d < 20);
  diversified.push(...high.slice(0, 3));
  diversified.push(...mid.slice(0, 4));
  diversified.push(...low.slice(0, 3));
  // Pad if still short
  for (const t of sorted) {
    if (diversified.length >= count) break;
    if (!diversified.find(d => d.hashtag === t.hashtag)) diversified.push(t);
  }
  return diversified.slice(0, count);
}

// ---------------------------------------------------------------------------
// getTrendingHooks — top hook templates by category
// ---------------------------------------------------------------------------
export function getTrendingHooks(opts?: { category?: string; platform?: Platform; count?: number }): TrendingHook[] {
  ensureSchema();
  const { category, platform, count = 10 } = opts || {};
  // Try cache
  const cached = teamDbQuery<any>(
    `SELECT * FROM trending_hooks`
      + (category ? ` WHERE category='${esc(category)}'` : "")
      + (platform ? ` ${category ? "AND" : "WHERE"} platform='${esc(platform)}'` : "")
      + ` ORDER BY growth_score DESC LIMIT 100`
  );
  let pool: TrendingHook[] = cached.length ? cached.map(rowToHook) : TEMPLATE_HOOKS
    .filter(t => !category || t.category === category)
    .filter(t => !platform || t.platform === platform)
    .map((t, i) => ({ ...t, id: `hook_${i}`, scrapedAt: nowIso() }));
  if (!cached.length) {
    for (const t of pool) {
      teamDbExec(
        `INSERT OR IGNORE INTO trending_hooks (id, hook, category, platform, format_type, growth_score, usage_count, scraped_at)
         VALUES ('${esc(t.id)}', '${esc(t.hook)}', '${esc(t.category)}', '${esc(t.platform || "")}',
                 ${t.formatType ? `'${esc(t.formatType)}'` : "NULL"}, ${t.growthScore}, ${t.usageCount}, '${esc(t.scrapedAt)}')`
      );
    }
  }
  return pool.sort((a, b) => b.growthScore - a.growthScore).slice(0, count);
}

// ---------------------------------------------------------------------------
// generateTrendReport — full report for a niche
// ---------------------------------------------------------------------------
export async function generateTrendReport(opts: { niche: string; platform?: Platform }): Promise<TrendReport> {
  ensureSchema();
  const { niche, platform } = opts;
  const formats = (await fetchTrendingFormats({ niche, platform, limit: 10 })).formats;
  const hooks = getTrendingHooks({ platform, count: 8 });
  const hashtags = getOptimalHashtags({ niche, platform, count: 12 });
  const patterns = analyzeViralPatterns({ platform, niche });
  // Synthesize a human-readable summary
  const topFormat = formats[0];
  const topHook = hooks[0];
  const topHashtag = hashtags[0];
  const summary = [
    `${niche} is currently dominated by the "${topFormat?.formatType || topFormat?.title || "unknown"}" format on ${topFormat?.platform || "all platforms"} (growth: ${topFormat?.growthScore || 0}/100).`,
    `The strongest hook pattern right now is "${topHook?.hook || "—"}" (used ${topHook?.usageCount?.toLocaleString() || 0} times in the last 7 days).`,
    `The fastest-rising hashtag is #${topHashtag?.hashtag || "—"} (+${topHashtag?.growth7d || 0}% this week, ${topHashtag?.competition || "medium"} competition).`,
    `${patterns.length} viral patterns detected across ${formats.length} trending formats.`,
  ].join(" ");
  // Recommendations
  const recommendations: string[] = [];
  if (topFormat) {
    recommendations.push(`Lead with the "${topFormat.formatType}" format — it has a ${topFormat.growthScore}/100 growth score.`);
  }
  if (topHook) {
    recommendations.push(`Use a hook similar to: "${topHook.hook}" — high growth, high usage.`);
  }
  if (topHashtag) {
    recommendations.push(`Include #${topHashtag.hashtag} in your next post — fastest-rising in your niche.`);
  }
  if (hashtags.length >= 3) {
    recommendations.push(`Rotate these 3 high-growth tags: ${hashtags.slice(0, 3).map(h => "#" + h.hashtag).join(", ")}`);
  }
  if (patterns.find(p => p.type === "length" && p.frequency >= 2)) {
    const lenPatterns = patterns.filter(p => p.type === "length");
    recommendations.push(`Stick to ${lenPatterns[0]?.pattern || "15-30s"} for the best distribution.`);
  }
  // Persist the report
  const id = uid("report");
  teamDbExec(
    `INSERT INTO trend_reports (id, niche, summary, top_formats, top_hooks, recommendations, generated_at)
     VALUES ('${esc(id)}', '${esc(niche)}', '${esc(summary)}', '${esc(JSON.stringify(formats))}',
             '${esc(JSON.stringify(hooks))}', '${esc(JSON.stringify(recommendations))}', '${nowIso()}')`
  );
  return {
    id,
    niche,
    summary,
    topFormats: formats,
    topHooks: hooks,
    topHashtags: hashtags,
    recommendations,
    patterns,
    generatedAt: nowIso(),
    source: "template",
  };
}

// ---------------------------------------------------------------------------
// recommendContentForTrend — turn a trending format into an actionable brief
// ---------------------------------------------------------------------------
export function recommendContentForTrend(formatId: string): { trend: TrendingFormat; brief: string; suggestedHook: string; suggestedHashtags: string[]; suggestedDurationSec: number } {
  const { formats } = await_(() => fetchTrendingFormats({ limit: 100 }));
  const t = formats.find(f => f.id === formatId);
  if (!t) return { trend: null as any, brief: "Format not found", suggestedHook: "", suggestedHashtags: [], suggestedDurationSec: 0 };
  const hook = t.hookPattern || "Stop scrolling — this changes everything";
  const brief = [
    `This format is exploding right now: "${t.title}".`,
    `Match the structure: ${t.description}`,
    `Open with a hook in this style: "${hook}"`,
    `Target duration: ${t.typicalDurationSec ? t.typicalDurationSec + "s" : "carousel / long-form"}`,
    `Use these hashtags: ${(t.hashtagCluster || []).map(h => "#" + h).join(", ")}`,
  ].join("\n");
  return {
    trend: t,
    brief,
    suggestedHook: hook,
    suggestedHashtags: t.hashtagCluster || [],
    suggestedDurationSec: t.typicalDurationSec || 0,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function await_<T>(fn: () => Promise<T> | T): T {
  // Internal helper: if fn returns a Promise, await it. Used so analyzeViralPatterns
  // can be a sync function that still reads from the async fetchTrendingFormats.
  // Callers in JS land see a sync return.
  const result = fn();
  if (result && typeof (result as any).then === "function") {
    // We're in sync code — the caller is a sync function. Return the cached value
    // (formats) synchronously by reaching into a known sync wrapper.
    // This is a pragmatic bridge; for full async correctness, callers should
    // `await analyzeViralPatternsAsync()`. We provide both below.
    throw new Error("INTERNAL: analyzeViralPatterns must be called via analyzeViralPatternsAsync to await fetchTrendingFormats");
  }
  return result as T;
}

export async function analyzeViralPatternsAsync(opts?: { platform?: Platform; niche?: string }): Promise<ViralPattern[]> {
  const { formats } = await fetchTrendingFormats({ platform: opts?.platform, niche: opts?.niche, limit: 50 });
  return analyzeViralPatternsSync(formats);
}

function analyzeViralPatternsSync(formats: TrendingFormat[]): ViralPattern[] {
  const hookBuckets: Record<string, { count: number; examples: string[]; platforms: Set<Platform>; growth: number[] }> = {};
  for (const f of formats) {
    if (!f.hookPattern) continue;
    const words = f.hookPattern.split(" ").slice(0, 3).join(" ").toLowerCase();
    const key = words;
    if (!hookBuckets[key]) hookBuckets[key] = { count: 0, examples: [], platforms: new Set(), growth: [] };
    hookBuckets[key].count++;
    hookBuckets[key].examples.push(f.hookPattern);
    hookBuckets[key].platforms.add(f.platform);
    hookBuckets[key].growth.push(f.growthScore);
  }
  const hashBuckets: Record<string, number> = {};
  for (const f of formats) {
    for (const tag of f.hashtagCluster || []) hashBuckets[tag] = (hashBuckets[tag] || 0) + 1;
  }
  const durBuckets: Record<string, { count: number; examples: string[]; growth: number[] }> = {
    "ultra_short_5_10s": { count: 0, examples: [], growth: [] },
    "short_15_30s": { count: 0, examples: [], growth: [] },
    "medium_30_60s": { count: 0, examples: [], growth: [] },
    "long_form_carousel": { count: 0, examples: [], growth: [] },
  };
  for (const f of formats) {
    const d = f.typicalDurationSec || 0;
    const k = d === 0 ? "long_form_carousel" : d <= 10 ? "ultra_short_5_10s" : d <= 30 ? "short_15_30s" : "medium_30_60s";
    durBuckets[k].count++;
    durBuckets[k].examples.push(f.title);
    durBuckets[k].growth.push(f.growthScore);
  }
  const patterns: ViralPattern[] = [];
  for (const [key, b] of Object.entries(hookBuckets)) {
    if (b.count < 1) continue;
    const avg = b.growth.reduce((a, x) => a + x, 0) / b.growth.length;
    patterns.push({ type: "hook_structure", pattern: `Opens with "${key}…"`, frequency: b.count, examples: b.examples.slice(0, 3), platforms: Array.from(b.platforms), growthScore: Math.round(avg) });
  }
  for (const [tag, count] of Object.entries(hashBuckets).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
    patterns.push({ type: "hashtag_cluster", pattern: `#${tag} appears in ${count} trending formats`, frequency: count, examples: [tag], platforms: ["tiktok", "instagram", "youtube"], growthScore: 90 });
  }
  for (const [k, b] of Object.entries(durBuckets)) {
    if (b.count === 0) continue;
    const avg = b.growth.reduce((a, x) => a + x, 0) / Math.max(1, b.growth.length);
    const label = k === "ultra_short_5_10s" ? "5-10s" : k === "short_15_30s" ? "15-30s" : k === "medium_30_60s" ? "30-60s" : "Carousel / long-form";
    patterns.push({ type: "length", pattern: `${label} videos are trending`, frequency: b.count, examples: b.examples.slice(0, 2), platforms: ["tiktok", "instagram", "youtube"], growthScore: Math.round(avg) });
  }
  return patterns.sort((a, b) => b.growthScore - a.growthScore);
}

function rowToFormat(r: any): TrendingFormat {
  return {
    id: r.id, platform: r.platform, formatType: r.format_type, title: r.title,
    description: r.description || "", hookPattern: r.hook_pattern || undefined,
    typicalDurationSec: r.typical_duration_sec ? Number(r.typical_duration_sec) : undefined,
    hashtagCluster: safeParse(r.hashtag_cluster, []),
    growthScore: Number(r.growth_score || 0),
    viewCount: r.view_count ? Number(r.view_count) : undefined,
    niche: r.niche || undefined,
    source: r.source || "api",
    scrapedAt: r.scraped_at,
    expiresAt: r.expires_at || undefined,
  };
}
function rowToHook(r: any): TrendingHook {
  return { id: r.id, hook: r.hook, category: r.category || "general", platform: r.platform || undefined, formatType: r.format_type || undefined, growthScore: Number(r.growth_score || 0), usageCount: Number(r.usage_count || 0), scrapedAt: r.scraped_at };
}
function rowToHashtag(r: any): TrendingHashtag {
  return { id: r.id, hashtag: r.hashtag, platform: r.platform || undefined, niche: r.niche || undefined, growth24h: Number(r.growth_24h || 0), growth7d: Number(r.growth_7d || 0), postCount: r.post_count ? Number(r.post_count) : undefined, competition: r.competition || "medium", scrapedAt: r.scraped_at };
}
