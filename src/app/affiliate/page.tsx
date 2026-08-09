"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift, DollarSign, Users, ArrowRight } from "lucide-react";

export default function AffiliatePage() {
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
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Affiliate Program</h1>
          <p className="text-slate-400 text-lg">Earn 10% commission on every referral — for life.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <Users className="w-6 h-6 text-[#c9a96e]" />, title: "1. Share", desc: "Get your unique referral link from your dashboard and share it with your audience." },
            { icon: <DollarSign className="w-6 h-6 text-[#c9a96e]" />, title: "2. Earn", desc: "When someone signs up using your link, you earn 10% of every payment they make — forever." },
            { icon: <Gift className="w-6 h-6 text-[#c9a96e]" />, title: "3. Get Paid", desc: "Commissions are paid monthly via Stripe. Track your earnings in real-time from your dashboard." },
          ].map((step, i) => (
            <div key={i} className="bg-[#1a1a24] border border-[#1e1e2a] rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#c9a96e]/10 flex items-center justify-center mx-auto mb-4">{step.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#c9a96e]/10 to-transparent border border-[#c9a96e]/20 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Why Partner With Us?</h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-2"><span className="text-[#c9a96e] font-bold mt-1">10%</span> lifetime commission on all referrals</li>
            <li className="flex items-start gap-2"><span className="text-[#c9a96e] font-bold mt-1">Real-time</span> dashboard to track clicks, signups, and earnings</li>
            <li className="flex items-start gap-2"><span className="text-[#c9a96e] font-bold mt-1">Monthly</span> payouts via Stripe — no minimum threshold</li>
            <li className="flex items-start gap-2"><span className="text-[#c9a96e] font-bold mt-1">Dedicated</span> support for top affiliates</li>
          </ul>
        </div>

        <div className="text-center">
          <Link href="/dashboard/affiliates">
            <Button variant="default" size="lg" className="gap-2">
              View Your Affiliate Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-slate-500 text-xs mt-4">
            By participating, you agree to our{" "}
            <Link href="/affiliate-terms" className="text-[#c9a96e] hover:text-[#d4b87a]">Affiliate Terms</Link>.
          </p>
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
