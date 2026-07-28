// Shared auth system — login, signup, session management, access codes
// Used by both OnePost AI and Axel AI for backbone parity

export const ACCESS_CODES = {
  FOUNDER: "AUREA2026",
  CEO: "AUREA2026",
};

export const AUTH_CONFIG = {
  trialDays: 3,
  monthlyPrice: 29,
  lifetimePrice: 199,
  monthlyPriceId: "price_1TkABVDIOEE0E2wQJlzDDNHn",
  lifetimePriceId: "price_1TkABjDIOEE0E2wQ4jINuBhJ",
  stripeMonthlyUrl: "https://buy.stripe.com/dRmcN51blcX24vreeecwg08",
  stripeLifetimeUrl: "https://buy.stripe.com/3cIaEXaLV1ek8LHb22cwg09",
};

export function validateAccessCode(code: string): boolean {
  return Object.values(ACCESS_CODES).includes(code.toUpperCase());
}

export function getRedirectForCode(code: string): string {
  const upper = code.toUpperCase();
  if (upper === ACCESS_CODES.FOUNDER) return "/dashboard/owner";
  return "/dashboard";
}