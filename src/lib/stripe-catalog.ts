/**
 * Stripe price catalog — single source of truth.
 * Import this from anywhere, NOT from the route file.
 *
 * Each plan has:
 *  - priceId     — the real Stripe price ID (or a placeholder until the owner
 *                  creates the corresponding product in the Stripe dashboard).
 *  - paymentLink — the Stripe payment link URL (https://buy.stripe.com/...)
 *                  Optional — when set, the pricing page CTA jumps straight to
 *                  Stripe's hosted checkout. Leave empty to use the API-driven
 *                  flow through /api/create-checkout.
 *  - amount      — the display amount in the smallest currency unit (USD cents
 *                  are *not* used here — these are whole dollars for display).
 *  - placeholder  — true when the priceId is a "price_placeholder_..." that
 *                  the owner still needs to replace. The /api/create-checkout
 *                  route returns a friendly stub in that case.
 */
export interface StripePlan {
  priceId: string;
  paymentLink?: string;
  label: string;
  amount: number;
  currency: string;
  mode: "payment" | "subscription";
  nickname?: string;
  placeholder?: boolean;
}
export const STRIPE_PRICE_CATALOG: Record<string, StripePlan> = {
  "onepost_basic": {
    // Owner: replace with the real Stripe price ID for the $19/mo plan.
    priceId: "price_placeholder_basic_19usd_monthly",
    paymentLink: "https://buy.stripe.com/test_onepost_basic_19usd",
    label: "OnePost AI Basic",
    amount: 19,
    currency: "USD",
    mode: "subscription",
    nickname: "Basic — solo creators",
    placeholder: true,
  },
  "onepost_pro": {
    // Owner: replace with the real Stripe price ID for the $49/mo plan.
    priceId: "price_placeholder_pro_49usd_monthly",
    paymentLink: "https://buy.stripe.com/test_onepost_pro_49usd",
    label: "OnePost AI Pro",
    amount: 49,
    currency: "USD",
    mode: "subscription",
    nickname: "Pro — serious creators",
    placeholder: true,
  },
  "onepost_lifetime": {
    // Real Stripe price — already configured in the owner's Stripe dashboard.
    priceId: "price_1TkABjDIOEE0E2wQ4jINuBhJ",
    paymentLink: "https://buy.stripe.com/test_onepost_lifetime",
    label: "OnePost AI Lifetime",
    amount: 199,
    currency: "USD",
    mode: "payment",
    nickname: "Lifetime access",
  },
  // Legacy alias — keeps old links that pointed at the original monthly
  // product working. New code should prefer onepost_basic / onepost_pro.
  "onepost_monthly": {
    priceId: "price_1TkABVDIOEE0E2wQJlzDDNHn",
    paymentLink: "https://buy.stripe.com/test_onepost_monthly",
    label: "One Post AI Monthly",
    amount: 29,
    currency: "USD",
    mode: "subscription",
    nickname: "Monthly subscription",
  },
};
export const PRICE_ID_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(STRIPE_PRICE_CATALOG).map(([k, v]) => [v.priceId, k])
);
/** Returns true if the priceId still needs to be replaced with a real one. */
export function isPlaceholderPriceId(priceId: string): boolean {
  return priceId.startsWith("price_placeholder_");
}
