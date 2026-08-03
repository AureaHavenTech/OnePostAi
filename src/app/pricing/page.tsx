"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowLeft, ArrowRight, Sparkles, Shield, Loader2 } from "lucide-react";

interface Plan {
  name: string;
  displayPrice: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  priceId: string;
  planKey?: string;
  mode: "subscription" | "payment";
  popular: boolean;
}

const plans: Plan[] = [
  {
    name: "Basic", displayPrice: "$19", period: "/month",
    desc: "For solo creators getting started",
    features: ["AI content generation from text", "Post to 7 platforms", "Smart scheduling (3x/day)", "Auto-format per platform", "Trending hashtags & captions", "7-day free trial"],
    cta: "Start Free Trial", priceId: "price_1TkABVDIOEE0E2wQJlzDDNHn", planKey: "onepost_monthly", mode: "subscription", popular: false,
  },
  {
    name: "Pro", displayPrice: "$49", period: "/month",
    desc: "For serious content creators",
    features: ["Everything in Basic", "Multi-brand management", "AI avatar videos", "Viral trend analytics", "Advanced scheduling (2 weeks)", "Priority support"],
    cta: "Start Free Trial", priceId: "price_1TkABVDIOEE0E2wQJlzDDNHn", planKey: "onepost_monthly", mode: "subscription", popular: true,
  },
  {
    name: "Agency", displayPrice: "$199", period: "lifetime",
    desc: "For agencies & teams — pay once, own forever",
    features: ["Everything in Pro", "Up to 10 brand profiles", "Team collaboration", "White-label options", "API access", "Dedicated account manager"],
    cta: "Buy Lifetime Access", priceId: "price_1TkABjDIOEE0E2wQ4jINuBhJ", planKey: "onepost_lifetime", mode: "payment", popular: false,
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: Plan) {
    setError(null); setLoadingPlan(plan.priceId);
    try {
      const userEmail = (() => { try { return localStorage.getItem("op_user_email") || undefined; } catch { return undefined; } })();
      const userId = (() => { try { return localStorage.getItem("op_user_id") || undefined; } catch { return undefined; } })();
      const res = await fetch("/api/create-checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId, plan: plan.planKey, email: userEmail, userId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.sessionUrl) throw new Error(data?.error || `Checkout failed (HTTP ${res.status})`);
      window.location.href = data.sessionUrl;
    } catch (e: any) {
      setError(e?.message || "Checkout failed."); setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-luxury py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="btn-ghost inline-flex items-center gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-cream mb-3">
            Simple pricing.<br /><span className="text-gradient-gold">Powerful results.</span>
          </h1>
          <p className="text-sm text-cream/50">30-day money-back guarantee on all plans.</p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`glass-card p-6 sm:p-8 text-center relative ${plan.popular ? "border-gold/40 bg-gold/[0.03]" : ""}`} style={plan.popular ? { boxShadow: "0 0 30px rgba(201,169,110,0.12)" } : {}}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-gold text-dark text-[10px] font-semibold shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="font-heading font-bold text-lg text-cream">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mt-2">
                <span className="text-4xl font-heading font-bold text-gradient-gold">{plan.displayPrice}</span>
                <span className="text-sm text-cream/40">{plan.period}</span>
              </div>
              <p className="text-xs text-cream/50 mt-1">{plan.desc}</p>
              <ul className="mt-6 space-y-2.5 text-left">
                {plan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-cream/60">
                    <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
              <button
                disabled={loadingPlan === plan.priceId}
                onClick={() => startCheckout(plan)}
                className={`w-full mt-6 ${plan.popular ? "btn-gold" : "btn-outline"} text-xs`}
              >
                {loadingPlan === plan.priceId ? (
                  <span className="inline-flex items-center gap-1.5"><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">{plan.cta} <ArrowRight className="w-4 h-4" /></span>
                )}
              </button>
              <p className="text-[10px] text-cream/30 mt-2">Secure checkout via Stripe • 30-day money-back</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5">
            <Shield className="w-4 h-4 text-gold" />
            <span className="text-xs text-cream/50">30-Day Money-Back Guarantee — No questions asked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
