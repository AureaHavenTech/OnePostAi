"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: July 4, 2026</p>
        </div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>1. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong className="text-white">Account Information:</strong> Name, email, billing info (Stripe)</li>
              <li><strong className="text-white">Content Data:</strong> Captions, images, videos you create</li>
              <li><strong className="text-white">Platform Data:</strong> Social media connections and analytics</li>
              <li><strong className="text-white">Usage Data:</strong> Features used and interactions</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>2. How We Use Your Information</h2>
            <p>We use your information to provide and improve OnePost AI services. <strong className="text-white">We never sell your personal data.</strong></p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>3. Data Security</h2>
            <p>We use AES-256 encryption at rest, TLS 1.3 in transit, and regular security audits.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>4. Your Rights (GDPR/CCPA)</h2>
            <p>You have the right to access, correct, delete, or port your data. Email <a href="mailto:aurahaventech@gmail.com" className="text-[#c9a96e] hover:text-[#d4b87a]">aurahaventech@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>5. Contact</h2>
            <p>Aura Haven Tech &mdash; <a href="mailto:aurahaventech@gmail.com" className="text-[#c9a96e] hover:text-[#d4b87a]">aurahaventech@gmail.com</a></p>
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
