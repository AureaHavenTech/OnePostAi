"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">
            Simple, <span className="gradient-text">transparent</span> pricing
          </h1>
          <p className="text-zinc-500">One plan. Everything you need. No hidden fees.</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="glass-card p-8 border-indigo-500/20 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
              Best Value
            </div>
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-zinc-100">$29</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <p className="text-zinc-500 mt-2">Flat rate. Unlimited everything.</p>
            </div>

            <ul className="mt-8 space-y-4">
              {[
                "Unlimited video uploads (up to 500MB)",
                "AI-generated captions & hashtags via GPT-4o",
                "Auto-resize to 9:16, 1:1, 16:9 formats",
                "Schedule & auto-publish to all platforms",
                "TikTok, Instagram, YouTube, LinkedIn",
                "Priority email & chat support",
                "14-day free trial, no credit card",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/login?signup=true">
              <Button variant="glow" size="lg" className="w-full mt-8 text-base">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>

            <p className="text-center text-xs text-zinc-600 mt-4">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}