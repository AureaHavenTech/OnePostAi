'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Footer } from "@/components/ui/footer";

const faqs = [
  { q: "What is One Post AI?", a: "One Post AI is an AI-powered content creation and publishing platform that helps you write, edit, schedule, and publish content across all social media platforms from a single dashboard." },
  { q: "How does the AI writing assistant work?", a: "Our AI generates engaging content based on your input. Describe what you want to say, pick a tone, and the AI creates multiple variations you can edit and refine." },
  { q: "Which platforms are supported?", a: "One Post AI supports Twitter/X, LinkedIn, Instagram, Facebook, and blogs. You can publish to all platforms simultaneously." },
  { q: "Can I schedule posts in advance?", a: "Yes! Our smart scheduling engine lets you pick optimal times based on engagement data, or set any custom time you prefer." },
  { q: "How does the AutoExec integration work?", a: "If you use Axel AI, you can delegate content creation tasks directly. Axel AI can create, edit, and publish posts through One Post AI automatically." },
  { q: "Is there a free trial?", a: "Yes! All plans come with a 30-day money-back guarantee. You can try any plan risk-free." },
  { q: "Can I cancel anytime?", a: "Absolutely. You can cancel your subscription at any time with no penalties. Your content remains yours." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-serif">One Post AI</span>
        </Link>
        <Link href="/dashboard"><Button variant="primary" size="sm">Dashboard</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Frequently Asked Questions</h1>
          <p className="text-slate-400 text-lg">Everything you need to know about One Post AI</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-900/30 transition-colors">
                <span className="font-medium text-white">{faq.q}</span>
                {open === i ? <ChevronUp className="h-5 w-5 text-brand-400 shrink-0 ml-4" /> : <ChevronDown className="h-5 w-5 text-slate-500 shrink-0 ml-4" />}
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}