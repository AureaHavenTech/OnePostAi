// POST /api/research/competitors — Analyze competitor content strategy
// Auth-protected. Scrapes competitor URL + GPT-4o competitive analysis.

import { NextRequest, NextResponse } from "next/server";
import { readSessionCookieFromHeader, verifySessionToken } from "@/lib/auth-edge";
import { chatCompletion, isOpenAIConfigured } from "@/lib/openai";

async function requireAuth(req: NextRequest) {
  const token = readSessionCookieFromHeader(req.headers.get("cookie"));
  if (!token) return null;
  return verifySessionToken(token);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      competitorUrl,
      platforms = ["tiktok", "instagram"],
      niche,
    } = body || {};

    if (!competitorUrl) {
      return NextResponse.json({ error: "competitorUrl is required" }, { status: 400 });
    }

    // Attempt to scrape competitor URL
    let scrapedContent = "";
    try {
      const res = await fetch(competitorUrl, {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "OnePostAI/1.0 Research Bot" },
      });
      const html = await res.text();
      scrapedContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);
    } catch {
      // Scraping failed — AI will still provide analysis based on URL
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json({
        success: true,
        aiConfigured: false,
        message: "OpenAI API key not configured.",
      });
    }

    const prompt = `Analyze this competitor's content strategy:

Competitor URL: ${competitorUrl}
${niche ? `Niche: ${niche}` : ""}
Platforms to analyze: ${Array.isArray(platforms) ? platforms.join(", ") : platforms}
${scrapedContent ? `Scraped content (excerpt): ${scrapedContent.substring(0, 2000)}` : "(Could not scrape — analyze based on URL alone)"}

Return a JSON object with:
{
  "competitorUrl": "${competitorUrl}",
  "contentThemes": ["theme1", "theme2", ...] — 3-5 main content themes
  "postingFrequency": "estimated posting frequency",
  "topContentTypes": ["reels", "carousels", ...],
  "engagementPatterns": "analysis of engagement patterns",
  "strengths": ["strength1", ...] — 2-3 strengths
  "gaps": ["gap1", ...] — 2-3 gaps or weaknesses
  "recommendations": ["rec1", ...] — 3-5 strategic recommendations
  "oneLineTakeaway": "single sentence strategic insight"
}`;

    const result = await chatCompletion([
      { role: "system", content: "You are a competitive content strategist. Return only valid JSON." },
      { role: "user", content: prompt },
    ], { temperature: 0.6, maxTokens: 700 });

    const analysis = JSON.parse(result.content || "{}");

    return NextResponse.json({
      success: true,
      aiConfigured: true,
      ...analysis,
    });
  } catch (e: any) {
    console.error("[research/competitors] error:", e);
    return NextResponse.json(
      { error: "COMPETITOR_ANALYSIS_FAILED", message: "Could not analyze competitor." },
      { status: 500 }
    );
  }
}
