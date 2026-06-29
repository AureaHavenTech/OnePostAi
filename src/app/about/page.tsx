'use client';

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, PenLine, Quote, Heart, ArrowRight, Camera, Zap } from "lucide-react";
import { Footer } from "@/components/ui/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-serif">One Post AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="text-white">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </nav>
        <Link href="/dashboard"><Button variant="primary" size="sm">Dashboard</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">About One Post AI</h1>
          <p className="text-slate-400 text-lg">Content That Moves</p>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 font-serif">Our Story</h2>
            <p>One Post AI was born from the same frustration that created Axel AI — too many businesses, too little time, and no budget for a content team. We needed a tool that could create, schedule, and publish content across all platforms without the manual grind.</p>
            <p className="mt-4">So we built One Post AI: an intelligent content creation platform that eliminates the busywork of content marketing. Write once, publish everywhere, and let AI handle the rest.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 font-serif">What Makes Us Different</h2>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3"><ShieldCheck className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" /><span><strong className="text-white">AI-First:</strong> Every feature is powered by AI — from writing to hashtag selection to optimal timing.</span></li>
              <li className="flex items-start space-x-3"><ShieldCheck className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" /><span><strong className="text-white">Cross-Platform:</strong> Publish to every major platform from one place. No more jumping between tabs.</span></li>
              <li className="flex items-start space-x-3"><ShieldCheck className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" /><span><strong className="text-white">AutoExec Integration:</strong> Works hand-in-hand with Axel AI for end-to-end workflow automation.</span></li>
            </ul>
          </section>

          <section className="py-12 border-y border-slate-900 my-12">
            <div className="grid md:grid-cols-5 gap-10 items-center">
              <div className="md:col-span-2 flex justify-center">
                <div className="relative w-48 h-48 rounded-full border-4 border-brand-500/30 overflow-hidden shadow-2xl shadow-brand-500/10">
                  <img src="/ceo-photo.png" alt="Lindsey - Founder & CEO" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="md:col-span-3 space-y-4">
                <div className="relative">
                  <Quote className="h-8 w-8 text-brand-500/20 absolute -top-4 -left-4" />
                  <h2 className="text-2xl font-bold text-white font-serif">Hi, I&apos;m Lindsey.</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  I built One Post AI because I was tired of the social media grind. As a mom and entrepreneur, I needed a way to keep my brands active without spending hours every day on content. 
                </p>
                <div className="flex space-x-4 pt-2">
                  <a href="https://instagram.com/funkycoldmedemaa" target="_blank" className="text-slate-400 hover:text-brand-400 transition-colors">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://tiktok.com/@funkycoldmedemaa" target="_blank" className="text-slate-400 hover:text-brand-400 transition-colors">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.14 1.01.23 2.08.94 2.81.45.47 1.02.81 1.64.96 1 .2 2.12-.12 2.85-.86.59-.58.82-1.38.89-2.18.02-3.3.01-6.6.01-9.91z"/></svg>
                  </a>
                  <a href="https://twitter.com/funkycoldmedemaa" target="_blank" className="text-slate-400 hover:text-brand-400 transition-colors">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://youtube.com/@funkycoldmedemaa" target="_blank" className="text-slate-400 hover:text-brand-400 transition-colors">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-8 text-center font-serif">The Aura Haven Tech Family</h2>
            <p className="text-center text-slate-400 mb-8 max-w-lg mx-auto">
              Tools built to help you create, grow, and thrive across every part of your business.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <a href="https://autoexecai.ctonew.app" target="_blank" className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-[#c9a96e]/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-[#c9a96e] flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 fill-slate-950" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Axel AI</div>
                  <div className="text-sm text-slate-500">Your AI Executive Assistant. Handles research and outreach.</div>
                </div>
              </a>
              <a href="https://aurahaven.shop" target="_blank" className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-[#c9a96e]/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#e8e0d4] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">AH</div>
                <div>
                  <div className="text-lg font-bold text-white">Aura Haven</div>
                  <div className="text-sm text-slate-500">Premium tech for modern living. Luxury quality gadgets.</div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}