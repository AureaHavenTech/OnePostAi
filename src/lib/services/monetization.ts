// Monetization — Credits & one-time purchases
// Additive system: users have 3 options after trial

export const CREDIT_PACKAGES = {
  small: {
    name: "Starter Pack",
    credits: 10,
    price: 9.99,
    priceCents: 999,
    description: "10 additional exports or AI generations",
  },
  medium: {
    name: "Creator Pack",
    credits: 30,
    price: 19.99,
    priceCents: 1999,
    description: "30 additional exports or AI generations — best value",
    popular: true,
  },
  large: {
    name: "Pro Pack",
    credits: 100,
    price: 49.99,
    priceCents: 4999,
    description: "100 additional exports or AI generations",
  },
};

export const CREDIT_COSTS = {
  contentGeneration: 1,       // 1 credit per AI content generation
  videoExport: 2,              // 2 credits per video export
  aiAvatarGeneration: 3,       // 3 credits per AI avatar video
  premiumTemplate: 1,          // 1 credit per premium template unlock
  trendAnalysisReport: 2,      // 2 credits per trend analysis
  brandKitCreate: 2,           // 2 credits to create a Brand Kit
  extraExportClean: 1,         // 1 credit for watermark-free export
};

export type SubscriptionTier = "free" | "basic" | "pro" | "agency";

export const SUBSCRIPTION_PLANS = {
  basic: { name: "Basic", price: 19, creditsIncluded: 50 },
  pro: { name: "Pro", price: 49, creditsIncluded: 200 },
  agency: { name: "Agency", price: 99, creditsIncluded: 1000 },
};

export function getRemainingFreeGenerations(used: number): number {
  return Math.max(0, 5 - used);
}

export function canGenerate(tier: SubscriptionTier, used: number, credits: number): boolean {
  if (tier === "free") return used < 5;
  return credits > 0;
}