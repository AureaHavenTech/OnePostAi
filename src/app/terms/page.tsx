"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#12121a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[#1e1e2a] px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.svg" alt="OnePost AI" className="h-10 w-auto" />
          <span className="font-bold text-white tracking-tight hidden sm:inline">OnePost AI</span>
        </Link>
        <Link href="/login"><Button variant="default" size="sm">Dashboard</Button></Link>
      </header>
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: July 4, 2026</p>
        </div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>1. Acceptance</h2><p>By using OnePost AI, you agree to these terms. OnePost AI is a product of Aura Haven Tech.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>2. Subscriptions</h2><p>Paid subscriptions billed monthly. All plans include a <strong className="text-white">30-day money-back guarantee</strong>.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>3. Intellectual Property</h2><p>OnePost AI&trade;, Axel AI&trade;, and Aura Haven&trade; are trademarks of Aura Haven Tech. You may not copy, reverse engineer, or create derivative works.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>4. Limitation of Liability</h2><p>Service provided &quot;as is.&quot; Liability limited to amount paid in preceding 12 months.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>5. Contact</h2><p><a href="mailto:aurahaventech@gmail.com" className="text-[#c9a96e]">aurahaventech@gmail.com</a></p></section>
        </div>
      </main>
      <footer className="border-t border-[#1e1e2a] py-8 px-6 text-center text-sm text-slate-500">
        <p>&copy; 2026 Aura Haven Tech. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <Link href="/privacy" className="text-[#c9a96e] hover:text-[#d4b87a]">Privacy</Link>
          <Link href="/terms" className="text-[#c9a96e] hover:text-[#d4b87a]">Terms</Link>
          <Link href="/" className="text-[#c9a96e] hover:text-[#d4b87a]">Home</Link>
        </div>
      </footer>
    </div>
  );
}
