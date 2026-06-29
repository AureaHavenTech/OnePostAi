"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenLine, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#12121a', color: '#e8e0d4' }}>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#2a2a3a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-gradient-to-br from-[#c9a96e] to-[#b8944a] rounded-lg flex items-center justify-center">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>One Post AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>
        <Link href="/dashboard"><Button variant="primary" size="sm">Launch App</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: June 25, 2026</p>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Account information: name, email address, and password</li>
              <li>Profile information: social media handles, website URL</li>
              <li>Content you create: posts, drafts, captions, hashtags, and media</li>
              <li>Payment information: processed securely through Stripe</li>
              <li>Communications: messages you send us and your preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Provide, maintain, and improve our AI-powered content creation services</li>
              <li>Generate content, hashtag suggestions, and publishing schedules</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Monitor and analyze usage trends across platforms</li>
              <li>Detect, investigate, and prevent fraudulent activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. AI-Generated Content</h2>
            <p>One Post AI uses artificial intelligence to generate social media content based on your input. You retain ownership of all content you create. AI-generated suggestions should be reviewed before publishing. We do not claim ownership of your content.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Cookies</h2>
            <p>We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information with service providers who perform services on our behalf, if required by law, or with your consent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. GDPR Compliance</h2>
            <p>If you are a resident of the EEA, you have certain data protection rights including the right to access, update, delete, or port your data. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-3" style={{ color: '#c9a96e' }}>support@onepostai.app</p>
            <p className="text-slate-400 text-sm">Aura Haven Tech<br />Part of the Axel AI family of brands</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#2a2a3a] py-12 px-6 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <PenLine className="h-4 w-4" style={{ color: '#c9a96e' }} />
            <span className="font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>One Post AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400 mb-4 md:mb-0">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/privacy" className="text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="https://aurahaven.shop" target="_blank" className="hover:text-white transition-colors">Aura Haven</a>
            <a href="https://autoexec-nine.vercel.app" target="_blank" className="hover:text-white transition-colors">Axel AI</a>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-400 text-xs mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>30-day money-back guarantee</span>
            </div>
            <div>&copy; {new Date().getFullYear()} One Post AI Inc.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}