"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { PenLine, ChevronDown, ChevronRight, Search, ShieldCheck } from "lucide-react";

const faqs = [
  {
    q: "What is One Post AI?",
    a: "One Post AI is your all-in-one content creation and publishing platform. Create, schedule, and publish content across every social media platform from one place. AI helps you write engaging posts, pick viral hashtags, schedule at optimal times, and track cross-platform analytics."
  },
  {
    q: "How is One Post AI different from other scheduling tools?",
    a: "One Post AI isn't just a scheduler — it's a full content creation engine. Our AI writes posts, picks trending hashtags, optimizes posting times based on engagement patterns, and gives you cross-platform analytics. Plus, it works alongside Axel AI, your autonomous executive assistant."
  },
  {
    q: "What platforms does One Post AI support?",
    a: "One Post AI supports all major social media platforms including Instagram, TikTok, Twitter/X, YouTube, LinkedIn, Facebook, and more. We're continuously adding new platforms."
  },
  {
    q: "How does the AI hashtag feature work?",
    a: "Our AI analyzes trending hashtags in your niche, your content topic, and current viral patterns to recommend the best hashtags for maximum reach. No more guessing — just better engagement."
  },
  {
    q: "How much does One Post AI cost?",
    a: "We offer flexible pricing plans. Check our pricing page for the latest options. All plans include core features like AI writing, multi-platform publishing, and analytics. Annual billing saves you money."
  },
  {
    q: "Is there a free trial?",
    a: "Yes! You can start with a 30-day free trial and explore all features. There's no risk — if you're not satisfied, cancel anytime."
  },
  {
    q: "How do I get started?",
    a: "Just click 'Get Started' on the homepage, create your account, and start creating content. Our AI guides you through the process from your first post."
  },
  {
    q: "Can One Post AI post automatically?",
    a: "Yes! One Post AI can automatically publish your content at optimal times across all your connected platforms. You can also review and manually approve posts before they go live."
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted in transit and at rest. Your content, analytics, and account information are private to you."
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime from the Billing page in your dashboard. Your subscription remains active until the end of the current billing period."
  },
  {
    q: "How is Axel AI related to One Post AI?",
    a: "Axel AI is our sister product — an autonomous AI executive assistant that handles research, email outreach, web scraping, and more. While One Post AI manages your content, Axel AI runs your business tasks. They work beautifully together."
  },
  {
    q: "What is Aura Haven?",
    a: "Aura Haven is our sister brand — a premium tech lifestyle store offering curated products for modern living. It's part of the same family of brands, all built by the same founder."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#12121a', color: '#e8e0d4' }}>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#2a2a3a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-gradient-to-br from-[#c9a96e] to-[#b8944a] rounded-lg flex items-center justify-center">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>One Post AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/faq" className="text-white">FAQ</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>
        <Link href="/dashboard"><Button variant="primary" size="sm">Launch App</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Frequently Asked Questions</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">Everything you need to know about One Post AI.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2"
            style={{ borderColor: '#2a2a3a', outlineColor: '#c9a96e' }}
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <div
              key={i}
              className="bg-slate-900/30 border border-slate-900 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-800"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-white pr-4">{faq.q}</span>
                {openIndex === i ? (
                  <ChevronDown className="h-5 w-5 shrink-0" style={{ color: '#c9a96e' }} />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-500 shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-slate-400 leading-relaxed text-sm border-t border-slate-900/80 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">No matching questions found.</div>
          )}
        </div>

        <div className="text-center mt-12 p-8 bg-slate-900/20 border border-slate-900 rounded-xl">
          <p className="text-slate-400 mb-4">Still have questions?</p>
          <Link href="/contact"><Button variant="primary">Contact Support</Button></Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
