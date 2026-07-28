import { NextResponse } from "next/server";
import { getOpenAI, hasApiKey } from "@/lib/openai-client";

const SYSTEM_PROMPT = `You are an expert social media campaign strategist. Generate a multi-platform content campaign.

Return a JSON object with platform-specific content for: tiktok, instagram, youtube, linkedin (and optionally facebook).
Each platform key must contain:
- "title": The video/post title (attention-grabbing, platform-appropriate)
- "description": The caption/description (2-5 lines, with emojis and hooks)
- "hashtags": Array of 10-15 relevant hashtags (mix of broad and niche)

Return ONLY valid JSON.`;

const FALLBACK_CAMPAIGN = {
  tiktok: {
    title: "🔥 You Won't Believe How Easy This Is!",
    description: "Stop overthinking your content strategy. 🛑\n\nHere's the truth: consistency beats perfection every single time.\n\n👇 Drop a 🎯 if you're ready to level up!\n\n#ContentCreator #GrowthHack",
    hashtags: ["fyp", "viral", "contentcreator", "growthhack", "marketingtips", "smallbusiness", "trending", "explorepage", "hack", "goforit"],
  },
  instagram: {
    title: "The One Tool Every Creator Needs 🚀",
    description: "Spending hours editing for each platform? Not anymore.\n\nOnePost AI handles the hard work so you can focus on creating.\n\n✅ Auto-resize for every format\n✅ AI-powered captions\n✅ Post everywhere at once\n\nSave this post for later! 📌",
    hashtags: ["instagramtips", "contentcreator", "socialmediamanager", "aitools", "productivityhacks", "marketingstrategy", "reelstips", "growthhacking", "creatorcommunity", "viralcontent"],
  },
  youtube: {
    title: "I Tested the Ultimate Content Automation Tool",
    description: "In this video, I walk through how OnePost AI is changing the game for content creators.\n\n📌 What we cover:\n0:00 - Intro\n0:45 - The multi-platform problem\n2:30 - How OnePost AI solves it\n5:15 - Live demo\n8:00 - Final thoughts\n\nSubscribe for more content creation tips! 🔔",
    hashtags: ["contentcreation", "aitools", "productivity", "youtubetips", "automation", "creator", "techreview", "socialmedia", "workflow", "digitalmarketing"],
  },
  linkedin: {
    title: "Why I Automate 80% of My Content Distribution",
    description: "As a content creator, I realized something crucial:\n\nThe platforms are different, but your message shouldn't be fragmented.\n\nOnePost AI lets me:\n• Upload once\n• Auto-format for each network\n• Schedule simultaneous publishing\n\nResult? 3x more reach with 1/10th the effort.\n\nWhat's your biggest content bottleneck? Let's discuss below 👇",
    hashtags: ["contentstrategy", "productivity", "aicontent", "socialmediamarketing", "creatoreconomy", "businesstips", "marketingautomation", "growthmindset", "digitalstrategy", "contentmarketing"],
  },
};

function buildFallback(source: string, fileName?: string) {
  return NextResponse.json({
    success: true,
    data: FALLBACK_CAMPAIGN,
    aiGenerated: false,
    source: source || "fallback",
    fileName,
  });
}

export async function POST(req: Request) {
  let transcription = "";
  let keywords = "";
  let fileName = "";

  try {
    const body = await req.json();
    transcription = body.transcription || "";
    keywords = body.keywords || "";
    fileName = body.fileName || "";

    if (!hasApiKey()) {
      console.warn("[generate-campaign] No API key — using fallback");
      return buildFallback(keywords || transcription, fileName);
    }

    const userContent = transcription
      ? `Transcription: "${transcription}"`
      : `Keywords/Topic: "${keywords}"`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${userContent}\n\nGenerate platform-specific campaign content for TikTok, Instagram, YouTube, and LinkedIn.` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
      temperature: 0.8,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response");
    const parsed = JSON.parse(raw);

    // Merge AI data with fallback for any missing platforms
    const campaignData = {
      tiktok: parsed.tiktok || FALLBACK_CAMPAIGN.tiktok,
      instagram: parsed.instagram || FALLBACK_CAMPAIGN.instagram,
      youtube: parsed.youtube || FALLBACK_CAMPAIGN.youtube,
      linkedin: parsed.linkedin || FALLBACK_CAMPAIGN.linkedin,
    };

    return NextResponse.json({
      success: true,
      data: campaignData,
      aiGenerated: true,
      source: keywords || transcription || "AI-generated",
      fileName,
    });
  } catch (error: any) {
    console.error("[generate-campaign] Error:", error?.message || error);
    return buildFallback(keywords || transcription, fileName);
  }
}
