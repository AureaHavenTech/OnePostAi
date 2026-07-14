"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ArrowRight, Sparkles, Shield } from "lucide-react";

const STRIPE_LINKS: Record<string, string> = {
  basic: "https://buy.stripe.com/aFa5kD5rBe160fbc66cwg0d",
  pro: "https://buy.stripe.com/7sYdR9g6fbSY5zvc66cwg0e",
  agency: "https://buy.stripe.com/fZu8wPaLVg9e9PL3zAcwg0f",
};

const plans = [
  {
    id: "basic",
    name: "Basic",
    desc: "For solo creators getting started",
    features: [
      "AI content generation from text",
      "Post to 7 platforms",
      "Smart scheduling (3x/day)",
      "Auto-format per platform",
      "Trending hashtags & captions",
      "7-day free trial",
    ],
    cta: "Start 7-Day Free Trial",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    desc: "For serious content creators",
    features: [
      "Everything in Basic",
      "Multi-brand management",
      "AI avatar videos",
      "Viral trend analytics",
      "Advanced scheduling (2 weeks)",
      "Priority support",
    ],
    cta: "Start 7-Day Free Trial",
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$99",
    desc: "For agencies & teams",
    features: [
      "Everything in Pro",
      "Up to 10 brand profiles",
      "Team collaboration",
      "White-label options",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Start 7-Day Free Trial",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#e8e0d4] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#12121a] mb-3 font-[family-name:var(--font-heading)]">
            Simple pricing.<br /><span className="text-[#c9a96e]">Powerful results.</span>
          </h1>
          <p className="text-sm text-[#6b5a5e]">30-day money-back guarantee on all plans.</p>
        </div>

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
                  <span className="text-4xl font-bold text-[#12121a]">{plan.price}</span>
                  <span className="text-sm text-[#6b5a5e]">/month</span>
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
                className={`w-full mt-6 ${plan.popular ? '' : 'border-[#c9a96e]/30 text-[#12121a] hover:bg-[#c9a96e]/10'}`}
                onClick={() => window.open(STRIPE_LINKS[plan.id], '_blank')}
              >
                {plan.cta}
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
              <p className="text-[10px] text-[#6b5a5e] mt-2 text-center">Secure checkout via Stripe • 30-day money-back</p>
            </div>
          ))}
        </div>

        {/* 30-day guarantee badge */}
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