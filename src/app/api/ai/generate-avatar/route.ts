/**
 * POST /api/ai/generate-avatar — AI Twin / Digital Avatar generation
 *
 * Creates UGC-style talking-head videos with AI avatars.
 * Accepts photos for digital twin, or generates AI models from scratch.
 *
 * Requires: HEYGEN_API_KEY (premium) or REPLICATE_API_TOKEN + OPENAI_API_KEY (Replicate pipeline)
 */

import { NextResponse } from "next/server";
import { generateAvatar, isAvatarAvailable } from "@/lib/services/ai/providers/avatar";
import type { AvatarInput, AvatarSource } from "@/lib/services/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      source,
      photoUrls,
      appearance,
      gender,
      script,
      voiceTone,
      gestures,
      background,
      provider,
    } = body;

    // ── Validation ──────────────────────────────────────────────

    if (!source || !["photos", "ai-generated", "preset"].includes(source)) {
      return NextResponse.json(
        { success: false, error: 'source is required. Must be "photos", "ai-generated", or "preset".' },
        { status: 400 }
      );
    }

    if (source === "photos" && (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0)) {
      return NextResponse.json(
        { success: false, error: "photoUrls array is required when source is 'photos'. Provide 3-5 photo URLs." },
        { status: 400 }
      );
    }

    if (source === "ai-generated" && !appearance) {
      return NextResponse.json(
        { success: false, error: "appearance description is required when source is 'ai-generated'. Describe the AI model's look." },
        { status: 400 }
      );
    }

    if (!script || typeof script !== "string" || script.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "script is required. The avatar needs something to say." },
        { status: 400 }
      );
    }

    if (script.length > 5000) {
      return NextResponse.json(
        { success: false, error: "script must be under 5000 characters." },
        { status: 400 }
      );
    }

    // ── Provider check ──────────────────────────────────────────

    if (!isAvatarAvailable()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No avatar provider configured. Set HEYGEN_API_KEY (premium) or REPLICATE_API_TOKEN + OPENAI_API_KEY in .env to enable AI avatar generation.",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    // ── Generate ────────────────────────────────────────────────

    const input: AvatarInput = {
      source: source as AvatarSource,
      photoUrls: photoUrls?.slice(0, 5),
      appearance,
      gender: gender || "neutral",
      script: script.trim(),
      voiceTone: voiceTone || "casual",
      gestures: gestures !== false,
      background,
      provider: provider || "auto",
    };

    const result = await generateAvatar(input);

    if (!result.success) {
      const status = result.code === "MISSING_API_KEY" ? 503 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({
      success: true,
      avatar: result.data,
      message: "AI avatar video generated successfully!",
    });
  } catch (error: any) {
    console.error("Avatar generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate avatar video" },
      { status: 500 }
    );
  }
}
