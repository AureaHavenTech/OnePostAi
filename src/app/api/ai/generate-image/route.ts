/**
 * POST /api/ai/generate-image — DALL-E 3 image generation
 * Requires: OPENAI_API_KEY
 */

import { NextResponse } from "next/server";
import { generateImage } from "@/lib/services/ai/pipeline";
import { isOpenAIConfigured } from "@/lib/openai";
import type { ImageStyle } from "@/lib/services/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, style, size } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "prompt (string) is required" },
        { status: 400 }
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured. Set it in .env to enable AI image generation.",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    const result = await generateImage(
      prompt,
      (style as ImageStyle) || "product-shot",
      (size as "1024x1024" | "1792x1024" | "1024x1792") || "1024x1024"
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      image: result.data,
    });
  } catch (error: any) {
    console.error("AI image generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
