import { NextRequest, NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { generateContent } from "@/lib/services/backend";

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
    validate: (b) => (!b?.brandName ? "brandName is required" : !b?.prompt ? "prompt is required" : true),
  },
  async (req, body) => {
    const { brandName, prompt, platforms, tone, captionStyle, isFreeTier, generationCount } = body;
    const result = await generateContent({ brandName, prompt, platforms: platforms || [], tone, captionStyle, isFreeTier, generationCount });
    if ((result as any).error) {
      return NextResponse.json(result, { status: 402 });
    }
    return result;
  }
);
