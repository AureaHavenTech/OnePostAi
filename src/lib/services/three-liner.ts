// Three Liner™ — Signature content framework
// Hook | Product/Solution | Brand — zero filler, maximum impact

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

export function generateThreeLiner(params: {
  template: string;
  brandName: string;
  brandMotto?: string;
  painPoint?: string;
  product?: string;
  keyFeature?: string;
  timeSaved?: string;
  link?: string;
}): ThreeLinerTemplate & { filled: { hook: string; body: string; brand: string } } {
  const template = THREE_LINER_TEMPLATES[params.template] || THREE_LINER_TEMPLATES.hookValueClose;
  const { brandName, brandMotto = "", painPoint = "content creation", product = brandName, keyFeature = "AI automation", timeSaved = "10+", link = "onepostai.ctonew.app" } = params;

  const filled = {
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

  return { ...template, filled };
}