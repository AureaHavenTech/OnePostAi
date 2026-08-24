// POST /api/optimize/keywords — Generate SEO/discovery keywords
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

type KeywordResult = {
  keywords: { word: string; searchVolume: string; competition: string; relevance: number }[];
  longTailPhrases: string[];
  algorithmTips: string[];
};

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
  },
  async (req: NextRequest, body: {
    niche?: string;
    platform?: string;
    contentType?: string;
  }) => {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { niche = "", platform = "tiktok", contentType = "post" } = body;
    if (!niche) {
      return NextResponse.json({ error: "niche is required" }, { status: 400 });
    }

    const ai = await chatCompletion<KeywordResult>({
      messages: [
        {
          role: "system",
          content: `You are an SEO and social media discovery expert for ${platform} in 2026.
Search volume tiers: High (>100K), Medium (10K-100K), Low (<10K). Competition tiers: High, Medium, Low.
Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Generate optimized discovery keywords:

NICHE: ${niche}
PLATFORM: ${platform}
CONTENT TYPE: ${contentType} (post|reel|story|ad)

Return JSON:
{
  "keywords": [
    {"word": "keyword", "searchVolume": "High|Medium|Low", "competition": "High|Medium|Low", "relevance": 95}
  ] (8-12 keywords),
  "longTailPhrases": ["long-tail phrase"] (5-8),
  "algorithmTips": ["actionable tip"] (3-5)
}`,
        },
      ],
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 800,
      responseFormat: "json_object",
    });

    if (!ai.ok) {
      return NextResponse.json(
        { success: false, error: "Keyword generation unavailable", aiError: ai.message },
        { status: 503 }
      );
    }

    return {
      success: true,
      niche,
      platform,
      contentType,
      ...ai.data,
      aiModel: ai.model,
      aiConfigured: isOpenAIConfigured(),
      generatedAt: new Date().toISOString(),
    };
  }
);
