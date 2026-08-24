// POST /api/optimize/full — Combo: hashtags + captions + keywords + viral score
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

type FullOptimization = {
  hashtags: {
    primary: { tag: string; relevance: number; reach: string }[];
    niche: { tag: string; relevance: number }[];
    trending: { tag: string; trendingScore: number }[];
    strategy: string;
  };
  captions: {
    caption: string;
    hook: string;
    cta: string;
    engagementScore: number;
    whyWorks: string;
  }[];
  keywords: {
    keywords: { word: string; searchVolume: string; competition: string; relevance: number }[];
    longTailPhrases: string[];
    algorithmTips: string[];
  };
  bestPostingTime: string;
  contentScore: number;
  viralPotential: number;
  overallStrategy: string;
};

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 20 },
  },
  async (req: NextRequest, body: {
    content?: string;
    platform?: string;
    niche?: string;
    goal?: string;
    tone?: string;
  }) => {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content = "", platform = "tiktok", niche = "", goal = "growth", tone = "viral" } = body;
    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const ai = await chatCompletion<FullOptimization>({
      messages: [
        {
          role: "system",
          content: `You are an elite viral content optimizer for ${platform} in 2026.
Provide a complete optimization package. Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Complete viral optimization for:

CONTENT: ${content}
PLATFORM: ${platform}
NICHE: ${niche}
GOAL: ${goal}
TONE: ${tone}

Return JSON:
{
  "hashtags": {
    "primary": [{"tag": "#tag", "relevance": 90, "reach": "High"}] (5-8),
    "niche": [{"tag": "#tag", "relevance": 95}] (5-8),
    "trending": [{"tag": "#tag", "trendingScore": 85}] (3-5),
    "strategy": "hashtag strategy explanation"
  },
  "captions": [
    {"caption": "full caption", "hook": "opening hook", "cta": "call to action", "engagementScore": 88, "whyWorks": "reasoning"}
  ] (2 variations),
  "keywords": {
    "keywords": [{"word": "kw", "searchVolume": "High", "competition": "Medium", "relevance": 90}] (6-8),
    "longTailPhrases": ["phrase"] (4-5),
    "algorithmTips": ["tip"] (3-4)
  },
  "bestPostingTime": "e.g. Tuesday 7PM EST — with reasoning",
  "contentScore": 85,
  "viralPotential": 78,
  "overallStrategy": "2-3 sentence comprehensive strategy"
}
Scores: contentScore 0-100, viralPotential 0-100. Be honest.`,
        },
      ],
      model: "gpt-4o",
      temperature: 0.85,
      maxTokens: 1800,
      responseFormat: "json_object",
    });

    if (!ai.ok) {
      return NextResponse.json(
        { success: false, error: "Full optimization unavailable", aiError: ai.message },
        { status: 503 }
      );
    }

    return {
      success: true,
      platform,
      goal,
      tone,
      optimization: ai.data,
      aiModel: ai.model,
      aiConfigured: isOpenAIConfigured(),
      generatedAt: new Date().toISOString(),
    };
  }
);
