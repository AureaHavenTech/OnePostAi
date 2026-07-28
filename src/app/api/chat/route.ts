import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { parseChatIntent, generateContent, generateSchedule } from "@/lib/services/backend";
import { chatWithAI, isOpenAIConfigured, type ChatMessage } from "@/lib/openai";

// Conversational limit — we cap history at the last 20 turns to keep the context
// window manageable and the API request fast.
const MAX_HISTORY_TURNS = 20;

// Default reply used when OpenAI is not configured AND the intent is unknown.
// We use a polished static message so the chat still feels alive in dev mode.
const DEFAULT_REPLY = `I'm OnePost AI — your AI content agency. I can:

📱 Create & post to all 7 platforms at once
🤖 AI-generate videos from text (no filming needed)
📅 Schedule 3+ posts/day for weeks ahead
🎯 Find trending hashtags & optimal posting times
🛍️ Create Shopify product pages

What do you need? Just tell me like you would a human.`;

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 60 },
    validate: (b) => (!b?.message ? "message is required" : true),
  },
  async (req, body) => {
    const { message, history, brandName, conversationId } = body;
    // Build a normalized history array (last MAX_HISTORY_TURNS, alternating u/a)
    const safeHistory: ChatMessage[] = Array.isArray(history)
      ? history
          .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-MAX_HISTORY_TURNS)
      : [];
    const intent = parseChatIntent(message);
    const response: {
      reply: string;
      intent: typeof intent;
      data: any;
      conversationId?: string;
      aiModel?: string;
      aiConfigured?: boolean;
    } = {
      reply: "",
      intent,
      data: null,
      conversationId: conversationId || `conv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      aiConfigured: isOpenAIConfigured(),
    };
    // For action intents, execute the action locally (these are the "deterministic"
    // branches) and then OPTIONALLY use OpenAI to polish the human-facing reply.
    switch (intent.action) {
      case "create": {
        const brand = intent.brandName || brandName || "your brand";
        const content = await generateContent({
          brandName: brand,
          prompt: message,
          platforms: intent.platforms || [],
        });
        const baseReply = `I'll create content for ${brand} across ${intent.platforms?.length || 7} platforms. Here's what I've generated — scripts, captions, and trending hashtags for each platform. Want me to schedule these for posting?`;
        // Polish the reply with the real conversational model (if configured)
        const polished = await chatWithAI({
          message,
          history: safeHistory,
          brandName: brand,
          context: `You just generated multi-platform content for ${brand}. Briefly confirm what you did in 1-2 sentences (under 30 words), and ask if they want to schedule or refine.`,
        });
        response.reply = polished.ok ? polished.data : baseReply;
        if (polished.ok) response.aiModel = polished.model;
        response.data = content;
        break;
      }
      case "schedule": {
        const schedule = generateSchedule({
          brandName: intent.brandName || brandName || "your brand",
          platforms: intent.platforms || ["tiktok", "instagram", "youtube"],
          postsPerDay: 3,
          startDate: new Date(),
          durationDays: 14,
        });
        const baseReply = `I've scheduled ${schedule.length} posts over the next 14 days across ${(intent.platforms || ["tiktok", "instagram", "youtube"]).length} platforms. Each post goes out at the optimal time for maximum engagement. You're all set — it runs on autopilot.`;
        const polished = await chatWithAI({
          message,
          history: safeHistory,
          brandName: intent.brandName || brandName,
          context: `You just scheduled ${schedule.length} posts over 14 days. Confirm the schedule in 1-2 sentences (under 30 words).`,
        });
        response.reply = polished.ok ? polished.data : baseReply;
        if (polished.ok) response.aiModel = polished.model;
        response.data = { schedule };
        break;
      }
      case "post": {
        const baseReply = `Ready to publish! I'll format your content for each platform's specs (9:16 for TikTok/Reels, 1:1 for Instagram, 16:9 for YouTube) and post simultaneously with the right hashtags. Which content would you like me to post?`;
        const polished = await chatWithAI({
          message,
          history: safeHistory,
          brandName: intent.brandName || brandName,
        });
        response.reply = polished.ok ? polished.data : baseReply;
        if (polished.ok) response.aiModel = polished.model;
        break;
      }
      case "analyze": {
        const baseReply = `I'm scanning trending topics in ${intent.brandName || brandName || "your niche"} right now. I'll pull the latest viral keywords, hashtags, and content formats that are getting the most engagement. Give me a moment...`;
        const polished = await chatWithAI({
          message,
          history: safeHistory,
          brandName: intent.brandName || brandName,
          context: `The user wants to analyze trends in ${intent.brandName || brandName || "their niche"}. Briefly explain what you'll look for in 1-2 sentences (under 30 words).`,
        });
        response.reply = polished.ok ? polished.data : baseReply;
        if (polished.ok) response.aiModel = polished.model;
        break;
      }
      default: {
        // Free-form conversation — fully delegated to the real OpenAI chat model
        const ai = await chatWithAI({
          message,
          history: safeHistory,
          brandName: intent.brandName || brandName,
        });
        if (ai.ok) {
          response.reply = ai.data;
          response.aiModel = ai.model;
        } else {
          response.reply = DEFAULT_REPLY;
        }
        break;
      }
    }
    return response;
  }
);
