// /api/brand-kit/[id] — PUT (update) and DELETE (remove) for a single brand kit.
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";

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

export const DELETE = withApi(
  {
    method: "DELETE",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
  },
  async (req, body) => {
    // id can come from URL path or body
    const url = new URL(req.url);
    const idFromPath = url.pathname.split("/").filter(Boolean).pop();
    const id = body?.id || idFromPath;
    if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    const persisted = teamDbExec(`DELETE FROM brand_kits WHERE id='${esc(id)}'`);
    return { success: true, message: "Brand kit deleted", id, persisted };
  }
);

export const PUT = withApi(
  {
    method: "PUT",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
  },
  async (req, body) => {
    const url = new URL(req.url);
    const idFromPath = url.pathname.split("/").filter(Boolean).pop();
    const id = body?.id || idFromPath;
    if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    const colors = body.colors ? JSON.stringify(body.colors) : null;
    const fonts = body.fonts ? JSON.stringify(body.fonts) : null;
    const music = body.music ? JSON.stringify(body.music) : null;
    const platforms = Array.isArray(body.platforms) ? JSON.stringify(body.platforms) : null;
    const sets: string[] = [];
    if (body.name !== undefined) sets.push(`name='${esc(body.name)}'`);
    if (body.description !== undefined) sets.push(`description='${esc(body.description)}'`);
    if (colors) sets.push(`colors='${esc(colors)}'`);
    if (fonts) sets.push(`fonts='${esc(fonts)}'`);
    if (music) sets.push(`music='${esc(music)}'`);
    if (body.voice !== undefined) sets.push(`voice='${esc(body.voice)}'`);
    if (platforms) sets.push(`platforms='${esc(platforms)}'`);
    sets.push("updated_at=datetime('now')");
    if (sets.length === 1) return { success: true, message: "Nothing to update" };
    const persisted = teamDbExec(`UPDATE brand_kits SET ${sets.join(", ")} WHERE id='${esc(id)}'`);
    return { success: true, message: "Brand kit updated", id, persisted };
  }
);
