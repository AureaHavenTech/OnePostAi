// src/app/api/generate-campaign/route.ts
// AI-powered multi-platform campaign generation. Real OpenAI (GPT-4o-mini)
// with a polished template fallback for dev mode.
import { NextResponse } from "next/server";
import { generateCampaignWithAI, isOpenAIConfigured, type Platform } from "@/lib/openai";

const DEFAULT_PLATFORMS: Platform[] = ["tiktok", "instagram", "youtube", "facebook", "linkedin"];

const FALLBACK_CAMPAIGN = (source: string) => ({
  campaignName: "Multi-Platform Launch Campaign",
  campaignGoal: `Drive awareness and engagement for ${source} across 5 social platforms with coordinated messaging and trending formats.`,
  totalPieces: 5,
  platforms: {
    tiktok: {
      title: "🔥 You Won't Believe How Easy This Is!",
      description:
        "Stop overthinking your content strategy. 🛑\n\nHere's the truth: consistency beats perfection every single time.\n\n👇 Drop a 🎯 if you're ready to level up!\n\n#ContentCreator #GrowthHack",
      hashtags: [
        "fyp", "viral", "contentcreator", "growthhack", "marketingtips",
        "smallbusiness", "trending", "explorepage", "hack", "goforit",
      ],
    },
    instagram: {
      title: "The One Tool Every Creator Needs 🚀",
      description:
        "Spending hours editing for each platform? Not anymore.\n\nOnePost AI handles the hard work so you can focus on creating.\n\n✅ Auto-resize for every format\n✅ AI-powered captions\n✅ Post everywhere at once\n\nSave this post for later! 📌",
      hashtags: [
        "instagramtips", "contentcreator", "socialmediamanager", "aitools",
        "productivityhacks", "marketingstrategy", "reelstips", "growthhacking",
        "creatorcommunity", "viralcontent",
      ],
    },
    youtube: {
      title: "I Tested the Ultimate Content Automation Tool",
      description:
        "In this video, I walk through how OnePost AI is changing the game for content creators.\n\n📌 What we cover:\n0:00 - Intro\n0:45 - The multi-platform problem\n2:30 - How OnePost AI solves it\n5:15 - Live demo\n8:00 - Final thoughts\n\nSubscribe for more content creation tips! 🔔",
      hashtags: [
        "contentcreation", "tutorial", "howto", "review", "2026",
        "creator", "automation", "productivity", "viral", "tutorial",
      ],
    },
    facebook: {
      title: "How Top Creators Save 10+ Hours Every Week",
      description:
        "I used to spend my entire周末 creating content for different platforms. Then I found a better way.\n\nThe result? 3x more content, 1/10th the effort, and better engagement.\n\nWhat's your biggest content bottleneck? Drop a comment — let's solve it together. 👇",
      hashtags: [
        "facebookmarketing", "contentmarketing", "smallbusiness", "marketing",
        "socialmediamarketing", "productivity", "businesstips", "entrepreneur",
        "growth", "viral",
      ],
    },
    linkedin: {
      title: "Why I Automate 80% of My Content Distribution",
      description:
        "As a content creator, I realized something crucial:\n\nThe platforms are different, but your message shouldn't be fragmented.\n\nOnePost AI lets me:\n• Upload once\n• Auto-format for each network\n• Schedule simultaneous publishing\n\nResult? 3x more reach with 1/10th the effort.\n\nWhat's your biggest content bottleneck? Let's discuss below 👇",
      hashtags: [
        "contentstrategy", "productivity", "aicontent", "socialmediamarketing",
        "creatoreconomy", "businesstips", "marketingautomation", "growthmindset",
        "digitalstrategy", "contentmarketing",
      ],
    },
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcription, keywords, fileName, brandName, platforms } = body;
    if (!transcription && !keywords) {
      return NextResponse.json(
        { success: false, error: "Either transcription or keywords is required" },
        { status: 400 }
      );
    }
    const brand = brandName || "Your Brand";
    const requestedPlatforms = Array.isArray(platforms) && platforms.length
      ? (platforms as Platform[])
      : DEFAULT_PLATFORMS;
    const source = keywords || transcription || fileName || "AI-generated";
    // Try real OpenAI
    const ai = await generateCampaignWithAI({
      brandName: brand,
      fileName,
      keywords,
      transcription,
      platforms: requestedPlatforms,
    });
    if (ai.ok) {
      return NextResponse.json({
        success: true,
        data: ai.data,
        source,
        fileName,
        brandName: brand,
        generatedAt: new Date().toISOString(),
        aiModel: ai.model,
        aiConfigured: true,
      });
    }
    // Fallback
    const fallback = FALLBACK_CAMPAIGN(source);
    return NextResponse.json({
      success: true,
      data: fallback,
      source,
      fileName,
      brandName: brand,
      generatedAt: new Date().toISOString(),
      aiModel: "template",
      aiConfigured: isOpenAIConfigured(),
      aiError: ai.message,
    });
  } catch (error: any) {
    console.error("Campaign generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate campaign" },
      { status: 500 }
    );
  }
}
