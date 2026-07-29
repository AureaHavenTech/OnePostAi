// src/lib/services/utility-apis.ts
// OnePost AI — Search, Email Capture, Session Save services
// Single module backing 3 new API routes that the frontend is depending on:
//   - /api/search        — smart search across brands, content, posts, trends, affiliates
//   - /api/email-capture — capture leads (welcome/trial/waitlist) + select email template
//   - /api/session/save  — auto-save chat sessions, conversation state, UI snapshots
//
// All persistence is via team-db. When keys arrive (Resend, Postmark, Algolia),
// the email-capture and search functions swap to live calls without changing
// the response shape.

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
  teamDbExec(`CREATE TABLE IF NOT EXISTS email_captures (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    source TEXT,
    template TEXT,
    plan TEXT,
    metadata TEXT,
    status TEXT DEFAULT 'pending',
    captured_at TEXT DEFAULT (datetime('now'))
  )`);
  teamDbExec(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    session_type TEXT,
    state TEXT,
    metadata TEXT,
    last_active_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  teamDbExec(`CREATE TABLE IF NOT EXISTS search_log (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    user_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  _schemaReady = true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SearchScope = "all" | "brands" | "content" | "posts" | "trends" | "affiliates" | "reports";

export type SearchResult = {
  type: "brand" | "content_item" | "scheduled_post" | "trending_format" | "affiliate" | "trend_report";
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  url?: string;
  relevance: number; // 0..1
  metadata?: Record<string, any>;
};

export type SearchResponse = {
  query: string;
  scope: SearchScope;
  totalResults: number;
  resultsByType: Record<string, number>;
  results: SearchResult[];
  suggestions: string[];
  searchTimeMs: number;
};

export type EmailCapture = {
  id: string;
  email: string;
  name?: string;
  source: string; // "welcome" | "trial" | "waitlist" | "receipt" | "reset" | "manual"
  template: string; // matches designer's email template names
  plan?: string;
  metadata?: Record<string, any>;
  status: "pending" | "sent" | "skipped" | "bounced" | "complained";
  capturedAt: string;
  persisted: boolean;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  preview: string;
  bodyMd: string;
  fromName: string;
  replyTo: string;
  tags: string[];
  category: "welcome" | "trial" | "content" | "receipt" | "reset" | "waitlist" | "marketing" | "transactional";
};

export type SessionState = {
  id: string;
  userId?: string;
  sessionType: "chat" | "editor" | "dashboard" | "calendar" | "onboarding" | "support";
  state: Record<string, any>;
  metadata?: Record<string, any>;
  lastActiveAt: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Smart Search
// ---------------------------------------------------------------------------
function tokenize(s: string): string[] {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}
function score(query: string, haystacks: Array<{ text: string; weight: number }>): number {
  const tokens = tokenize(query);
  if (tokens.length === 0) return 0;
  let totalScore = 0;
  for (const t of tokens) {
    for (const h of haystacks) {
      if (!h.text) continue;
      const lower = String(h.text).toLowerCase();
      if (lower === t) totalScore += h.weight * 2;
      else if (lower.includes(t)) totalScore += h.weight;
    }
  }
  return Math.min(1, totalScore / (tokens.length * 4));
}

export function smartSearch(opts: {
  query: string;
  scope?: SearchScope;
  limit?: number;
  brandId?: string;
  userId?: string;
}): SearchResponse {
  ensureSchema();
  const t0 = Date.now();
  const query = String(opts.query || "").trim();
  const scope: SearchScope = opts.scope || "all";
  const limit = Math.min(50, Math.max(1, opts.limit ?? 25));
  const results: SearchResult[] = [];

  // 1. Brands
  if (scope === "all" || scope === "brands") {
    const brands = teamDbQuery<any>(`SELECT * FROM brands ORDER BY created_at DESC LIMIT 200`);
    for (const b of brands) {
      const r = score(query, [
        { text: b.name, weight: 3 },
        { text: b.description, weight: 2 },
        { text: b.niche, weight: 1.5 },
        { text: b.platform_accounts, weight: 1 },
      ]);
      if (r > 0) {
        results.push({
          type: "brand",
          id: b.id,
          title: b.name,
          subtitle: b.niche || b.description?.slice(0, 100),
          description: b.description,
          url: `/dashboard/brands/${b.id}`,
          relevance: r,
          metadata: { platforms: safeParse(b.platform_accounts, []), createdAt: b.created_at },
        });
      }
    }
  }

  // 2. Content items (drafts + published scripts/captions)
  if (scope === "all" || scope === "content") {
    const items = teamDbQuery<any>(`SELECT * FROM content_items ORDER BY created_at DESC LIMIT 200`);
    for (const c of items) {
      const r = score(query, [
        { text: c.brand, weight: 2 },
        { text: c.prompt, weight: 2 },
        { text: c.script, weight: 1.5 },
        { text: c.hook, weight: 2.5 },
        { text: c.body, weight: 1.5 },
        { text: c.cta, weight: 1 },
        { text: c.captions, weight: 1 },
        { text: c.hashtags, weight: 1 },
      ]);
      if (r > 0) {
        const captions = safeParse(c.captions, {});
        const hashtags = safeParse(c.hashtags, []);
        results.push({
          type: "content_item",
          id: c.id,
          title: (c.hook || c.prompt || "Untitled").slice(0, 120),
          subtitle: c.brand,
          description: (c.script || c.body || "").slice(0, 200),
          url: `/dashboard/content/${c.id}`,
          relevance: r,
          metadata: {
            status: c.status,
            platform: c.music_style,
            durationSec: c.duration_seconds,
            hashtags,
            captions,
            createdAt: c.created_at,
          },
        });
      }
    }
  }

  // 3. Scheduled posts
  if (scope === "all" || scope === "posts") {
    const posts = teamDbQuery<any>(`SELECT * FROM scheduled_posts ORDER BY scheduled_for DESC LIMIT 200`);
    for (const p of posts) {
      const r = score(query, [
        { text: p.brand_id, weight: 1 },
        { text: p.content_type, weight: 2 },
        { text: p.platform, weight: 2 },
        { text: p.script, weight: 1.5 },
        { text: p.caption, weight: 2 },
        { text: p.hashtags, weight: 1.5 },
      ]);
      if (r > 0) {
        results.push({
          type: "scheduled_post",
          id: p.id,
          title: p.caption?.slice(0, 120) || `${p.content_type} on ${p.platform}`,
          subtitle: `${p.platform} • ${p.status}`,
          description: p.script?.slice(0, 200),
          url: `/dashboard/calendar?post=${p.id}`,
          relevance: r,
          metadata: {
            brandId: p.brand_id,
            contentType: p.content_type,
            platform: p.platform,
            status: p.status,
            scheduledFor: p.scheduled_for,
          },
        });
      }
    }
  }

  // 4. Trending formats
  if (scope === "all" || scope === "trends") {
    const trends = teamDbQuery<any>(`SELECT * FROM trending_formats WHERE expires_at > datetime('now') ORDER BY growth_score DESC LIMIT 100`);
    for (const t of trends) {
      const r = score(query, [
        { text: t.title, weight: 3 },
        { text: t.description, weight: 2 },
        { text: t.format_type, weight: 2.5 },
        { text: t.platform, weight: 2 },
        { text: t.hook_pattern, weight: 2 },
        { text: t.hashtag_cluster, weight: 1 },
        { text: t.niche, weight: 1.5 },
      ]);
      if (r > 0) {
        const cluster = safeParse(t.hashtag_cluster, []);
        results.push({
          type: "trending_format",
          id: t.id,
          title: t.title,
          subtitle: `${t.platform} • ${t.format_type}`,
          description: t.description,
          url: `/dashboard/trends?format=${t.id}`,
          relevance: r,
          metadata: {
            platform: t.platform,
            formatType: t.format_type,
            growthScore: t.growth_score,
            viewCount: t.view_count,
            hashtags: cluster,
            typicalDurationSec: t.typical_duration_sec,
          },
        });
      }
    }
  }

  // 5. Affiliates
  if (scope === "all" || scope === "affiliates") {
    const affs = teamDbQuery<any>(`SELECT * FROM affiliates ORDER BY earnings DESC LIMIT 100`);
    for (const a of affs) {
      const r = score(query, [
        { text: a.name, weight: 3 },
        { text: a.email, weight: 2 },
        { text: a.referral_code, weight: 2.5 },
        { text: a.status, weight: 1 },
      ]);
      if (r > 0) {
        results.push({
          type: "affiliate",
          id: a.id,
          title: a.name,
          subtitle: a.email,
          description: `Code: ${a.referral_code} • ${a.referrals || 0} referrals • $${(a.earnings || 0).toFixed(2)} earned`,
          url: `/dashboard/affiliates/${a.id}`,
          relevance: r,
          metadata: {
            email: a.email,
            referralCode: a.referral_code,
            referrals: a.referrals || 0,
            activeSubscribers: a.active_subscribers || 0,
            earnings: a.earnings || 0,
            status: a.status,
          },
        });
      }
    }
  }

  // 6. Trend reports
  if (scope === "all" || scope === "reports") {
    const reports = teamDbQuery<any>(`SELECT * FROM trend_reports ORDER BY generated_at DESC LIMIT 50`);
    for (const r of reports) {
      const s = score(query, [
        { text: r.niche, weight: 3 },
        { text: r.summary, weight: 2 },
        { text: r.recommendations, weight: 1.5 },
      ]);
      if (s > 0) {
        results.push({
          type: "trend_report",
          id: r.id,
          title: `Trend Report: ${r.niche}`,
          subtitle: r.generated_at,
          description: (r.summary || "").slice(0, 200),
          url: `/dashboard/trends/report/${r.id}`,
          relevance: s,
          metadata: { niche: r.niche, topFormats: safeParse(r.top_formats, []), topHooks: safeParse(r.top_hooks, []), generatedAt: r.generated_at },
        });
      }
    }
  }

  // Optional brand filter
  const filtered = opts.brandId
    ? results.filter((r) => {
        if (r.type === "brand") return r.id === opts.brandId;
        const m = r.metadata || {};
        return m.brandId === opts.brandId;
      })
    : results;

  // Sort by relevance desc
  filtered.sort((a, b) => b.relevance - a.relevance);

  // Cap to limit
  const capped = filtered.slice(0, limit);

  // Build counts
  const counts: Record<string, number> = {};
  for (const r of capped) counts[r.type] = (counts[r.type] || 0) + 1;

  // Suggestions (did you mean) — extract unique tokens from top results
  const suggestions: string[] = [];
  const seen = new Set<string>();
  for (const r of capped) {
    for (const t of tokenize(r.title + " " + (r.subtitle || ""))) {
      if (!seen.has(t) && tokenize(query).indexOf(t) === -1) {
        seen.add(t);
        suggestions.push(t);
        if (suggestions.length >= 5) break;
      }
    }
    if (suggestions.length >= 5) break;
  }

  // Log the search
  if (query) {
    const id = uid("search");
    teamDbExec(
      `INSERT INTO search_log (id, query, result_count, user_id) VALUES ('${esc(id)}', '${esc(query)}', ${capped.length}, '${esc(opts.userId || "")}')`
    );
  }

  return {
    query,
    scope,
    totalResults: capped.length,
    resultsByType: counts,
    results: capped,
    suggestions,
    searchTimeMs: Date.now() - t0,
  };
}

function safeParse(s: any, fb: any) {
  if (!s) return fb;
  try {
    return typeof s === "string" ? JSON.parse(s) : s;
  } catch {
    return fb;
  }
}

// ---------------------------------------------------------------------------
// Email Templates
// ---------------------------------------------------------------------------
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome: {
    id: "welcome",
    name: "Welcome to OnePost AI",
    subject: "Welcome to OnePost AI — your content engine is ready ✨",
    preview: "Get from idea to published in minutes. Here's your quick start.",
    bodyMd: `# Welcome to OnePost AI ✨\n\nHi {{name}},\n\nYou're in. Your OnePost AI workspace is live and your 7-platform publishing pipeline is ready.\n\n## Quick start\n1. **Create your first brand** — /dashboard/brands\n2. **Open the chat** — describe a piece of content ("15s unboxing for TikTok + IG")\n3. **Set the schedule** — say "every 2 days at 7 PM" and we run it forever\n\nWe'll never make you stitch together 5 apps again.\n\n— The OnePost AI team`,
    fromName: "OnePost AI",
    replyTo: "hello@onepost.ai",
    tags: ["onboarding", "welcome", "transactional"],
    category: "welcome",
  },
  trial: {
    id: "trial",
    name: "Trial started",
    subject: "Your Pro trial is live — 14 days, every feature unlocked",
    preview: "You've got the full Pro tier for 14 days. Here's what's now in your hands.",
    bodyMd: `# Your Pro trial is live 🚀\n\nHi {{name}},\n\nFor the next 14 days you have full access to:\n- Unlimited AI content generation across 7 content types\n- Multi-brand scheduling (up to 5 brands)\n- AI avatar / AI twin generation\n- Trend scraping + viral hook analysis\n- Priority queue (faster generation)\n\nSet a calendar reminder for day 12 — we'll send a check-in.\n\n— The OnePost AI team`,
    fromName: "OnePost AI",
    replyTo: "hello@onepost.ai",
    tags: ["trial", "transactional"],
    category: "trial",
  },
  content: {
    id: "content",
    name: "Content ready",
    subject: "Your content is ready to review",
    preview: "New content was generated and is ready for your review.",
    bodyMd: `# Content ready for review ✍️\n\nHi {{name}},\n\nWe just finished generating **{{contentType}}** for **{{brand}}**.\n\n{{preview}}\n\n[Open the editor →]({{url}})\n\n— OnePost AI`,
    fromName: "OnePost AI",
    replyTo: "hello@onepost.ai",
    tags: ["content", "notification"],
    category: "content",
  },
  receipt: {
    id: "receipt",
    name: "Payment receipt",
    subject: "Receipt — {{plan}} ({{amount}})",
    preview: "Payment confirmed. Your {{plan}} is active.",
    bodyMd: `# Payment received ✅\n\nHi {{name}},\n\n**{{amount}}** charged to your card on file for the **{{plan}}** plan.\n\nYour invoice: {{invoiceUrl}}\n\nManage your subscription anytime at /dashboard/settings/billing.\n\n— OnePost AI`,
    fromName: "OnePost AI Billing",
    replyTo: "billing@onepost.ai",
    tags: ["receipt", "billing", "transactional"],
    category: "receipt",
  },
  reset: {
    id: "reset",
    name: "Password reset",
    subject: "Reset your OnePost AI password",
    preview: "Click the link to reset. Link expires in 1 hour.",
    bodyMd: `# Reset your password 🔐\n\nHi {{name}},\n\nClick below to reset your password. This link expires in 1 hour.\n\n[Reset password →]({{resetUrl}})\n\nIf you didn't request this, ignore this email — your password is unchanged.\n\n— OnePost AI`,
    fromName: "OnePost AI",
    replyTo: "support@onepost.ai",
    tags: ["reset", "security", "transactional"],
    category: "reset",
  },
  waitlist: {
    id: "waitlist",
    name: "Waitlist confirmation",
    subject: "You're on the OnePost AI waitlist",
    preview: "We'll email you the moment a spot opens up.",
    bodyMd: `# You're on the list 🎉\n\nHi {{name}},\n\nThanks for joining the OnePost AI waitlist. We'll email you the moment a spot opens up.\n\nWant to skip the line? Share your referral link: {{referralUrl}}\n\n— The OnePost AI team`,
    fromName: "OnePost AI",
    replyTo: "hello@onepost.ai",
    tags: ["waitlist", "marketing"],
    category: "waitlist",
  },
};

export function listEmailTemplates(): EmailTemplate[] {
  return Object.values(EMAIL_TEMPLATES);
}

export function getEmailTemplate(id: string): EmailTemplate | null {
  return EMAIL_TEMPLATES[String(id || "").toLowerCase()] || null;
}

export function renderEmailTemplate(id: string, vars: Record<string, any> = {}): { subject: string; body: string; html: string; fromName: string; replyTo: string } | null {
  const t = getEmailTemplate(id);
  if (!t) return null;
  const fill = (s: string) =>
    String(s).replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
  const subject = fill(t.subject);
  const body = fill(t.bodyMd);
  // Naive markdown → HTML for email body
  const html = body
    .replace(/^# (.*)$/gm, "<h1 style=\"font-family:Playfair Display,serif;color:#c9a96e;margin:0 0 16px\">$1</h1>")
    .replace(/^## (.*)$/gm, "<h2 style=\"font-family:Playfair Display,serif;color:#e8e0d4;margin:24px 0 8px\">$1</h2>")
    .replace(/^### (.*)$/gm, "<h3 style=\"font-family:Inter,sans-serif;color:#e8e0d4;margin:16px 0 4px\">$1</h3>")
    .replace(/^\- (.*)$/gm, "<li style=\"margin:4px 0\">$1</li>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#c9a96e;text-decoration:underline">$1</a>')
    .replace(/\n\n/g, "</p><p style=\"margin:12px 0;line-height:1.6\">")
    .replace(/^(?!<[a-z])(.*)/, "<p style=\"margin:12px 0;line-height:1.6\">$1");
  return { subject, body, html, fromName: t.fromName, replyTo: t.replyTo };
}

// ---------------------------------------------------------------------------
// Email capture
// ---------------------------------------------------------------------------
export function captureEmail(input: {
  email: string;
  name?: string;
  source?: string;       // "landing" | "pricing" | "checkout" | "manual" | "import"
  template?: string;     // which template to send (auto-resolved from source if omitted)
  plan?: string;         // e.g. "pro" for trial template
  metadata?: Record<string, any>;
  userId?: string;       // for already-registered users
  sendNow?: boolean;     // if true, also mark status="sent" (real send is via webhook)
}): { capture: EmailCapture; template: EmailTemplate | null; rendered: { subject: string; body: string; html: string; fromName: string; replyTo: string } | null } {
  ensureSchema();
  const email = String(input.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      capture: {
        id: "",
        email,
        name: input.name,
        source: input.source || "manual",
        template: "",
        plan: input.plan,
        status: "pending",
        capturedAt: nowIso(),
        persisted: false,
      },
      template: null,
      rendered: null,
    };
  }

  // Auto-resolve template from source
  const source = String(input.source || "manual").toLowerCase();
  const sourceToTemplate: Record<string, string> = {
    landing: "welcome",
    pricing: "welcome",
    signup: "welcome",
    welcome: "welcome",
    trial: "trial",
    checkout: "trial",
    content: "content",
    receipt: "receipt",
    billing: "receipt",
    reset: "reset",
    forgot: "reset",
    waitlist: "waitlist",
    manual: "welcome",
  };
  const templateId = String(input.template || sourceToTemplate[source] || "welcome").toLowerCase();
  const template = getEmailTemplate(templateId);

  const id = uid("email");
  const status = input.sendNow ? "sent" : "pending";
  const persisted = teamDbExec(
    `INSERT INTO email_captures (id, email, name, source, template, plan, metadata, status) VALUES (
      '${esc(id)}', '${esc(email)}', '${esc(input.name || "")}', '${esc(source)}', '${esc(templateId)}',
      '${esc(input.plan || "")}', '${esc(JSON.stringify(input.metadata || {}))}', '${esc(status)}'
    )`
  );

  // Render with captured vars
  const rendered = template
    ? renderEmailTemplate(templateId, {
        name: input.name || "there",
        brand: input.metadata?.brand || "your brand",
        contentType: input.metadata?.contentType || "video",
        plan: input.plan || template.category,
        amount: input.metadata?.amount || "$0",
        invoiceUrl: input.metadata?.invoiceUrl || "/dashboard/settings/billing",
        resetUrl: input.metadata?.resetUrl || "/reset?token=" + id,
        referralUrl: input.metadata?.referralUrl || "https://onepost.ai/?ref=" + id,
        url: input.metadata?.url || "/dashboard",
        preview: input.metadata?.preview || "",
      })
    : null;

  return {
    capture: {
      id,
      email,
      name: input.name,
      source,
      template: templateId,
      plan: input.plan,
      metadata: input.metadata,
      status: status as EmailCapture["status"],
      capturedAt: nowIso(),
      persisted,
    },
    template,
    rendered,
  };
}

export function listEmailCaptures(opts: { email?: string; source?: string; limit?: number } = {}): EmailCapture[] {
  ensureSchema();
  const limit = Math.min(500, Math.max(1, opts.limit ?? 100));
  const conditions: string[] = [];
  if (opts.email) conditions.push(`email = '${esc(opts.email.toLowerCase())}'`);
  if (opts.source) conditions.push(`source = '${esc(opts.source)}'`);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = teamDbQuery<any>(`SELECT * FROM email_captures ${where} ORDER BY captured_at DESC LIMIT ${limit}`);
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    source: r.source,
    template: r.template,
    plan: r.plan,
    metadata: safeParse(r.metadata, {}),
    status: r.status as EmailCapture["status"],
    capturedAt: r.captured_at,
    persisted: true,
  }));
}

export function markEmailStatus(id: string, status: EmailCapture["status"]): { success: boolean; persisted: boolean } {
  ensureSchema();
  const persisted = teamDbExec(`UPDATE email_captures SET status = '${esc(status)}' WHERE id = '${esc(id)}'`);
  return { success: true, persisted };
}

// ---------------------------------------------------------------------------
// Session save
// ---------------------------------------------------------------------------
export function saveSession(input: {
  sessionId?: string;
  userId?: string;
  sessionType?: SessionState["sessionType"];
  state?: Record<string, any>;
  metadata?: Record<string, any>;
}): SessionState {
  ensureSchema();
  const sessionType = input.sessionType || "chat";
  const id = input.sessionId || uid("sess");
  const now = nowIso();

  // Upsert: if id exists, update; else insert
  const existing = teamDbQuery<any>(`SELECT id FROM sessions WHERE id = '${esc(id)}' LIMIT 1`);
  let persisted = false;
  if (existing.length > 0) {
    persisted = teamDbExec(
      `UPDATE sessions SET user_id='${esc(input.userId || "")}', session_type='${esc(sessionType)}',
        state='${esc(JSON.stringify(input.state || {}))}', metadata='${esc(JSON.stringify(input.metadata || {}))}',
        last_active_at='${now}' WHERE id='${esc(id)}'`
    );
  } else {
    persisted = teamDbExec(
      `INSERT INTO sessions (id, user_id, session_type, state, metadata, last_active_at, created_at) VALUES (
        '${esc(id)}', '${esc(input.userId || "")}', '${esc(sessionType)}',
        '${esc(JSON.stringify(input.state || {}))}', '${esc(JSON.stringify(input.metadata || {}))}',
        '${now}', '${now}'
      )`
    );
  }

  return {
    id,
    userId: input.userId,
    sessionType,
    state: input.state || {},
    metadata: input.metadata,
    lastActiveAt: now,
    createdAt: now,
  };
}

export function loadSession(id: string): SessionState | null {
  ensureSchema();
  const rows = teamDbQuery<any>(`SELECT * FROM sessions WHERE id = '${esc(id)}' LIMIT 1`);
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id,
    userId: r.user_id || undefined,
    sessionType: r.session_type,
    state: safeParse(r.state, {}),
    metadata: safeParse(r.metadata, {}),
    lastActiveAt: r.last_active_at,
    createdAt: r.created_at,
  };
}

export function listSessions(opts: { userId?: string; sessionType?: string; limit?: number } = {}): SessionState[] {
  ensureSchema();
  const limit = Math.min(200, Math.max(1, opts.limit ?? 50));
  const conditions: string[] = [];
  if (opts.userId) conditions.push(`user_id = '${esc(opts.userId)}'`);
  if (opts.sessionType) conditions.push(`session_type = '${esc(opts.sessionType)}'`);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = teamDbQuery<any>(`SELECT * FROM sessions ${where} ORDER BY last_active_at DESC LIMIT ${limit}`);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id || undefined,
    sessionType: r.session_type,
    state: safeParse(r.state, {}),
    metadata: safeParse(r.metadata, {}),
    lastActiveAt: r.last_active_at,
    createdAt: r.created_at,
  }));
}

export function deleteSession(id: string): { success: boolean; persisted: boolean } {
  ensureSchema();
  const persisted = teamDbExec(`DELETE FROM sessions WHERE id = '${esc(id)}'`);
  return { success: true, persisted };
}
