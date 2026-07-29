// Three Liner™ — Signature content framework
// Hook | Product/Solution | Brand — zero filler, maximum impact
// Now powered by OpenAI GPT-4o — falls back to template substitution in dev mode.

import { generateThreeLinerWithAI, isOpenAIConfigured } from "@/lib/openai";

export interface ThreeLinerTemplate {
  name: string;
  structure: {
    hook: string;        // Scroll-stopping opener
    body: string;        // Product / solution / value
    brand: string;       // Brand close with CTA
  };
  suggestedDuration: string; // e.g. "15 sec", "30 sec", "static"
  bestFor: string[];         // e.g. ["tiktok", "reels", "shorts"]
}

export const THREE_LINER_TEMPLATES: Record<string, ThreeLinerTemplate> = {
  problemSolution: {
    name: "Problem → Solution",
    structure: {
      hook: "Struggling with [pain point]?",
      body: "Here's what I found — [solution/product] changes everything.",
      brand: "Try [brand] today. Link in bio.",
    },
    suggestedDuration: "15 sec",
    bestFor: ["tiktok", "instagram", "facebook"],
  },
  beforeAfter: {
    name: "Before → After",
    structure: {
      hook: "Stop doing [old way]. Do this instead.",
      body: "[Brand] makes it effortless. Here's how it works in 10 seconds.",
      brand: "[Brand] — [motto]. Get yours at [link].",
    },
    suggestedDuration: "15-30 sec",
    bestFor: ["tiktok", "instagram", "youtube"],
  },
  hookValueClose: {
    name: "Hook → Value → Close",
    structure: {
      hook: "This one change saved me [X] hours/week.",
      body: "[Product] automates the grunt work so you can focus on what matters.",
      brand: "Powered by [brand]. Start your free trial at [link].",
    },
    suggestedDuration: "15 sec",
    bestFor: ["tiktok", "instagram", "linkedin", "facebook"],
  },
  curiositySell: {
    name: "Curiosity → Sell",
    structure: {
      hook: "I wish I knew this sooner...",
      body: "[Product] does [X], [Y], and [Z] in one click. No editing. No stress.",
      brand: "[Brand]. [tagline]. Try it free → [link]",
    },
    suggestedDuration: "15 sec",
    bestFor: ["tiktok", "instagram", "snapchat"],
  },
  quickTip: {
    name: "Quick Tip",
    structure: {
      hook: "Here's a quick [topic] tip that changed everything for me.",
      body: "[Brand] makes it possible by [key feature]. Watch this 👇",
      brand: "Follow [brand] for more [topic] tips. [link]",
    },
    suggestedDuration: "10-15 sec",
    bestFor: ["tiktok", "instagram", "youtube shorts"],
  },
};

function fillTemplate(params: {
  template: string;
  brandName: string;
  brandMotto?: string;
  painPoint?: string;
  product?: string;
  keyFeature?: string;
  timeSaved?: string;
  link?: string;
}): { hook: string; body: string; brand: string } {
  const template = THREE_LINER_TEMPLATES[params.template] || THREE_LINER_TEMPLATES.hookValueClose;
  const {
    brandName,
    brandMotto = "",
    painPoint = "content creation",
    product = brandName,
    keyFeature = "AI automation",
    timeSaved = "10+",
    link = "onepostai.ctonew.app",
  } = params;

  return {
    hook: template.structure.hook
      .replace("[pain point]", painPoint)
      .replace("[old way]", painPoint)
      .replace("[X]", timeSaved)
      .replace("[topic]", painPoint),
    body: template.structure.body
      .replace("[solution]", product)
      .replace("[product]", product)
      .replace("[Brand]", brandName)
      .replace("[key feature]", keyFeature),
    brand: template.structure.brand
      .replace("[brand]", brandName)
      .replace("[Brand]", brandName)
      .replace("[motto]", brandMotto)
      .replace("[tagline]", brandMotto)
      .replace("[link]", link)
      .replace("[topic]", painPoint),
  };
}

export async function generateThreeLiner(params: {
  template: string;
  brandName: string;
  brandMotto?: string;
  painPoint?: string;
  product?: string;
  keyFeature?: string;
  timeSaved?: string;
  link?: string;
}): Promise<ThreeLinerTemplate & {
  filled: { hook: string; body: string; brand: string };
  aiModel?: string;
  aiConfigured?: boolean;
  aiError?: string;
}> {
  const template = THREE_LINER_TEMPLATES[params.template] || THREE_LINER_TEMPLATES.hookValueClose;

  // Try real OpenAI generation
  const ai = await generateThreeLinerWithAI({
    brandName: params.brandName,
    template: params.template,
    painPoint: params.painPoint,
    product: params.product,
    keyFeature: params.keyFeature,
    timeSaved: params.timeSaved,
    brandMotto: params.brandMotto,
    link: params.link,
  });

  if (ai.ok) {
    return {
      ...template,
      filled: {
        hook: ai.data.hook,
        body: ai.data.body,
        brand: ai.data.brand,
      },
      aiModel: ai.model,
      aiConfigured: true,
    };
  }

  // Fallback to template substitution
  return {
    ...template,
    filled: fillTemplate(params),
    aiModel: "template",
    aiConfigured: isOpenAIConfigured(),
    aiError: ai.message,
  };
}
