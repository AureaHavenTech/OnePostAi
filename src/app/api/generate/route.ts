import { NextRequest, NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { generateContent } from "@/lib/services/backend";
import { detectContentType } from "@/lib/services/content-types";

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
    validate: (b) => (!b?.brandName ? "brandName is required" : !b?.prompt ? "prompt is required" : true),
  },
  async (req, body) => {
    const {
      brandName, prompt, platforms, tone, captionStyle,
      isFreeTier, generationCount,
      contentType, productName, productDescription, durationSec,
    } = body;
    // Auto-detect content type from the prompt if the caller didn't specify one.
    // This is the magic that makes "Create a 15-second unboxing video for..."
    // automatically route to the right specialized pipeline.
    const resolvedType = contentType || detectContentType(`${prompt} ${productDescription || ""}`) || undefined;
    const result = await generateContent({
      brandName, prompt,
      platforms: platforms || [],
      tone, captionStyle, isFreeTier, generationCount,
      contentType: resolvedType,
      productName, productDescription, durationSec,
    });
    if ((result as any).error) {
      return NextResponse.json(result, { status: 402 });
    }
    return result;
  }
);
