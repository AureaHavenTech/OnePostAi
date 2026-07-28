/**
 * OnePost AI — Unified AI Pipeline Orchestrator (Next.js / TypeScript)
 *
 * Single entrypoint that coordinates all AI providers:
 *   OpenAI   → scripts, captions, images (DALL-E 3), product pages, ad campaigns, chat
 *   Replicate → video generation, image-to-video, lip-sync
 *   ElevenLabs → voiceovers, TTS
 */

import * as openai from "@/lib/services/ai/providers/openai";
import * as replicate from "@/lib/services/ai/providers/replicate";
import * as elevenlabs from "@/lib/services/ai/providers/elevenlabs";
import * as avatar from "@/lib/services/ai/providers/avatar";
import type {
  AIProvider,
  ProviderResult,
  ProviderStatus,
  ContentType,
  Tone,
  Platform,
  GenerateContentInput,
  GenerateContentOutput,
  AIProductPage,
  AIAdCampaign,
  AIImage,
  AIVoiceover,
  AIAvatar,
  AvatarInput,
  ChatMessage,
  ChatResult,
  ImageStyle,
} from "@/lib/services/ai/types";

// ── Helpers ──────────────────────────────────────────────────────────

async function wrap<T>(
  provider: string,
  fn: () => Promise<ProviderResult<T>>
): Promise<{ data?: T; error?: string }> {
  const result = await fn();
  if (result.success) {
    return { data: result.data };
  }
  console.error(`[Pipeline] ${provider} error:`, result.error);
  return { error: result.error };
}

/**
 * Check which providers are available (have API keys set).
 */
export function getAvailableProviders(): Record<AIProvider, boolean> {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    replicate: !!process.env.REPLICATE_API_TOKEN,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    stability: !!process.env.STABILITY_API_KEY,
    heygen: !!process.env.HEYGEN_API_KEY,
  };
}

export function healthCheck(): { status: string; activeProviders: string[]; missingProviders: string[]; providers: ProviderStatus[] } {
  const available = getAvailableProviders();
  const providers: ProviderStatus[] = Object.entries(available).map(([key, val]) => ({
    provider: key as AIProvider,
    available: val,
    message: val ? `${key} configured` : `${key} API key not set`,
  }));
  const active = providers.filter((p) => p.available).map((p) => p.provider);
  const missing = providers.filter((p) => !p.available).map((p) => p.provider);

  return {
    status: active.length > 0 ? "ok" : "degraded",
    activeProviders: active,
    missingProviders: missing,
    providers,
  };
}

// ── Core Pipeline Functions ──────────────────────────────────────────

/**
 * Generate a complete content package: script + images + voiceover + video.
 * This is the main entry point for "Create a 15-second unboxing video for Mellow Sleep."
 */
export async function generateContent(params: GenerateContentInput): Promise<GenerateContentOutput> {
  const {
    product,
    contentType = "ugc",
    tone = "upbeat",
    duration = 15,
    platforms = ["tiktok", "instagram", "facebook", "youtube", "linkedin"],
    brand = {},
    options = {},
  } = params;

  const available = getAvailableProviders();
  const results: GenerateContentOutput = {
    product,
    contentType,
    tone,
    duration,
    platforms,
    generatedAt: new Date().toISOString(),
    providers: available,
  };

  // Step 1: Generate Script (OpenAI)
  if (available.openai) {
    const { data: script, error } = await wrap("openai", () =>
      openai.generateScript(product, contentType, tone, duration)
    );
    if (script) {
      results.script = script;

      // Generate per-platform captions
      results.captions = {};
      for (const platform of platforms) {
        const { data: caption } = await wrap("openai", () =>
          openai.generateCaption(product, platform, tone, { contentType, duration, brand: brand.name })
        );
        if (caption) results.captions[platform] = caption;
      }
    } else {
      results.scriptError = error;
    }
  } else {
    results.scriptError = "OPENAI_API_KEY not configured. Set it in .env to enable AI script generation.";
  }

  // Step 2: Generate Image (DALL-E 3)
  if (options.includeImage !== false && available.openai) {
    const imageStyle: ImageStyle = contentType === "ugc" ? "ugc-thumbnail" : "product-shot";
    const imagePrompt =
      options.imagePrompt ||
      `${product} product photography, ${tone} aesthetic, social media content, eye-catching thumbnail`;

    const { data: image, error } = await wrap("openai", () => openai.generateImage(imagePrompt, imageStyle));
    if (image) {
      results.image = image;
    } else {
      results.imageError = error;
    }
  }

  // Step 3: Generate Voiceover (ElevenLabs)
  if (options.includeVoice !== false && available.elevenlabs && results.script) {
    const voiceText = results.script.script || results.script.hook || product;
    const { data: voice, error } = await wrap("elevenlabs", () =>
      elevenlabs.generateSpeech(voiceText.substring(0, 1000), tone)
    );
    if (voice) {
      results.voiceover = {
        voiceName: voice.voiceName,
        tone: voice.tone,
        audioBase64: voice.audioBase64,
        mimeType: voice.mimeType,
      };
    } else {
      results.voiceoverError = error;
    }
  } else if (options.includeVoice !== false && !available.elevenlabs) {
    results.voiceoverError = "ELEVENLABS_API_KEY not configured.";
  }

  // Step 4: Generate Video (Replicate)
  if (options.includeVideo === true && available.replicate) {
    const videoPrompt =
      options.videoPrompt ||
      `${product} product showcase, ${tone} vibe, social media short, ${duration} seconds, vertical format`;

    const { data: video, error } = await wrap("replicate", () =>
      replicate.textToVideo(videoPrompt, {
        model: "zeroscope",
        numFrames: Math.min(duration * 8, 120),
        fps: 8,
        width: 576,
        height: 1024,
      })
    );
    if (video) {
      results.video = video;
    } else {
      results.videoError = error;
    }
  } else if (options.includeVideo === true && !available.replicate) {
    results.videoError = "REPLICATE_API_TOKEN not configured.";
  }

  return results;
}

/**
 * Generate a complete product page.
 */
export async function generateProductPage(
  product: string,
  details?: { category?: string; targetAudience?: string; pricePoint?: string; keyBenefits?: string }
): Promise<ProviderResult<AIProductPage>> {
  return openai.generateProductPage(product, details);
}

/**
 * Generate an ad campaign.
 */
export async function generateAdCampaign(
  product: string,
  platform?: string,
  goal?: string
): Promise<ProviderResult<AIAdCampaign>> {
  return openai.generateAdCampaign(product, platform, goal);
}

/**
 * Generate an image only.
 */
export async function generateImage(
  prompt: string,
  style?: ImageStyle,
  size?: "1024x1024" | "1792x1024" | "1024x1792"
): Promise<ProviderResult<AIImage>> {
  return openai.generateImage(prompt, style, size);
}

/**
 * Generate a voiceover only.
 */
export async function generateVoiceover(
  text: string,
  tone?: string,
  options?: elevenlabs.SpeechOptions
): Promise<ProviderResult<AIVoiceover>> {
  return elevenlabs.generateSpeech(text, tone, options);
}

/**
 * Generate a video only.
 */
export async function generateVideo(
  prompt: string,
  model?: string,
  options?: replicate.TextToVideoOptions
): Promise<ProviderResult<import("@/lib/services/ai/types").AIVideo>> {
  return replicate.textToVideo(prompt, { ...options, model: model || "zeroscope" });
}

/**
 * Generate an AI avatar / digital twin video.
 */
export async function generateAvatar(
  input: AvatarInput
): Promise<ProviderResult<AIAvatar>> {
  return avatar.generateAvatar(input);
}

/**
 * Chat with the AI assistant.
 */
export async function chat(
  messages: ChatMessage[],
  systemContext?: string
): Promise<ProviderResult<ChatResult>> {
  return openai.chat(messages, systemContext);
}

// ── Exports ──────────────────────────────────────────────────────────

export { openai, replicate, elevenlabs, avatar };
