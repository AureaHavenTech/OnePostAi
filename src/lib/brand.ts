/**
 * OnePost AI — Brand Foundation Config
 *
 * Single source of truth for brand identity across the app.
 * Import this instead of hardcoding brand values.
 *
 * © 2026 Aura Haven Tech. All rights reserved.
 */

export const brand = {
  /** Brand identity */
  name: "OnePost AI",
  nameLegal: "OnePost AI™",
  tagline: "Content that moves",
  description:
    "Fix ALL content creation headaches. Posts across every social media platform from ONE place. Automatically picks viral hashtags. Schedules at optimal times. Cross-platform analytics so you never have to research or jump between pages.",

  /** Vibe & personality */
  vibe: "Sexy, luxurious, premium, confident, feminine — like Coco Chanel",
  emotion: "Boosts confidence, builds trust, signals quality",

  /** Logo */
  logo: {
    path: "/logo.svg",
    alt: "OnePost AI — Gold OP Monogram",
    /** Display LARGE as hero centerpiece on landing page */
    heroSize: "w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80",
    glowFilter: "drop-shadow(0 0 60px rgba(201,169,110,0.3))",
  },

  /** Color palette — LOCKED */
  colors: {
    dark: {
      DEFAULT: "#12121a",
      deeper: "#0a0a0f",
      border: "#1e1e2a",
      card: "rgba(10,10,15,0.4)",
    },
    cream: {
      DEFAULT: "#e8e0d4",
      light: "#f5f0eb",
    },
    gold: {
      DEFAULT: "#c9a96e",
      light: "#d4b87a",
      lighter: "#e8d4a8",
      gradient: "linear-gradient(135deg, #c9a96e, #d4b87a, #e8d4a8)",
    },
    emerald: {
      DEFAULT: "#10b981",
      light: "#34d399",
      /** Trust signals and 30-day guarantee badges */
      usage: "Trust signals, guarantees (30-day money-back)",
    },
  },

  /** Typography — LOCKED */
  fonts: {
    heading: {
      family: "'Playfair Display', Georgia, serif",
      description: "Serif, elegant, premium",
    },
    body: {
      family: "'Inter', system-ui, -apple-system, sans-serif",
      description: "Clean, modern, readable",
    },
  },

  /** Parent company */
  parent: {
    name: "Aura Haven Tech",
    email: "aurahaventech@gmail.com",
    copyright: "© 2026 Aura Haven Tech. All rights reserved.",
  },

  /** Social links */
  socials: {
    handle: "@funkycoldmedemaa",
    instagram: "https://instagram.com/funkycoldmedemaa",
    tiktok: "https://tiktok.com/@funkycoldmedemaa",
    facebook: "https://facebook.com/funkycoldmedemaa",
    pinterest: "https://pinterest.com/funkycoldmedemaa",
    snapchat: "https://snapchat.com/add/funkycoldmedemaa",
  },

  /** URLs */
  urls: {
    app: "https://onepostai.vercel.app",
    /** Cross-promotion to sibling brands */
    axelAI: "https://axelai-eight.vercel.app",
    auraHaven: "https://aurbhaven.shop",
  },

  /** Pricing tiers */
  pricing: [
    { name: "Starter", price: 19, features: ["1 social platform", "10 scheduled posts/mo", "Basic analytics", "Hashtag suggestions"] },
    { name: "Pro", price: 49, features: ["5 social platforms", "50 scheduled posts/mo", "Advanced analytics", "AI content generation", "Auto hashtags", "Priority support"] },
    { name: "Unlimited", price: 99, features: ["Unlimited platforms", "Unlimited posts", "Real-time analytics", "AI content + repurpose", "Custom branding", "Dedicated manager"] },
  ],

  /** Guarantee */
  guarantee: "30-day money-back guarantee",
} as const;

export default brand;