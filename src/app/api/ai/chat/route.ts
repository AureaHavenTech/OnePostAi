/**
 * POST /api/ai/chat — Conversational AI (Axel assistant)
 * Requires: OPENAI_API_KEY
 */

import { NextResponse } from "next/server";
import { chat } from "@/lib/services/ai/pipeline";
import { isOpenAIConfigured } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, systemContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "messages array is required" },
        { status: 400 }
      );
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not configured. Set it in .env to enable AI chat.",
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    const result = await chat(messages, systemContext);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reply: result.data.reply,
      model: result.data.model,
      usage: result.data.usage,
    });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process chat" },
      { status: 500 }
    );
  }
}
