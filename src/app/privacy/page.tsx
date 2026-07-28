"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <p className="text-slate-400 text-sm">Last updated: July 7, 2026</p>
        </div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>1. Information We Collect</h2>
            <p>We collect information you provide directly: account details (name, email, billing info), content you create through OnePost AI (captions, hashtags, images, videos), social media account connections, and communication data. We also collect usage data — features used, content generated, posting activity, and interaction patterns — to improve our AI and platform.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>2. How We Use Your Information</h2>
            <p>We use your data to: generate AI content you request, publish to your connected social platforms, process payments, send service updates, ensure security, and comply with legal obligations. <strong className="text-white">We never sell your personal data.</strong> Your content data is used only to fulfill your requests and improve our AI models.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>3. AI Processing</h2>
            <p>When you generate content through OnePost AI, your inputs are processed by OpenAI&apos;s API. Text inputs are processed in transit and are not stored by OpenAI for training purposes. We do not use your content to train external models. See our <Link href="/dpa" className="text-[#c9a96e] hover:text-[#d4b87a]">Data Processing Agreement</Link> for details.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>4. Data Security</h2>
            <p>We implement encryption at rest (AES-256) and in transit (TLS 1.3), access controls, regular security audits, and incident response procedures. Your data is stored securely and processed only as needed to provide our services.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. After deletion, data is retained for 30 days for recovery, then permanently deleted within 90 days. Anonymized analytics may be retained longer.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>6. Your Rights (GDPR/CCPA)</h2>
            <p>You have the right to access, correct, delete, or port your data. To exercise these rights, email <a href="mailto:aurahaventech@gmail.com" className="text-[#c9a96e] hover:text-[#d4b87a]">aurahaventech@gmail.com</a>. We will respond within 30 days.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>7. Cookies</h2>
            <p>We use essential cookies for authentication and security. See our <Link href="/cookies" className="text-[#c9a96e] hover:text-[#d4b87a]">Cookie Policy</Link>.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>8. Contact</h2>
            <p>Email: <a href="mailto:aurahaventech@gmail.com" className="text-[#c9a96e] hover:text-[#d4b87a]">aurahaventech@gmail.com</a><br />Aura Haven Tech</p>
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
