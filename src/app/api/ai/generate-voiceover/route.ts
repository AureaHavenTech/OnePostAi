/**
 * POST /api/ai/generate-voiceover — ElevenLabs TTS voiceover generation
 * Requires: ELEVENLABS_API_KEY
 */

import { NextResponse } from "next/server";
import { generateVoiceover } from "@/lib/services/ai/pipeline";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, tone } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { success: false, error: "text (string) is required" },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "ELEVENLABS_API_KEY is not configured. Set it in .env to enable AI voiceovers.",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    const result = await generateVoiceover(text, tone || "upbeat");

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      voiceover: {
        voiceName: result.data.voiceName,
        tone: result.data.tone,
        mimeType: result.data.mimeType,
        audioBase64: result.data.audioBase64,
        charCount: result.data.charCount,
      },
    });
  } catch (error: any) {
    console.error("AI voiceover error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate voiceover" },
      { status: 500 }
    );
  }
}
