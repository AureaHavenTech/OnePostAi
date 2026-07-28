"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AffiliateTermsPage() {
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
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Affiliate Program Terms</h1>
          <p className="text-slate-400 text-sm">Last updated: July 7, 2026</p>
        </div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>1. Program Overview</h2>
            <p>The OnePost AI Affiliate Program lets you earn 10% commission on referred customers&apos; first subscription payment. Operated by Aura Haven Tech.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>2. Commission Details</h2>
            <p>10% of first payment. $50 minimum payout threshold. Monthly payouts via PayPal or bank transfer. 30-day cookie duration. Affiliates must be 18+ and have an active OnePost AI account.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>3. Approved Marketing</h2>
            <p>Social media posts, blog content, YouTube videos, email to existing subscribers. Prohibited: paid search on branded keywords, spam, coupon/deal sites, self-referrals, fake accounts.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>4. Disclosure</h2>
            <p>You must clearly disclose affiliate relationships in all promotional content as required by FTC guidelines.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>5. Contact</h2>
            <p>Email: <a href="mailto:aurahaventech@gmail.com" className="text-[#c9a96e] hover:text-[#d4b87a]">aurahaventech@gmail.com</a></p>
          </section>
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
