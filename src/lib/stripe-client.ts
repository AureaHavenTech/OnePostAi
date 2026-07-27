import { NextRequest } from "next/server";
import Stripe from "stripe";

// Stripe catalog — single source of truth for valid price IDs
export const STRIPE_PRICE_CATALOG: Record<string, { priceId: string; label: string; amount: number; currency: string; mode: "payment" | "subscription"; nickname?: string }> = {
  "onepost_monthly": { priceId: "price_1TkABVDIOEE0E2wQJlzDDNHn", label: "One Post AI Monthly", amount: 29, currency: "USD", mode: "subscription", nickname: "Monthly subscription" },
  "onepost_lifetime": { priceId: "price_1TkABjDIOEE0E2wQ4jINuBhJ", label: "One Post AI Lifetime", amount: 199, currency: "USD", mode: "payment", nickname: "Lifetime access" },
};

// Reverse map: priceId → catalogKey (for reverse lookup)
export const PRICE_ID_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(STRIPE_PRICE_CATALOG).map(([k, v]) => [v.priceId, k])
);

let stripeClient: Stripe | null = null;
export function getStripe(): Stripe | null {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripeClient = new Stripe(key, { apiVersion: "2024-06-20" as any });
  return stripeClient;
}

export function getBaseUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
}

export function esc(v: unknown): string { return String(v ?? "").replace(/'/g, "''"); }

export function logCheckoutEvent(event: string, data: Record<string, unknown>) {
  try {
    const { execSync } = require("child_process");
    const sql = `INSERT INTO invoices (id, customer, email, plan, amount, currency, status, date) VALUES ('evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}', 'checkout-${esc(event)}', 'system@onepost.ai', 'checkout_attempt', 0, 'USD', 'initiated', datetime('now'))`;
    execSync(`team-db "${sql}"`, { encoding: "utf8", stdio: "ignore" });
  } catch (_e) { /* non-fatal */ }
}

export function persistInvoiceRecord(invoice: { id: string; customer: string; email: string; plan: string; amount: number; currency: string; status: string; date: string }) {
  try {
    const { execSync } = require("child_process");
    const sql = `INSERT OR REPLACE INTO invoices (id, customer, email, plan, amount, currency, status, date) VALUES ('${esc(invoice.id)}', '${esc(invoice.customer)}', '${esc(invoice.email)}', '${esc(invoice.plan)}', ${invoice.amount || 0}, '${esc(invoice.currency)}', '${esc(invoice.status)}', '${esc(invoice.date)}')`;
    execSync(`team-db "${sql}"`, { encoding: "utf8", stdio: "ignore" });
  } catch (_e) { /* non-fatal */ }
}
