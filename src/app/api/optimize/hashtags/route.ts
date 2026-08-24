// POST /api/optimize/hashtags — Generate viral hashtag strategy
// Auth-protected. Powered by GPT-4o.

import { NextRequest, NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { readSessionCookieFromHeader, verifySessionToken } from "@/lib/auth-edge";
import { chatCompletion, isOpenAIConfigured } from "@/lib/openai";

async function requireAuth(req: NextRequest) {
  const token = readSessionCookieFromHeader(req.headers.get("cookie"));
  if (!token) return null;
  return verifySessionToken(token);
}

type HashtagResult = {
  primary: { tag: string; relevance: number; reach: string }[];
  niche: { tag: string; relevance: number }[];
  trending: { tag: string; trendingScore: number }[];
  strategy: string;
};

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
  },
  async (req: NextRequest, body: {
    content?: string;
    platform?: string;
    niche?: string;
    goal?: string;
  }) => {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      content = "",
      platform = "tiktok",
      niche = "",
      goal = "growth",
    } = body;

    if (!content && !niche) {
      return NextResponse.json({ error: "content or niche is required" }, { status: 400 });
    }

    const ai = await chatCompletion<HashtagResult>({
      messages: [
        {
          role: "system",
          content: `You are a viral hashtag strategist for ${platform} in 2026. 
You optimize hashtags for maximum discovery, reach, and engagement.
For each hashtag, provide a relevance score (0-100) and reach tier (Low/Medium/High/Viral).
Return ONLY JSON.`,
        },
        {
          role: "user",
          content: `Generate a complete hashtag strategy:

CONTENT: ${content}
NICHE: ${niche}
PLATFORM: ${platform}
GOAL: ${goal} (growth|engagement|conversions|reach)

Return JSON:
{
  "primary": [{"tag": "#example", "relevance": 92, "reach": "High"}] (5-10),
  "niche": [{"tag": "#nicheTag", "relevance": 95}] (5-10),
  "trending": [{"tag": "#trending", "trendingScore": 88}] (3-5),
  "strategy": "2-3 sentence explanation"
}`,
        },
      ],
      model: "gpt-4o",
      temperature: 0.8,
      maxTokens: 900,
      responseFormat: "json_object",
    });

    if (!ai.ok) {
      return NextResponse.json(
        { success: false, error: "Hashtag generation unavailable", aiError: ai.message },
        { status: 503 }
      );
    }

    return {
      success: true,
      platform,
      goal,
      hashtags: ai.data,
      aiModel: ai.model,
      aiConfigured: isOpenAIConfigured(),
      generatedAt: new Date().toISOString(),
    };
  }
);
