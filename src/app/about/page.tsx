"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, Users, Quote, Heart, ArrowRight, Camera, PenLine } from "lucide-react";

export default function AboutPage() {
  const socialLinks = [
    { label: "Instagram", url: "https://instagram.com/funkycoldmedemaa", icon: "📸" },
    { label: "TikTok", url: "https://tiktok.com/@funkycoldmedemaa", icon: "🎵" },
    { label: "Twitter/X", url: "https://twitter.com/funkycoldmedemaa", icon: "🐦" },
    { label: "YouTube", url: "https://youtube.com/@funkycoldmedemaa", icon: "▶️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] rounded-lg flex items-center justify-center">
            <PenLine className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">One Post AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="text-white">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
        </nav>
        <Link href="/dashboard">
          <Button variant="primary" size="sm">Launch App</Button>
        </Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-24">
          <Badge variant="info" className="mb-6 px-4 py-1 text-xs uppercase tracking-wider font-semibold">
            <Heart className="h-3.5 w-3.5 mr-1.5 text-brand-400" /> Built from Real Life
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Built by a Mom Who <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Didn&apos;t Have Time
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            One Post AI isn&apos;t another tech gimmick. It was born from the chaos of
            trying to do it all — and the belief that you shouldn&apos;t have to.
          </p>
        </div>

        {/* Founder Story */}
        <section className="mb-24">
          <div className="grid md:grid-cols-5 gap-10 items-start">
            <div className="md:col-span-2">
              <div className="relative flex flex-col items-center">
                <div className="relative w-64 h-64 rounded-full border-4 border-purple-500/30 overflow-hidden shadow-2xl shadow-purple-500/10 transition-all duration-300">
                  <img
                    src="/ceo-photo.png"
                    alt="Lindsey - Founder & CEO"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-4 max-w-[200px] text-center leading-relaxed">
                  Lindsey — Founder & CEO
                </p>
              </div>
            </div>

            <div className="md:col-span-3 space-y-6">
              <div className="relative">
                <Quote className="h-10 w-10 text-purple-500/20 absolute -top-2 -left-3" />
                <p className="text-xl md:text-2xl text-white font-semibold leading-relaxed pl-6">
                  Hi, I&apos;m Lindsey.
                </p>
              </div>

              <div className="space-y-5 text-slate-300 leading-relaxed text-lg">
                <p>
                  I&apos;m a mom, creator, and entrepreneur who knows what it&apos;s like to feel
                  overwhelmed while trying to build a life you&apos;re proud of.
                </p>
                <p>
                  I built One Post AI because I needed it myself.
                </p>
                <p>
                  Between running businesses, showing up for my family, and trying to maintain 
                  a consistent content presence across every platform — I was drowning. Posting 
                  once felt like a win. Posting daily felt impossible.
                </p>
                <p>
                  I wanted a tool that wasn&apos;t just another scheduler. I wanted something that 
                  could help me create content that actually sounds like me, feels authentic, and 
                  keeps my audience engaged — without spending hours in front of a screen.
                </p>
                <p>
                  Content shouldn&apos;t feel like a chore. It should feel like creative expression 
                  that builds your brand while you sleep.
                </p>
                <p>
                  This is especially close to my heart for the busy moms, the side-hustlers, and 
                  the creative souls who spend so much time pouring into everyone else that they 
                  forget they have something worth saying, too.
                </p>
                <p>
                  If One Post AI helps you show up consistently, grow your audience, and feel 
                  proud of the content you&apos;re putting out into the world — then it&apos;s done 
                  exactly what I hoped it would.
                </p>
                <p className="text-white font-medium text-xl">
                  From one busy human trying to make her mark to another — I&apos;m so glad you&apos;re here.
                </p>
                <p className="text-purple-400 font-semibold pt-2">
                  — Lindsey, Founder
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dedication */}
        <div className="text-center mb-16">
          <p className="text-lg text-slate-400 italic">
            💜 Dedicated to my mom, who never gives up on me.
          </p>
        </div>

        {/* Follow the Founder */}
        <section className="mb-16 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-2xl p-8 md:p-10 px-12">
            <h2 className="text-2xl font-bold text-white mb-2">Follow the Founder</h2>
            <p className="text-slate-400 text-sm mb-6">Stay connected with Lindsey and the journey</p>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.url} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/30 text-slate-300 hover:text-white transition-all duration-200 text-sm font-medium">
                  <span>{link.icon}</span> {link.label}
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-4">@funkycoldmedemaa — everywhere</p>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="mb-24">
          <div className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-2xl p-10 md:p-14">
            <h2 className="text-3xl font-bold mb-8 text-center">Why One Post AI Exists</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "Consistency is everything",
                  desc: "The algorithm rewards showing up. One Post AI makes it possible to post daily content that feels authentic — without the burnout."
                },
                {
                  icon: PenLine,
                  title: "For the creators",
                  desc: "You have a voice. You have something to say. Let the tool handle the heavy lifting so you can focus on being creative."
                },
                {
                  icon: Heart,
                  title: "Built from real struggle",
                  desc: "This isn't a feature list from a marketing meeting. It's what one creator-actually needed to grow her brand while juggling real life."
                }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="text-center">
                    <Icon className="h-10 w-10 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center bg-slate-900/30 border border-slate-900 rounded-2xl p-12">
          <Sparkles className="h-10 w-10 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to show up consistently?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join creators who use One Post AI to grow their brand without burning out.
          </p>
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="text-base px-8 py-4">
              Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-xs text-slate-500 mt-4">30-day money-back guarantee. No risk.</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a3a] py-12 px-6 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <PenLine className="h-4 w-4 text-purple-400" />
            <span className="font-bold text-white">One Post AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-400 mb-4 md:mb-0">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
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