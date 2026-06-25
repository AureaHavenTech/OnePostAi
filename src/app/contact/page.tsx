"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenLine, Mail, Send, Loader2, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

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
          <Link href="/contact" className="text-white">Contact</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>
        <Link href="/dashboard"><Button variant="primary" size="sm">Launch App</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Mail className="h-12 w-12 mx-auto mb-4" style={{ color: '#c9a96e' }} />
          <h1 className="text-5xl font-extrabold tracking-tight mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Contact Us</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Have a question, feedback, or need help? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
          {/* Contact form */}
          <div>
            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-slate-400">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
                  <input required className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2" style={{ borderColor: '#2a2a3a', outlineColor: '#c9a96e' }} placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                  <input required type="email" className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2" style={{ borderColor: '#2a2a3a', outlineColor: '#c9a96e' }} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
                  <textarea required rows={5} className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 resize-none" style={{ borderColor: '#2a2a3a', outlineColor: '#c9a96e' }} placeholder="How can we help?" />
                </div>
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send Message</>}
                </Button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6">
              <MessageSquare className="h-6 w-6 mb-3" style={{ color: '#c9a96e' }} />
              <h3 className="font-bold mb-1">Chat Support</h3>
              <p className="text-sm text-slate-400">Use the in-app chat to get instant answers from our AI support assistant.</p>
              <Link href="/dashboard"><Button variant="outline" size="sm" className="mt-3">Open Chat</Button></Link>
            </div>
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6">
              <Mail className="h-6 w-6 mb-3" style={{ color: '#c9a96e' }} />
              <h3 className="font-bold mb-1">Email</h3>
              <p className="text-sm text-slate-400">support@onepostai.app</p>
              <p className="text-xs text-slate-500 mt-1">We respond within 24 hours</p>
            </div>
            <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6">
              <h3 className="font-bold mb-3">Follow the Founder</h3>
              <div className="flex flex-wrap gap-3">
                <a href="https://instagram.com/funkycoldmedemaa" target="_blank" className="text-sm text-slate-400 hover:text-white transition-colors">📸 Instagram</a>
                <a href="https://tiktok.com/@funkycoldmedemaa" target="_blank" className="text-sm text-slate-400 hover:text-white transition-colors">🎵 TikTok</a>
                <a href="https://twitter.com/funkycoldmedemaa" target="_blank" className="text-sm text-slate-400 hover:text-white transition-colors">🐦 Twitter/X</a>
                <a href="https://youtube.com/@funkycoldmedemaa" target="_blank" className="text-sm text-slate-400 hover:text-white transition-colors">▶️ YouTube</a>
              </div>
              <p className="text-xs text-slate-600 mt-2">@funkycoldmedemaa — everywhere</p>
            </div>
          </div>
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