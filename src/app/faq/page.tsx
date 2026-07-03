"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ArrowLeft, Search, MessageCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "How does OnePost AI auto-edit my videos?", a: "Upload a raw video and AI analyzes it to add cuts, transitions, text overlays, and effects optimized for each platform. No editing skills needed." },
  { q: "Can I post without showing my face?", a: "Yes! Upload 3-5 photos and AI creates an avatar that looks like you. It generates UGC videos with your digital twin, voiceover, and captions." },
  { q: "How do I connect my social accounts?", a: "One-time OAuth setup in Settings. Connect TikTok, Instagram, Facebook, YouTube, LinkedIn, Snapchat, and Pinterest. After that, auto-publish everywhere." },
  { q: "Can it really find trending products for my Shopify store?", a: "Yes. Type your niche (e.g., 'beauty tech') and it scans market data to find the top 10 products by margin, viral potential, and competition level." },
  { q: "How does the affiliate program work?", a: "Sign up as an ambassador, share your referral link, and earn 10% lifetime commission on every subscription sold. It's free advertising for us, passive income for you." },
  { q: "Can I schedule posts in advance?", a: "Yes — the Content Calendar lets you schedule weeks ahead. Set it and forget it. Posts auto-publish at optimal times for each platform." },
  { q: "Does it create ads too?", a: "Yes. Generate Meta Ads, TikTok Ads, and Instagram Ads directly from your content. AI writes ad copy, selects visuals, and formats them for each ad platform." },
  { q: "How does OnePost AI pair with Auto Exec?", a: "Auto Exec runs your dropshipping business 24/7 — billing, Shopify orders, payments via Stripe. OnePost AI creates and publishes all the marketing content. Together they're a complete business system." },
  { q: "What if I run out of content ideas?", a: "The Idea Engine scans trending topics in your niche and hands you 10 viral-ready post ideas with hooks, formats, and hashtag recommendations." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no hidden fees. Cancel from your Settings page and your subscription ends at the billing period." },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-zinc-100">Frequently Asked Questions</h1>
          <p className="text-zinc-500 mt-2">Everything you need to know about OnePost AI.</p>

          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Search FAQs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>

          <div className="mt-6 space-y-2">
            {filtered.map((faq, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-zinc-200">{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", openIndex === i && "rotate-180")} />
                </button>
                {openIndex === i && (
                  <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>

          {/* Still need help */}
          <div className="mt-8 glass-card p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto text-indigo-400 mb-3" />
            <h3 className="font-semibold text-zinc-200 mb-2">Still have questions?</h3>
            <p className="text-sm text-zinc-500 mb-4">Our AI support is available 24/7 to help you.</p>
            <Link href="/support"><Button variant="glow" size="sm">Ask AI Support</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}