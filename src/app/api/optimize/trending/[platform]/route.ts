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
  async (req: NextRequest, _body: any, ctx: { params?: Promise<{ platform: string }> }) => {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve platform from dynamic route params
    let platform = "tiktok";
    if (ctx?.params) {
      const params = ctx.params instanceof Promise ? await ctx.params : ctx.params;
      platform = (params as any).platform?.toLowerCase() || "tiktok";
    }

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
          content: `You are a ${platform} trend analyst for August 2026.
You track real-time trending topics, hashtags, challenges, and content formats.
Provide accurate, current trend data. Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `List the current trending topics, hashtags, challenges, and content formats on ${platform}:

Return JSON:
{
  "platform": "${platform}",
  "trendingTopics": [
    {"name": "topic name", "category": "Entertainment|Education|Lifestyle|Tech|Business", "momentum": "Rising|Peak|Declining", "description": "1 sentence"}
  ] (6-10 topics),
  "trendingHashtags": [
    {"tag": "#trending", "postCount": "e.g. 2.5M posts"}
  ] (5-8 hashtags),
  "trendingChallenges": [
    {"name": "challenge name", "description": "what people do", "participation": "e.g. 500K+ participants"}
  ] (3-5 challenges, skip if platform doesn't have challenges),
  "trendingFormats": [
    {"format": "e.g. Green Screen", "why": "why this format is working right now"}
  ] (3-5 formats),
  "summary": "2-3 sentence overview of what's trending on ${platform} right now"
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
