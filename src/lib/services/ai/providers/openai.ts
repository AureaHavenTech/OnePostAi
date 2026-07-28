/**
 * OnePost AI — OpenAI Provider (Next.js / TypeScript)
 * GPT-4o for scripts, captions, product pages, ad campaigns.
 * DALL-E 3 for product images, thumbnails, UGC visuals.
 *
 * Builds on the shared client in @/lib/openai but adds image generation,
 * product pages, ad campaigns, and content-type-specific script prompts.
 */

import OpenAI from "openai";
import { isOpenAIConfigured, getOpenAIClient } from "@/lib/openai";
import type {
  ProviderResult,
  ContentType,
  Tone,
  Platform,
  ImageStyle,
  AIScript,
  AIImage,
  AIProductPage,
  AIAdCampaign,
  ChatMessage,
  ChatResult,
} from "@/lib/services/ai/types";

// ── Helpers ──────────────────────────────────────────────────────────

function missingKeyErr(): Error {
  const e = new Error("OPENAI_API_KEY is not configured. Set it in .env to enable AI generation.");
  (e as any).code = "MISSING_API_KEY";
  (e as any).provider = "openai";
  return e;
}

function safeJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return { raw: text } as unknown as T;
  }
}

function success<T>(data: T): ProviderResult<T> {
  return { success: true, data };
}

function failure(code: string, message: string): ProviderResult<any> {
  return { success: false, error: message, code, provider: "openai" };
}

// ── Content-Type Prompt Templates ────────────────────────────────────

const CONTENT_PROMPTS: Record<ContentType, (product: string, tone: string, duration: number) => string> = {
  unboxing: (p, t, d) =>
    `Write a ${d}-second UNBOXING script for "${p}". Tone: ${t}. Structure: [HOOK 0-3s] → [BODY 3-${d - 3}s] → [CTA last 3s]. Return JSON: {"hook":"...","body":["step1","step2","step3"],"cta":"...","captions":{"tiktok":"...","instagram":"...","youtube":"...","facebook":"...","linkedin":"..."},"hashtags":["#tag1"],"onScreenText":["overlay1"]}`,

  voiceover: (p, t, d) =>
    `Write a ${d}-second VOICEOVER script for "${p}". Tone: ${t}. Structure: Hook → Problem → Solution → Proof → CTA. Return JSON: {"hook":"...","script":"...","cta":"...","captions":{"tiktok":"...","instagram":"...","youtube":"...","facebook":"...","linkedin":"..."},"hashtags":["#tag1"],"bRoll":["suggestion1"],"musicVibe":"upbeat/calm/luxury"}`,

  talkingHead: (p, t, d) =>
    `Write a ${d}-second TALKING HEAD script for "${p}". Tone: ${t}. Structure: Personal story → Discovery → Demonstration → Recommendation. Return JSON: {"hook":"...","script":"...","cta":"...","captions":{"tiktok":"...","instagram":"...","youtube":"...","facebook":"...","linkedin":"..."},"hashtags":["#tag1"],"deliveryNotes":"..."}`,

  productDemo: (p, t, d) =>
    `Write a ${d}-second PRODUCT DEMO script for "${p}". Tone: ${t}. Structure: "Watch this..." → Action → 3 features → Before/After → "Get yours..." Return JSON: {"hook":"...","script":"...","features":["f1","f2","f3"],"cta":"...","captions":{"tiktok":"...","instagram":"...","youtube":"...","facebook":"...","linkedin":"..."},"hashtags":["#tag1"]}`,

  storytelling: (p, t, d) =>
    `Write a ${d}-second STORYTELLING script for "${p}". Tone: ${t}. Structure: Relatable situation → Emotional low → Discovery → Transformation → Share. Return JSON: {"hook":"...","story":"...","cta":"...","captions":{"tiktok":"...","instagram":"...","youtube":"...","facebook":"...","linkedin":"..."},"hashtags":["#tag1"],"emotionalArc":"..."}`,

  trendingHook: (p, t, d) =>
    `Write a ${d}-second TRENDING HOOK script for "${p}". Tone: ${t}. Structure: Meme/trend reference → Product tie-in → Punchline → CTA. Return JSON: {"hook":"...","script":"...","cta":"...","captions":{"tiktok":"...","instagram":"...","youtube":"...","facebook":"...","linkedin":"..."},"hashtags":["#tag1"],"trendReference":"..."}`,

  ugc: (p, t, d) =>
    `Write a ${d}-second UGC-STYLE script for "${p}". Tone: ${t}. Casual, authentic, unpolished — as if a real customer filmed on their phone. Structure: "Okay so I just got..." → First impression → Honest review → "If you want to try it..." Return JSON: {"hook":"...","script":"...","cta":"...","captions":{"tiktok":"...","instagram":"...","youtube":"...","facebook":"...","linkedin":"..."},"hashtags":["#tag1"],"ugcStyle":"phone footage, natural lighting"}`,
};

// ── Public API ───────────────────────────────────────────────────────

/**
 * Generate a content script for a specific content type.
 */
export async function generateScript(
  product: string,
  contentType: ContentType = "ugc",
  tone: Tone = "upbeat",
  duration: number = 15
): Promise<ProviderResult<AIScript>> {
  try {
    if (!isOpenAIConfigured()) throw missingKeyErr();
    const openai = getOpenAIClient();
    const promptFn = CONTENT_PROMPTS[contentType];
    if (!promptFn) {
      return failure("BAD_REQUEST", `Unknown content type: ${contentType}. Valid: ${Object.keys(CONTENT_PROMPTS).join(", ")}`);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert social media content strategist. Always return valid JSON. Never include markdown code fences — raw JSON only." },
        { role: "user", content: promptFn(product, tone, duration) },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "{}";
    return success(safeJson<AIScript>(raw));
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("OPENAI_ERROR", err.message || String(err));
  }
}

/**
 * Generate a caption / hashtag set for a given platform.
 */
export async function generateCaption(
  product: string,
  platform: string,
  tone: string = "upbeat",
  context: Record<string, unknown> = {}
): Promise<ProviderResult<{ caption: string; hashtags: string[] }>> {
  try {
    if (!isOpenAIConfigured()) throw missingKeyErr();
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: 'You are a social media copywriter. Return valid JSON with "caption" and "hashtags" array.' },
        { role: "user", content: `Write a ${tone} caption for ${platform} promoting "${product}". Context: ${JSON.stringify(context)}. Return JSON: {"caption": "...", "hashtags": ["..."]}` },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    return success(safeJson(response.choices[0]?.message?.content || "{}"));
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("OPENAI_ERROR", err.message || String(err));
  }
}

/**
 * Generate an AI image using DALL-E 3.
 */
export async function generateImage(
  prompt: string,
  style: ImageStyle = "product-shot",
  size: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024"
): Promise<ProviderResult<AIImage>> {
  try {
    if (!isOpenAIConfigured()) throw missingKeyErr();
    const openai = getOpenAIClient();

    const styleModifiers: Record<ImageStyle, string> = {
      "product-shot": "Professional product photography on a clean background, studio lighting, commercial quality, 4K detail",
      "ugc-thumbnail": "Casual user-generated content style thumbnail, natural lighting, phone camera aesthetic, authentic feel",
      influencer: "Lifestyle influencer photo style, warm tones, aspirational aesthetic, golden hour lighting",
      "brand-kit": "Minimal brand identity graphic, luxury aesthetic, clean typography space, premium feel",
    };

    const modifier = styleModifiers[style] || styleModifiers["product-shot"];
    const fullPrompt = `${prompt}. ${modifier}`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size,
      quality: "hd",
      style: "vivid",
    });

    const imageData = response.data?.[0];
    return success({
      url: imageData?.url || "",
      revisedPrompt: imageData?.revised_prompt || prompt,
      style,
      size,
    });
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("OPENAI_ERROR", err.message || String(err));
  }
}

/**
 * Generate a complete Shopify / e-commerce product page.
 */
export async function generateProductPage(
  product: string,
  details: { category?: string; targetAudience?: string; pricePoint?: string; keyBenefits?: string } = {}
): Promise<ProviderResult<AIProductPage>> {
  try {
    if (!isOpenAIConfigured()) throw missingKeyErr();
    const openai = getOpenAIClient();
    const { category = "", targetAudience = "", pricePoint = "", keyBenefits = "" } = details;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert e-commerce copywriter and SEO strategist. Return valid JSON only." },
        {
          role: "user",
          content: `Create a complete product page for "${product}". Category: ${category}. Target audience: ${targetAudience}. Price: ${pricePoint}. Key benefits: ${keyBenefits}. Return JSON: {"title":"...","metaDescription":"...","heroHeadline":"...","heroSubheadline":"...","productDescription":"...","keyFeatures":[{"title":"...","description":"..."}],"specifications":[{"label":"...","value":"..."}],"pricingStrategy":{"recommendedPrice":"...","anchorPrice":"...","paymentOptions":["..."]},"faq":[{"question":"...","answer":"..."}],"socialProofBlocks":["..."],"urgencyTriggers":["..."],"seoKeywords":["..."],"guaranteeText":"..."}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    return success(safeJson<AIProductPage>(response.choices[0]?.message?.content || "{}"));
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("OPENAI_ERROR", err.message || String(err));
  }
}

/**
 * Generate ad campaign creative for Meta / TikTok / Instagram.
 */
export async function generateAdCampaign(
  product: string,
  platform: string = "meta",
  goal: string = "conversions"
): Promise<ProviderResult<AIAdCampaign>> {
  try {
    if (!isOpenAIConfigured()) throw missingKeyErr();
    const openai = getOpenAIClient();

    const platformGuides: Record<string, string> = {
      meta: "Meta (Facebook + Instagram) ad best practices. Primary text max 125 chars.",
      tiktok: "TikTok Spark Ads best practices. Casual, native-feeling. Hook in first 1.5 seconds.",
      instagram: "Instagram Story + Feed ad best practices. Visual-first.",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a performance marketing creative strategist. ${platformGuides[platform] || platformGuides.meta} Goal: ${goal}. Return valid JSON only.`,
        },
        {
          role: "user",
          content: `Create ad creative for "${product}" on ${platform} with goal: ${goal}. Return JSON: {"campaignName":"...","headline":"...","primaryText":"...","description":"...","cta":"shop_now|learn_more|sign_up|watch_more","adVariants":[{"angle":"benefit-driven","headline":"...","primaryText":"..."},{"angle":"social-proof","headline":"...","primaryText":"..."},{"angle":"curiosity-gap","headline":"...","primaryText":"..."}],"audienceTargeting":{"interests":["..."],"behaviors":["..."],"demographics":"..."},"budgetTips":"...","thumbnailPrompt":"..."}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    return success(safeJson<AIAdCampaign>(response.choices[0]?.message?.content || "{}"));
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("OPENAI_ERROR", err.message || String(err));
  }
}

/**
 * Conversational chat — freeform AI chat for the OnePost assistant.
 */
export async function chat(
  messages: ChatMessage[],
  systemContext: string = ""
): Promise<ProviderResult<ChatResult>> {
  try {
    if (!isOpenAIConfigured()) throw missingKeyErr();
    const openai = getOpenAIClient();

    const systemMsg =
      systemContext ||
      "You are Axel, the AI assistant for OnePost AI. You help users create scripts, images, videos, captions, product pages, and ad campaigns. You are conversational, unfiltered, premium, and authentic.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMsg },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    return success({
      reply: response.choices[0]?.message?.content || "",
      model: response.model,
      usage: response.usage
        ? {
            prompt_tokens: response.usage.prompt_tokens,
            completion_tokens: response.usage.completion_tokens,
            total_tokens: response.usage.total_tokens,
          }
        : undefined,
    });
  } catch (err: any) {
    if (err.code === "MISSING_API_KEY") return failure("MISSING_API_KEY", err.message);
    return failure("OPENAI_ERROR", err.message || String(err));
  }
}
