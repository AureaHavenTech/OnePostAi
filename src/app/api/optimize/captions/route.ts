// POST /api/optimize/captions — Generate viral caption variations
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

type CaptionVariation = {
  caption: string;
  hook: string;
  cta: string;
  engagementScore: number;
  whyWorks: string;
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
    tone?: string;
    goal?: string;
    includeCallToAction?: boolean;
  }) => {
    const session = await requireAuth(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      content = "",
      platform = "tiktok",
      tone = "viral",
      goal = "engagement",
      includeCallToAction = true,
    } = body;

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const ctaText = includeCallToAction ? "Include a call-to-action in each caption." : "Do NOT include a call-to-action.";

    const ai = await chatCompletion<{ variations: CaptionVariation[] }>({
      messages: [
        {
          role: "system",
          content: `You are an elite social media copywriter for ${platform} in 2026.
You write captions that stop the scroll, maximize engagement, and drive action.
Tone styles: viral (trendy, hook-driven), professional (polished, authoritative), casual (conversational, relatable), luxury (premium, aspirational).
Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Write 3 caption variations for this content:

CONTENT: ${content}
PLATFORM: ${platform}
TONE: ${tone}
GOAL: ${goal}
${ctaText}

Return JSON:
{
  "variations": [
    {
      "caption": "the full caption text",
      "hook": "5-10 word opening hook",
      "cta": "call-to-action or empty",
      "engagementScore": 85,
      "whyWorks": "why this drives ${goal}"
    }
  ] (exactly 3)
}`,
        },
      ],
      model: "gpt-4o-mini",
      temperature: 0.9,
      maxTokens: 1200,
      responseFormat: "json_object",
    });

    if (!ai.ok) {
      return NextResponse.json(
        { success: false, error: "Caption generation unavailable", aiError: ai.message },
        { status: 503 }
      );
    }

    return {
      success: true,
      platform,
      tone,
      goal,
      ...ai.data,
      aiModel: ai.model,
      aiConfigured: isOpenAIConfigured(),
      generatedAt: new Date().toISOString(),
    };
  }
);
