// src/app/api/generate-ideas/route.ts
// AI-powered content idea generation. Real OpenAI (GPT-4o-mini) with a
// template fallback when OPENAI_API_KEY is missing.
import { NextResponse } from "next/server";
import { generateIdeasWithAI, isOpenAIConfigured, type Platform } from "@/lib/openai";

// Hardcoded fallback ideas — used when the API key isn't set or the call fails.
// Each idea is enriched to match the real-AI response shape.
const FALLBACK_IDEAS = (niche: string) => [
  {
    title: `Why I stopped using [competitor] and switched to ${niche}`,
    description: "Honest story that builds trust through a personal switch",
    hook: "I used [competitor] for years. Then I tried this. Here's what changed.",
    platform: "tiktok" as Platform,
    format: "Talking head / testimonial",
    viralScore: 92,
    platforms: ["TikTok", "Instagram Reel", "YouTube Shorts"],
  },
  {
    title: `3 things nobody tells you about ${niche}`,
    description: "Curiosity gap — must watch to find out",
    hook: "Most people get this wrong. Here are 3 things nobody tells you...",
    platform: "tiktok" as Platform,
    format: "Listicle with text overlays",
    viralScore: 88,
    platforms: ["TikTok", "Instagram Reel", "YouTube Shorts", "LinkedIn"],
  },
  {
    title: `The $0 ${niche} hack that changed everything`,
    description: "Value-driven — saves money/time",
    hook: "This $0 hack saved me hours every week. You're welcome.",
    platform: "instagram" as Platform,
    format: "Before/after demonstration",
    viralScore: 95,
    platforms: ["TikTok", "Instagram Reel", "YouTube Shorts"],
  },
  {
    title: `I tried ${niche} for 30 days — here's what happened`,
    description: "Social proof through experience",
    hook: "Day 1 vs Day 30. The result shocked me.",
    platform: "youtube" as Platform,
    format: "Progress journey / montage",
    viralScore: 85,
    platforms: ["YouTube", "TikTok", "Instagram"],
  },
  {
    title: `Stop doing [common mistake] in ${niche} — do this instead`,
    description: "Corrects a common pain point",
    hook: "If you're still doing this, stop. Here's what to do instead.",
    platform: "tiktok" as Platform,
    format: "Educational with graphics",
    viralScore: 90,
    platforms: ["TikTok", "Instagram", "LinkedIn", "YouTube"],
  },
  {
    title: `How I make money with ${niche} — full breakdown`,
    description: "Money talk drives engagement",
    hook: "Full breakdown of how I turned ${niche} into revenue.",
    platform: "linkedin" as Platform,
    format: "Screen recording + voiceover",
    viralScore: 87,
    platforms: ["YouTube", "LinkedIn", "TikTok"],
  },
  {
    title: `The truth about ${niche} that nobody talks about`,
    description: "Controversial / myth-busting",
    hook: "Hot take: most of what you've been told about ${niche} is wrong.",
    platform: "tiktok" as Platform,
    format: "Storytelling with B-roll",
    viralScore: 91,
    platforms: ["TikTok", "Instagram Reel", "YouTube Shorts"],
  },
  {
    title: `5 ways ${niche} makes my life easier (link in bio)`,
    description: "Listicle + call to action",
    hook: "5 underrated ways ${niche} saves me time every day.",
    platform: "instagram" as Platform,
    format: "Quick cuts with text overlays",
    viralScore: 83,
    platforms: ["Instagram Reel", "TikTok", "YouTube Shorts"],
  },
  {
    title: `Day in the life using ${niche} — real results`,
    description: "Behind-the-scenes authenticity",
    hook: "A full day in my life using ${niche}. Real, unfiltered.",
    platform: "youtube" as Platform,
    format: "Vlog style with timestamps",
    viralScore: 86,
    platforms: ["YouTube", "TikTok", "Instagram"],
  },
  {
    title: `${niche} for beginners: start here (save this post)`,
    description: "Educational + saveable content",
    hook: "New to ${niche}? Start here. Save this post.",
    platform: "linkedin" as Platform,
    format: "Tutorial screencast",
    viralScore: 89,
    platforms: ["YouTube", "LinkedIn", "Instagram", "TikTok"],
  },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { niche, platform, count, brandName } = body;
    if (!niche) {
      return NextResponse.json({ success: false, error: "niche is required" }, { status: 400 });
    }
    const safeCount = Math.min(Math.max(count || 10, 1), 30);
    const platforms = platform ? [platform] : (["tiktok", "instagram", "youtube"] as Platform[]);
    const brand = brandName || niche; // fallback brand name = niche string
    // Try real OpenAI
    const ai = await generateIdeasWithAI({ brandName: brand, prompt: niche, count: safeCount, platforms });
    if (ai.ok) {
      return NextResponse.json({
        success: true,
        niche,
        brandName: brand,
        ideas: ai.data.ideas,
        trendingFormats: ["Talking head reviews", "Product demonstrations", "Educational listicles", "POV hooks", "Carousel storytelling"],
        bestPlatform: "Instagram Reel (highest viral potential for this niche)",
        generatedAt: new Date().toISOString(),
        source: "openai",
        aiModel: ai.model,
        aiConfigured: true,
      });
    }
    // Fallback
    const fallbackIdeas = FALLBACK_IDEAS(niche).slice(0, safeCount);
    return NextResponse.json({
      success: true,
      niche,
      brandName: brand,
      ideas: fallbackIdeas,
      trendingFormats: ["Talking head reviews", "Product demonstrations", "Educational listicles"],
      bestPlatform: "Instagram Reel (highest viral potential for this niche)",
      generatedAt: new Date().toISOString(),
      source: "template",
      aiModel: "template",
      aiConfigured: isOpenAIConfigured(),
      aiError: ai.ok ? undefined : ai.message,
    });
  } catch (error: any) {
    console.error("Idea generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
