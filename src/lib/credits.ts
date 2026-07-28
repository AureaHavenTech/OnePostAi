/**
 * Credits system for OnePost AI.
 * Additive layer — stores credit balances in localStorage.
 * Credits are used for premium AI requests and automations.
 */

const CREDITS_KEY = "onepostai_credits";
const CREDIT_USAGE_KEY = "onepostai_credit_usage";

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  description: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", name: "Starter Pack", credits: 50, price: 9, description: "For light AI tasks" },
  { id: "creator", name: "Creator Pack", credits: 200, price: 29, popular: true, description: "Best value for active creators" },
  { id: "pro", name: "Pro Pack", credits: 500, price: 59, description: "For power users and teams" },
];

export const CREDIT_COSTS = {
  contentGeneration: 2,
  imageGeneration: 5,
  videoGeneration: 10,
  hashtagResearch: 1,
  adCreativeGeneration: 3,
  trendAnalysis: 4,
  autoPublish: 1,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function loadCredits(): number {
  if (!isBrowser()) return 0;
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function saveCredits(balance: number): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CREDITS_KEY, String(balance));
  } catch {
    // ignore
  }
}

function loadUsage(): Record<string, number> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(CREDIT_USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsage(usage: Record<string, number>): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CREDIT_USAGE_KEY, JSON.stringify(usage));
  } catch {
    // ignore
  }
}

/**
 * Get current credit balance.
 */
export function getCreditBalance(): number {
  return loadCredits();
}

/**
 * Add credits to balance. Returns new balance.
 */
export function addCredits(amount: number): number {
  const balance = loadCredits() + amount;
  saveCredits(balance);
  return balance;
}

/**
 * Spend credits for an action. Returns true if successful, false if insufficient.
 */
export function spendCredits(action: keyof typeof CREDIT_COSTS): boolean {
  const cost = CREDIT_COSTS[action];
  if (cost === undefined) return false;
  const balance = loadCredits();
  if (balance < cost) return false;
  saveCredits(balance - cost);

  // Track usage
  const usage = loadUsage();
  usage[action] = (usage[action] || 0) + 1;
  usage._totalSpent = (usage._totalSpent || 0) + cost;
  saveUsage(usage);

  return true;
}

/**
 * Check if user has enough credits for an action.
 */
export function hasCreditsFor(action: keyof typeof CREDIT_COSTS): boolean {
  const cost = CREDIT_COSTS[action];
  if (cost === undefined) return false;
  return loadCredits() >= cost;
}

/**
 * Get the cost of a specific action.
 */
export function getCreditCost(action: keyof typeof CREDIT_COSTS): number {
  return CREDIT_COSTS[action] || 0;
}

/**
 * Get full credit stats.
 */
export function getCreditStats() {
  const balance = loadCredits();
  const usage = loadUsage();
  return {
    balance,
    usage,
    totalSpent: usage._totalSpent || 0,
    packs: CREDIT_PACKS,
    costs: CREDIT_COSTS,
  };
}

/**
 * Reset credits (for testing).
 */
export function resetCredits(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(CREDITS_KEY);
    localStorage.removeItem(CREDIT_USAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Post-trial options for users who have exhausted their trial.
 */
export interface PostTrialOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  href: string;
  highlight?: boolean;
}

export const POST_TRIAL_OPTIONS: PostTrialOption[] = [
  {
    id: "upgrade-monthly",
    title: "Upgrade Monthly",
    description: "Unlock unlimited access. All features, no limits. From $19/mo.",
    icon: "💎",
    action: "View Plans",
    href: "/pricing",
    highlight: true,
  },
  {
    id: "buy-credits",
    title: "Buy Credit Pack",
    description: "Pay-as-you-go. Get 50-500 credits for premium AI actions. No subscription needed.",
    icon: "⚡",
    action: "See Packs",
    href: "#credits",
  },
  {
    id: "continue-free",
    title: "Continue Free",
    description: "Keep the app with reduced limits. 5 generations/mo, basic features only.",
    icon: "🆓",
    action: "Continue",
    href: "/dashboard",
  },
];