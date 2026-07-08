"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function RefundPage() {
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
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Refund Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: July 4, 2026</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-bold">30-Day Money-Back Guarantee</span>
          </div>
        </div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section><h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Our Guarantee</h2><p>We offer a <strong className="text-white">30-day money-back guarantee</strong>. Not satisfied? Email us for a full refund — no questions asked.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>How to Request</h2><p>Email <a href="mailto:aurahaventech@gmail.com" className="text-[#c9a96e]">aurahaventech@gmail.com</a> with your account email. Refunds processed within 5-10 business days.</p></section>
          <section><h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Contact</h2><p>Aura Haven Tech</p></section>
        </div>
      </main>
      <footer className="border-t border-[#1e1e2a] py-8 px-6 text-center text-sm text-slate-500">
        <p>&copy; 2026 Aura Haven Tech. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2 text-xs">
          <Link href="/privacy" className="text-[#c9a96e]">Privacy</Link>
          <Link href="/terms" className="text-[#c9a96e]">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
