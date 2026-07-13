import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { parseChatIntent, generateContent, generateSchedule } from "@/lib/services/backend";

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 60 },
    validate: (b) => (!b?.message ? "message is required" : true),
  },
  async (req, body) => {
    const { message } = body;
    const intent = parseChatIntent(message);
    const response: { reply: string; intent: typeof intent; data: any } = { reply: "", intent, data: null };

    switch (intent.action) {
      case "create": {
        const brand = intent.brandName || "your brand";
        const content = await generateContent({
          brandName: brand,
          prompt: message,
          platforms: intent.platforms || [],
        });
        response.reply = `I'll create content for ${brand} across ${intent.platforms?.length || 7} platforms. Here's what I've generated — scripts, captions, and trending hashtags for each platform. Want me to schedule these for posting?`;
        response.data = content;
        break;
      }
      case "schedule": {
        const schedule = generateSchedule({
          brandName: intent.brandName || "your brand",
          platforms: intent.platforms || ["tiktok", "instagram", "youtube"],
          postsPerDay: 3,
          startDate: new Date(),
          durationDays: 14,
        });
        response.reply = `I've scheduled ${schedule.length} posts over the next 14 days across ${(intent.platforms || ["tiktok", "instagram", "youtube"]).length} platforms. Each post goes out at the optimal time for maximum engagement. You're all set — it runs on autopilot.`;
        response.data = { schedule };
        break;
      }
      case "post":
        response.reply = `Ready to publish! I'll format your content for each platform's specs (9:16 for TikTok/Reels, 1:1 for Instagram, 16:9 for YouTube) and post simultaneously with the right hashtags. Which content would you like me to post?`;
        break;
      case "analyze":
        response.reply = `I'm scanning trending topics in ${intent.brandName || "your niche"} right now. I'll pull the latest viral keywords, hashtags, and content formats that are getting the most engagement. Give me a moment...`;
        break;
      default:
        response.reply = `I'm OnePost AI — your AI content agency. I can:\n\n📱 Create & post to all 7 platforms at once\n🤖 AI-generate videos from text (no filming needed)\n📅 Schedule 3+ posts/day for weeks ahead\n🎯 Find trending hashtags & optimal posting times\n🛍️ Create Shopify product pages\n\nWhat do you need? Just tell me like you would a human.`;
    }
    return response;
  }
);
