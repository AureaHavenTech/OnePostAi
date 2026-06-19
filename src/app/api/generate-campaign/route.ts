import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcription, keywords, fileName } = body;

    // In production, this calls OpenAI GPT-4o or Anthropic Claude
    // Here we return structured mock data matching the platform tab structure
    const campaignData = {
      tiktok: {
        title: "🔥 You Won't Believe How Easy This Is!",
        description:
          "Stop overthinking your content strategy. 🛑\n\nHere's the truth: consistency beats perfection every single time.\n\n👇 Drop a 🎯 if you're ready to level up!\n\n#ContentCreator #GrowthHack",
        hashtags: [
          "fyp",
          "viral",
          "contentcreator",
          "growthhack",
          "marketingtips",
          "smallbusiness",
          "trending",
          "explorepage",
          "hack",
          "goforit",
        ],
      },
      instagram: {
        title: "The One Tool Every Creator Needs 🚀",
        description:
          "Spending hours editing for each platform? Not anymore.\n\nOnePost AI handles the hard work so you can focus on creating.\n\n✅ Auto-resize for every format\n✅ AI-powered captions\n✅ Post everywhere at once\n\nSave this post for later! 📌",
        hashtags: [
          "instagramtips",
          "contentcreator",
          "socialmediamanager",
          "aitools",
          "productivityhacks",
          "marketingstrategy",
          "reelstips",
          "growthhacking",
          "creatorcommunity",
          "viralcontent",
        ],
      },
      youtube: {
        title: "I Tested the Ultimate Content Automation Tool",
        description:
          "In this video, I walk through how OnePost AI is changing the game for content creators.\n\n📌 What we cover:\n0:00 - Intro\n0:45 - The multi-platform problem\n2:30 - How OnePost AI solves it\n5:15 - Live demo\n8:00 - Final thoughts\n\nSubscribe for more content creation tips! 🔔",
        hashtags: [
          "contentcreation",
          "aitools",
          "productivity",
          "youtubetips",
          "automation",
          "creator",
          "techreview",
          "socialmedia",
          "workflow",
          "digitalmarketing",
        ],
      },
      linkedin: {
        title: "Why I Automate 80% of My Content Distribution",
        description:
          "As a content creator, I realized something crucial:\n\nThe platforms are different, but your message shouldn't be fragmented.\n\nOnePost AI lets me:\n• Upload once\n• Auto-format for each network\n• Schedule simultaneous publishing\n\nResult? 3x more reach with 1/10th the effort.\n\nWhat's your biggest content bottleneck? Let's discuss below 👇",
        hashtags: [
          "contentstrategy",
          "productivity",
          "aicontent",
          "socialmediamarketing",
          "creatoreconomy",
          "businesstips",
          "marketingautomation",
          "growthmindset",
          "digitalstrategy",
          "contentmarketing",
        ],
      },
    };

    return NextResponse.json({
      success: true,
      data: campaignData,
      source: keywords || transcription || "AI-generated",
      fileName,
    });
  } catch (error) {
    console.error("Campaign generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate campaign" },
      { status: 500 }
    );
  }
}