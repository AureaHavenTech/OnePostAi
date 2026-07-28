/**
 * POST /api/external/generate
 * External API endpoint for Axel AI to trigger content generation in OnePost AI.
 * Authenticated via shared API key (ONEPOST_API_KEY).
 * 
 * Request body: { prompt, platform?, style?, apiKey }
 * Response: { success, content, platform, hashtags?, metadata }
 */
import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/services/backend";

const VALID_API_KEY = process.env.ONEPOST_API_KEY;

const PLATFORM_MAP: Record<string, string[]> = {
  tiktok: ["tiktok"],
  instagram: ["instagram"],
  twitter: ["twitter", "x"],
  linkedin: ["linkedin"],
  facebook: ["facebook"],
  youtube: ["youtube"],
  all: ["tiktok", "instagram", "twitter", "linkedin", "facebook", "youtube"],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, platform = "all", style, apiKey } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "prompt is required" },
        { status: 400 }
      );
    }

    // Authenticate
    if (!VALID_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Server not configured with ONEPOST_API_KEY" },
        { status: 500 }
      );
    }

    if (!apiKey || apiKey !== VALID_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing API key" },
        { status: 401 }
      );
    }

    // Map platform
    const platforms = PLATFORM_MAP[platform.toLowerCase()] || PLATFORM_MAP.all;

    // Generate content using the existing engine
    const result = await generateContent({
      brandName: "Axel AI User",
      prompt,
      platforms,
      tone: style || "professional",
      captionStyle: style || "casual",
      isFreeTier: false,
      generationCount: 1,
    });

    return NextResponse.json({
      success: true,
      content: (result as any).content || (result as any).caption || prompt,
      platform: platforms[0],
      platforms,
      hashtags: (result as any).hashtags || [],
      metadata: {
        generatedBy: "OnePost AI",
        requestedVia: "Axel AI API Bridge",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Content generation failed",
      },
      { status: 500 }
    );
  }
}
