import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    let brands: any[] = [];
    try {
      const { execSync } = require("child_process");
      const out = execSync('team-db "SELECT * FROM brands ORDER BY created_at DESC"', { encoding: "utf8" });
      brands = JSON.parse(out);
    } catch (e) {}
    return NextResponse.json({ brands, total: brands.length });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, brandVoice, platforms, scheduleConfig } = body;
    if (!name) return NextResponse.json({ error: "Brand name is required" }, { status: 400 });
    const brand = {
      id: `brand_${Date.now()}`,
      name,
      description: description || "",
      brandVoice: brandVoice || "professional",
      platforms: platforms || ["tiktok", "instagram", "youtube"],
      scheduleConfig: scheduleConfig || { postsPerDay: 3, postEvery: 2, timezone: "EST" },
      createdAt: new Date().toISOString(),
    };
    try {
      const { execSync } = require("child_process");
      execSync(`team-db "INSERT INTO brands (id, user_id, name, description, niche, platform_accounts, created_at) VALUES ('${brand.id}', 'user', '${name.replace(/'/g, "''")}', '${(description || "").replace(/'/g, "''")}', '${(brandVoice || "").replace(/'/g, "''")}', '${JSON.stringify(platforms || []).replace(/'/g, "''")}', datetime('now'))"`, { encoding: "utf8" });
    } catch (e) {}
    return NextResponse.json({ success: true, brand }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description, brandVoice, platforms, scheduleConfig } = body;
    if (!id) return NextResponse.json({ error: "Brand id is required" }, { status: 400 });
    try {
      const { execSync } = require("child_process");
      execSync(`team-db "UPDATE brands SET name='${(name || "").replace(/'/g, "''")}', description='${(description || "").replace(/'/g, "''")}', niche='${(brandVoice || "").replace(/'/g, "''")}', platform_accounts='${JSON.stringify(platforms || []).replace(/'/g, "''")}' WHERE id='${id}'"`, { encoding: "utf8" });
    } catch (e) {}
    return NextResponse.json({ success: true, message: "Brand updated" });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Brand id is required" }, { status: 400 });
    try {
      const { execSync } = require("child_process");
      execSync(`team-db "DELETE FROM brands WHERE id='${id}'"`, { encoding: "utf8" });
    } catch (e) {}
    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}