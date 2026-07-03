'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Footer } from "@/components/ui/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-serif">One Post AI</span>
        </Link>
        <Link href="/dashboard"><Button variant="default" size="sm">Dashboard</Button></Link>
      </header>
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12"><h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Privacy Policy</h1><p className="text-slate-400 text-sm">Last updated: June 25, 2026</p></div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">1. Information We Collect</h2><p>We collect information you provide directly: name, email address, content you create, and account preferences. We also collect usage data such as pages visited and features used.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">2. How We Use Your Information</h2><p>We use your information to provide and improve One Post AI services, process your requests, send service updates, and ensure platform security. We never sell your personal data.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">3. Data Security</h2><p>We implement industry-standard security measures including encryption at rest and in transit. Your content is stored securely and processed only as needed to provide our services.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3 font-serif">4. Contact</h2><p>Questions about this policy? Contact us at <a href="mailto:aurahaven@gmail.com" className="text-brand-400 hover:text-brand-300">aurahaven@gmail.com</a></p></section>
        </div>
      </main>
      <Footer />
    </div>
  );
}