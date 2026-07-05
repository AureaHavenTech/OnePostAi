import { NextResponse } from "next/server";

// Demo/simulated content generations
const DEMO_CAPTIONS = [
  "🔥 This changes EVERYTHING for content creators in 2026 🚀\n\nI've been testing this for weeks and the results are INSANE. Here's what you need to know ⬇️\n\n#contentcreator #viral #growth #2026",
  "💡 Nobody tells you this about going viral...\n\nBut here's the truth: it's not about luck. It's about understanding ONE thing that most people get completely wrong.\n\nSave this for later 📌",
  "🎬 POV: You finally found the content hack that actually works\n\n3 months ago I was stuck at 500 views. Now I'm averaging 50K+ per post. Here's exactly what changed 👇\n\n#contentstrategy #growthhack",
  "📊 The algorithm LOVES this type of content in 2026\n\nI analyzed 1000+ viral posts and found 3 patterns they all share. Thread below 🧵",
  "💰 How I turned content creation into a full-time income\n\nFrom $0 to $5K/month in 90 days. No fancy equipment. No followers needed. Just consistency and ONE strategy.\n\n#sidehustle #contentcreator",
];

const DEMO_HASHTAGS = [
  ["#viral", "#trending", "#contentcreator", "#growth", "#2026"],
  ["#marketing", "#socialmedia", "#tips", "#hacks", "#business"],
  ["#entrepreneur", "#money", "#success", "#motivation", "#goals"],
  ["#fyp", "#explore", "#trendingaudio", "#viralvideo", "#reels"],
  ["#smallbusiness", "#boss", "#hustle", "#grind", "#wealth"],
];

const DEMO_AD_COPIES = [
  {
    headline: "Stop Posting Blind — Let AI Do the Heavy Lifting",
    body: "Most creators spend 10+ hours a week planning content. OnePost AI does it in 5 minutes. Generate viral captions, perfect hashtags, and scroll-stopping visuals — all from one dashboard.",
    cta: "Start Free Trial",
    valueProp: "Save 20+ hours/month",
  },
  {
    headline: "Your Content Strategy Is Outdated (Here's the Fix)",
    body: "The 2026 algorithm rewards consistency and quality. OnePost AI helps you post better content, more often, without burning out. Used by 500+ creators to grow their audience.",
    cta: "Get Started",
    valueProp: "Grow 3x faster",
  },
  {
    headline: "From 0 to Viral — The Shortcut You've Been Looking For",
    body: "Describe your idea once. OnePost AI generates platform-optimized posts with AI-powered hashtags and smart scheduling. Post across 10+ platforms in one click.",
    cta: "Claim Your Spot",
    valueProp: "Post to 10 platforms instantly",
  },
];

const DEMO_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600",
    alt: "Social media content calendar",
    width: 600,
    height: 400,
  },
  {
    url: "https://images.unsplash.com/photo-1432889821006-3149403d44b7?w=600",
    alt: "Creative workspace with analytics",
    width: 600,
    height: 400,
  },
  {
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    alt: "Digital marketing dashboard",
    width: 600,
    height: 400,
  },
];

function generateSimulatedContent(topic: string, contentType: string) {
  const randomIndex = Math.floor(Math.random() * DEMO_CAPTIONS.length);
  const caption = DEMO_CAPTIONS[randomIndex]
    .replace("content creation", topic)
    .replace("content", topic);
  const hashtags = DEMO_HASHTAGS[randomIndex].slice(0, 5 + Math.floor(Math.random() * 5));
  const ad = DEMO_AD_COPIES[Math.floor(Math.random() * DEMO_AD_COPIES.length)];
  const image = DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];

  return {
    caption,
    hashtags,
    image,
    adCopy: ad,
    videoScript: `[SCENE START]\n\nINTRO (0-3s): Hook - "${topic} is NOT what you think"\n\nBODY (3-12s): Quick cuts showing transformation/results\n- Text overlay: "Day 1 vs Day 30"\n- B-roll of the process\n- Voiceover explaining the key insight\n\nOUTRO (12-15s): Call to action\n- "Follow for more ${topic} tips"\n- "Comment 'guide' for the free resource"\n\n[SCENE END]`,
    engagement: {
      estimatedViews: Math.floor(Math.random() * 50000) + 5000,
      estimatedLikes: Math.floor(Math.random() * 5000) + 500,
      estimatedShares: Math.floor(Math.random() * 500) + 50,
    },
    bestTimeToPost: ["7-9 AM", "12-2 PM", "7-9 PM"][Math.floor(Math.random() * 3)],
    trendingSounds: [
      "Viral synth beat - #1 trending on TikTok",
      "Upbeat corporate - Top 10 LinkedIn audio",
      "Chill lo-fi - Trending on Reels",
    ],
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, contentType, platform } = body;

    if (!topic || !contentType) {
      return NextResponse.json(
        { success: false, error: "Topic and content type are required" },
        { status: 400 }
      );
    }

    // Generate simulated content
    const simulatedContent = generateSimulatedContent(topic, contentType);

    // Real OpenAI API integration (ready when OPENAI_API_KEY is set)
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
    // if (process.env.OPENAI_API_KEY) {
    //   const completion = await openai.chat.completions.create({
    //     model: "gpt-4o-mini",
    //     messages: [
    //       { role: "system", content: `You are a professional content creator. Generate ${contentType} content about ${topic} for ${platform || 'social media'}.` },
    //       { role: "user", content: `Generate viral ${contentType} content about ${topic}. Include engaging captions, relevant hashtags, and platform-specific best practices. Make it feel authentic and trending.` }
    //     ],
    //   });
    //   // Use real AI response here
    // }

    return NextResponse.json({
      success: true,
      topic,
      contentType,
      platform: platform || "all",
      generated: {
        ...simulatedContent,
        contentId: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generatedAt: new Date().toISOString(),
        isDemo: true, // Flag to indicate demo mode
      },
      realApiReady: !!process.env.OPENAI_API_KEY, // Will be true when API key is set
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 }
    );
  }
}