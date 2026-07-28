// src/app/api/generate-video/route.ts
// AI-powered video script generation. Real OpenAI (GPT-4o-mini) with a
// polished template fallback for dev mode.
import { NextResponse } from "next/server";
import { generateVideoScriptWithAI, isOpenAIConfigured } from "@/lib/openai";

const FALLBACK_VIDEO = (topic: string, style: string, voiceover: string, duration: string) => ({
  script: `Open with a strong hook about ${topic}. Show the problem in the first 3 seconds. Then reveal the solution using ${style}. Build social proof with a quick before/after. Close with a clear CTA: tap the link in bio to get started. End on a memorable line that makes viewers want to share.`,
  scenes: [
    { start: "0:00", end: "0:03", visual: "Close-up of frustrated person with the problem", voiceover: `If you're struggling with ${topic}, watch this.`, textOverlay: "Stop scrolling" },
    { start: "0:03", end: "0:08", visual: "Cut to a clean product reveal with dramatic lighting", voiceover: `Here's the ${style} that changed everything.`, textOverlay: "The solution" },
    { start: "0:08", end: "0:15", visual: "Demo / B-roll showing the product in use", voiceover: `In just 7 days, here's what happened...`, textOverlay: "The result" },
    { start: "0:15", end: "0:25", visual: "Quick cuts: testimonials, before/after, social proof", voiceover: `Thousands of people are already seeing results. You could be next.`, textOverlay: "Real results" },
    { start: "0:25", end: duration, visual: "Strong CTA graphic + product + brand logo", voiceover: `Tap the link in bio to get started. Don't wait.`, textOverlay: "Link in bio 👆" },
  ],
  hook: `If you're struggling with ${topic}, watch this.`,
  voiceoverStyle: voiceover || "natural, conversational, confident",
  suggestedMusic: "Upbeat lo-fi beat with a strong bass drop at 0:08",
  shotList: [
    "Close-up of person looking frustrated",
    "Quick cut to product on clean background",
    "Product being used in real-life setting",
    "Before/after side-by-side comparison",
    "Testimonial quote on screen with stock footage",
    "Final CTA card with logo and link",
  ],
  cta: `Tap the link in bio to start using ${style === "AI" ? "our AI" : "this"} for ${topic}.`,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandUrl, topic, style, voiceover, duration, brandName } = body;
    if (!topic) {
      return NextResponse.json({ success: false, error: "topic is required" }, { status: 400 });
    }
    const dur = duration || "30s";
    const styleVal = style || "UGC review";
    const voiceoverVal = voiceover || "AI natural voice";
    // Try real OpenAI
    const ai = await generateVideoScriptWithAI({ brandUrl, topic, style: styleVal, voiceover: voiceoverVal, duration: dur });
    if (ai.ok) {
      return NextResponse.json({
        success: true,
        message: "AI video script generated",
        video: {
          url: `/output/ai_generated_${Date.now()}.mp4`,
          duration: dur,
          style: styleVal,
          voiceover: voiceoverVal,
          footageSource: "stock + brand assets",
          affiliateLink: brandUrl ? { url: brandUrl, placement: "bio + description" } : null,
          script: ai.data.script,
          scenes: ai.data.scenes,
          hook: ai.data.hook,
          voiceoverStyle: ai.data.voiceoverStyle,
          suggestedMusic: ai.data.suggestedMusic,
          shotList: ai.data.shotList,
          cta: ai.data.cta,
        },
        platforms: ["tiktok", "instagram", "youtube", "linkedin"],
        metadata: {
          topic,
          brandName: brandName || null,
          estimatedCompletion: "2-3 minutes",
        },
        aiModel: ai.model,
        aiConfigured: true,
        generatedAt: new Date().toISOString(),
      });
    }
    // Fallback
    const fallback = FALLBACK_VIDEO(topic, styleVal, voiceoverVal, dur);
    return NextResponse.json({
      success: true,
      message: "AI video script generated (template mode — set OPENAI_API_KEY for real AI)",
      video: {
        url: `/output/ai_generated_${Date.now()}.mp4`,
        duration: dur,
        style: styleVal,
        voiceover: voiceoverVal,
        footageSource: "stock + brand assets",
        affiliateLink: brandUrl ? { url: brandUrl, placement: "bio + description" } : null,
        ...fallback,
      },
      platforms: ["tiktok", "instagram", "youtube", "linkedin"],
      metadata: {
        topic,
        brandName: brandName || null,
        estimatedCompletion: "2-3 minutes",
      },
      aiModel: "template",
      aiConfigured: isOpenAIConfigured(),
      aiError: ai.message,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI video generation error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate video" },
      { status: 500 }
    );
  }
}
