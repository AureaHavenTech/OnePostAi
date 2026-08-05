"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ArrowRight, Sparkles, Shield, Loader2 } from "lucide-react";
// Plan keys here MUST exist in src/lib/stripe-catalog.ts. The catalog
// resolves them to the real Stripe priceId at request time. If the owner
// hasn't set up a real Stripe product yet, the catalog entry has
// `placeholder: true` and the API returns a friendly stub instead of 500ing.
import { STRIPE_PRICE_CATALOG } from "@/lib/stripe-catalog";

interface Plan {
  name: string;
  displayPrice: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  // Each plan now has a unique `planKey` that the /api/create-checkout
  // route resolves to a Stripe price via the catalog in
  // src/lib/stripe-catalog.ts. Never hard-code a priceId here — change the
  // catalog entry instead, then every page that references the plan picks
  // up the new price automatically.
  planKey: "onepost_basic" | "onepost_pro" | "onepost_lifetime";
  priceId: string;            // Stripe price ID (looked up from catalog by planKey)
  paymentLink?: string;       // Optional Stripe payment link (https://buy.stripe.com/...) for instant redirect
  mode: "subscription" | "payment";
  popular: boolean;
}
const plans: Plan[] = [
  {
    name: "Basic",
    displayPrice: "$19",
    period: "/month",
    desc: "For solo creators getting started",
    features: [
      "AI content generation from text",
      "Post to 7 platforms",
      "Smart scheduling (3x/day)",
      "Auto-format per platform",
      "Trending hashtags & captions",
      "7-day free trial",
    ],
    cta: "Start Free Trial",
    planKey: "onepost_basic",
    priceId: STRIPE_PRICE_CATALOG.onepost_basic.priceId,
    paymentLink: STRIPE_PRICE_CATALOG.onepost_basic.paymentLink,
    mode: "subscription",
    popular: false,
  },
  {
    name: "Pro",
    displayPrice: "$49",
    period: "/month",
    desc: "For serious content creators",
    features: [
      "Everything in Basic",
      "Multi-brand management",
      "AI avatar videos",
      "Viral trend analytics",
      "Advanced scheduling (2 weeks)",
      "Priority support",
    ],
    cta: "Start Free Trial",
    planKey: "onepost_pro",
    priceId: STRIPE_PRICE_CATALOG.onepost_pro.priceId,
    paymentLink: STRIPE_PRICE_CATALOG.onepost_pro.paymentLink,
    mode: "subscription",
    popular: true,
  },
  {
    name: "Agency",
    displayPrice: "$199",
    period: "lifetime",
    desc: "For agencies & teams — pay once, own forever",
    features: [
      "Everything in Pro",
      "Up to 10 brand profiles",
      "Team collaboration",
      "White-label options",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Buy Lifetime Access",
    planKey: "onepost_lifetime",
    priceId: STRIPE_PRICE_CATALOG.onepost_lifetime.priceId,
    paymentLink: STRIPE_PRICE_CATALOG.onepost_lifetime.paymentLink,
    mode: "payment",
    popular: false,
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: Plan) {
    setError(null);
    setLoadingPlan(plan.planKey);
    try {
      // Get user info from localStorage if available (set by /login)
      const userEmail = (() => { try { return localStorage.getItem("op_user_email") || undefined; } catch { return undefined; } })();
      const userId = (() => { try { return localStorage.getItem("op_user_id") || undefined; } catch { return undefined; } })();
      // Send planKey as the primary identifier. The /api/create-checkout
      // route resolves it to the real priceId via the catalog — never
      // hard-code a priceId here. The route also returns needsConfiguration
      // when the catalog entry is still a placeholder, in which case we
      // jump straight to the configured payment link.
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.planKey, priceId: plan.priceId, email: userEmail, userId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.sessionUrl) {
        throw new Error(data?.error || `Checkout failed (HTTP ${res.status})`);
      }
      // Redirect to Stripe Checkout (or to the configured payment link when
      // the priceId is a placeholder the owner hasn't replaced yet).
      window.location.href = data.sessionUrl;
    } catch (e: any) {
      setError(e?.message || "Checkout failed. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#e8e0d4] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home
            </Button>
          </Link>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#12121a] mb-3 font-[family-name:var(--font-heading)]">
            Simple pricing.<br /><span className="text-[#c9a96e]">Powerful results.</span>
          </h1>
          <p className="text-sm text-[#6b5a5e]">30-day money-back guarantee on all plans.</p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-white/80 backdrop-blur-md border rounded-2xl p-6 sm:p-8 shadow-sm relative ${plan.popular ? 'border-[#c9a96e] ring-2 ring-[#c9a96e]/20' : 'border-[#c9a96e]/10'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] text-[#12121a] text-[10px] font-semibold shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="text-center">
                <h3 className="text-lg font-bold text-[#12121a] font-[family-name:var(--font-heading)]">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-4xl font-bold text-[#12121a]">{plan.displayPrice}</span>
                  <span className="text-sm text-[#6b5a5e]">{plan.period}</span>
                </div>
                <p className="text-xs text-[#6b5a5e] mt-1">{plan.desc}</p>
              </div>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[#6b5a5e]">
                    <Check className="w-3.5 h-3.5 text-[#c9a96e] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "glow" : "outline"}
                size="lg"
                disabled={loadingPlan === plan.planKey}
                onClick={() => startCheckout(plan)}
                className={`w-full mt-6 ${plan.popular ? '' : 'border-[#c9a96e]/30 text-[#12121a] hover:bg-[#c9a96e]/10'}`}
              >
                {loadingPlan === plan.planKey ? (
                  <><Loader2 className="ml-1.5 w-4 h-4 animate-spin" /> Redirecting…</>
                ) : (
                  <>{plan.cta} <ArrowRight className="ml-1.5 w-4 h-4" /></>
                )}
              </Button>
              <p className="text-[10px] text-[#6b5a5e] mt-2 text-center">Secure checkout via Stripe • 30-day money-back</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5">
            <Shield className="w-4 h-4 text-[#c9a96e]" />
            <span className="text-xs text-[#6b5a5e]">30-Day Money-Back Guarantee — No questions asked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
