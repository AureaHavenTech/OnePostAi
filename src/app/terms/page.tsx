'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Footer } from "@/components/ui/footer";

export default function TermsPage() {
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
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12"><h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Terms of Service</h1><p className="text-slate-400 text-sm">Last updated: June 25, 2026</p></div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">1. Acceptance of Terms</h2><p>By using One Post AI, you agree to these terms. If you do not agree, do not use the service. One Post AI is a product of Aura Haven Tech.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">2. Service Description</h2><p>One Post AI provides AI-powered content creation, scheduling, and publishing tools. We reserve the right to modify or discontinue features with reasonable notice.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">3. User Responsibilities</h2><p>You are responsible for content you create and publish. You must not use One Post AI for spam, harassment, or any illegal activity. You retain all rights to your content.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Payments & Refunds</h2><p>All plans include a 30-day money-back guarantee. Refunds are processed within 5-10 business days. Cancellations take effect at the end of your billing period.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">5. Contact</h2><p>Questions? Email <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a></p></section>
        </div>
      </main>
      <Footer />
    </div>
  );
}