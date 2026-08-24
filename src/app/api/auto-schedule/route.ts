// src/app/api/auto-schedule/route.ts
// AI-powered smart scheduling. Uses backend scheduling engine + OpenAI
// for intelligent schedule optimization. Falls back to static optimal-time
// data when OPENAI_API_KEY is not set.
import { NextRequest, NextResponse } from "next/server";
import { withApi } from "@/lib/api-utils";
import { generateSchedule, OPTIMAL_TIMES } from "@/lib/services/backend";
import { chatCompletion, isOpenAIConfigured } from "@/lib/openai";

export const POST = withApi(
  {
    method: "POST",
    cache: "no-store",
    rateLimit: { windowMs: 60_000, max: 30 },
  },
  async (req, body) => {
    const {
      posts,
      scheduleType,
      platforms,
      affiliateLinks,
      brandName = "Your Brand",
      startDate: startDateStr,
      durationDays = 14,
      postsPerDay = 3,
    } = body;

    const requestedPlatforms: string[] = Array.isArray(platforms) && platforms.length
      ? platforms
      : ["tiktok", "instagram", "youtube", "linkedin"];

    const startDate = startDateStr ? new Date(startDateStr) : new Date();

    // Build a text summary of the posts for AI optimization (if available)
    const postSummary = Array.isArray(posts) && posts.length
      ? posts.map((p: any, i: number) =>
          `${i + 1}. "${p?.title || p?.prompt || `Post ${i + 1}`}"` +
          (p?.platforms ? ` → ${Array.isArray(p.platforms) ? p.platforms.join(", ") : p.platforms}` : "")
        ).join("\n")
      : "No specific posts provided";

    // Use backend scheduling engine for foundational schedule
    const baseSchedule = generateSchedule({
      brandName,
      platforms: requestedPlatforms,
      postsPerDay,
      startDate,
      durationDays,
    });

    // Try AI-powered schedule optimization
    type ScheduleAnalysis = {
      recommendations: string[];
      bestTimeSummary: Record<string, string>;
      strategy: string;
    };

    let aiModel = "template";
    let recommendations: string[] = [];
    let strategy = `Optimal posting schedule across ${requestedPlatforms.length} platforms — ${postsPerDay} posts/day for ${durationDays} days`;
    let bestTimeSummary: Record<string, string> = {};

    if (isOpenAIConfigured()) {
      const aiResult = await chatCompletion<ScheduleAnalysis>({
        messages: [
          {
            role: "system",
            content: "You are a social media scheduling strategist. Analyze posts and platforms, then suggest optimal scheduling strategies. Return JSON only.",
          },
          {
            role: "user",
            content: `Analyze this content schedule and provide optimization recommendations:

BRAND: ${brandName}
PLATFORMS: ${requestedPlatforms.join(", ")}
POSTS PER DAY: ${postsPerDay}
DURATION: ${durationDays} days starting ${startDate.toISOString().split("T")[0]}
SCHEDULE TYPE: ${scheduleType || "mixed"}

POSTS TO SCHEDULE:
${postSummary}

OPTIMAL TIMES PER PLATFORM:
${Object.entries(OPTIMAL_TIMES).map(([p, times]) => `- ${p}: ${times.join(", ")}`).join("\n")}

Return JSON:
{
  "recommendations": ["3-5 specific optimization tips for this schedule"],
  "bestTimeSummary": { "<platform>": "brief best-time summary" },
  "strategy": "1-2 sentence overall strategy for this schedule"
}
JSON only.`,
          },
        ],
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 600,
        responseFormat: "json_object",
      });

      if (aiResult.ok) {
        aiModel = aiResult.model;
        recommendations = aiResult.data.recommendations || [];
        bestTimeSummary = aiResult.data.bestTimeSummary || {};
        strategy = aiResult.data.strategy || strategy;
      }
    }

    // Build time summary from static data if AI didn't provide one
    if (Object.keys(bestTimeSummary).length === 0) {
      for (const p of requestedPlatforms) {
        const times = OPTIMAL_TIMES[p];
        bestTimeSummary[p] = times ? `${times.length} windows: ${times.join(", ")}` : "12:00 PM daily";
      }
    }

    return {
      success: true,
      message: `Scheduled ${baseSchedule.length} posts across ${requestedPlatforms.length} platforms over ${durationDays} days`,
      schedule: baseSchedule.slice(0, 30), // Return first 30 for display
      totalPosts: baseSchedule.length,
      optimalPostingTimes: bestTimeSummary,
      recommendations,
      strategy,
      aiModel,
      aiConfigured: isOpenAIConfigured(),
    };
  }
);
