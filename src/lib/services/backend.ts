// OnePost AI Backend Integration — Usage Limits & Watermark System
import { getOpenAI, hasApiKey } from "@/lib/openai-client";

export const USAGE_LIMITS = {
  free: {
    maxGenerations: 5,
    maxPlatforms: 2,
    maxScheduledPosts: 3,
    watermark: true,
    hashtagQuality: "basic",
    aiAvatar: false,
    trendAnalytics: false,
    multiBrand: false,
    scheduleAutomation: false,
    contentLock: true,
  },
  paid: {
    maxGenerations: Infinity,
    maxPlatforms: 7,
    maxScheduledPosts: 100,
    watermark: false,
    hashtagQuality: "viral",
    aiAvatar: true,
    trendAnalytics: true,
    multiBrand: true,
    scheduleAutomation: true,
    contentLock: false,
  },
};

export function getWatermarkOverlay(brandName: string): string {
  return `\n\n——\nCreated with OnePost AI™ — Get unlimited, watermark-free content at onepostai.ctonew.app`;
}

// ============================================================================
// CAPTION STYLES
// ============================================================================
export type CaptionStyle = "short" | "long" | "storytelling" | "professional" | "funny" | "sales" | "educational";

export const CAPTION_STYLES: Record<CaptionStyle, { label: string; description: string; maxLength: number }> = {
  short: { label: "Short & Punchy", description: "1-2 sentences, hook-first, ideal for TikTok/Reels", maxLength: 150 },
  long: { label: "Long-Form", description: "3-5 sentences with story arc, ideal for LinkedIn/Facebook", maxLength: 500 },
  storytelling: { label: "Storytelling", description: "Personal narrative, opens with a moment, ideal for IG captions", maxLength: 400 },
  professional: { label: "Professional", description: "Polished, third-person, ideal for B2B/LinkedIn", maxLength: 350 },
  funny: { label: "Funny", description: "Witty, irreverent, ideal for TikTok/X", maxLength: 200 },
  sales: { label: "Sales", description: "Pain-point → solution → CTA, ideal for product launches", maxLength: 350 },
  educational: { label: "Educational", description: "Tip or how-to with steps, ideal for carousels/reels", maxLength: 450 },
};

// ============================================================================
// FALLBACK — Template-based content (used when API key missing or call fails)
// ============================================================================
function fallbackCaption(style: CaptionStyle, brandName: string, prompt: string, platform: string): string {
  const tpl = CAPTION_STYLES[style];
  const subject = prompt.trim() || "your niche";
  const cap = (s: string) => s.length > tpl.maxLength ? s.slice(0, tpl.maxLength - 1) + "…" : s;
  switch (style) {
    case "short":
      return cap(`Stop scrolling. ${brandName} ${subject.toLowerCase().slice(0, 60)} 👀`);
    case "long":
      return cap(`Let's talk about ${subject.toLowerCase().slice(0, 50)}.\n\nMost people get this wrong — they focus on the surface and miss the real opportunity underneath. At ${brandName}, we've learned that the best results come from doing the unsexy work: testing, iterating, and listening to your audience.\n\nHere's the takeaway: stop chasing hacks. Build a system that compounds. What questions do you have? Drop them below 👇`);
    case "storytelling":
      return cap(`Three months ago I almost gave up on ${subject.toLowerCase().slice(0, 40)}.\n\nThen I tried something different with ${brandName} — and the results blew me away.\n\nHere's what changed: I stopped guessing and started listening. I treated every customer like a co-creator. I shipped imperfect work, fast.\n\nThe lesson? Momentum beats perfection. Every time.\n\nWhat's a recent risk that paid off for you? Share below 💬`);
    case "professional":
      return cap(`${brandName} is sharing new research on ${subject.toLowerCase().slice(0, 50)}.\n\nOur latest analysis reveals three patterns that high-performing teams share:\n\n1. They treat content as a system, not a project.\n2. They measure outcomes, not output.\n3. They invest in distribution as much as creation.\n\nRead the full breakdown in our latest report. Link in comments.`);
    case "funny":
      return cap(`POV: you finally found ${brandName} and your ${subject.toLowerCase().slice(0, 30)} problems just filed for unemployment 🫡\n\n(You're welcome in advance.)`);
    case "sales":
      return cap(`If ${subject.toLowerCase().slice(0, 40)} is taking up too much of your time, read this.\n\nMost teams waste 5-10 hours a week on tasks that ${brandName} handles in minutes. AI-generated scripts, captions, hashtags, schedules — all in one workflow.\n\nThe result: 3x more output, 80% less effort.\n\nReady to see it in action? Start your free trial today. Link in bio 👆`);
    case "educational":
      return cap(`How to nail ${subject.toLowerCase().slice(0, 50)} — in 4 steps:\n\n1️⃣ Define the goal. What does success look like?\n2️⃣ Identify the constraint. What's slowing you down?\n3️⃣ Run a 7-day experiment with ${brandName}.\n4️⃣ Measure, iterate, repeat.\n\nSave this post for the next time you're stuck. Which step trips you up most?`);
    default:
      return cap(`${brandName} — ${subject.slice(0, 80)}`);
  }
}

function fallbackScripts(prompt: string): Record<string, string> {
  return {
    tiktok: `🔥 ${prompt.split(" ").slice(0, 5).join(" ")}... YOU NEED TO SEE THIS! #viral #fyp`,
    instagram: `✨ The secret to ${prompt.toLowerCase().slice(0, 30)}... Save this for later! 📌`,
    youtube: `${prompt.slice(0, 50)} - Full Tutorial and Review`,
    facebook: `I had to share this with you all! ${prompt.slice(0, 60)}`,
    linkedin: `I've been researching ${prompt.slice(0, 40)}... Here's what I found.`,
  };
}

function fallbackHashtags(brandName: string): Record<string, string[]> {
  return {
    tiktok: ["fyp", "viral", "trending", "contentcreator", brandName.replace(/\s/g, "").toLowerCase()],
    instagram: ["explorepage", "trending", "contentcreator", "viral", "marketingtips"],
    youtube: ["tutorial", "howto", "review", brandName.replace(/\s/g, "").toLowerCase(), "2026"],
    facebook: ["trending", "mustwatch", "viralvideo", "sharethis"],
    linkedin: ["contentstrategy", "marketing", "branding", "growth", "productivity"],
  };
}

function buildFallbackResult(params: {
  brandName: string;
  prompt: string;
  platforms: string[];
  isFreeTier: boolean;
  generationCount: number;
  captionStyle: CaptionStyle;
}) {
  const { brandName, prompt, platforms, isFreeTier, generationCount, captionStyle } = params;
  const effectivePlatforms = isFreeTier ? platforms.slice(0, USAGE_LIMITS.free.maxPlatforms) : platforms;
  const watermark = isFreeTier ? getWatermarkOverlay(brandName) : "";
  const scripts = fallbackScripts(prompt);
  const htags = fallbackHashtags(brandName);
  const selectedPlatforms = effectivePlatforms.length > 0 ? effectivePlatforms : Object.keys(scripts);
  const hashtagQuality = isFreeTier ? "basic" : "viral";

  return {
    brandName,
    prompt,
    tier: isFreeTier ? "free" : "paid",
    generationLimit: isFreeTier ? { used: generationCount + 1, limit: USAGE_LIMITS.free.maxGenerations } : undefined,
    watermark: isFreeTier ? "Watermark added. Upgrade for clean exports." : undefined,
    captionStyle,
    aiGenerated: false,
    platformContent: selectedPlatforms.map(p => ({
      platform: p,
      script: scripts[p] || scripts.tiktok,
      caption: (isFreeTier ? fallbackCaption(captionStyle, brandName, prompt, p) + watermark : fallbackCaption(captionStyle, brandName, prompt, p)),
      hashtags: htags[p]?.slice(0, isFreeTier ? 3 : 10) || htags.tiktok.slice(0, isFreeTier ? 3 : 10),
      hashtagQuality,
    })),
    suggestedFormat: selectedPlatforms.includes("tiktok") || selectedPlatforms.includes("instagram")
      ? "9:16 vertical" : "16:9 horizontal",
    estimatedDuration: "15 seconds",
  };
}

// ============================================================================
// REAL AI — OpenAI-powered content generation
// ============================================================================

interface AIContentItem {
  script: string;
  caption: string;
  hashtags: string[];
}

const AI_CONTENT_SYSTEM_PROMPT = `You are an expert social media content strategist and copywriter for OnePost AI. Generate platform-optimized content for social media posts.

Return a JSON object with keys for each requested platform. Each platform value must have:
- "script": The video script or post text (1-3 sentences, hook-first, platform-appropriate)
- "caption": A caption matching the requested caption style
- "hashtags": Array of 10-15 relevant, trending hashtags (include both broad and niche tags)

Platform voice guidelines:
- TikTok: Casual, hook-heavy, trend-aware, emoji-rich
- Instagram: Polished, visually descriptive, community-building
- YouTube: Detailed, value-packed, SEO-aware
- Facebook: Conversational, shareable, community-driven
- LinkedIn: Professional, insightful, thought-leadership

Caption style guidelines:
- short: 1-2 punchy sentences
- long: 3-5 sentences with story arc
- storytelling: Personal narrative with emotional hook
- professional: Polished, third-person, data-driven
- funny: Witty, irreverent, meme-aware
- sales: Pain-point → solution → CTA
- educational: Step-by-step how-to or tips

IMPORTANT: Return ONLY valid JSON, no other text.`;

export async function generateContent(params: {
  brandName: string;
  prompt: string;
  platforms: string[];
  tone?: string;
  isFreeTier?: boolean;
  generationCount?: number;
  captionStyle?: CaptionStyle;
}) {
  const { brandName, prompt, platforms, isFreeTier = false, generationCount = 0, captionStyle = "short" } = params;

  // Check if free user has exceeded limit
  if (isFreeTier && generationCount >= USAGE_LIMITS.free.maxGenerations) {
    return {
      error: true,
      message: `You've used all ${USAGE_LIMITS.free.maxGenerations} free generations. Upgrade to continue creating — no watermarks, unlimited content.`,
      upgradeRequired: true,
      usage: { used: generationCount, limit: USAGE_LIMITS.free.maxGenerations },
    };
  }

  const effectivePlatforms = isFreeTier
    ? platforms.slice(0, USAGE_LIMITS.free.maxPlatforms)
    : platforms.length > 0 ? platforms : ["tiktok", "instagram", "youtube", "facebook", "linkedin"];

  // Try OpenAI — fall back to templates if key missing or call fails
  if (!hasApiKey()) {
    console.warn("[backend] OPENAI_API_KEY not set — using fallback templates");
    return buildFallbackResult({ brandName, prompt, platforms: effectivePlatforms, isFreeTier, generationCount, captionStyle });
  }

  try {
    const styleDesc = CAPTION_STYLES[captionStyle]?.description || CAPTION_STYLES.short.description;
    const userPrompt = `Brand: "${brandName}"
Topic/Prompt: "${prompt}"
Platforms: ${effectivePlatforms.join(", ")}
Caption Style: ${captionStyle} (${styleDesc})
Tone: ${params.tone || "engaging and authentic"}

Generate content for each platform listed above. Return ONLY valid JSON.`;

    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: AI_CONTENT_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2048,
      temperature: 0.8,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from OpenAI");

    const aiData = JSON.parse(raw) as Record<string, AIContentItem>;
    const watermark = isFreeTier ? getWatermarkOverlay(brandName) : "";
    const hashtagQuality = isFreeTier ? "basic" : "viral";

    const platformContent = effectivePlatforms.map(p => {
      const item = aiData[p] || aiData.tiktok || { script: "", caption: "", hashtags: [] };
      return {
        platform: p,
        script: item.script || fallbackScripts(prompt)[p] || "",
        caption: (item.caption || "") + watermark,
        hashtags: isFreeTier
          ? (item.hashtags || []).slice(0, 3)
          : (item.hashtags || []).slice(0, 15),
        hashtagQuality,
      };
    });

    return {
      brandName,
      prompt,
      tier: isFreeTier ? "free" : "paid",
      generationLimit: isFreeTier ? { used: generationCount + 1, limit: USAGE_LIMITS.free.maxGenerations } : undefined,
      watermark: isFreeTier ? "Watermark added. Upgrade for clean exports." : undefined,
      captionStyle,
      aiGenerated: true,
      platformContent,
      suggestedFormat: effectivePlatforms.includes("tiktok") || effectivePlatforms.includes("instagram")
        ? "9:16 vertical" : "16:9 horizontal",
      estimatedDuration: "15 seconds",
    };
  } catch (err: any) {
    console.error("[backend] OpenAI call failed, using fallback:", err?.message || err);
    return buildFallbackResult({ brandName, prompt, platforms: effectivePlatforms, isFreeTier, generationCount, captionStyle });
  }
}

// ============================================================================
// SEO KEYWORD GENERATION
// ============================================================================
const KEYWORDS_SYSTEM_PROMPT = `You are an SEO expert. Generate keyword suggestions for a brand/prompt.

Return a JSON object with these keys:
- "primary": Array of 5-10 primary keywords (brand + topic combos, high-intent)
- "secondary": Array of 5-10 secondary keywords (related topics, medium-intent)
- "longTail": Array of 5-10 long-tail keyword phrases (question-based, specific)
- "trending": Array of 5-10 trending keywords (current viral topics in the niche)

Return ONLY valid JSON.`;

export async function generateKeywords(params: { brandName: string; prompt: string; platforms?: string[]; count?: number }): Promise<{ primary: string[]; secondary: string[]; longTail: string[]; trending: string[]; aiGenerated: boolean }> {
  const { brandName, prompt, platforms = [], count = 10 } = params;

  if (!hasApiKey()) {
    console.warn("[backend] OPENAI_API_KEY not set — using fallback keywords");
    return { ...fallbackKeywords(params), aiGenerated: false };
  }

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: KEYWORDS_SYSTEM_PROMPT },
        { role: "user", content: `Brand: "${brandName}"\nTopic: "${prompt}"\nPlatforms: ${platforms.join(", ") || "all social media"}\nCount per category: ${count}` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.7,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response");
    const parsed = JSON.parse(raw);
    return {
      primary: (parsed.primary || []).slice(0, count),
      secondary: (parsed.secondary || []).slice(0, count),
      longTail: (parsed.longTail || []).slice(0, count),
      trending: (parsed.trending || []).slice(0, count),
      aiGenerated: true,
    };
  } catch (err: any) {
    console.error("[backend] Keywords AI call failed:", err?.message || err);
    return { ...fallbackKeywords(params), aiGenerated: false };
  }
}

function fallbackKeywords(params: { brandName: string; prompt: string; platforms?: string[]; count?: number }): { primary: string[]; secondary: string[]; longTail: string[]; trending: string[] } {
  const { brandName, prompt, platforms = [], count = 10 } = params;
  const brand = brandName.replace(/\s/g, "").toLowerCase();
  const subject = (prompt || "").toLowerCase().replace(/[^\w\s]/g, " ").trim();
  const subjectWords = subject.split(/\s+/).filter(w => w.length > 3).slice(0, 5);
  const baseNoun = subjectWords[0] || "content";
  const platformTags = platforms.length > 0
    ? platforms.map(p => `${p}marketing`)
    : ["socialmedia", "digitalmarketing", "contentstrategy"];

  const primary = [brand, `${brand} ${baseNoun}`, `${baseNoun} tips`, `${baseNoun} 2026`, `best ${baseNoun}`].slice(0, count);
  const secondary = [`${baseNoun} strategy`, `${baseNoun} ideas`, `${baseNoun} for beginners`, `how to ${baseNoun}`, `${baseNoun} tools`, ...subjectWords.slice(1, 4).map(w => `${w} ${baseNoun}`)].slice(0, count);
  const longTail = [`how to create ${baseNoun} that goes viral`, `best ${baseNoun} strategy for small business`, `${baseNoun} ideas for ${platforms[0] || "tiktok"}`, `affordable ${baseNoun} tools for creators`, `${baseNoun} mistakes to avoid in 2026`].slice(0, count);
  const trending = ["AI content", "faceless creator", "UGC ads", "short form video", "TikTok algorithm 2026", ...platformTags].slice(0, count);

  return { primary, secondary, longTail, trending };
}

// ============================================================================
// CTA GENERATION
// ============================================================================
const CTA_SYSTEM_PROMPT = `You are a conversion copywriter. Generate call-to-action (CTA) options for social media posts.

Return a JSON object with:
- "primary": The best CTA for this content (1 sentence)
- "alternatives": Array of 5 alternative CTAs
- "perPlatform": Object with platform-specific CTAs for: tiktok, instagram, youtube, facebook, linkedin

Return ONLY valid JSON.`;

export async function generateCTAs(params: { brandName: string; prompt?: string; style?: "soft" | "medium" | "hard" | "mixed"; count?: number }): Promise<{ primary: string; alternatives: string[]; perPlatform: Record<string, string>; aiGenerated: boolean }> {
  const { brandName, prompt = "", style = "mixed", count = 5 } = params;

  if (!hasApiKey()) {
    return { ...fallbackCTAs(params), aiGenerated: false };
  }

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CTA_SYSTEM_PROMPT },
        { role: "user", content: `Brand: "${brandName}"\nTopic: "${prompt}"\nCTA Style: ${style} (soft=gentle nudge, medium=engagement ask, hard=direct buy, mixed=variety)\nNumber of alternatives: ${count}` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.7,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response");
    const parsed = JSON.parse(raw);
    return {
      primary: parsed.primary || `Try ${brandName} today — link in bio.`,
      alternatives: (parsed.alternatives || []).slice(0, count),
      perPlatform: parsed.perPlatform || {},
      aiGenerated: true,
    };
  } catch (err: any) {
    console.error("[backend] CTA AI call failed:", err?.message || err);
    return { ...fallbackCTAs(params), aiGenerated: false };
  }
}

function fallbackCTAs(params: { brandName: string; prompt?: string; style?: "soft" | "medium" | "hard" | "mixed"; count?: number }): { primary: string; alternatives: string[]; perPlatform: Record<string, string> } {
  const { brandName, prompt = "", style = "mixed", count = 5 } = params;
  const brand = brandName;
  const subject = prompt.split(" ").slice(0, 3).join(" ").toLowerCase() || "this";

  const soft = [
    `Curious? Learn more about ${brand} in our bio.`,
    `Want to see more? Follow for daily ${subject} tips.`,
    `Save this for later — you'll want it.`,
    `Send this to a friend who needs it.`,
    `Tap the link in bio when you're ready.`,
  ];
  const medium = [
    `Comment "${brand.split(" ")[0]}" and I'll send you the full guide.`,
    `DM us "READY" for the free ${subject} starter pack.`,
    `Try ${brand} free for 7 days — link in bio.`,
    `Join 12,000+ creators using ${brand} to grow. Link in bio.`,
    `Drop a 🔥 if you want more ${subject} content like this.`,
  ];
  const hard = [
    `Don't wait — start your free trial of ${brand} now. Link in bio.`,
    `Limited spots: get ${brand} today before pricing changes.`,
    `Last chance: 50% off ${brand} for the next 24 hours.`,
    `Buy now and start posting in under 5 minutes.`,
    `Stop scrolling. Start creating. Get ${brand} → link in bio.`,
  ];
  const all = style === "soft" ? soft : style === "medium" ? medium : style === "hard" ? hard : [...medium.slice(0, 2), ...soft.slice(0, 2), ...hard.slice(0, 1)];
  const primary = all[0];
  const alternatives = all.slice(1, count);

  return {
    primary,
    alternatives,
    perPlatform: {
      tiktok: `Comment "${brand.split(" ")[0]}" for the free guide 🎁`,
      instagram: `Save this post + tap the link in bio to get started with ${brand} ✨`,
      youtube: `Subscribe + hit the bell so you don't miss our next ${subject} tutorial.`,
      facebook: `Share this with someone who needs it, and DM us for the free starter kit.`,
      linkedin: `Reach out if you're building in ${subject} — happy to share what ${brand} learned.`,
    },
  };
}

// ============================================================================
// CONTENT CALENDAR GENERATION
// ============================================================================
export type CalendarTheme = "educational" | "entertainment" | "product_promotion" | "community_engagement" | "storytelling";

export const CALENDAR_THEMES: Record<CalendarTheme, { label: string; weight: number; description: string }> = {
  educational: { label: "Educational", weight: 0.30, description: "How-tos, tips, tutorials" },
  entertainment: { label: "Entertainment", weight: 0.25, description: "Trends, memes, behind-the-scenes" },
  product_promotion: { label: "Product Promotion", weight: 0.20, description: "Features, demos, testimonials" },
  community_engagement: { label: "Community", weight: 0.15, description: "Polls, Q&A, UGC, replies" },
  storytelling: { label: "Storytelling", weight: 0.10, description: "Founder story, customer wins" },
};

const CALENDAR_SYSTEM_PROMPT = `You are a social media content strategist. Generate a content calendar.

Return a JSON object with:
- "calendar": Array of objects, each with:
  - "theme": One of: educational, entertainment, product_promotion, community_engagement, storytelling
  - "idea": A specific, actionable post idea (1 sentence)
  - "captionHook": The first line of the caption (1 sentence, hook-driven)
  - "suggestedFormat": Video format suggestion like "9:16 short", "1:1 or 16:9", "9:16 short"

Return ONLY valid JSON.`;

export async function generateContentCalendar(params: { brandName: string; platforms: string[]; weeks?: number; postsPerWeek?: number; startDate?: Date }) {
  const { brandName, platforms, weeks = 4, postsPerWeek = 7, startDate = new Date() } = params;

  if (!hasApiKey()) {
    return fallbackCalendar(params);
  }

  try {
    const totalPosts = weeks * postsPerWeek;
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CALENDAR_SYSTEM_PROMPT },
        { role: "user", content: `Brand: "${brandName}"\nPlatforms: ${platforms.join(", ")}\nWeeks: ${weeks}\nPosts per week: ${postsPerWeek}\nTotal posts needed: ${totalPosts}\n\nThemes to distribute: educational (30%), entertainment (25%), product_promotion (20%), community_engagement (15%), storytelling (10%)` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
      temperature: 0.8,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response");
    const parsed = JSON.parse(raw);
    const aiCalendar: any[] = parsed.calendar || [];

    const calendar = aiCalendar.slice(0, totalPosts).map((item: any, idx: number) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + idx);
      const platform = platforms[idx % platforms.length] || platforms[0] || "tiktok";
      return {
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        platform,
        theme: item.theme || "educational",
        themeLabel: CALENDAR_THEMES[item.theme as CalendarTheme]?.label || "Educational",
        idea: item.idea || "Post idea",
        captionHook: item.captionHook || "Check this out…",
        suggestedFormat: item.suggestedFormat || (["tiktok", "instagram", "snapchat"].includes(platform) ? "9:16 short" : "1:1 or 16:9"),
      };
    });

    // Pad with fallback if AI didn't return enough
    while (calendar.length < totalPosts) {
      const idx = calendar.length;
      const date = new Date(startDate);
      date.setDate(date.getDate() + idx);
      const platform = platforms[idx % platforms.length] || platforms[0] || "tiktok";
      calendar.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        platform,
        theme: "educational",
        themeLabel: "Educational",
        idea: `Content tip for ${brandName}`,
        captionHook: "Here's something you need to know…",
        suggestedFormat: ["tiktok", "instagram"].includes(platform) ? "9:16 short" : "1:1 or 16:9",
      });
    }

    const themes: CalendarTheme[] = Object.keys(CALENDAR_THEMES) as CalendarTheme[];
    return {
      brandName,
      weeks,
      postsPerWeek,
      totalPosts: calendar.length,
      platforms,
      aiGenerated: true,
      calendar,
      themeBreakdown: themes.map(t => ({ theme: t, label: CALENDAR_THEMES[t].label, count: calendar.filter((c: any) => c.theme === t).length })),
    };
  } catch (err: any) {
    console.error("[backend] Calendar AI call failed:", err?.message || err);
    return fallbackCalendar(params);
  }
}

function fallbackCalendar(params: { brandName: string; platforms: string[]; weeks?: number; postsPerWeek?: number; startDate?: Date }) {
  const { brandName, platforms, weeks = 4, postsPerWeek = 7, startDate = new Date() } = params;
  const themes: CalendarTheme[] = Object.keys(CALENDAR_THEMES) as CalendarTheme[];
  const themeWeights = themes.map(t => CALENDAR_THEMES[t].weight);
  const totalPosts = weeks * postsPerWeek;
  const themePool: CalendarTheme[] = [];
  themes.forEach((t, i) => {
    const count = Math.round(themeWeights[i] * totalPosts);
    for (let k = 0; k < count; k++) themePool.push(t);
  });
  while (themePool.length < totalPosts) themePool.push("educational");
  for (let i = themePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [themePool[i], themePool[j]] = [themePool[j], themePool[i]];
  }
  const ideaTemplates: Record<CalendarTheme, string[]> = {
    educational: ["3 mistakes to avoid in {topic}", "How to {topic} in 5 steps", "The {topic} framework I wish I knew sooner", "Beginner's guide to {topic}", "Save this for your next {topic} session"],
    entertainment: ["POV: when {topic} finally clicks", "Things that just make sense about {topic}", "A day in the life of a {brand} creator", "Reacting to the wildest {topic} trends", "What nobody tells you about {topic}"],
    product_promotion: ["Why customers love {brand}", "60 seconds inside the {brand} studio", "Before vs after using {brand}", "New from {brand}: {feature}", "Founder story: why I built {brand}"],
    community_engagement: ["Poll: what's your biggest {topic} struggle?", "Q&A roundup: your top {topic} questions", "Reposting the best {topic} UGC this week", "Comment your wildest {topic} idea", "Tag a friend who needs to see this"],
    storytelling: ["How I went from zero to {brand} in 6 months", "The customer story that changed our roadmap", "A moment I almost quit {brand}", "Lessons from our first 1000 customers", "The {topic} story behind our latest launch"],
  };
  const topicGuess = "your niche";
  const fill = (s: string) => s.replace("{topic}", topicGuess).replace("{brand}", brandName).replace("{feature}", "this feature");

  const calendar: Array<{ date: string; day: string; platform: string; theme: CalendarTheme; themeLabel: string; idea: string; captionHook: string; suggestedFormat: string }> = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < postsPerWeek; d++) {
      const idx = w * postsPerWeek + d;
      if (idx >= themePool.length) break;
      const theme = themePool[idx];
      const date = new Date(startDate);
      date.setDate(date.getDate() + idx);
      const platform = platforms[idx % platforms.length] || platforms[0] || "tiktok";
      const templates = ideaTemplates[theme];
      const idea = fill(templates[idx % templates.length]);
      calendar.push({
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        platform,
        theme,
        themeLabel: CALENDAR_THEMES[theme].label,
        idea,
        captionHook: idea.split(" ").slice(0, 8).join(" ") + "…",
        suggestedFormat: ["tiktok", "instagram", "snapchat"].includes(platform) ? "9:16 short" : ["youtube", "facebook", "linkedin", "pinterest"].includes(platform) ? "1:1 or 16:9" : "9:16 short",
      });
    }
  }
  return {
    brandName,
    weeks,
    postsPerWeek,
    totalPosts: calendar.length,
    platforms,
    aiGenerated: false,
    calendar,
    themeBreakdown: themes.map(t => ({ theme: t, label: CALENDAR_THEMES[t].label, count: calendar.filter(c => c.theme === t).length })),
  };
}

// ============================================================================
// CREDIT COSTS
// ============================================================================
export type ActionType = "generate_content" | "generate_video" | "generate_image" | "schedule_post" | "publish_post" | "ai_avatar" | "trend_analysis" | "generate_ideas" | "generate_calendar" | "three_liner" | "brand_kit_create";

export const CREDIT_COSTS: Record<ActionType, number> = {
  generate_content: 1,
  generate_video: 5,
  generate_image: 2,
  schedule_post: 1,
  publish_post: 1,
  ai_avatar: 10,
  trend_analysis: 3,
  generate_ideas: 1,
  generate_calendar: 2,
  three_liner: 1,
  brand_kit_create: 1,
};

export function getCreditCost(action: ActionType | string, params?: { platforms?: string[]; durationDays?: number; isFreeTier?: boolean }): { action: string; cost: number; breakdown?: string[]; total?: number } {
  const base = CREDIT_COSTS[action as ActionType];
  if (base === undefined) {
    return { action, cost: 0, breakdown: [`Unknown action: ${action}`], total: 0 };
  }
  if (action === "generate_content" && params?.platforms) {
    const platformCount = params.platforms.length;
    const perPlatform = 1;
    const subtotal = platformCount * perPlatform;
    return { action, cost: subtotal, breakdown: params.platforms.map(p => `${p}: ${perPlatform} credit`), total: subtotal };
  }
  if (action === "schedule_post" && params?.durationDays) {
    const weeks = Math.ceil(params.durationDays / 7);
    const subtotal = 1 * weeks;
    return { action, cost: subtotal, breakdown: [`${weeks} week(s) of scheduling: ${subtotal} credits`], total: subtotal };
  }
  return { action, cost: base };
}

// ============================================================================
// Scheduling Engine
// ============================================================================
export const OPTIMAL_TIMES: Record<string, string[]> = {
  tiktok: ["7:00-9:00 AM", "12:00-2:00 PM", "7:00-11:00 PM"],
  instagram: ["9:00-11:00 AM", "12:00-2:00 PM", "7:00-9:00 PM"],
  youtube: ["2:00-4:00 PM", "6:00-8:00 PM"],
  facebook: ["9:00 AM-1:00 PM", "1:00-4:00 PM"],
  linkedin: ["7:00-8:00 AM", "12:00-1:00 PM", "5:00-6:00 PM"],
  pinterest: ["8:00-11:00 PM"],
  snapchat: ["10:00 AM-12:00 PM", "7:00-10:00 PM"],
};

export function generateSchedule(params: {
  brandName: string;
  platforms: string[];
  postsPerDay: number;
  startDate: Date;
  durationDays: number;
}) {
  const { platforms, postsPerDay, startDate, durationDays } = params;
  const schedule = [];
  for (let day = 0; day < durationDays; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    for (let post = 0; post < postsPerDay; post++) {
      for (const platform of platforms) {
        const times = OPTIMAL_TIMES[platform] || ["12:00 PM"];
        const time = times[post % times.length];
        schedule.push({
          platform,
          date: date.toISOString().split("T")[0],
          time,
          brandName: params.brandName,
          optimized: true,
        });
      }
    }
  }
  return schedule;
}

// ============================================================================
// Conversational AI Parser
// ============================================================================
export function parseChatIntent(message: string): {
  action: "create" | "schedule" | "post" | "analyze" | "unknown";
  brandName?: string;
  platforms?: string[];
  frequency?: string;
  duration?: string;
} {
  const lower = message.toLowerCase();
  const platformKeywords: Record<string, string[]> = {
    tiktok: ["tiktok", "tt"],
    instagram: ["instagram", "ig", "reels", "insta"],
    youtube: ["youtube", "yt", "shorts"],
    facebook: ["facebook", "fb"],
    linkedin: ["linkedin"],
    snapchat: ["snapchat", "snap"],
    pinterest: ["pinterest", "pin"],
  };
  const platforms: string[] = [];
  for (const [platform, keywords] of Object.entries(platformKeywords)) {
    if (keywords.some(k => lower.includes(k))) {
      platforms.push(platform);
    }
  }
  let action: "create" | "schedule" | "post" | "analyze" | "unknown" = "unknown";
  if (lower.includes("create") || lower.includes("make") || lower.includes("generate") || lower.includes("write")) action = "create";
  else if (lower.includes("schedule") || lower.includes("plan") || lower.includes("calendar")) action = "schedule";
  else if (lower.includes("post") || lower.includes("publish") || lower.includes("share")) action = "post";
  else if (lower.includes("analyze") || lower.includes("research") || lower.includes("trend") || lower.includes("find")) action = "analyze";
  const freqMatch = lower.match(/(\d+)\s*(?:post|time|video)s?\s*(?:per|a|every|each)\s*(day|week|month)/);
  const frequency = freqMatch ? `${freqMatch[1]} posts/${freqMatch[2]}` : undefined;
  let brandName: string | undefined;
  const brandMatch = lower.match(/(?:for|my)\s+(\w+(?:\s+\w+)?)\s*(?:brand|company|product)?/);
  if (brandMatch) brandName = brandMatch[1];
  return { action, brandName, platforms, frequency };
}
