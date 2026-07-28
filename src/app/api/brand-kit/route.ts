// /api/brand-kit — CRUD for brand kits (colors, fonts, music, voice, platforms).
// Required by /dashboard/brand-kit page; was missing and caused site-wide console
// errors. Persists to team-db (Turso). 30s in-memory cache to reduce DB reads.
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";

// ---- team-db helpers (same pattern as /api/brands) ----
let _schemaReady = false;
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
function esc(v: any): string { return String(v ?? "").replace(/'/g, "''"); }

async function ensureSchema() {
  if (_schemaReady) return;
  teamDbExec(
    "CREATE TABLE IF NOT EXISTS brand_kits (id TEXT PRIMARY KEY, user_id TEXT DEFAULT 'user', name TEXT NOT NULL, description TEXT DEFAULT '', colors TEXT DEFAULT '{}', fonts TEXT DEFAULT '{}', music TEXT DEFAULT '{}', voice TEXT DEFAULT 'professional', platforms TEXT DEFAULT '[]', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))"
  );
  _schemaReady = true;
}

// ---- in-memory cache (30s TTL) ----
type Cache = { data: any[]; ts: number };
const CACHE_TTL_MS = 30_000;
let _cache: Cache | null = null;
function invalidateCache() { _cache = null; }

function rowToKit(r: any) {
  // Parse JSON columns safely
  const safeParse = (s: any, fb: any) => {
    if (!s) return fb;
    try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return fb; }
  };
  return {
    id: r.id,
    name: r.name,
    description: r.description || "",
    colors: safeParse(r.colors, { primary: "#c9a96e", secondary: "#e8e0d4", accent: "#d4a0a0" }),
    fonts: safeParse(r.fonts, { heading: "Playfair Display", body: "Inter" }),
    music: safeParse(r.music, { genre: "pop", mood: "upbeat" }),
    voice: r.voice || "professional",
    platforms: safeParse(r.platforms, ["tiktok", "instagram", "youtube"]),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s server cache; in-memory cache below
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async () => {
    await ensureSchema();
    const now = Date.now();
    if (!_cache || now - _cache.ts > CACHE_TTL_MS) {
      const rows = teamDbQuery("SELECT * FROM brand_kits ORDER BY created_at DESC");
      _cache = { data: rows.map(rowToKit), ts: now };
    }
    // Frontend expects: { data: BrandKit[] }
    return { data: _cache.data, total: _cache.data.length, cached: true };
  }
);

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
    validate: (b) => (!b?.name ? "name is required" : true),
  },
  async (req, body) => {
    await ensureSchema();
    const id = body.id || `kit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const colors = body.colors || { primary: "#c9a96e", secondary: "#e8e0d4", accent: "#d4a0a0" };
    const fonts = body.fonts || { heading: "Playfair Display", body: "Inter" };
    const music = body.music || { genre: "pop", mood: "upbeat" };
    const voice = body.voice || "professional";
    const platforms = Array.isArray(body.platforms) ? body.platforms : ["tiktok", "instagram", "youtube"];
    const description = body.description || "";
    const persisted = teamDbExec(
      `INSERT OR REPLACE INTO brand_kits (id, user_id, name, description, colors, fonts, music, voice, platforms, created_at, updated_at) VALUES ('${esc(id)}', 'user', '${esc(body.name)}', '${esc(description)}', '${esc(JSON.stringify(colors))}', '${esc(JSON.stringify(fonts))}', '${esc(JSON.stringify(music))}', '${esc(voice)}', '${esc(JSON.stringify(platforms))}', datetime('now'), datetime('now'))`
    );
    invalidateCache();
    return NextResponse.json({ success: true, brandKit: { id, name: body.name, description, colors, fonts, music, voice, platforms }, persisted }, { status: 201 });
  }
);
