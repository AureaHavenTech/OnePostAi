/**
 * Stripe price catalog — single source of truth.
 * Import this from anywhere, NOT from the route file.
 */

export const STRIPE_PRICE_CATALOG: Record<string, { priceId: string; label: string; amount: number; currency: string; mode: "payment" | "subscription"; nickname?: string }> = {
  "onepost_monthly": { priceId: "price_1TkABVDIOEE0E2wQJlzDDNHn", label: "One Post AI Monthly", amount: 29, currency: "USD", mode: "subscription", nickname: "Monthly subscription" },
  "onepost_lifetime": { priceId: "price_1TkABjDIOEE0E2wQ4jINuBhJ", label: "One Post AI Lifetime", amount: 199, currency: "USD", mode: "payment", nickname: "Lifetime access" },
};

export const PRICE_ID_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(STRIPE_PRICE_CATALOG).map(([k, v]) => [v.priceId, k])
);
