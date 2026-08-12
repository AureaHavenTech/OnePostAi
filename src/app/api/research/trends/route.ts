// POST /api/research/trends — AI-synthesized trend intelligence
// Auth-protected. GPT-4o generates trending data for any niche/platform.

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
      query,
      platforms = ["tiktok", "instagram"],
      contentType = "hashtags",
    } = body || {};

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json({
        success: true,
        query,
        aiConfigured: false,
        message: "OpenAI API key not configured. Add OPENAI_API_KEY to enable trend intelligence.",
        trends: [],
      });
    }

    const platformList = Array.isArray(platforms) ? platforms.join(", ") : platforms;
    const prompt = `You are a social media trend analyst. Research current trends for: "${query}"

Platforms: ${platformList}
Content Type Requested: ${contentType}

Return a JSON object with this exact structure:
{
  "query": "${query}",
  "platforms": ["..."],
  "hashtags": [
    { "tag": "string", "relevance": 85, "reach": "high|medium|low", "trending": true|false }
  ],
  "topics": [
    { "topic": "string", "momentum": "rising|peak|declining", "description": "string" }
  ],
  "sounds": [
    { "name": "string", "platform": "tiktok|instagram", "category": "string" }
  ],
  "creators": [
    { "name": "string", "niche": "string", "followerRange": "string" }
  ],
  "insightSummary": "2-3 sentence strategic insight about these trends"
}

Generate 3-5 items per array. Be specific and realistic.`;

    const result = await chatCompletion<Record<string, unknown>>({
        messages: [
          { role: "system", content: "You are an expert social media trend analyst. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        maxTokens: 800,
        responseFormat: "json_object",
      });
      const trends = result.ok ? result.data : {};
return NextResponse.json({
      success: true,
      aiConfigured: true,
      ...trends,
    });
  } catch (e: any) {
    console.error("[research/trends] error:", e);
    return NextResponse.json(
      { error: "TRENDS_FAILED", message: "Could not generate trend data. Try a different query." },
      { status: 500 }
    );
  }
}
