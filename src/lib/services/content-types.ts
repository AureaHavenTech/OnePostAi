// src/lib/services/content-types.ts
// OnePost AI — Content Type System
// 7 specialized AI pipelines, each with its own prompt engineering, JSON schema,
// video specs, and platform-specific output. Used by:
//   - /api/generate (when contentType is passed)
//   - /api/chat (auto-detected from natural language)
//   - autonomous-scheduler (rotates types per brand)
import { chatCompletion, isOpenAIConfigured, type ChatMessage } from "@/lib/openai";
import type { Platform } from "@/lib/openai";

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export type ContentTypeId =
  | "unboxing"
  | "voiceover"
  | "talking_head"
  | "ai_twin"
  | "product_demo"
  | "trending_hook"
  | "storytelling";

export type ContentCategory = "video" | "narrative" | "image";

// Video specs that downstream renderers (HeyGen, CapCut, InVideo) consume
export type VideoSpec = {
  aspectRatio: "9:16" | "1:1" | "16:9" | "4:5";
  durationSec: number;        // target runtime
  fps: 24 | 30 | 60;
  style: string;              // "UGC", "polished", "cinematic", "talking-head"
  musicGenre: string;         // "lofi", "pop", "hip-hop", "ambient", "corporate", "trending"
  musicMood: "upbeat" | "chill" | "dramatic" | "energetic" | "calm" | "motivational";
  transitions: "cut" | "fade" | "zoom" | "match-cut" | "morph" | "dynamic";
  textOverlays: boolean;
  voiceover: boolean;
};

// Per-platform output the renderer needs to assemble a multi-platform post
export type PlatformOutput = {
  platform: Platform;
  script: string;             // 10-30s voiceover / on-camera script
  caption: string;            // post caption
  hashtags: string[];         // 5-12 trending hashtags
  textOverlays?: string[];    // on-screen text (if VideoSpec.textOverlays)
  hookFirstLine?: string;     // the 2s hook (first line of script)
  cta?: string;               // closing call-to-action
};

// The full content type output
export type ContentTypeOutput = {
  contentType: ContentTypeId;
  brandName: string;
  videoSpec: VideoSpec;
  platformContent: PlatformOutput[];
  prompt: string;             // the user's request
  model: string;              // "gpt-4o-mini" | "gpt-4o" | "template"
  aiConfigured: boolean;
  aiError?: string;
  createdAt: string;
};

// Universal input shape
export type ContentTypeInput = {
  brandName: string;
  prompt: string;
  platforms: Platform[];
  contentType?: ContentTypeId; // inferred from prompt when omitted
  productName?: string;
  productDescription?: string;
  brandVoice?: string;        // e.g. "playful", "luxury", "professional"
  tone?: string;              // e.g. "casual", "authoritative"
  durationSec?: number;       // override default duration
  additionalContext?: string; // free-form extras
};

// ---------------------------------------------------------------------------
// Content type registry
// ---------------------------------------------------------------------------

type ContentTypeDefinition = {
  id: ContentTypeId;
  label: string;
  description: string;
  category: ContentCategory;
  icon: string;               // emoji for UI
  defaultVideoSpec: VideoSpec;
  // Build the chat messages for the AI. The system prompt is the heart of the
  // type's "personality" — it's where most of the prompt-engineering lives.
  buildMessages: (input: ContentTypeInput) => ChatMessage[];
};

const SYSTEM_PREFIX =
  "You are the lead creative at OnePost AI, a premium AI content agency. " +
  "You write viral short-form content for 7 platforms. " +
  "Voice: premium, confident, modern. No clichés. " +
  "Hook in the first 1-2 seconds. Return ONLY valid JSON — no prose, no fences.";

// ---- 1) Unboxing ----------------------------------------------------------
const unboxing: ContentTypeDefinition = {
  id: "unboxing",
  label: "Unboxing",
  description: "Product reveal, text overlays, trending music. The classic UGC format.",
  category: "video",
  icon: "📦",
  defaultVideoSpec: {
    aspectRatio: "9:16",
    durationSec: 18,
    fps: 30,
    style: "UGC",
    musicGenre: "trending",
    musicMood: "upbeat",
    transitions: "dynamic",
    textOverlays: true,
    voiceover: false,
  },
  buildMessages: (input) => [
    { role: "system", content: SYSTEM_PREFIX + " You specialize in UNBOXING videos — the kind that get 10M+ views. Every video you write has a hook, a build-up, a reveal moment, and a reaction. Use quick cuts, anticipation, and an ASMR-feeling product reveal." },
    { role: "user", content: `Write an unboxing video for ${input.brandName}.

PRODUCT: ${input.productName || "the featured product"}
PRODUCT DESCRIPTION: ${input.productDescription || "(none — infer from the prompt)"}
USER PROMPT: ${input.prompt}
PLATFORMS: ${input.platforms.join(", ")}
DURATION: ${input.durationSec || 18}s
${input.brandVoice ? `BRAND VOICE: ${input.brandVoice}` : ""}
${input.tone ? `TONE: ${input.tone}` : ""}

Return JSON in EXACTLY this shape:
{
  "platforms": {
    "<platform>": {
      "script": "10-30 word voiceover with HOOK → BUILD-UP → REVEAL → REACTION. Must hold attention for ${input.durationSec || 18}s.",
      "caption": "post caption, 100-200 chars, leads with hook",
      "hashtags": ["7-10 trending tags including #unboxing, the product category, and viral hooks"],
      "textOverlays": ["3-5 on-screen text lines, max 5 words each (e.g. 'THE BOX IS HEAVY...', 'INSIDE:', 'OMG', '10/10')"],
      "hookFirstLine": "the 2-second hook (≤8 words)",
      "cta": "follow/like/comment CTA"
    },
    ...one entry per platform
  }
}
JSON only.` }
  ]
};

// ---- 2) Voiceover ---------------------------------------------------------
const voiceover: ContentTypeDefinition = {
  id: "voiceover",
  label: "Voiceover",
  description: "AI narration over product footage. Cinematic, premium, authoritative.",
  category: "video",
  icon: "🎙️",
  defaultVideoSpec: {
    aspectRatio: "9:16",
    durationSec: 30,
    fps: 30,
    style: "cinematic",
    musicGenre: "lofi",
    musicMood: "calm",
    transitions: "fade",
    textOverlays: true,
    voiceover: true,
  },
  buildMessages: (input) => [
    { role: "system", content: SYSTEM_PREFIX + " You write VOICEOVER scripts — calm, authoritative narration layered over B-roll footage. Think Apple product films, Aesop ads, or premium documentary shorts. Sentence cadence is deliberate. Every word earns its place." },
    { role: "user", content: `Write a voiceover-narration video for ${input.brandName}.

PRODUCT: ${input.productName || "the featured product"}
PRODUCT DESCRIPTION: ${input.productDescription || "(none)"}
USER PROMPT: ${input.prompt}
PLATFORMS: ${input.platforms.join(", ")}
DURATION: ${input.durationSec || 30}s
${input.brandVoice ? `BRAND VOICE: ${input.brandVoice}` : ""}

Return JSON:
{
  "platforms": {
    "<platform>": {
      "script": "30-60 word voiceover script. Cinematic cadence. No clichés. First line is a strong visual cue that the B-roll can match.",
      "caption": "post caption, premium tone, ≤200 chars",
      "hashtags": ["5-8 tags — include #cinematic or #filmtok for reach"],
      "textOverlays": ["2-3 minimal on-screen text lines, max 4 words each"],
      "hookFirstLine": "the first 4-6 words (visual hook)",
      "cta": "soft save/share CTA"
    }
  }
}
JSON only.` }
  ]
};

// ---- 3) Talking Head ------------------------------------------------------
const talkingHead: ContentTypeDefinition = {
  id: "talking_head",
  label: "Talking Head",
  description: "AI avatar speaks directly to camera. Personal, direct, human.",
  category: "video",
  icon: "🗣️",
  defaultVideoSpec: {
    aspectRatio: "9:16",
    durationSec: 45,
    fps: 30,
    style: "talking-head",
    musicGenre: "ambient",
    musicMood: "motivational",
    transitions: "cut",
    textOverlays: true,
    voiceover: false,
  },
  buildMessages: (input) => [
    { role: "system", content: SYSTEM_PREFIX + " You write TALKING-HEAD scripts — the creator speaks directly to the camera like a friend giving advice. Conversational, first-person, NO corporate-speak. Open with a bold claim, give 3 quick points, close with a CTA. This is the format behind 80% of viral creator content." },
    { role: "user", content: `Write a talking-head video for ${input.brandName}.

PRODUCT: ${input.productName || "the featured product"}
PRODUCT DESCRIPTION: ${input.productDescription || "(none)"}
USER PROMPT: ${input.prompt}
PLATFORMS: ${input.platforms.join(", ")}
DURATION: ${input.durationSec || 45}s
${input.brandVoice ? `BRAND VOICE: ${input.brandVoice}` : ""}
${input.tone ? `TONE: ${input.tone}` : ""}

Return JSON:
{
  "platforms": {
    "<platform>": {
      "script": "60-90 word script. Direct address. Opens with a bold claim or pattern interrupt. 3 quick points. Close with a strong CTA.",
      "caption": "post caption, personal tone, 100-200 chars, includes 1 question to drive comments",
      "hashtags": ["7-10 tags, mix of niche and broad"],
      "textOverlays": ["3-5 BOLD CAPS lines, 1-4 words each (e.g. 'WRONG.', 'HERE'S THE TRUTH.', 'STEP 1')"],
      "hookFirstLine": "the first line — must stop the scroll in 1.5s",
      "cta": "comment / save / share CTA"
    }
  }
}
JSON only.` }
  ]
};

// ---- 4) AI Twin -----------------------------------------------------------
const aiTwin: ContentTypeDefinition = {
  id: "ai_twin",
  label: "AI Twin",
  description: "Uploaded photos → digital twin in UGC-style videos. Personal at scale.",
  category: "video",
  icon: "👯",
  defaultVideoSpec: {
    aspectRatio: "9:16",
    durationSec: 22,
    fps: 30,
    style: "UGC",
    musicGenre: "pop",
    musicMood: "upbeat",
    transitions: "morph",
    textOverlays: true,
    voiceover: true,
  },
  buildMessages: (input) => [
    { role: "system", content: SYSTEM_PREFIX + " You write AI-TWIN scripts — the creator's digital twin speaks to camera in their style, tone, and mannerisms. The format is UGC-personal: relatable, casual, and feels like a real person. Scripts are short, punchy, and always have a 'wait what?' moment." },
    { role: "user", content: `Write an AI-Twin video script for ${input.brandName}.

PRODUCT: ${input.productName || "the featured product"}
PRODUCT DESCRIPTION: ${input.productDescription || "(none)"}
USER PROMPT: ${input.prompt}
PLATFORMS: ${input.platforms.join(", ")}
DURATION: ${input.durationSec || 22}s
${input.brandVoice ? `BRAND VOICE: ${input.brandVoice}` : ""}

Return JSON:
{
  "platforms": {
    "<platform>": {
      "script": "30-50 word casual UGC script. The 'twin' talks like a friend. Has a 'wait — there's a way?' moment.",
      "caption": "post caption, casual, ≤150 chars, uses 1-2 emojis",
      "hashtags": ["6-9 tags — #aitwin #ugccreator recommended"],
      "textOverlays": ["2-4 text lines — context-setting only, not the whole script"],
      "hookFirstLine": "first 4-6 words — feels natural, not scripted",
      "cta": "comment CTA ('comment X and I'll send you...')"
    }
  }
}
JSON only.` }
  ]
};

// ---- 5) Product Demo ------------------------------------------------------
const productDemo: ContentTypeDefinition = {
  id: "product_demo",
  label: "Product Demo",
  description: "Feature walkthrough, benefits, CTAs. Clear and informative.",
  category: "video",
  icon: "🎬",
  defaultVideoSpec: {
    aspectRatio: "9:16",
    durationSec: 35,
    fps: 30,
    style: "polished",
    musicGenre: "pop",
    musicMood: "energetic",
    transitions: "zoom",
    textOverlays: true,
    voiceover: true,
  },
  buildMessages: (input) => [
    { role: "system", content: SYSTEM_PREFIX + " You write PRODUCT DEMO scripts — clean, structured walkthroughs that turn features into benefits. Every line ties back to a user pain point. This format performs best on YouTube Shorts, LinkedIn, and Pinterest. Avoid hype; let the product do the talking." },
    { role: "user", content: `Write a product-demo video for ${input.brandName}.

PRODUCT: ${input.productName || "the featured product"}
PRODUCT DESCRIPTION: ${input.productDescription || "(none)"}
USER PROMPT: ${input.prompt}
PLATFORMS: ${input.platforms.join(", ")}
DURATION: ${input.durationSec || 35}s
${input.brandVoice ? `BRAND VOICE: ${input.brandVoice}` : ""}

Return JSON:
{
  "platforms": {
    "<platform>": {
      "script": "70-100 word demo script. 3-part structure: HOOK (pain) → DEMO (solution) → CTA. Each sentence ties a feature to a benefit.",
      "caption": "post caption, info-dense, 150-250 chars, includes 1 specific outcome",
      "hashtags": ["5-8 tags, mix of product category and intent keywords"],
      "textOverlays": ["3-6 short benefit-driven lines, max 5 words each (e.g. 'NO MORE X', 'JUST ONE TAP')"],
      "hookFirstLine": "first 4-6 words — calls out the pain point",
      "cta": "trial / demo / link-in-bio CTA"
    }
  }
}
JSON only.` }
  ]
};

// ---- 6) Trending Hook -----------------------------------------------------
const trendingHook: ContentTypeDefinition = {
  id: "trending_hook",
  label: "Trending Hook",
  description: "Viral format, pattern interrupt, algorithm-optimized. Designed for distribution.",
  category: "video",
  icon: "🔥",
  defaultVideoSpec: {
    aspectRatio: "9:16",
    durationSec: 12,
    fps: 30,
    style: "UGC",
    musicGenre: "trending",
    musicMood: "energetic",
    transitions: "match-cut",
    textOverlays: true,
    voiceover: false,
  },
  buildMessages: (input) => [
    { role: "system", content: SYSTEM_PREFIX + " You write TRENDING HOOK scripts — ultra-short videos engineered for the algorithm. Pattern interrupt in the first 0.5s, fast pacing, visual surprise, callback to a viral format. Think TikTok hooks that get 5M views in 24h. Every word is optimized for retention, not clarity." },
    { role: "user", content: `Write a trending-hook video for ${input.brandName}.

PRODUCT: ${input.productName || "the featured product"}
USER PROMPT: ${input.prompt}
PLATFORMS: ${input.platforms.join(", ")}
DURATION: ${input.durationSec || 12}s (SHORT — designed for replay)
${input.brandVoice ? `BRAND VOICE: ${input.brandVoice}` : ""}

Return JSON:
{
  "platforms": {
    "<platform>": {
      "script": "8-20 word script. Visual-first. The viewer must feel something in 0.5 seconds (surprise, recognition, curiosity). Designed for replay.",
      "caption": "post caption, 50-120 chars, includes 1 emoji, drives comments",
      "hashtags": ["8-12 tags — lean into current trending tags. Include 1-2 of: #trending #fyp #viral"],
      "textOverlays": ["2-4 BOLD lines, 1-3 words each (e.g. 'WAIT.', 'WHAT.', 'POV:')"],
      "hookFirstLine": "the first 3-5 words — must create a pattern interrupt",
      "cta": "share/comment/replay CTA (NO link pushes)"
    }
  }
}
JSON only.` }
  ]
};

// ---- 7) Storytelling ------------------------------------------------------
const storytelling: ContentTypeDefinition = {
  id: "storytelling",
  label: "Storytelling",
  description: "Narrative arc, brand story, emotional connection. Long-form, intimate.",
  category: "narrative",
  icon: "📖",
  defaultVideoSpec: {
    aspectRatio: "9:16",
    durationSec: 60,
    fps: 30,
    style: "cinematic",
    musicGenre: "acoustic",
    musicMood: "dramatic",
    transitions: "fade",
    textOverlays: true,
    voiceover: true,
  },
  buildMessages: (input) => [
    { role: "system", content: SYSTEM_PREFIX + " You write STORYTELLING scripts — long-form, intimate, narrative-driven content that builds an emotional bond between the brand and viewer. Three-act structure: SETUP → CONFLICT → RESOLUTION. The brand appears naturally in the resolution, not as a pitch. Think Patagonia, Aesop, or Apple-at-its-best." },
    { role: "user", content: `Write a storytelling video for ${input.brandName}.

PRODUCT: ${input.productName || "the featured product"}
PRODUCT DESCRIPTION: ${input.productDescription || "(none)"}
USER PROMPT: ${input.prompt}
PLATFORMS: ${input.platforms.join(", ")}
DURATION: ${input.durationSec || 60}s
${input.brandVoice ? `BRAND VOICE: ${input.brandVoice}` : ""}

Return JSON:
{
  "platforms": {
    "<platform>": {
      "script": "120-180 word story with clear 3-act structure: SETUP (the moment) → CONFLICT (the struggle) → RESOLUTION (the brand moment). First-person, sensory, no marketing-speak.",
      "caption": "post caption, story-driven, 150-300 chars, ends with a reflective question",
      "hashtags": ["4-7 tags — lean into emotional/intent categories like #storytime #founderstory #whyimadethis"],
      "textOverlays": ["2-4 minimal text lines, max 4 words each — used sparingly, only at key emotional beats"],
      "hookFirstLine": "the opening line — in medias res, action or feeling",
      "cta": "soft save/follow CTA — NEVER a hard sell"
    }
  }
}
JSON only.` }
  ]
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const CONTENT_TYPES: Record<ContentTypeId, ContentTypeDefinition> = {
  unboxing,
  voiceover,
  talking_head: talkingHead,
  ai_twin: aiTwin,
  product_demo: productDemo,
  trending_hook: trendingHook,
  storytelling,
};

export const CONTENT_TYPE_LIST: ContentTypeDefinition[] = Object.values(CONTENT_TYPES);

export function getContentType(id: string): ContentTypeDefinition | null {
  return (CONTENT_TYPES as Record<string, ContentTypeDefinition>)[id] || null;
}

// ---------------------------------------------------------------------------
// Detection from natural language
// ---------------------------------------------------------------------------

const TYPE_KEYWORDS: Record<ContentTypeId, string[]> = {
  unboxing: ["unbox", "unboxing", "package", "package reveal", "haul"],
  voiceover: ["voiceover", "voice over", "narration", "narrate", "voice-over"],
  talking_head: ["talking head", "talking-head", "on camera", "on-camera", "speak to camera", "creator speaks", "host"],
  ai_twin: ["ai twin", "digital twin", "ai avatar", "ai me", "clone", "ai version", "twin video"],
  product_demo: ["demo", "demonstration", "walkthrough", "product demo", "how it works", "feature", "tutorial", "tutorial video"],
  trending_hook: ["trending hook", "trending", "viral hook", "pattern interrupt", "viral video", "tiktok hook", "viral format"],
  storytelling: ["story", "storytelling", "storytime", "narrative", "brand story", "founder story", "why i", "my journey"],
};

export function detectContentType(message: string): ContentTypeId | null {
  const lower = message.toLowerCase();
  for (const [id, kws] of Object.entries(TYPE_KEYWORDS) as Array<[ContentTypeId, string[]]>) {
    for (const kw of kws) {
      if (lower.includes(kw)) return id;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export async function generateByContentType(input: ContentTypeInput): Promise<ContentTypeOutput> {
  const def = getContentType(input.contentType as string) as ContentTypeDefinition | null;
  // Base result
  const baseSpec = def ? def.defaultVideoSpec : unboxing.defaultVideoSpec;
  const aiConfigured = isOpenAIConfigured();
  // Try real AI
  if (def && aiConfigured) {
    const messages = def.buildMessages(input);
    const res = await chatCompletion<{ platforms: Record<Platform, Omit<PlatformOutput, "platform">> }>({
      messages,
      model: process.env.OPENAI_CONTENT_MODEL || "gpt-4o-mini",
      temperature: 0.9,
      maxTokens: 1800,
      responseFormat: "json_object",
    });
    if (res.ok) {
      const spec = { ...baseSpec };
      if (input.durationSec) spec.durationSec = input.durationSec;
      const platformContent: PlatformOutput[] = input.platforms.map((p) => {
        const entry = (res.data.platforms as any)?.[p] || {};
        return {
          platform: p,
          script: entry.script || `${input.brandName} — ${input.prompt.slice(0, 60)}`,
          caption: entry.caption || `${input.brandName}: ${input.prompt.slice(0, 80)}`,
          hashtags: Array.isArray(entry.hashtags) ? entry.hashtags : [],
          textOverlays: Array.isArray(entry.textOverlays) ? entry.textOverlays : [],
          hookFirstLine: entry.hookFirstLine,
          cta: entry.cta,
        };
      });
      return {
        contentType: def.id,
        brandName: input.brandName,
        videoSpec: spec,
        platformContent,
        prompt: input.prompt,
        model: res.model,
        aiConfigured: true,
        createdAt: new Date().toISOString(),
      };
    }
    // Fall through to template on API error
    return {
      ...templateContentType(input, def, res.message),
      aiConfigured: false,
      aiError: res.message,
      model: "template",
    };
  }
  // No key configured → template
  return templateContentType(input, def);
}

// ---------------------------------------------------------------------------
// Template fallback (used when OPENAI_API_KEY is missing or call fails)
// ---------------------------------------------------------------------------

function templateContentType(input: ContentTypeInput, def: ContentTypeDefinition | null, _errMsg?: string): ContentTypeOutput {
  const d = def || unboxing;
  const spec = { ...d.defaultVideoSpec };
  if (input.durationSec) spec.durationSec = input.durationSec;
  const subject = input.productName || input.brandName;
  const topic = input.prompt.slice(0, 60);
  const platformContent: PlatformOutput[] = input.platforms.map((p) => templatePlatform(p, d.id, input.brandName, subject, topic, input));
  return {
    contentType: d.id,
    brandName: input.brandName,
    videoSpec: spec,
    platformContent,
    prompt: input.prompt,
    model: "template",
    aiConfigured: false,
    createdAt: new Date().toISOString(),
  };
}

function templatePlatform(platform: Platform, type: ContentTypeId, brand: string, subject: string, topic: string, input: ContentTypeInput): PlatformOutput {
  const tone = (input.tone || "premium").toLowerCase();
  const sw: Record<ContentTypeId, { script: string; caption: string; tags: string[]; overlays: string[]; hook: string; cta: string }> = {
    unboxing: {
      script: `Stop scrolling — I'm unboxing ${subject} and what I found inside is wild. First, the box feels premium. Then you open it, and the reveal is even better. This is going to be a 10/10. ${brand} absolutely cooked.`,
      caption: `I tried ${subject} so you don't have to. Verdict? 10/10. ${brand} is different. ✨`,
      tags: ["unboxing", "ugccreator", brand.replace(/\s/g, "").toLowerCase(), "productreview", "viral", "fyp", "tiktokmademebuyit"],
      overlays: ["THE BOX IS HEAVY", "INSIDE:", "REVEAL 👀", "10/10", "I NEED THIS"],
      hook: `I wasn't going to buy ${subject}…`,
      cta: "Comment your guess 👇",
    },
    voiceover: {
      script: `Some products arrive in plastic. ${subject} arrives in a box you don't want to throw away. Every detail, considered. Every texture, intentional. This is what ${brand} believes.`,
      caption: `${brand} — designed to be felt. ${subject}.`,
      tags: ["cinematic", "filmtok", "design", "premium", "productfilm"],
      overlays: ["Designed to be felt.", "Every detail, considered."],
      hook: "Some products arrive in plastic.",
      cta: "Save for later.",
    },
    talking_head: {
      script: `Everyone's wrong about ${subject}. Here's the truth: the brands that win in 2026 aren't louder — they're clearer. Three things to remember. One: the hook matters more than the product. Two: your CTA is not your caption. Three: ${brand} built this so you can stop guessing. Stop overthinking. Start posting.`,
      caption: `3 things I wish I knew before using ${subject}. #1 will surprise you.`,
      tags: ["creator", "talkinghead", "brandtips", "contentcreator", brand.replace(/\s/g, "").toLowerCase(), "marketingtips"],
      overlays: ["WRONG.", "3 THINGS.", "1. HOOK", "2. CTA", "3. SYSTEM"],
      hook: `Stop scrolling — this changes ${topic}.`,
      cta: "Save this for later.",
    },
    ai_twin: {
      script: `OK so my AI twin just made this video while I was making coffee. She nailed the vibe. Same energy, same voice, less effort. ${brand} is doing something wild with this.`,
      caption: `My AI twin is officially taking over. ${brand}, you understand me. 👯`,
      tags: ["aitwin", "ugccreator", "aiugc", "digitalclone", brand.replace(/\s/g, "").toLowerCase()],
      overlays: ["AI TWIN ACTIVATED", "Same vibe.", "Less effort."],
      hook: `Wait, is that me?`,
      cta: "Comment AI for the link.",
    },
    product_demo: {
      script: `Let me show you exactly how ${subject} works. One tap and you're in. No setup, no friction, no tutorial. The whole point of ${brand} is that you don't have to think. The result speaks for itself. Try it once and you'll never go back.`,
      caption: `How ${subject} actually works. No fluff.`,
      tags: ["productdemo", "howto", "tutorial", brand.replace(/\s/g, "").toLowerCase(), "review"],
      overlays: ["ONE TAP.", "NO SETUP.", "JUST WORKS.", "TRY IT."],
      hook: `How ${subject} works:`,
      cta: "Link in bio.",
    },
    trending_hook: {
      script: `POV: you just found ${subject} and your entire routine just broke. ${brand} did something nobody else has tried. This is the format that's about to take over your FYP.`,
      caption: `Why is nobody talking about ${subject}?? 😩`,
      tags: ["trending", "fyp", "viral", "pov", "tiktokmademebuyit", brand.replace(/\s/g, "").toLowerCase(), "tiktoktrend"],
      overlays: ["WAIT.", "WHAT.", "POV:", "RUN."],
      hook: `Tell me you found ${subject} without telling me`,
      cta: "Send to a friend.",
    },
    storytelling: {
      script: `A year ago I was posting into the void. No views, no replies, no rhythm. Then I found ${subject} from ${brand} and everything changed. Not because of the product — but because of what it gave me back: time, focus, a system. I'm still not famous. But I'm finally consistent. That's the whole story.`,
      caption: `A year ago I had nothing. Here's what changed.`,
      tags: ["storytime", "founderstory", "myjourney", brand.replace(/\s/g, "").toLowerCase(), "buildinpublic"],
      overlays: ["A year ago.", "Then everything changed."],
      hook: `A year ago, I was posting into the void.`,
      cta: "Save this if you needed it.",
    },
  };
  const entry = sw[type];
  // Tone modifier — keep templates from feeling mechanical
  if (tone.includes("fun") || tone.includes("playful")) entry.caption = entry.caption + " 😜";
  if (tone.includes("luxury") || tone.includes("premium")) entry.caption = entry.caption + " ✨";
  return {
    platform,
    script: entry.script,
    caption: entry.caption,
    hashtags: entry.tags,
    textOverlays: entry.overlays,
    hookFirstLine: entry.hook,
    cta: entry.cta,
  };
}
