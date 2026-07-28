/**
 * POST /api/ai/ad-campaign — Meta / TikTok / Instagram ad campaign creation
 * Requires: OPENAI_API_KEY
 */

import { NextResponse } from "next/server";
import { generateAdCampaign } from "@/lib/services/ai/pipeline";
import { isOpenAIConfigured } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, platform, goal } = body;

    if (!product || typeof product !== "string") {
      return NextResponse.json(
        { success: false, error: "product (string) is required" },
        { status: 400 }
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured. Set it in .env to enable ad campaign generation.",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    const result = await generateAdCampaign(product, platform || "meta", goal || "conversions");

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign: result.data,
    });
  } catch (error: any) {
    console.error("Ad campaign generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate ad campaign" },
      { status: 500 }
    );
  }
}
