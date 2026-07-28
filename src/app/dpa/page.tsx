"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DPAPage() {
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
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Data Processing Agreement</h1>
          <p className="text-slate-400 text-sm">Last updated: July 7, 2026</p>
        </div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>1. Parties</h2>
            <p>This DPA is between you (&quot;Controller&quot;) and Aura Haven Tech (&quot;Processor&quot;), operator of OnePost AI. It forms part of the Terms of Service.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>2. Processing Details</h2>
            <p><strong className="text-white">Subject Matter:</strong> AI-powered content creation and social media management. <strong className="text-white">Duration:</strong> Subscription term + 30 days. <strong className="text-white">Data Types:</strong> Content prompts, generated captions/hashtags/ad copies, uploaded images/videos, social media account data, analytics and scheduling data.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>3. Processor Obligations</h2>
            <p>Process data only on your instructions. Implement security measures (AES-256, TLS 1.3, access controls). Notify you within 48 hours of data breaches. Delete or return data at end of service.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>4. Sub-processors</h2>
            <p>OpenAI (AI content generation), Stripe (payments), Vercel (hosting), Turso (database). We will notify you of any changes to sub-processors.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>5. International Transfers</h2>
            <p>Data may be processed in the US and other countries where sub-processors operate. Standard Contractual Clauses (SCCs) and UK IDTA are in place for adequate safeguards.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>6. Contact</h2>
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
