// /api/content-type — List all 7 content types and dispatch to a specific one.
// Used by the chat to auto-detect, by the generate page to show a type picker,
// and by the autonomous scheduler to rotate types per brand.
import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import {
  CONTENT_TYPE_LIST,
  generateByContentType,
  detectContentType,
  getContentType,
  type ContentTypeId,
  type ContentTypeInput,
} from "@/lib/services/content-types";
import type { Platform } from "@/lib/openai";

export const GET = withApi(
  {
    method: "GET",
    cache: "long", // 1h — content type catalog rarely changes
  },
  async () => {
    return {
      types: CONTENT_TYPE_LIST.map((t) => ({
        id: t.id,
        label: t.label,
        description: t.description,
        icon: t.icon,
        category: t.category,
        videoSpec: t.defaultVideoSpec,
      })),
      total: CONTENT_TYPE_LIST.length,
    };
  }
);

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
    validate: (b) =>
      !b?.brandName ? "brandName is required" : !b?.prompt ? "prompt is required" : true,
  },
  async (req, body) => {
    // Resolve contentType: explicit > auto-detect from prompt > null
    let contentType: string | null = body.contentType || null;
    if (!contentType) {
      contentType = detectContentType(`${body.prompt} ${body.productDescription || ""}`);
    }
    if (!contentType) {
      return NextResponse.json(
        {
          success: false,
          error: "contentType required. Pass one of: " + CONTENT_TYPE_LIST.map((t) => t.id).join(", ") +
            " — or use words like 'unboxing', 'voiceover', 'talking head', 'demo', 'trending hook', 'storytelling' in your prompt.",
        },
        { status: 400 }
      );
    }
    const def = getContentType(contentType);
    if (!def) {
      return NextResponse.json(
        { success: false, error: `Unknown contentType: ${contentType}. Valid: ${CONTENT_TYPE_LIST.map((t) => t.id).join(", ")}` },
        { status: 400 }
      );
    }
    const platforms: Platform[] = Array.isArray(body.platforms) && body.platforms.length
      ? body.platforms
      : ["tiktok", "instagram", "youtube"];
    const input: ContentTypeInput = {
      brandName: body.brandName,
      prompt: body.prompt,
      platforms,
      productName: body.productName,
      productDescription: body.productDescription,
      brandVoice: body.brandVoice || body.tone,
      tone: body.tone,
      durationSec: body.durationSec,
      additionalContext: body.additionalContext,
    };
    const out = await generateByContentType(input);
    return { success: true, ...out };
  }
);
