// GET /api/research/trending-sounds — Trending audio for TikTok/Reels
// Auth-protected. GPT-4o curated list of trending sounds and music.

import { NextRequest, NextResponse } from "next/server";
import { readSessionCookieFromHeader, verifySessionToken } from "@/lib/auth-edge";
import { chatCompletion, isOpenAIConfigured } from "@/lib/openai";

async function requireAuth(req: NextRequest) {
  const token = readSessionCookieFromHeader(req.headers.get("cookie"));
  if (!token) return null;
  return verifySessionToken(token);
}

const FALLBACK_SOUNDS = [
  { artist: "Various Artists", title: "Viral Trending Audio", platform: "tiktok", category: "Trending", mood: "Upbeat", bestFor: "Dance, transitions, lifestyle content", usageEstimate: "100K+" },
  { artist: "Various Artists", title: "Lo-fi Chill Beats", platform: "tiktok", category: "Lo-fi", mood: "Chill", bestFor: "Aesthetic, B-roll, study content", usageEstimate: "50K+" },
  { artist: "Various Artists", title: "Cinematic Orchestral", platform: "instagram", category: "Cinematic", mood: "Dramatic", bestFor: "Product reveals, before/after, storytelling", usageEstimate: "75K+" },
  { artist: "Various Artists", title: "Upbeat Pop Remix", platform: "tiktok", category: "Pop", mood: "Energetic", bestFor: "Unboxing, hauls, quick cuts", usageEstimate: "200K+" },
  { artist: "Various Artists", title: "Emotional Piano", platform: "instagram", category: "Classical", mood: "Emotional", bestFor: "Brand stories, testimonials, transformations", usageEstimate: "40K+" },
];

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") || "tiktok";
    const category = searchParams.get("category");

    if (!isOpenAIConfigured()) {
      return NextResponse.json({
        success: true,
        aiConfigured: false,
        platform,
        sounds: FALLBACK_SOUNDS,
        source: "curated-fallback",
      });
    }

    const prompt = `Generate a curated list of currently trending sounds/music for ${platform}${category ? ` in the ${category} category` : ""}.

Return a JSON array of 8-10 sounds:
[
  {
    "artist": "Artist name",
    "title": "Track/sound title",
    "platform": "${platform}",
    "category": "Pop|Hip-Hop|Electronic|Lo-fi|Cinematic|Classical|Trending",
    "mood": "Upbeat|Chill|Dramatic|Energetic|Emotional",
    "usageEstimate": "estimated number of videos using this sound",
    "bestFor": "what content this sound works best for"
  }
]

Generate realistic, specific entries. Focus on currently trending sounds.`;

    const result = await chatCompletion([
      { role: "system", content: "You are a social media audio trend expert. Return only valid JSON arrays." },
      { role: "user", content: prompt },
    ], { temperature: 0.8, maxTokens: 600 });

    const sounds = JSON.parse(result.content || "[]");

    return NextResponse.json({
      success: true,
      aiConfigured: true,
      platform,
      category: category || null,
      sounds: Array.isArray(sounds) ? sounds : FALLBACK_SOUNDS,
      source: "ai-generated",
    });
  } catch (e: any) {
    console.error("[research/trending-sounds] error:", e);
    // Return fallback on any error
    return NextResponse.json({
      success: true,
      aiConfigured: isOpenAIConfigured(),
      platform: "tiktok",
      sounds: FALLBACK_SOUNDS,
      source: "curated-fallback",
    });
  }
}
