import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const brandId = new URL(req.url).pathname.split("/")[4];
    if (!brandId) return NextResponse.json({ error: "Brand ID required" }, { status: 400 });
    let content: any[] = [];
    try {
      const { execSync } = require("child_process");
      const out = execSync(`team-db "SELECT * FROM content_items WHERE brand='${brandId.replace(/'/g, "''")}' ORDER BY created_at DESC LIMIT 50"`, { encoding: "utf8" });
      content = JSON.parse(out);
    } catch (e) {}
    return NextResponse.json({ brandId, content, total: content.length });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const brandId = new URL(req.url).pathname.split("/")[4];
    const body = await req.json();
    if (!brandId || !body.prompt) return NextResponse.json({ error: "Brand ID and prompt required" }, { status: 400 });
    const { generateContent } = await import("@/lib/services/backend");
    const result = await generateContent({ brandName: brandId, prompt: body.prompt, platforms: body.platform ? [body.platform] : [], tone: body.tone || "conversational" });
    const r = result as any;
    let contentId = "";
    try {
      const { execSync } = require("child_process");
      contentId = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      execSync(`team-db "INSERT INTO content_items (id, brand, prompt, script, captions, hashtags, status) VALUES ('${contentId}', '${brandId.replace(/'/g, "''")}', '${body.prompt.replace(/'/g, "''")}', '${(r.script || "").replace(/'/g, "''")}', '${JSON.stringify(r.captions || {}).replace(/'/g, "''")}', '${JSON.stringify(r.hashtags || {}).replace(/'/g, "''")}', 'generated')"`, { encoding: "utf8" });
    } catch (e) { contentId = `cnt_${Date.now()}`; }
    if (body.schedule) {
      const { generateSchedule } = await import("@/lib/services/backend");
      r.schedule = generateSchedule({ brandName: brandId, platforms: body.schedule.platforms || ["tiktok", "instagram"], postsPerDay: body.schedule.postsPerDay || 3, startDate: new Date(), durationDays: body.schedule.durationDays || 7 });
    }
    return NextResponse.json({ success: true, brandId, content: r, contentId }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}