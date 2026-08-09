"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AupPage() {
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
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Acceptable Use Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: July 4, 2026</p>
        </div>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>1. Acceptable Use</h2>
            <p>OnePost AI is designed to help you create and publish content. You agree to use our platform responsibly and lawfully.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>2. Prohibited Content</h2>
            <p>You may not use OnePost AI to create, distribute, or promote:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Illegal content or activities</li>
              <li>Hate speech, harassment, or bullying</li>
              <li>Spam, phishing, or deceptive content</li>
              <li>Malware, viruses, or harmful code</li>
              <li>Content that violates others&apos; intellectual property rights</li>
              <li>Explicit or adult content without proper labeling</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>3. Platform Rules</h2>
            <p>When using OnePost AI, you agree to respect platform rules of each connected social media service. We reserve the right to suspend accounts that violate these terms.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>4. Enforcement</h2>
            <p>We may review content for compliance with this policy. Violations may result in content removal, account suspension, or termination. Repeated violations will result in permanent account closure.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>5. Reporting</h2>
            <p>If you see content that violates this policy, contact us at <a href="mailto:aurahaventech@gmail.com" className="text-[#c9a96e] hover:text-[#d4b87a]">aurahaventech@gmail.com</a>.</p>
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
