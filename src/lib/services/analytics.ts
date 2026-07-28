// src/lib/services/analytics.ts
// OnePost AI — Analytics & Reporting Engine
// Architecture: aggregates real data from existing tables (content_items,
// scheduled_posts, invoices, affiliates, brand_schedules) + writes granular
// metrics to `content_performance` / `brand_followers` / `revenue_transactions`
// tables so the API shape is stable when real platform keys arrive.
//
// Until platform APIs are wired, the engine returns structured demo data
// (clearly stamped `source: "demo"`) when there is no real data to aggregate,
// so the dashboard never shows a blank screen.
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
  } catch (e) {
    return [];
  }
}
function teamDbExec(sql: string): boolean {
  try {
    const { execSync } = require("child_process");
    execSync(`team-db "${sql.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
    return true;
  } catch (e) {
    return false;
  }
}
function esc(v: any): string {
  return String(v ?? "").replace(/'/g, "''");
}
function safeParse(s: any, fb: any) {
  if (!s) return fb;
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return fb;
  }
}
function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function nowIso() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Schema bootstrap
// ---------------------------------------------------------------------------
let _schemaReady = false;
function ensureSchema() {
  if (_schemaReady) return;
  teamDbExec(`CREATE TABLE IF NOT EXISTS content_performance (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    post_source TEXT,
    brand_id TEXT,
    brand_name TEXT,
    platform TEXT NOT NULL,
    content_type TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    revenue_usd REAL DEFAULT 0,
    source TEXT DEFAULT 'manual',
    captured_at TEXT DEFAULT (datetime('now'))
  )`);
  teamDbExec(`CREATE TABLE IF NOT EXISTS brand_followers (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL,
    brand_name TEXT,
    platform TEXT NOT NULL,
    followers INTEGER NOT NULL,
    captured_at TEXT DEFAULT (datetime('now'))
  )`);
  teamDbExec(`CREATE TABLE IF NOT EXISTS revenue_transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    source TEXT,
    amount_usd REAL NOT NULL,
    customer_email TEXT,
    customer_name TEXT,
    plan TEXT,
    affiliate_id TEXT,
    affiliate_referral_code TEXT,
    description TEXT,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  _schemaReady = true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type PostPerformance = {
  id: string;
  postId: string;
  postSource: "content_items" | "scheduled_posts" | "manual";
  brandId?: string;
  brandName?: string;
  platform: Platform;
  contentType?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number; // 0..1
  reach: number;
  impressions: number;
  followersGained: number;
  revenueUsd: number;
  source: "platform_api" | "manual" | "demo";
  capturedAt: string;
};

export type BrandAnalytics = {
  brandId: string;
  brandName: string;
  totalPosts: number;
  totalPublished: number;
  totalScheduled: number;
  totalDrafts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  averageEngagementRate: number; // 0..1
  totalFollowers: number;
  followerGrowth: number; // net new over the period
  followerGrowthPct: number; // 0..1
  bestPerformingContentTypes: Array<{
    contentType: string;
    posts: number;
    avgEngagementRate: number;
    totalViews: number;
  }>;
  bestPerformingPlatforms: Array<{
    platform: string;
    posts: number;
    totalViews: number;
    avgEngagementRate: number;
  }>;
  topPosts: PostPerformance[];
  periodDays: number;
};

export type PlatformBreakdown = {
  platform: Platform;
  posts: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number; // 0..1
  reach: number;
  followers: number;
  followerGrowth: number;
  averagePostViews: number;
  share: number; // share of total posts (0..1)
  isTopPerformer: boolean;
};

export type RevenueAnalytics = {
  periodDays: number;
  totals: {
    stripeRevenue: number;
    affiliateRevenue: number;
    creditsRevenue: number;
    lifetimeDeals: number;
    totalRevenue: number;
    projectedMonthly: number;
    projectedAnnual: number;
  };
  bySource: Array<{ source: string; amount: number; transactionCount: number; share: number }>;
  byPlan: Array<{ plan: string; subscribers: number; amount: number; share: number }>;
  byDay: Array<{ date: string; amount: number; transactionCount: number }>;
  topAffiliates: Array<{
    affiliateId: string;
    name: string;
    email: string;
    referralCode: string;
    referrals: number;
    activeSubscribers: number;
    earnings: number;
    conversionRate: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    source: string;
    amount: number;
    plan?: string;
    customerEmail?: string;
    description?: string;
    createdAt: string;
  }>;
  source: "platform_api" | "manual" | "demo";
};

export type AnalyticsOverview = {
  periodDays: number;
  totals: {
    contentGenerated: number;
    postsScheduled: number;
    postsPublished: number;
    totalViews: number;
    totalEngagements: number;
    totalClicks: number;
    newFollowers: number;
    estimatedRevenue: number;
  };
  averageEngagementRate: number;
  averagePostViews: number;
  bestPlatform: Platform;
  bestContentType: string;
  byPlatform: Array<{ platform: Platform; views: number; posts: number; share: number }>;
  byContentType: Array<{ contentType: string; posts: number; avgEngagement: number; share: number }>;
  byDay: Array<{ date: string; views: number; engagements: number; posts: number; revenue: number }>;
  topBrands: Array<{ brandId: string; brandName: string; views: number; posts: number; engagement: number }>;
  source: "platform_api" | "manual" | "demo";
};

// ---------------------------------------------------------------------------
// 7 platforms
// ---------------------------------------------------------------------------
export const PLATFORMS: Platform[] = [
  "tiktok",
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
  "snapchat",
  "pinterest",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function computeEngagementRate(likes: number, comments: number, shares: number, saves: number, views: number): number {
  if (!views || views <= 0) return 0;
  return Math.min(1, (likes + comments + shares + saves) / views);
}

function dayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}
function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function parseDay(s: string): string {
  return s ? String(s).slice(0, 10) : "";
}
function num(x: any, fb = 0): number {
  const v = Number(x);
  return Number.isFinite(v) ? v : fb;
}
function round(x: number, dp = 4): number {
  const f = Math.pow(10, dp);
  return Math.round(x * f) / f;
}

// ---------------------------------------------------------------------------
// Core read APIs
// ---------------------------------------------------------------------------
export function getContentPerformance(opts: {
  brandId?: string;
  platform?: Platform;
  postId?: string;
  days?: number;
  limit?: number;
  offset?: number;
} = {}): { posts: PostPerformance[]; total: number; days: number; source: "platform_api" | "manual" | "demo" } {
  ensureSchema();
  const days = Math.max(1, Math.min(365, opts.days ?? 30));
  const limit = Math.min(500, Math.max(1, opts.limit ?? 50));
  const offset = Math.max(0, opts.offset ?? 0);
  const sinceIso = isoNDaysAgo(days - 1);

  const conditions: string[] = [`captured_at >= '${sinceIso}'`];
  if (opts.brandId) conditions.push(`brand_id = '${esc(opts.brandId)}'`);
  if (opts.platform) conditions.push(`platform = '${esc(opts.platform)}'`);
  if (opts.postId) conditions.push(`post_id = '${esc(opts.postId)}'`);
  const where = `WHERE ${conditions.join(" AND ")}`;

  const rows = teamDbQuery<any>(
    `SELECT * FROM content_performance ${where} ORDER BY captured_at DESC LIMIT ${limit} OFFSET ${offset}`
  );
  const totalRows = teamDbQuery<any>(
    `SELECT COUNT(*) as n FROM content_performance ${where}`
  );
  const total = num(totalRows[0]?.n, 0);

  // Aggregate to one row per (post_id, platform) — capture the latest snapshot
  const byPost = new Map<string, any>();
  for (const r of rows) {
    const key = `${r.post_id}::${r.platform}`;
    const prev = byPost.get(key);
    if (!prev || String(r.captured_at) > String(prev.captured_at)) {
      byPost.set(key, r);
    }
  }
  const posts: PostPerformance[] = Array.from(byPost.values()).map((r) => {
    const views = num(r.views);
    const likes = num(r.likes);
    const comments = num(r.comments);
    const shares = num(r.shares);
    const saves = num(r.saves);
    return {
      id: r.id,
      postId: r.post_id,
      postSource: (r.post_source || "manual") as PostPerformance["postSource"],
      brandId: r.brand_id,
      brandName: r.brand_name,
      platform: r.platform as Platform,
      contentType: r.content_type,
      views,
      likes,
      comments,
      shares,
      saves: saves,
      clicks: num(r.clicks),
      engagementRate: num(r.engagement_rate) || computeEngagementRate(likes, comments, shares, saves, views),
      reach: num(r.reach),
      impressions: num(r.impressions),
      followersGained: num(r.followers_gained),
      revenueUsd: num(r.revenue_usd),
      source: (r.source || "manual") as PostPerformance["source"],
      capturedAt: r.captured_at,
    };
  });

  // If no real rows, return demo data so dev mode shows the dashboard
  if (posts.length === 0) {
    return { posts: generateDemoContentPerformance({ brandId: opts.brandId, platform: opts.platform, days, limit }), total: limit, days, source: "demo" };
  }

  return { posts, total, days, source: "platform_api" };
}

export function getBrandAnalytics(opts: { brandId: string; days?: number }): BrandAnalytics {
  ensureSchema();
  const days = Math.max(1, Math.min(365, opts.days ?? 30));
  const brandId = opts.brandId;
  const sinceIso = isoNDaysAgo(days - 1);

  // Brand info
  const brandRow = teamDbQuery<any>(`SELECT * FROM brands WHERE id = '${esc(brandId)}' LIMIT 1`)[0];
  const brandName = brandRow?.name || "Unknown Brand";

  // Count content_items by status
  const contentItems = teamDbQuery<any>(`SELECT id, status FROM content_items WHERE brand = '${esc(brandName)}'`);
  const totalContent = contentItems.length;

  // Count scheduled_posts by status
  const scheduledRows = teamDbQuery<any>(`SELECT id, status FROM scheduled_posts WHERE brand_id = '${esc(brandId)}'`);
  const totalScheduled = scheduledRows.length;
  const totalPublished = scheduledRows.filter((r) => r.status === "published").length;

  // Aggregate content_performance
  const perfRows = teamDbQuery<any>(
    `SELECT * FROM content_performance WHERE brand_id = '${esc(brandId)}' AND captured_at >= '${sinceIso}'`
  );
  const totalViews = perfRows.reduce((a, r) => a + num(r.views), 0);
  const totalLikes = perfRows.reduce((a, r) => a + num(r.likes), 0);
  const totalComments = perfRows.reduce((a, r) => a + num(r.comments), 0);
  const totalShares = perfRows.reduce((a, r) => a + num(r.shares), 0);
  const totalClicks = perfRows.reduce((a, r) => a + num(r.clicks), 0);
  const averageEngagementRate = totalViews > 0 ? (totalLikes + totalComments + totalShares) / totalViews : 0;

  // Best content types
  const byType = new Map<string, { posts: number; views: number; engSum: number }>();
  for (const r of perfRows) {
    const t = r.content_type || "unknown";
    const cur = byType.get(t) || { posts: 0, views: 0, engSum: 0 };
    cur.posts += 1;
    cur.views += num(r.views);
    cur.engSum += num(r.engagement_rate) || 0;
    byType.set(t, cur);
  }
  const bestPerformingContentTypes = Array.from(byType.entries())
    .map(([contentType, v]) => ({
      contentType,
      posts: v.posts,
      avgEngagementRate: v.posts > 0 ? v.engSum / v.posts : 0,
      totalViews: v.views,
    }))
    .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
    .slice(0, 5);

  // Best platforms
  const byPlatform = new Map<string, { posts: number; views: number; engSum: number }>();
  for (const r of perfRows) {
    const p = r.platform || "unknown";
    const cur = byPlatform.get(p) || { posts: 0, views: 0, engSum: 0 };
    cur.posts += 1;
    cur.views += num(r.views);
    cur.engSum += num(r.engagement_rate) || 0;
    byPlatform.set(p, cur);
  }
  const bestPerformingPlatforms = Array.from(byPlatform.entries())
    .map(([platform, v]) => ({
      platform,
      posts: v.posts,
      totalViews: v.views,
      avgEngagementRate: v.posts > 0 ? v.engSum / v.posts : 0,
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 5);

  // Top posts (by views)
  const topPosts: PostPerformance[] = perfRows
    .sort((a, b) => num(b.views) - num(a.views))
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      postId: r.post_id,
      postSource: (r.post_source || "manual") as PostPerformance["postSource"],
      brandId: r.brand_id,
      brandName: r.brand_name,
      platform: r.platform as Platform,
      contentType: r.content_type,
      views: num(r.views),
      likes: num(r.likes),
      comments: num(r.comments),
      shares: num(r.shares),
      saves: num(r.saves),
      clicks: num(r.clicks),
      engagementRate: num(r.engagement_rate) || 0,
      reach: num(r.reach),
      impressions: num(r.impressions),
      followersGained: num(r.followers_gained),
      revenueUsd: num(r.revenue_usd),
      source: (r.source || "manual") as PostPerformance["source"],
      capturedAt: r.captured_at,
    }));

  // Followers — most recent snapshot per platform, plus earliest in window
  const followerRows = teamDbQuery<any>(
    `SELECT * FROM brand_followers WHERE brand_id = '${esc(brandId)}' ORDER BY captured_at DESC`
  );
  const totalFollowers = followerRows.reduce((acc: number, r: any) => {
    acc += num(r.followers);
    return acc;
  }, 0);
  // Growth = latest_followers - earliest_in_window
  const byPlatformF = new Map<string, { latest: number; earliest: number }>();
  for (const r of followerRows) {
    const k = r.platform;
    const cur = byPlatformF.get(k) || { latest: 0, earliest: Infinity };
    if (cur.latest === 0) cur.latest = num(r.followers);
    cur.earliest = Math.min(cur.earliest, num(r.followers));
    byPlatformF.set(k, cur);
  }
  const followerGrowth = Array.from(byPlatformF.values()).reduce((a, v) => a + (v.latest - (Number.isFinite(v.earliest) ? v.earliest : v.latest)), 0);
  const followerGrowthPct = totalFollowers > 0 ? followerGrowth / Math.max(1, totalFollowers - followerGrowth) : 0;

  // Demo fallback when no real data
  if (perfRows.length === 0 && followerRows.length === 0) {
    return generateDemoBrandAnalytics({ brandId, brandName, days });
  }

  return {
    brandId,
    brandName,
    totalPosts: totalContent,
    totalPublished,
    totalScheduled,
    totalDrafts: Math.max(0, totalContent - totalPublished),
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    totalClicks,
    averageEngagementRate: round(averageEngagementRate, 4),
    totalFollowers,
    followerGrowth,
    followerGrowthPct: round(followerGrowthPct, 4),
    bestPerformingContentTypes,
    bestPerformingPlatforms,
    topPosts,
    periodDays: days,
  };
}

export function listBrandAnalytics(days: number = 30): BrandAnalytics[] {
  ensureSchema();
  const brands = teamDbQuery<any>(`SELECT id, name FROM brands ORDER BY created_at DESC LIMIT 100`);
  return brands.map((b) => getBrandAnalytics({ brandId: b.id, days }));
}

export function getPlatformBreakdown(opts: { days?: number } = {}): {
  platforms: PlatformBreakdown[];
  days: number;
  source: "platform_api" | "manual" | "demo";
} {
  ensureSchema();
  const days = Math.max(1, Math.min(365, opts.days ?? 30));
  const sinceIso = isoNDaysAgo(days - 1);

  const perfRows = teamDbQuery<any>(
    `SELECT * FROM content_performance WHERE captured_at >= '${sinceIso}'`
  );
  const followerRows = teamDbQuery<any>(
    `SELECT * FROM brand_followers WHERE captured_at >= '${sinceIso}'`
  );

  const byPlatform = new Map<string, { views: number; likes: number; comments: number; shares: number; saves: number; clicks: number; reach: number; impressions: number; posts: Set<string> }>();
  for (const p of PLATFORMS) {
    byPlatform.set(p, { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, reach: 0, impressions: 0, posts: new Set() });
  }
  for (const r of perfRows) {
    const k = r.platform;
    if (!byPlatform.has(k)) byPlatform.set(k, { views: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, reach: 0, impressions: 0, posts: new Set() });
    const cur = byPlatform.get(k)!;
    cur.views += num(r.views);
    cur.likes += num(r.likes);
    cur.comments += num(r.comments);
    cur.shares += num(r.shares);
    cur.saves += num(r.saves);
    cur.clicks += num(r.clicks);
    cur.reach += num(r.reach);
    cur.impressions += num(r.impressions);
    cur.posts.add(`${r.post_id}::${r.captured_at}`);
  }

  const followersByPlatform = new Map<string, number>();
  for (const r of followerRows) {
    const k = r.platform;
    followersByPlatform.set(k, (followersByPlatform.get(k) || 0) + num(r.followers));
  }

  // Use latest follower per platform as a baseline; growth = latest - earliest
  const growthByPlatform = new Map<string, number>();
  const latestFollowers = teamDbQuery<any>(`SELECT platform, MAX(captured_at) as max_at FROM brand_followers GROUP BY platform`);
  for (const lf of latestFollowers) {
    const latest = teamDbQuery<any>(`SELECT followers FROM brand_followers WHERE platform = '${esc(lf.platform)}' ORDER BY captured_at DESC LIMIT 1`)[0];
    const earliest = teamDbQuery<any>(`SELECT followers FROM brand_followers WHERE platform = '${esc(lf.platform)}' ORDER BY captured_at ASC LIMIT 1`)[0];
    if (latest && earliest) {
      growthByPlatform.set(lf.platform, num(latest.followers) - num(earliest.followers));
    }
  }

  // Compute totals to derive share
  const allEntries = Array.from(byPlatform.entries());
  const totalPosts = allEntries.reduce((a, [, v]) => a + v.posts.size, 0);

  const platforms: PlatformBreakdown[] = PLATFORMS.map((p) => {
    const v = byPlatform.get(p)!;
    const posts = v.posts.size;
    const engagementRate = v.views > 0 ? (v.likes + v.comments + v.shares + v.saves) / v.views : 0;
    return {
      platform: p,
      posts,
      views: v.views,
      likes: v.likes,
      comments: v.comments,
      shares: v.shares,
      saves: v.saves,
      clicks: v.clicks,
      engagementRate: round(engagementRate, 4),
      reach: v.reach,
      followers: followersByPlatform.get(p) || 0,
      followerGrowth: growthByPlatform.get(p) || 0,
      averagePostViews: posts > 0 ? Math.round(v.views / posts) : 0,
      share: totalPosts > 0 ? round(posts / totalPosts, 4) : 0,
      isTopPerformer: false,
    };
  });

  // Demo fallback when no data
  if (perfRows.length === 0) {
    return { platforms: generateDemoPlatformBreakdown(days), days, source: "demo" };
  }

  // Mark top performer (by engagement rate)
  const topIdx = platforms.reduce((best, cur, idx) => (cur.engagementRate > platforms[best].engagementRate ? idx : best), 0);
  platforms[topIdx].isTopPerformer = true;

  return { platforms, days, source: "platform_api" };
}

export function getRevenueAnalytics(opts: { days?: number } = {}): RevenueAnalytics {
  ensureSchema();
  const days = Math.max(1, Math.min(365, opts.days ?? 30));
  const sinceIso = isoNDaysAgo(days - 1);

  // Source 1: invoices table
  const invoiceRows = teamDbQuery<any>(`SELECT * FROM invoices WHERE date >= '${sinceIso}'`);
  // Source 2: revenue_transactions table
  const txRows = teamDbQuery<any>(`SELECT * FROM revenue_transactions WHERE created_at >= '${sinceIso}'`);
  // Source 3: affiliates (lifetime commission)
  const affiliateRows = teamDbQuery<any>(`SELECT * FROM affiliates`);

  // Aggregate by type from both sources
  let stripeRevenue = 0;
  let affiliateRevenue = 0;
  let creditsRevenue = 0;
  let lifetimeDeals = 0;
  for (const r of invoiceRows) {
    if (r.status === "paid") {
      const amt = num(r.amount);
      const plan = String(r.plan || "").toLowerCase();
      if (plan === "lifetime") lifetimeDeals += amt;
      else stripeRevenue += amt;
    }
  }
  for (const r of txRows) {
    if (r.status === "completed" || !r.status) {
      const amt = num(r.amount_usd);
      const t = String(r.type || "").toLowerCase();
      if (t === "affiliate") affiliateRevenue += amt;
      else if (t === "credits") creditsRevenue += amt;
      else if (t === "lifetime") lifetimeDeals += amt;
      else stripeRevenue += amt;
    }
  }
  for (const a of affiliateRows) {
    affiliateRevenue += num(a.earnings);
  }

  const totalRevenue = stripeRevenue + affiliateRevenue + creditsRevenue + lifetimeDeals;

  // Projection: simple linear projection
  const dailyAvg = totalRevenue / Math.max(1, days);
  const projectedMonthly = dailyAvg * 30;
  const projectedAnnual = dailyAvg * 365;

  // By source
  const bySourceMap = new Map<string, { amount: number; count: number }>();
  for (const r of invoiceRows) {
    if (r.status === "paid") {
      const k = "stripe";
      const cur = bySourceMap.get(k) || { amount: 0, count: 0 };
      cur.amount += num(r.amount);
      cur.count += 1;
      bySourceMap.set(k, cur);
    }
  }
  for (const r of txRows) {
    if (r.status === "completed" || !r.status) {
      const k = String(r.source || "manual");
      const cur = bySourceMap.get(k) || { amount: 0, count: 0 };
      cur.amount += num(r.amount_usd);
      cur.count += 1;
      bySourceMap.set(k, cur);
    }
  }
  // Affiliate commissions from affiliates table (counted as 1 tx per affiliate for simplicity)
  if (affiliateRows.length > 0) {
    const cur = bySourceMap.get("affiliate") || { amount: 0, count: 0 };
    for (const a of affiliateRows) cur.amount += num(a.earnings);
    cur.count += affiliateRows.length;
    bySourceMap.set("affiliate", cur);
  }
  const bySource = Array.from(bySourceMap.entries())
    .map(([source, v]) => ({
      source,
      amount: round(v.amount, 2),
      transactionCount: v.count,
      share: totalRevenue > 0 ? round(v.amount / totalRevenue, 4) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // By plan
  const byPlanMap = new Map<string, { amount: number; count: number }>();
  for (const r of invoiceRows) {
    if (r.status === "paid") {
      const k = String(r.plan || "other");
      const cur = byPlanMap.get(k) || { amount: 0, count: 0 };
      cur.amount += num(r.amount);
      cur.count += 1;
      byPlanMap.set(k, cur);
    }
  }
  for (const r of txRows) {
    if (r.status === "completed" || !r.status) {
      const k = String(r.plan || "other");
      const cur = byPlanMap.get(k) || { amount: 0, count: 0 };
      cur.amount += num(r.amount_usd);
      cur.count += 1;
      byPlanMap.set(k, cur);
    }
  }
  const byPlan = Array.from(byPlanMap.entries())
    .map(([plan, v]) => ({
      plan,
      amount: round(v.amount, 2),
      subscribers: v.count,
      share: totalRevenue > 0 ? round(v.amount / totalRevenue, 4) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // By day — last N days
  const byDayMap = new Map<string, { amount: number; count: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDayMap.set(dayKey(d), { amount: 0, count: 0 });
  }
  for (const r of invoiceRows) {
    const k = parseDay(r.date);
    if (byDayMap.has(k) && r.status === "paid") {
      const cur = byDayMap.get(k)!;
      cur.amount += num(r.amount);
      cur.count += 1;
    }
  }
  for (const r of txRows) {
    const k = parseDay(r.created_at);
    if (byDayMap.has(k) && (r.status === "completed" || !r.status)) {
      const cur = byDayMap.get(k)!;
      cur.amount += num(r.amount_usd);
      cur.count += 1;
    }
  }
  const byDay = Array.from(byDayMap.entries())
    .map(([date, v]) => ({ date, amount: round(v.amount, 2), transactionCount: v.count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top affiliates
  const topAffiliates = affiliateRows
    .sort((a, b) => num(b.earnings) - num(a.earnings))
    .slice(0, 10)
    .map((a) => ({
      affiliateId: a.id,
      name: a.name,
      email: a.email,
      referralCode: a.referral_code,
      referrals: num(a.referrals),
      activeSubscribers: num(a.active_subscribers),
      earnings: round(num(a.earnings), 2),
      conversionRate: num(a.referrals) > 0 ? round(num(a.active_subscribers) / num(a.referrals), 4) : 0,
    }));

  // Recent transactions (mix of invoices + tx)
  const recentTransactions = [
    ...invoiceRows.map((r) => ({
      id: r.id,
      type: "subscription",
      source: "stripe",
      amount: num(r.amount),
      plan: r.plan,
      customerEmail: r.email,
      description: `${r.plan || "Plan"} — ${r.customer || ""}`,
      createdAt: r.date,
    })),
    ...txRows.map((r) => ({
      id: r.id,
      type: r.type,
      source: r.source,
      amount: num(r.amount_usd),
      plan: r.plan,
      customerEmail: r.customer_email,
      description: r.description,
      createdAt: r.created_at,
    })),
  ]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 20);

  // Demo fallback when no data
  if (totalRevenue === 0 && affiliateRows.length === 0) {
    return generateDemoRevenueAnalytics(days);
  }

  return {
    periodDays: days,
    totals: {
      stripeRevenue: round(stripeRevenue, 2),
      affiliateRevenue: round(affiliateRevenue, 2),
      creditsRevenue: round(creditsRevenue, 2),
      lifetimeDeals: round(lifetimeDeals, 2),
      totalRevenue: round(totalRevenue, 2),
      projectedMonthly: round(projectedMonthly, 2),
      projectedAnnual: round(projectedAnnual, 2),
    },
    bySource,
    byPlan,
    byDay,
    topAffiliates,
    recentTransactions,
    source: "platform_api",
  };
}

export function getOverview(opts: { days?: number } = {}): AnalyticsOverview {
  ensureSchema();
  const days = Math.max(1, Math.min(365, opts.days ?? 30));
  const sinceIso = isoNDaysAgo(days - 1);

  // Content items
  const totalContentGenerated = teamDbQuery<any>(`SELECT COUNT(*) as n FROM content_items WHERE created_at >= '${sinceIso}'`)[0]?.n || 0;
  // Scheduled
  const totalPostsScheduled = teamDbQuery<any>(`SELECT COUNT(*) as n FROM scheduled_posts WHERE created_at >= '${sinceIso}'`)[0]?.n || 0;
  const totalPostsPublished = teamDbQuery<any>(`SELECT COUNT(*) as n FROM scheduled_posts WHERE status = 'published' AND published_at >= '${sinceIso}'`)[0]?.n || 0;

  // Performance aggregate
  const perfRows = teamDbQuery<any>(`SELECT * FROM content_performance WHERE captured_at >= '${sinceIso}'`);
  const totalViews = perfRows.reduce((a, r) => a + num(r.views), 0);
  const totalEngagements = perfRows.reduce((a, r) => a + num(r.likes) + num(r.comments) + num(r.shares) + num(r.saves), 0);
  const totalClicks = perfRows.reduce((a, r) => a + num(r.clicks), 0);
  const newFollowers = perfRows.reduce((a, r) => a + num(r.followers_gained), 0);
  const estimatedRevenue = perfRows.reduce((a, r) => a + num(r.revenue_usd), 0);

  // Average engagement
  const averageEngagementRate = totalViews > 0 ? totalEngagements / totalViews : 0;
  const postCount = new Set(perfRows.map((r: any) => `${r.post_id}::${r.platform}`)).size;
  const averagePostViews = postCount > 0 ? Math.round(totalViews / postCount) : 0;

  // By platform — dedupe by postId::platform so `share` is consistent with `postCount`
  const byPlatformMap = new Map<string, { views: number; posts: Set<string> }>();
  for (const p of PLATFORMS) byPlatformMap.set(p, { views: 0, posts: new Set() });
  for (const r of perfRows) {
    const cur = byPlatformMap.get(r.platform) || { views: 0, posts: new Set() };
    cur.views += num(r.views);
    cur.posts.add(`${r.post_id}::${r.platform}`);
    byPlatformMap.set(r.platform, cur);
  }
  const byPlatform = Array.from(byPlatformMap.entries())
    .map(([platform, v]) => ({
      platform: platform as Platform,
      views: v.views,
      posts: v.posts.size,
      share: postCount > 0 ? round(v.posts.size / postCount, 4) : 0,
    }))
    .filter((v) => v.posts > 0)
    .sort((a, b) => b.views - a.views);

  // By content type — dedupe by postId::contentType
  const byTypeMap = new Map<string, { posts: Set<string>; engSum: number }>();
  for (const r of perfRows) {
    const t = r.content_type || "unknown";
    const cur = byTypeMap.get(t) || { posts: new Set(), engSum: 0 };
    cur.posts.add(`${r.post_id}::${t}`);
    cur.engSum += num(r.engagement_rate) || 0;
    byTypeMap.set(t, cur);
  }
  const byContentType = Array.from(byTypeMap.entries())
    .map(([contentType, v]) => ({
      contentType,
      posts: v.posts.size,
      avgEngagement: v.posts.size > 0 ? round(v.engSum / v.posts.size, 4) : 0,
      share: postCount > 0 ? round(v.posts.size / postCount, 4) : 0,
    }))
    .filter((v) => v.posts > 0)
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  // Best platform + content type
  const bestPlatform = byPlatform[0]?.platform || "tiktok";
  const bestContentType = byContentType[0]?.contentType || "unboxing";

  // By day — dedupe posts by postId::platform so daily counts are consistent
  const byDayMap = new Map<string, { views: number; engagements: number; posts: Set<string>; revenue: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDayMap.set(dayKey(d), { views: 0, engagements: 0, posts: new Set(), revenue: 0 });
  }
  for (const r of perfRows) {
    const k = parseDay(r.captured_at);
    const cur = byDayMap.get(k);
    if (cur) {
      cur.views += num(r.views);
      cur.engagements += num(r.likes) + num(r.comments) + num(r.shares) + num(r.saves);
      cur.posts.add(`${r.post_id}::${r.platform}`);
      cur.revenue += num(r.revenue_usd);
    }
  }
  const byDay = Array.from(byDayMap.entries())
    .map(([date, v]) => ({ date, views: v.views, engagements: v.engagements, posts: v.posts.size, revenue: round(v.revenue, 2) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top brands
  const byBrandMap = new Map<string, { views: number; posts: Set<string>; engSum: number }>();
  for (const r of perfRows) {
    const k = r.brand_id || r.brand_name || "unknown";
    const cur = byBrandMap.get(k) || { views: 0, posts: new Set(), engSum: 0 };
    cur.views += num(r.views);
    cur.posts.add(`${r.post_id}::${r.captured_at}`);
    cur.engSum += num(r.engagement_rate) || 0;
    byBrandMap.set(k, cur);
  }
  const topBrands = Array.from(byBrandMap.entries())
    .map(([brandId, v]) => {
      const brandRow = teamDbQuery<any>(`SELECT name FROM brands WHERE id = '${esc(brandId)}' LIMIT 1`)[0];
      return {
        brandId,
        brandName: brandRow?.name || v.posts.size > 0 ? brandId : brandId,
        views: v.views,
        posts: v.posts.size,
        engagement: v.posts.size > 0 ? round(v.engSum / v.posts.size, 4) : 0,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Demo fallback
  if (perfRows.length === 0 && Number(totalContentGenerated) === 0 && Number(totalPostsScheduled) === 0) {
    return generateDemoOverview(days);
  }

  return {
    periodDays: days,
    totals: {
      contentGenerated: Number(totalContentGenerated),
      postsScheduled: Number(totalPostsScheduled),
      postsPublished: Number(totalPostsPublished),
      totalViews,
      totalEngagements,
      totalClicks,
      newFollowers,
      estimatedRevenue: round(estimatedRevenue, 2),
    },
    averageEngagementRate: round(averageEngagementRate, 4),
    averagePostViews,
    bestPlatform,
    bestContentType,
    byPlatform,
    byContentType,
    byDay,
    topBrands,
    source: "platform_api",
  };
}

// ---------------------------------------------------------------------------
// Write APIs (for when real platform data arrives)
// ---------------------------------------------------------------------------
export function recordContentPerformance(input: {
  postId: string;
  postSource?: "content_items" | "scheduled_posts" | "manual";
  brandId?: string;
  brandName?: string;
  platform: Platform;
  contentType?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  reach?: number;
  impressions?: number;
  followersGained?: number;
  revenueUsd?: number;
  source?: "platform_api" | "manual" | "demo";
}): { success: boolean; id: string; persisted: boolean } {
  ensureSchema();
  const id = uid("perf");
  const views = num(input.views);
  const likes = num(input.likes);
  const comments = num(input.comments);
  const shares = num(input.shares);
  const saves = num(input.saves);
  const engagementRate = computeEngagementRate(likes, comments, shares, saves, views);
  const persisted = teamDbExec(
    `INSERT INTO content_performance (id, post_id, post_source, brand_id, brand_name, platform, content_type, views, likes, comments, shares, saves, clicks, engagement_rate, reach, impressions, followers_gained, revenue_usd, source) VALUES (
      '${esc(id)}', '${esc(input.postId)}', '${esc(input.postSource || "manual")}', '${esc(input.brandId || "")}', '${esc(input.brandName || "")}', '${esc(input.platform)}', '${esc(input.contentType || "")}',
      ${views}, ${likes}, ${comments}, ${shares}, ${saves}, ${num(input.clicks)}, ${engagementRate},
      ${num(input.reach)}, ${num(input.impressions)}, ${num(input.followersGained)}, ${num(input.revenueUsd)},
      '${esc(input.source || "manual")}'
    )`
  );
  return { success: true, id, persisted };
}

export function recordBrandFollowers(input: {
  brandId: string;
  brandName?: string;
  platform: Platform;
  followers: number;
}): { success: boolean; id: string; persisted: boolean } {
  ensureSchema();
  const id = uid("follower");
  const persisted = teamDbExec(
    `INSERT INTO brand_followers (id, brand_id, brand_name, platform, followers) VALUES (
      '${esc(id)}', '${esc(input.brandId)}', '${esc(input.brandName || "")}', '${esc(input.platform)}', ${num(input.followers)}
    )`
  );
  return { success: true, id, persisted };
}

export function recordRevenue(input: {
  type: "subscription" | "affiliate" | "credits" | "lifetime";
  source?: string;
  amountUsd: number;
  customerEmail?: string;
  customerName?: string;
  plan?: string;
  affiliateId?: string;
  affiliateReferralCode?: string;
  description?: string;
  status?: "completed" | "pending" | "refunded";
}): { success: boolean; id: string; persisted: boolean } {
  ensureSchema();
  const id = uid("rev");
  const persisted = teamDbExec(
    `INSERT INTO revenue_transactions (id, type, source, amount_usd, customer_email, customer_name, plan, affiliate_id, affiliate_referral_code, description, status) VALUES (
      '${esc(id)}', '${esc(input.type)}', '${esc(input.source || "manual")}', ${num(input.amountUsd)},
      '${esc(input.customerEmail || "")}', '${esc(input.customerName || "")}', '${esc(input.plan || "")}',
      '${esc(input.affiliateId || "")}', '${esc(input.affiliateReferralCode || "")}',
      '${esc(input.description || "")}', '${esc(input.status || "completed")}'
    )`
  );
  return { success: true, id, persisted };
}

// ---------------------------------------------------------------------------
// Demo data generators — stable output so dev mode is never blank
// ---------------------------------------------------------------------------
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDemoContentPerformance(opts: { brandId?: string; platform?: Platform; days: number; limit: number }): PostPerformance[] {
  const out: PostPerformance[] = [];
  const rand = seededRandom(42);
  const platforms: Platform[] = opts.platform ? [opts.platform] : PLATFORMS;
  const contentTypes = ["unboxing", "voiceover", "talking_head", "ai_twin", "product_demo", "trending_hook", "storytelling"];
  for (let i = 0; i < opts.limit; i++) {
    const p = platforms[i % platforms.length];
    const t = contentTypes[Math.floor(rand() * contentTypes.length)];
    const baseViews = Math.floor(800 + rand() * 80000);
    const likeRate = 0.04 + rand() * 0.08;
    const commentRate = 0.005 + rand() * 0.01;
    const shareRate = 0.01 + rand() * 0.02;
    const saveRate = 0.005 + rand() * 0.015;
    const clickRate = 0.02 + rand() * 0.05;
    const likes = Math.floor(baseViews * likeRate);
    const comments = Math.floor(baseViews * commentRate);
    const shares = Math.floor(baseViews * shareRate);
    const saves = Math.floor(baseViews * saveRate);
    const clicks = Math.floor(baseViews * clickRate);
    const daysAgo = Math.floor(rand() * opts.days);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    out.push({
      id: `demo_perf_${i}`,
      postId: `demo_post_${i}`,
      postSource: "manual",
      brandId: opts.brandId || `brand_demo_${(i % 3) + 1}`,
      brandName: `Demo Brand ${(i % 3) + 1}`,
      platform: p,
      contentType: t,
      views: baseViews,
      likes,
      comments,
      shares,
      saves,
      clicks,
      engagementRate: round(computeEngagementRate(likes, comments, shares, saves, baseViews), 4),
      reach: Math.floor(baseViews * (0.7 + rand() * 0.3)),
      impressions: Math.floor(baseViews * (1.2 + rand() * 0.5)),
      followersGained: Math.floor(baseViews * (0.002 + rand() * 0.008)),
      revenueUsd: round(baseViews * 0.001 * (0.5 + rand()), 2),
      source: "demo",
      capturedAt: d.toISOString(),
    });
  }
  return out.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}

function generateDemoBrandAnalytics(opts: { brandId: string; brandName: string; days: number }): BrandAnalytics {
  const rand = seededRandom(99);
  const contentTypes = ["unboxing", "voiceover", "talking_head", "product_demo", "trending_hook"];
  const platforms: Platform[] = PLATFORMS;
  const totalPosts = Math.floor(40 + rand() * 60);
  const totalPublished = Math.floor(totalPosts * (0.6 + rand() * 0.3));
  const totalScheduled = Math.floor((totalPosts - totalPublished) * (0.3 + rand() * 0.5));
  const totalViews = Math.floor(totalPublished * (5000 + rand() * 25000));
  const totalLikes = Math.floor(totalViews * (0.04 + rand() * 0.04));
  const totalComments = Math.floor(totalViews * (0.005 + rand() * 0.01));
  const totalShares = Math.floor(totalViews * (0.01 + rand() * 0.02));
  const totalClicks = Math.floor(totalViews * (0.02 + rand() * 0.04));
  const averageEngagementRate = totalViews > 0 ? (totalLikes + totalComments + totalShares) / totalViews : 0;

  // Best content types — pick 4 random
  const bestPerformingContentTypes = [...contentTypes]
    .sort(() => rand() - 0.5)
    .slice(0, 4)
    .map((contentType) => {
      const posts = Math.floor(totalPublished * (0.1 + rand() * 0.2));
      const views = Math.floor(posts * (3000 + rand() * 20000));
      return {
        contentType,
        posts,
        avgEngagementRate: round(0.04 + rand() * 0.08, 4),
        totalViews: views,
      };
    })
    .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);

  const bestPerformingPlatforms = platforms
    .map((platform) => {
      const posts = Math.floor(totalPublished * (0.05 + rand() * 0.2));
      const views = Math.floor(posts * (2000 + rand() * 15000));
      return {
        platform,
        posts,
        totalViews: views,
        avgEngagementRate: round(0.04 + rand() * 0.08, 4),
      };
    })
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 5);

  const topPosts = generateDemoContentPerformance({ brandId: opts.brandId, days: opts.days, limit: 5 });

  const totalFollowers = Math.floor(5000 + rand() * 50000);
  const followerGrowth = Math.floor(totalFollowers * (0.02 + rand() * 0.06));
  const followerGrowthPct = followerGrowth / Math.max(1, totalFollowers - followerGrowth);

  return {
    brandId: opts.brandId,
    brandName: opts.brandName,
    totalPosts,
    totalPublished,
    totalScheduled,
    totalDrafts: Math.max(0, totalPosts - totalPublished - totalScheduled),
    totalViews,
    totalLikes,
    totalComments,
    totalShares,
    totalClicks,
    averageEngagementRate: round(averageEngagementRate, 4),
    totalFollowers,
    followerGrowth,
    followerGrowthPct: round(followerGrowthPct, 4),
    bestPerformingContentTypes,
    bestPerformingPlatforms,
    topPosts,
    periodDays: opts.days,
  };
}

function generateDemoPlatformBreakdown(days: number): PlatformBreakdown[] {
  const rand = seededRandom(7);
  const totalPosts = Math.floor(50 + rand() * 200);
  const platforms: PlatformBreakdown[] = PLATFORMS.map((platform, idx) => {
    const posts = Math.floor(totalPosts * (0.05 + rand() * 0.25));
    const views = Math.floor(posts * (1500 + rand() * 25000));
    const likes = Math.floor(views * (0.04 + rand() * 0.06));
    const comments = Math.floor(views * (0.005 + rand() * 0.015));
    const shares = Math.floor(views * (0.01 + rand() * 0.02));
    const saves = Math.floor(views * (0.005 + rand() * 0.015));
    const clicks = Math.floor(views * (0.02 + rand() * 0.04));
    const engagementRate = views > 0 ? (likes + comments + shares + saves) / views : 0;
    const followers = Math.floor(2000 + rand() * 80000);
    const followerGrowth = Math.floor(followers * (0.01 + rand() * 0.04));
    return {
      platform,
      posts,
      views,
      likes,
      comments,
      shares,
      saves,
      clicks,
      engagementRate: round(engagementRate, 4),
      reach: Math.floor(views * 0.85),
      followers,
      followerGrowth,
      averagePostViews: posts > 0 ? Math.round(views / posts) : 0,
      share: round(posts / Math.max(1, totalPosts), 4),
      isTopPerformer: false,
    };
  });
  // Mark top
  const topIdx = platforms.reduce((best, cur, idx) => (cur.engagementRate > platforms[best].engagementRate ? idx : best), 0);
  platforms[topIdx].isTopPerformer = true;
  return platforms;
}

function generateDemoRevenueAnalytics(days: number): RevenueAnalytics {
  const rand = seededRandom(123);
  const totalSubs = Math.floor(20 + rand() * 200);
  const totalAffiliates = Math.floor(5 + rand() * 20);
  // $19 basic, $49 pro, $99 agency, $299 lifetime
  const basic = Math.floor(totalSubs * 0.5);
  const pro = Math.floor(totalSubs * 0.35);
  const agency = Math.floor(totalSubs * 0.1);
  const lifetime = Math.floor(totalSubs * 0.05);
  const stripeRevenue = basic * 19 + pro * 49 + agency * 99;
  const lifetimeDeals = lifetime * 299;
  const affiliateRevenue = totalAffiliates * (50 + rand() * 500);
  const creditsRevenue = Math.floor(rand() * 500);
  const totalRevenue = stripeRevenue + affiliateRevenue + creditsRevenue + lifetimeDeals;
  const projectedMonthly = (totalRevenue / Math.max(1, days)) * 30;
  const projectedAnnual = (totalRevenue / Math.max(1, days)) * 365;

  const bySource = [
    { source: "stripe", amount: round(stripeRevenue, 2), transactionCount: basic + pro + agency, share: round(stripeRevenue / totalRevenue, 4) },
    { source: "affiliate", amount: round(affiliateRevenue, 2), transactionCount: totalAffiliates, share: round(affiliateRevenue / totalRevenue, 4) },
    { source: "lifetime", amount: round(lifetimeDeals, 2), transactionCount: lifetime, share: round(lifetimeDeals / totalRevenue, 4) },
    { source: "credits", amount: round(creditsRevenue, 2), transactionCount: 1, share: round(creditsRevenue / totalRevenue, 4) },
  ].sort((a, b) => b.amount - a.amount);

  const byPlan = [
    { plan: "basic", subscribers: basic, amount: round(basic * 19, 2), share: round((basic * 19) / totalRevenue, 4) },
    { plan: "pro", subscribers: pro, amount: round(pro * 49, 2), share: round((pro * 49) / totalRevenue, 4) },
    { plan: "agency", subscribers: agency, amount: round(agency * 99, 2), share: round((agency * 99) / totalRevenue, 4) },
    { plan: "lifetime", subscribers: lifetime, amount: round(lifetime * 299, 2), share: round((lifetime * 299) / totalRevenue, 4) },
  ].sort((a, b) => b.amount - a.amount);

  const byDay: Array<{ date: string; amount: number; transactionCount: number }> = [];
  const dailyAvg = totalRevenue / Math.max(1, days);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const variance = 0.5 + rand();
    byDay.push({
      date: dayKey(d),
      amount: round(dailyAvg * variance, 2),
      transactionCount: Math.floor(1 + rand() * 5),
    });
  }

  const topAffiliates = Array.from({ length: Math.min(5, totalAffiliates) }, (_, i) => {
    const refs = Math.floor(5 + rand() * 50);
    const subs = Math.floor(refs * (0.2 + rand() * 0.5));
    return {
      affiliateId: `amb_demo_${i}`,
      name: `Demo Affiliate ${i + 1}`,
      email: `affiliate${i + 1}@example.com`,
      referralCode: `ONEPOST${(1000 + i).toString()}`,
      referrals: refs,
      activeSubscribers: subs,
      earnings: round(subs * 49 * 0.1, 2),
      conversionRate: refs > 0 ? round(subs / refs, 4) : 0,
    };
  }).sort((a, b) => b.earnings - a.earnings);

  const recentTransactions: Array<{ id: string; type: string; source: string; amount: number; plan?: string; customerEmail?: string; description?: string; createdAt: string }> = [];
  for (let i = 0; i < 10; i++) {
    const isAff = rand() > 0.7;
    const plan = ["basic", "pro", "agency"][Math.floor(rand() * 3)];
    const amount = isAff ? round(10 + rand() * 200, 2) : ({ basic: 19, pro: 49, agency: 99 }[plan as string] || 49);
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(rand() * days));
    recentTransactions.push({
      id: `txn_demo_${i}`,
      type: isAff ? "affiliate" : "subscription",
      source: isAff ? "affiliate" : "stripe",
      amount,
      plan: isAff ? undefined : plan,
      customerEmail: `user${i}@example.com`,
      description: isAff ? `10% commission` : `${plan} plan — monthly`,
      createdAt: d.toISOString(),
    });
  }
  recentTransactions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    periodDays: days,
    totals: {
      stripeRevenue: round(stripeRevenue, 2),
      affiliateRevenue: round(affiliateRevenue, 2),
      creditsRevenue: round(creditsRevenue, 2),
      lifetimeDeals: round(lifetimeDeals, 2),
      totalRevenue: round(totalRevenue, 2),
      projectedMonthly: round(projectedMonthly, 2),
      projectedAnnual: round(projectedAnnual, 2),
    },
    bySource,
    byPlan,
    byDay,
    topAffiliates,
    recentTransactions,
    source: "demo",
  };
}

function generateDemoOverview(days: number): AnalyticsOverview {
  const rand = seededRandom(2024);
  const totalContentGenerated = Math.floor(40 + rand() * 200);
  const totalPostsScheduled = Math.floor(20 + rand() * 100);
  const totalPostsPublished = Math.floor(totalPostsScheduled * (0.5 + rand() * 0.4));
  const totalViews = Math.floor(50000 + rand() * 500000);
  const totalEngagements = Math.floor(totalViews * (0.06 + rand() * 0.06));
  const totalClicks = Math.floor(totalViews * (0.02 + rand() * 0.04));
  const newFollowers = Math.floor(100 + rand() * 2000);
  const estimatedRevenue = round(totalViews * 0.001 * (0.5 + rand()), 2);
  const postCount = Math.floor(20 + rand() * 80);
  const averageEngagementRate = totalViews > 0 ? totalEngagements / totalViews : 0;
  const averagePostViews = postCount > 0 ? Math.round(totalViews / postCount) : 0;

  const platformShare = PLATFORMS.map((p) => ({ platform: p, share: rand() }));
  const sumShare = platformShare.reduce((a, p) => a + p.share, 0);
  const byPlatform = platformShare
    .map((p) => ({
      platform: p.platform,
      views: Math.floor((p.share / sumShare) * totalViews),
      posts: Math.floor((p.share / sumShare) * postCount),
      share: round(p.share / sumShare, 4),
    }))
    .sort((a, b) => b.views - a.views);

  const contentTypes = ["unboxing", "voiceover", "talking_head", "ai_twin", "product_demo", "trending_hook", "storytelling"];
  const byContentType = contentTypes
    .map((contentType) => {
      const posts = Math.floor(rand() * 15);
      return {
        contentType,
        posts,
        avgEngagement: round(0.04 + rand() * 0.08, 4),
        share: posts / Math.max(1, postCount),
      };
    })
    .filter((c) => c.posts > 0)
    .sort((a, b) => b.avgEngagement - a.avgEngagement);

  const bestPlatform = byPlatform[0]?.platform || "tiktok";
  const bestContentType = byContentType[0]?.contentType || "unboxing";

  const byDay: Array<{ date: string; views: number; engagements: number; posts: number; revenue: number }> = [];
  const dailyViews = totalViews / Math.max(1, days);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const variance = 0.4 + rand() * 1.2;
    byDay.push({
      date: dayKey(d),
      views: Math.floor(dailyViews * variance),
      engagements: Math.floor(dailyViews * variance * 0.08),
      posts: Math.floor(rand() * 3),
      revenue: round(dailyViews * variance * 0.001, 2),
    });
  }

  const topBrands = ["Mellow Sleep", "Aura Beauty", "Luxe Pet"].map((brandName, i) => ({
    brandId: `brand_demo_${i + 1}`,
    brandName,
    views: Math.floor((byPlatform[i % byPlatform.length]?.views || 0) * (0.5 + rand() * 0.5)),
    posts: Math.floor(5 + rand() * 25),
    engagement: round(0.05 + rand() * 0.07, 4),
  })).sort((a, b) => b.views - a.views);

  return {
    periodDays: days,
    totals: {
      contentGenerated: totalContentGenerated,
      postsScheduled: totalPostsScheduled,
      postsPublished: totalPostsPublished,
      totalViews,
      totalEngagements,
      totalClicks,
      newFollowers,
      estimatedRevenue,
    },
    averageEngagementRate: round(averageEngagementRate, 4),
    averagePostViews,
    bestPlatform,
    bestContentType,
    byPlatform,
    byContentType,
    byDay,
    topBrands,
    source: "demo",
  };
}
