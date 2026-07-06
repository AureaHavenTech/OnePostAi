"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-dark mb-3">
            One price. <span className="gradient-gold">Everything.</span>
          </h1>
          <p className="text-sm text-gray-400">No tiers. No per-post fees. Just results.</p>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="card-luxury p-6 sm:p-8 relative border-gold/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-gold to-gold-light text-dark text-[10px] font-semibold shadow-lg shadow-gold/20">
              Best Value
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Flat Rate</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-dark">$29</span>
                <span className="text-sm text-gray-400">/month</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Unlimited content. Unlimited platforms.</p>
            </div>

            <ul className="mt-6 space-y-2.5">
              {[
                "Unlimited content creation",
                "AI avatar videos (no camera needed)",
                "Auto-edit raw footage",
                "Shopify page creator",
                "Ad creator (Meta, TikTok, IG)",
                "Content calendar & auto-scheduling",
                "Market research & trend analysis",
                "Portfolio builder ($3k-$30k retainers)",
                "Post to 7 platforms at once",
                "Priority support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                  <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link href="https://buy.stripe.com/dRmcN51blcX24vreeecwg08">
              <Button variant="glow" size="lg" className="w-full mt-6">
                Start 3-Day Free Trial
                <ArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </Link>

            <p className="text-center text-[10px] text-gray-400 mt-3">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}