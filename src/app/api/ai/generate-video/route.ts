/**
 * POST /api/ai/generate-video — Replicate AI video generation
 * Requires: REPLICATE_API_TOKEN
 */

import { NextResponse } from "next/server";
import { generateVideo } from "@/lib/services/ai/pipeline";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "prompt (string) is required" },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "REPLICATE_API_TOKEN is not configured. Set it in .env to enable AI video generation.",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    const result = await generateVideo(prompt, model || "zeroscope");

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      video: result.data,
    });
  } catch (error: any) {
    console.error("AI video generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate video" },
      { status: 500 }
    );
  }
}
