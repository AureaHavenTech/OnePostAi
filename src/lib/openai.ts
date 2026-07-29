// src/lib/openai.ts
// OnePost AI — Real OpenAI integration
// Replaces mock/template content generation with GPT-4o (and friends).
// When OPENAI_API_KEY is missing, helpers return a `{ error, fallback }` shape
// so callers can transparently fall back to template content in dev mode.
//
// Production hardened: circuit breaker + retry wrap all OpenAI calls.

import OpenAI from "openai";
import { withRetry } from "@/lib/retry";
import { breakers } from "@/lib/circuit-breaker";

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

let _client: OpenAI | null = null;
let _clientKey: string | null = null;

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0);
}

export function getOpenAIClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key || !key.trim()) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env (or your hosting provider) to enable real AI generation."
    );
  }
  // Reuse the client if the key hasn't changed (handles runtime env refresh)
  if (!_client || _clientKey !== key) {
    _client = new OpenAI({ apiKey: key });
    _clientKey = key;
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type Platform = "tiktok" | "instagram" | "youtube" | "facebook" | "linkedin" | "snapchat" | "pinterest";

export type ContentTier = "free" | "paid";

export type AIErrorCode = "OPENAI_NOT_CONFIGURED" | "OPENAI_ERROR" | "OPENAI_TIMEOUT" | "OPENAI_BAD_REQUEST";

export type AIFallback<T> = {
  ok: false;
  error: AIErrorCode;
  message: string;
  fallback: T;
};

export type AIResult<T> =
  | { ok: true; data: T; model: string; tokens?: { prompt: number; completion: number; total: number } }
  | AIFallback<T>;

// ---------------------------------------------------------------------------
// Low-level chat wrapper
// ---------------------------------------------------------------------------

export type ChatOptions = {
  messages: ChatMessage[];
  model?: string;            // default: gpt-4o-mini (cheap) — override with gpt-4o for premium
  temperature?: number;      // default: 0.85 for creative, 0.4 for structured
  maxTokens?: number;        // default: 1024
  responseFormat?: "json_object" | "text";
  timeoutMs?: number;        // default: 25000
};

export async function chatCompletion<T = any>(opts: ChatOptions): Promise<AIResult<T>> {
  if (!isOpenAIConfigured()) {
    return {
      ok: false,
      error: "OPENAI_NOT_CONFIGURED",
      message: "OPENAI_API_KEY is not set",
      fallback: null as unknown as T,
    };
  }
  const client = getOpenAIClient();
  const model = opts.model || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const timeoutMs = opts.timeoutMs ?? 25000;

  // Wrap the OpenAI call with circuit breaker + retry
  return breakers.openai.call(() =>
    withRetry(async () => {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await client.chat.completions.create(
          {
            model,
            messages: opts.messages as any,
            temperature: opts.temperature ?? 0.85,
            max_tokens: opts.maxTokens ?? 1024,
            ...(opts.responseFormat === "json_object"
              ? { response_format: { type: "json_object" as const } }
              : {}),
          },
          { signal: controller.signal as any }
        );
        clearTimeout(t);
        const text = resp.choices?.[0]?.message?.content || "";
        let data: any = text;
        if (opts.responseFormat === "json_object") {
          try {
            data = JSON.parse(text);
          } catch (e: any) {
            throw Object.assign(new Error(`Invalid JSON: ${e?.message || e}`), {
              type: "openai_bad_json",
              statusCode: 422,
            });
          }
        }
        return {
          ok: true as const,
          data: data as T,
          model,
          tokens: {
            prompt: resp.usage?.prompt_tokens ?? 0,
            completion: resp.usage?.completion_tokens ?? 0,
            total: resp.usage?.total_tokens ?? 0,
          },
        };
      } catch (e: any) {
        clearTimeout(t);
        const isTimeout =
          e?.name === "AbortError" || /aborted|timeout/i.test(String(e?.message));
        throw Object.assign(
          new Error(e?.message || String(e)),
          {
            type: isTimeout ? "openai_timeout" : "openai_error",
            statusCode: isTimeout ? 504 : 502,
            originalError: e,
          }
        );
      }
    }, { maxRetries: 2, baseDelay: 2000 })
  );
}

// ---------------------------------------------------------------------------
// System prompts
// ---------------------------------------------------------------------------

const SCRIPT_GENERATOR_SYSTEM = `You are the lead copywriter at OnePost AI — a premium AI content agency.
You write viral short-form scripts, captions, and hashtags for 7 platforms:
TikTok, Instagram Reels, YouTube Shorts, Facebook, LinkedIn, Snapchat Spotlight, Pinterest.

Your voice is premium, confident, and modern — think Coco Chanel meets MrBeast.
You never use clichés like "game-changer" or "unlock your potential".
You optimize for HOOK in the first 1-2 seconds (15-30 word video scripts).
You return ONLY valid JSON — no prose, no markdown fences.`;

const CHAT_AGENT_SYSTEM = `You are OnePost AI — a friendly, premium AI content assistant.
You talk like a competent human colleague: concise, warm, confident, never salesy.
You help creators, affiliate marketers, and brand owners plan, create, schedule, and publish content.
You can answer questions about content strategy, social media, hashtags, posting times, and brand voice.
If the user asks you to do something you cannot do (e.g. "buy followers", "hack an account"), politely decline.
Keep replies under 120 words unless the user asks for more detail. Use 1-3 short paragraphs max.`;

// ---------------------------------------------------------------------------
// 1) Content generation (scripts + captions + hashtags per platform)
// ---------------------------------------------------------------------------

export type PlatformContent = {
  platform: Platform;
  script: string;          // 10-30 word video script optimized for first-2-seconds hook
  caption: string;         // on-screen / post caption
  hashtags: string[];      // 5-12 trending hashtags
};

export type GenerateContentAIInput = {
  brandName: string;
  prompt: string;          // what the user wants the content about
  platforms: Platform[];   // which platforms to generate for
  captionStyle?: string;    // short | long | storytelling | professional | funny | sales | educational
  tone?: string;           // optional brand voice
  tier?: ContentTier;      // free = basic hashtags (max 5), paid = viral (10+)
};

export type GenerateContentAIOutput = {
  scripts: Record<Platform, string>;
  captions: Record<Platform, string>;
  hashtags: Record<Platform, string[]>;
  platformContent: PlatformContent[];
};

function buildContentMessages(input: GenerateContentAIInput): ChatMessage[] {
  const { brandName, prompt, platforms, captionStyle = "short", tone, tier = "paid" } = input;
  const capLimit = tier === "free" ? 150 : 350;
  const hashLimit = tier === "free" ? 5 : 12;
  const platformList = platforms.length ? platforms.join(", ") : "tiktok, instagram, youtube, facebook, linkedin";
  const user = `Generate viral short-form content for these inputs:

BRAND: ${brandName}
PROMPT (user's idea): ${prompt}
PLATFORMS: ${platformList}
CAPTION STYLE: ${captionStyle} (keep caption under ${capLimit} chars)
TONE: ${tone || "premium, confident, modern"}
TIER: ${tier} (use ${hashLimit === 5 ? "5" : "10-12"} hashtags per platform)

Return JSON in EXACTLY this shape:
{
  "platforms": {
    "<platform>": {
      "script": "10-30 word video script with a strong hook in the first 1-2 seconds",
      "caption": "caption text, under ${capLimit} chars, matching the ${captionStyle} style",
      "hashtags": ["tag1", "tag2", "...up to ${hashLimit}"]
    },
    ...one entry per platform listed
  }
}

Rules:
- Hook first. No cliché intros.
- Scripts must be SHORT (10-30 words). One strong idea per platform.
- Hashtags mix: 2-3 niche, 2-3 mid-tier, 1-2 broad reach.
- DO NOT include explanations, markdown, or code fences — JSON only.`;
  return [
    { role: "system", content: SCRIPT_GENERATOR_SYSTEM },
    { role: "user", content: user },
  ];
}

export async function generateContentWithAI(input: GenerateContentAIInput): Promise<AIResult<GenerateContentAIOutput>> {
  const platforms = (input.platforms && input.platforms.length ? input.platforms : ["tiktok", "instagram", "youtube", "facebook", "linkedin"]) as Platform[];
  const messages = buildContentMessages(input);
  const res = await chatCompletion<{ platforms: Record<string, { script: string; caption: string; hashtags: string[] }> }>({
    messages,
    model: process.env.OPENAI_CONTENT_MODEL || "gpt-4o-mini",
    temperature: 0.9,
    maxTokens: 1800,
    responseFormat: "json_object",
  });
  if (!res.ok) return res as unknown as AIResult<GenerateContentAIOutput>;
  const data = res.data;
  const scripts: Record<string, string> = {};
  const captions: Record<string, string> = {};
  const hashtags: Record<string, string[]> = {};
  const platformContent: PlatformContent[] = [];
  for (const p of platforms) {
    const entry = data.platforms?.[p] || data.platforms?.[p.toLowerCase() as any];
    const script = entry?.script || `${input.brandName} — ${input.prompt.slice(0, 60)}`;
    const caption = entry?.caption || `${input.brandName} presents: ${input.prompt.slice(0, 100)}`;
    const tags = Array.isArray(entry?.hashtags) ? entry!.hashtags : [];
    scripts[p] = script;
    captions[p] = caption;
    hashtags[p] = tags;
    platformContent.push({ platform: p, script, caption, hashtags: tags });
  }
  return { ok: true, data: { scripts, captions, hashtags, platformContent }, model: res.model, tokens: res.tokens };
}

// ---------------------------------------------------------------------------
// 2) Conversational chat (multi-turn, brand-aware)
// ---------------------------------------------------------------------------

export type ChatAIInput = {
  message: string;
  history?: ChatMessage[];        // prior turns (alternating user/assistant)
  brandName?: string;
  context?: string;               // optional extra context the caller wants to include
};

export async function chatWithAI(input: ChatAIInput): Promise<AIResult<string>> {
  const systemParts: string[] = [CHAT_AGENT_SYSTEM];
  if (input.brandName) systemParts.push(`The user manages a brand called "${input.brandName}". Tailor your advice to that brand when relevant.`);
  if (input.context) systemParts.push(input.context);
  const messages: ChatMessage[] = [
    { role: "system", content: systemParts.join("\n\n") },
    ...(Array.isArray(input.history) ? input.history : []),
    { role: "user", content: input.message },
  ];
  const res = await chatCompletion<{ text: string } | string>({
    messages,
    model: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 400,
    responseFormat: "text",
  });
  if (!res.ok) return res as AIResult<string>;
  const text = typeof res.data === "string" ? res.data : (res.data as any).text || "";
  return { ok: true, data: text, model: res.model, tokens: res.tokens };
}

// ---------------------------------------------------------------------------
// 3) Content ideas (for /api/generate-ideas)
// ---------------------------------------------------------------------------

export type IdeaAIInput = {
  brandName: string;
  prompt?: string;
  count?: number;        // default 10
  platforms?: Platform[];
};

export type IdeaAIOutput = { ideas: Array<{ title: string; description: string; platform: Platform; hook: string }> };

export async function generateIdeasWithAI(input: IdeaAIInput): Promise<AIResult<IdeaAIOutput>> {
  const count = input.count ?? 10;
  const platforms = input.platforms?.length ? input.platforms : ["tiktok", "instagram", "youtube"];
  const user = `Generate ${count} viral content ideas for the brand "${input.brandName}".
TOPIC/FOCUS: ${input.prompt || "the brand's niche"}
PLATFORMS TO COVER: ${platforms.join(", ")}

Return JSON:
{
  "ideas": [
    { "title": "5-8 word idea title", "description": "1-2 sentence explanation of the video/format", "platform": "<one of ${platforms.join("|")}>", "hook": "the exact first line a creator would say on camera" }
  ]
}
JSON only, no markdown.`;
  const res = await chatCompletion<{ ideas: IdeaAIOutput["ideas"] }>({
    messages: [
      { role: "system", content: SCRIPT_GENERATOR_SYSTEM },
      { role: "user", content: user },
    ],
    model: process.env.OPENAI_CONTENT_MODEL || "gpt-4o-mini",
    temperature: 0.95,
    maxTokens: 1500,
    responseFormat: "json_object",
  });
  if (!res.ok) return res as AIResult<IdeaAIOutput>;
  return { ok: true, data: { ideas: res.data.ideas || [] }, model: res.model, tokens: res.tokens };
}

// ---------------------------------------------------------------------------
// 4) Campaign generation (for /api/generate-campaign)
// ---------------------------------------------------------------------------

export type CampaignPlatformOutput = {
  title: string;
  description: string;
  hashtags: string[];
};

export type CampaignAIInput = {
  brandName: string;
  fileName?: string;
  keywords?: string;            // comma-separated keyword list
  transcription?: string;       // optional long-form text
  platforms?: Platform[];
};

export type CampaignAIOutput = {
  campaignName: string;
  campaignGoal: string;
  totalPieces: number;
  platforms: Record<Platform, CampaignPlatformOutput>;
};

export async function generateCampaignWithAI(input: CampaignAIInput): Promise<AIResult<CampaignAIOutput>> {
  const platforms = input.platforms?.length ? input.platforms : ["tiktok", "instagram", "youtube", "facebook", "linkedin"];
  const user = `Create a complete multi-platform social media campaign for "${input.brandName}".

SOURCE:
- File: ${input.fileName || "(none)"}
- Keywords: ${input.keywords || "(none)"}
- Transcription / long-form: ${(input.transcription || "").slice(0, 1200) || "(none)"}

PLATFORMS TO COVER: ${platforms.join(", ")}

Return JSON in this shape:
{
  "campaignName": "3-5 word campaign name",
  "campaignGoal": "1 sentence describing the campaign's primary goal",
  "totalPieces": <number — total pieces of content across all platforms>,
  "platforms": {
    "<platform>": {
      "title": "compelling post title for this platform (3-8 words)",
      "description": "long-form description / caption (3-5 sentences, optimized for the platform)",
      "hashtags": ["tag1", "tag2", "...5-10 tags"]
    },
    ...one entry per platform
  }
}
JSON only.`;
  const res = await chatCompletion<CampaignAIOutput>({
    messages: [
      { role: "system", content: SCRIPT_GENERATOR_SYSTEM },
      { role: "user", content: user },
    ],
    model: process.env.OPENAI_CAMPAIGN_MODEL || "gpt-4o-mini",
    temperature: 0.85,
    maxTokens: 2500,
    responseFormat: "json_object",
  });
  if (!res.ok) return res as AIResult<CampaignAIOutput>;
  return { ok: true, data: res.data, model: res.model, tokens: res.tokens };
}

// ---------------------------------------------------------------------------
// 5) Video script generation (for /api/generate-video)
// ---------------------------------------------------------------------------

export type VideoAIInput = {
  brandUrl?: string;
  topic: string;
  style?: string;       // UGC review, tutorial, testimonial, demo, etc.
  voiceover?: string;   // tone of voiceover
  duration?: string;    // "15s", "30s", "60s"
};

export type VideoAIOutput = {
  script: string;          // 15-30s voiceover script
  scenes: Array<{ start: string; end: string; visual: string; voiceover: string; textOverlay: string }>;
  hook: string;            // 1-line on-screen hook
  voiceoverStyle: string;
  suggestedMusic: string;
  shotList: string[];      // 5-8 shot descriptions
  cta: string;             // closing CTA
};

export async function generateVideoScriptWithAI(input: VideoAIInput): Promise<AIResult<VideoAIOutput>> {
  const dur = input.duration || "30s";
  const user = `Write a complete short-form video script for the topic: "${input.topic}".
BRAND URL: ${input.brandUrl || "(none)"}
STYLE: ${input.style || "UGC review"}
VOICEOVER TONE: ${input.voiceover || "natural, conversational"}
DURATION: ${dur}

Return JSON:
{
  "script": "the full voiceover script (no timestamps), suitable for ${dur} of video",
  "scenes": [
    { "start": "0:00", "end": "0:03", "visual": "what's on screen", "voiceover": "what's said", "textOverlay": "1-5 word on-screen text" }
  ],
  "hook": "the first line viewers hear (must hook in 2s)",
  "voiceoverStyle": "1-sentence direction for the voice actor/AI",
  "suggestedMusic": "1-sentence music style suggestion",
  "shotList": ["5-8 short shot descriptions for the editor"],
  "cta": "1-sentence closing call-to-action"
}
JSON only.`;
  const res = await chatCompletion<VideoAIOutput>({
    messages: [
      { role: "system", content: SCRIPT_GENERATOR_SYSTEM },
      { role: "user", content: user },
    ],
    model: process.env.OPENAI_VIDEO_MODEL || "gpt-4o-mini",
    temperature: 0.9,
    maxTokens: 1500,
    responseFormat: "json_object",
  });
  if (!res.ok) return res as AIResult<VideoAIOutput>;
  return { ok: true, data: res.data, model: res.model, tokens: res.tokens };
}

// ---------------------------------------------------------------------------
// 6) SEO keywords (for generateKeywords in backend.ts)
// ---------------------------------------------------------------------------

export type KeywordsAIInput = {
  brandName: string;
  prompt: string;
  platforms?: Platform[];
  count?: number;
};

export type KeywordsAIOutput = { primary: string[]; secondary: string[]; longTail: string[]; trending: string[] };

export async function generateKeywordsWithAI(input: KeywordsAIInput): Promise<AIResult<KeywordsAIOutput>> {
  const count = input.count ?? 10;
  const user = `Generate SEO keyword ideas for the brand "${input.brandName}".
TOPIC: ${input.prompt}
PLATFORMS: ${(input.platforms || []).join(", ") || "all social"}

Return JSON:
{
  "primary": [${count} high-intent brand/product keywords],
  "secondary": [${count} mid-funnel content keywords],
  "longTail": [${Math.min(count, 5)} long-tail question-style keywords],
  "trending": [${count} currently trending hashtags/keywords in this niche for 2026]
}
JSON only.`;
  const res = await chatCompletion<KeywordsAIOutput>({
    messages: [
      { role: "system", content: "You are an SEO strategist specializing in social media and short-form video discovery." },
      { role: "user", content: user },
    ],
    model: process.env.OPENAI_CONTENT_MODEL || "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 800,
    responseFormat: "json_object",
  });
  if (!res.ok) return res as AIResult<KeywordsAIOutput>;
  return { ok: true, data: res.data, model: res.model, tokens: res.tokens };
}

// ---------------------------------------------------------------------------
// 7) CTAs (for generateCTAs in backend.ts)
// ---------------------------------------------------------------------------

export type CTAAIInput = {
  brandName: string;
  prompt?: string;
  style?: "soft" | "medium" | "hard" | "mixed";
  count?: number;
};

export type CTAAIOutput = { primary: string; alternatives: string[]; perPlatform: Record<string, string> };

export async function generateCTAsWithAI(input: CTAAIInput): Promise<AIResult<CTAAIOutput>> {
  const count = input.count ?? 5;
  const style = input.style || "mixed";
  const user = `Write ${count} call-to-action (CTA) lines for the brand "${input.brandName}".
TOPIC: ${input.prompt || "their niche"}
STYLE: ${style} (soft = subtle nudge, medium = clear ask, hard = direct close, mixed = blend)

Return JSON:
{
  "primary": "the single best CTA",
  "alternatives": ["alt1", "alt2", "...up to ${count - 1}"],
  "perPlatform": {
    "tiktok": "platform-specific CTA for TikTok",
    "instagram": "platform-specific CTA for IG",
    "youtube": "platform-specific CTA for YT Shorts",
    "facebook": "platform-specific CTA for FB",
    "linkedin": "platform-specific CTA for LinkedIn"
  }
}
JSON only. CTAs must be 1-2 sentences, written in the brand's voice.`;
  const res = await chatCompletion<CTAAIOutput>({
    messages: [
      { role: "system", content: "You are a direct-response copywriter who writes CTAs that feel natural, never pushy or salesy." },
      { role: "user", content: user },
    ],
    model: process.env.OPENAI_CONTENT_MODEL || "gpt-4o-mini",
    temperature: 0.9,
    maxTokens: 600,
    responseFormat: "json_object",
  });
  if (!res.ok) return res as AIResult<CTAAIOutput>;
  return { ok: true, data: res.data, model: res.model, tokens: res.tokens };
}

// ---------------------------------------------------------------------------
// 8) Content calendar (for generateContentCalendar in backend.ts)
// ---------------------------------------------------------------------------

export type CalendarEntry = {
  date: string;          // YYYY-MM-DD
  day: string;           // "Mon", "Tue", ...
  platform: Platform;
  theme: "educational" | "entertainment" | "product_promotion" | "community_engagement" | "storytelling";
  themeLabel: string;
  idea: string;
  captionHook: string;
  suggestedFormat: string;
};

export type CalendarAIInput = {
  brandName: string;
  platforms: Platform[];
  weeks?: number;        // default 4
  postsPerWeek?: number; // default 7
  startDate?: string;    // ISO date
  prompt?: string;
};

export type CalendarAIOutput = {
  calendar: CalendarEntry[];
  themeBreakdown: Array<{ theme: string; label: string; count: number }>;
};

export async function generateCalendarWithAI(input: CalendarAIInput): Promise<AIResult<CalendarAIOutput>> {
  const weeks = input.weeks ?? 4;
  const postsPerWeek = input.postsPerWeek ?? 7;
  const totalPosts = weeks * postsPerWeek;
  const start = input.startDate || new Date().toISOString().split("T")[0];
  const user = `Build a ${weeks}-week content calendar for "${input.brandName}" with ${postsPerWeek} posts per week.
PLATFORMS: ${input.platforms.join(", ")}
START DATE: ${start}
TOPIC/FOCUS: ${input.prompt || "the brand's niche"}
TOTAL POSTS: ${totalPosts}

Theme distribution (approximate):
- 30% educational
- 25% entertainment
- 20% product promotion
- 15% community engagement
- 10% storytelling

Return JSON:
{
  "calendar": [
    {
      "date": "YYYY-MM-DD",
      "day": "Mon",
      "platform": "<one of ${input.platforms.join("|")}>",
      "theme": "educational|entertainment|product_promotion|community_engagement|storytelling",
      "themeLabel": "Educational",
      "idea": "5-12 word post idea",
      "captionHook": "8-15 word first-line hook for the caption",
      "suggestedFormat": "9:16 short|1:1 or 16:9|carousel"
    }
    ...${totalPosts} entries
  ],
  "themeBreakdown": [{"theme": "educational", "label": "Educational", "count": <int>}, ...]
}
JSON only.`;
  const res = await chatCompletion<CalendarAIOutput>({
    messages: [
      { role: "system", content: SCRIPT_GENERATOR_SYSTEM },
      { role: "user", content: user },
    ],
    model: process.env.OPENAI_CONTENT_MODEL || "gpt-4o-mini",
    temperature: 0.9,
    maxTokens: 3000,
    responseFormat: "json_object",
  });
  if (!res.ok) return res as AIResult<CalendarAIOutput>;
  return { ok: true, data: res.data, model: res.model, tokens: res.tokens };
}
