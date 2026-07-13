import { NextResponse, NextRequest } from "next/server";
import { withApi } from "@/lib/api-utils";

// Simple in-memory + team-db-backed cache for brands (rarely changes within a session).
let brandsCache: { data: any[]; ts: number } | null = null;
const CACHE_TTL_MS = 30_000;

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

function invalidateBrandsCache() { brandsCache = null; }

export const GET = withApi(
  {
    method: "GET",
    cache: "short", // 30s; backed by in-memory cache too
    rateLimit: { windowMs: 60_000, max: 120 },
  },
  async () => {
    const now = Date.now();
    if (!brandsCache || now - brandsCache.ts > CACHE_TTL_MS) {
      brandsCache = { data: teamDbQuery("SELECT * FROM brands ORDER BY created_at DESC"), ts: now };
    }
    return { brands: brandsCache.data, total: brandsCache.data.length, cached: true };
  }
);

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
    validate: (b) => (!b?.name ? "Brand name is required" : true),
  },
  async (req, body) => {
    const { name, description, brandVoice, platforms, scheduleConfig } = body;
    const brand = {
      id: `brand_${Date.now()}`,
      name,
      description: description || "",
      brandVoice: brandVoice || "professional",
      platforms: platforms || ["tiktok", "instagram", "youtube"],
      scheduleConfig: scheduleConfig || { postsPerDay: 3, postEvery: 2, timezone: "EST" },
      createdAt: new Date().toISOString(),
    };
    const persisted = teamDbExec(
      `INSERT INTO brands (id, user_id, name, description, niche, platform_accounts, created_at) VALUES ('${esc(brand.id)}', 'user', '${esc(brand.name)}', '${esc(brand.description)}', '${esc(brand.brandVoice)}', '${esc(JSON.stringify(brand.platforms))}', datetime('now'))`
    );
    invalidateBrandsCache();
    return NextResponse.json({ success: true, brand, persisted }, { status: 201 });
  }
);

export const PUT = withApi(
  {
    method: "PUT",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
    validate: (b) => (!b?.id ? "Brand id is required" : true),
  },
  async (req, body) => {
    const { id, name, description, brandVoice, platforms } = body;
    const persisted = teamDbExec(
      `UPDATE brands SET name='${esc(name || "")}', description='${esc(description || "")}', niche='${esc(brandVoice || "")}', platform_accounts='${esc(JSON.stringify(platforms || []))}' WHERE id='${esc(id)}'`
    );
    invalidateBrandsCache();
    return { success: true, message: "Brand updated", persisted };
  }
);

export const DELETE = withApi(
  {
    method: "DELETE",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
    validate: (b) => (!b?.id ? "Brand id is required" : true),
  },
  async (req, body) => {
    const id = body?.id;
    const persisted = teamDbExec(`DELETE FROM brands WHERE id='${esc(id)}'`);
    invalidateBrandsCache();
    return { success: true, message: "Brand deleted", persisted };
  }
);
