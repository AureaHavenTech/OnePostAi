// GET /api/optimize/trending/[platform] — Trending topics per platform
// Auth-protected. Powered by GPT-4o.

import { NextRequest, NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { readSessionCookieFromHeader, verifySessionToken } from "@/lib/auth-edge";
import { chatCompletion, isOpenAIConfigured } from "@/lib/openai";

const VALID_PLATFORMS = ["tiktok", "instagram", "youtube", "linkedin", "facebook", "snapchat", "pinterest"];

async function requireAuth(req: NextRequest) {
  const token = readSessionCookieFromHeader(req.headers.get("cookie"));
  if (!token) return null;
  return verifySessionToken(token);
}

type TrendingTopics = {
  platform: string;
  trendingTopics: { name: string; category: string; momentum: string; description: string }[];
  trendingHashtags: { tag: string; postCount: string }[];
  trendingChallenges: { name: string; description: string; participation: string }[];
  trendingFormats: { format: string; why: string }[];
  summary: string;
};

export const GET = withApi(
  {
    method: "GET",
    cache: "short",
    rateLimit: { windowMs: 60_000, max: 30 },
  },
  async (req: NextRequest, _body: any) => {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract platform from URL path (withApi wrapper doesn't forward Next.js params context)
    const segments = req.nextUrl.pathname.split("/");
    const platform = (segments[segments.length - 1] || "tiktok").toLowerCase();

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform: ${platform}. Valid: ${VALID_PLATFORMS.join(", ")}` },
        { status: 400 }
      );
    }

    const ai = await chatCompletion<TrendingTopics>({
      messages: [
        {
          role: "system",
          content: `You are a ${platform} trend analyst for August 2026. Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `List current trending topics, hashtags, challenges, and content formats on ${platform}:

Return JSON:
{
  "platform": "${platform}",
  "trendingTopics": [
    {"name": "topic", "category": "Entertainment|Education|Lifestyle|Tech|Business", "momentum": "Rising|Peak|Declining", "description": "1 sentence"}
  ] (6-10),
  "trendingHashtags": [{"tag": "#trending", "postCount": "e.g. 2.5M posts"}] (5-8),
  "trendingChallenges": [{"name": "challenge", "description": "what people do", "participation": "e.g. 500K+"}] (3-5),
  "trendingFormats": [{"format": "e.g. Green Screen", "why": "why it works"}] (3-5),
  "summary": "2-3 sentence overview"
}`,
        },
      ],
      model: "gpt-4o-mini",
      temperature: 0.85,
      maxTokens: 1200,
      responseFormat: "json_object",
    });

    if (!ai.ok) {
      return NextResponse.json(
        { success: false, error: "Trend data unavailable", platform, aiError: ai.message },
        { status: 503 }
      );
    }

    return {
      success: true,
      ...ai.data,
      aiModel: ai.model,
      aiConfigured: isOpenAIConfigured(),
      generatedAt: new Date().toISOString(),
    };
  }
);
