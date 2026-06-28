"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, Wand2, Brain, Globe, Zap, Film,
  Menu, X, Check, ArrowRight, ChevronDown,
  Star, Instagram, Music2, Youtube, Linkedin, 
  ShoppingBag, MessageSquareText, CalendarDays, TrendingUp,
  BadgeCheck, Crown, ExternalLink, Users, Play,
  Camera, Upload, Hash
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "Mission Control",
    description: "Type what you want — I'll make it happen. Research trends, create content, and post everywhere with one command.",
  },
  {
    icon: Camera,
    title: "AI Avatar Videos",
    description: "Upload 5 photos — I build your digital twin. You never need to be on camera again.",
  },
  {
    icon: Film,
    title: "Auto-Edit Raw Clips",
    description: "Upload raw footage. I cut, add effects, text, and music — ready to post in minutes.",
  },
  {
    icon: TrendingUp,
    title: "Market Research",
    description: "Scan any niche for trending products by margin, demand, and viral potential. Data-driven decisions.",
  },
  {
    icon: ShoppingBag,
    title: "Shopify Page Creator",
    description: "Complete product pages with SEO titles, conversion copy, images, and smart pricing. Ready to sell.",
  },
  {
    icon: BadgeCheck,
    title: "Ad Creator",
    description: "Auto-generate Meta, TikTok, and Instagram ads with viral hooks and creative that converts.",
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    description: "Schedule 21+ posts across 7 platforms. Set it and forget it — the app runs on autopilot.",
  },
  {
    icon: Crown,
    title: "Portfolio Builder",
    description: "Build a pro portfolio that commands $3k-$30k monthly retainers. Show results, not effort.",
  },
  {
    icon: Globe,
    title: "Post Everywhere",
    description: "TikTok, Instagram, Facebook, YouTube, LinkedIn, Snapchat, Pinterest — one connection, auto-publish.",
  },
];

const platforms = [
  { name: "TikTok", icon: Music2 },
  { name: "Instagram", icon: Instagram },
  { name: "Facebook", icon: Globe },
  { name: "YouTube", icon: Youtube },
  { name: "LinkedIn", icon: Linkedin },
  { name: "Snapchat", icon: Zap },
  { name: "Pinterest", icon: Hash },
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream text-dark">
      {/* NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20 group-hover:shadow-gold/30 transition-all">
                <span className="text-xs font-bold text-dark">O</span>
              </div>
              <span className="font-semibold text-sm tracking-tight">
                <span className="text-dark">OnePost</span>
                <span className="text-gold"> AI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/pricing" className="text-xs text-gray-500 hover:text-dark transition-colors">Pricing</Link>
              <Link href="/about" className="text-xs text-gray-500 hover:text-dark transition-colors">About</Link>
              <Link href="/faq" className="text-xs text-gray-500 hover:text-dark transition-colors">FAQ</Link>
              <Link href="/login">
                <button className="px-5 py-2 rounded-xl text-xs font-medium bg-dark text-cream hover:bg-charcoal transition-all">
                  Get Started
                </button>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {navOpen && (
            <div className="md:hidden pb-4 border-t border-gold/10 pt-4">
              <div className="flex flex-col gap-3">
                <Link href="/pricing" className="text-sm text-gray-500 hover:text-dark py-1">Pricing</Link>
                <Link href="/about" className="text-sm text-gray-500 hover:text-dark py-1">About</Link>
                <Link href="/faq" className="text-sm text-gray-500 hover:text-dark py-1">FAQ</Link>
                <Link href="/login">
                  <button className="w-full px-5 py-2.5 rounded-xl text-sm font-medium bg-dark text-cream">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center pt-16 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-xs text-gold mb-8">
            <Sparkles className="w-3 h-3" />
            AI content agency. One subscription.
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-dark">
            Your content empire
            <br />
            <span className="gradient-gold">runs itself.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Type what you want — "Find 10 viral beauty products, create Shopify pages, and post everywhere" 
            — and it's done. AI avatar videos, trending research, auto-editing, ad creation. 
            <span className="text-dark font-medium"> No editing. No filming. No grunt work.</span>
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login">
              <button className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-dark text-cream hover:bg-charcoal transition-all shadow-lg shadow-dark/10 hover:shadow-dark/20 inline-flex items-center gap-2">
                Start Your 3-Day Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/about">
              <button className="px-8 py-3.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-dark transition-all inline-flex items-center gap-2">
                <Play className="w-4 h-4" />
                See How It Works
              </button>
            </Link>
          </div>

          {/* Trust indicator */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> 3-day free trial</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> No credit card required</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Cancel anytime</span>
          </div>

          {/* Platform bar */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-wider">
                <p.icon className="w-3.5 h-3.5" />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title text-dark">
              Content creation on<br /><span className="gradient-gold">autopilot</span>
            </h2>
            <p className="mt-3 text-sm text-gray-400 max-w-lg mx-auto">One dashboard. One command. Seven platforms.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "You Type", desc: '"Find trending products in skincare, create Shopify pages, and post to TikTok & IG"' },
              { step: "02", title: "AI Executes", desc: "Researches trends, generates AI avatar videos, writes captions, creates ads, builds pages" },
              { step: "03", title: "It Publishes", desc: "Auto-posts to TikTok, Instagram, Facebook, YouTube Shorts, LinkedIn, Snapchat & Pinterest" },
            ].map((item) => (
              <div key={item.step} className="card-luxury p-6 text-center animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xs font-bold text-gold">{item.step}</span>
                </div>
                <h3 className="font-semibold text-sm text-dark mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 px-4 bg-gradient-to-b from-cream to-warm-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title text-dark">
              Everything you need.<br /><span className="gradient-gold">Nothing you don't.</span>
            </h2>
            <p className="mt-3 text-sm text-gray-400 max-w-lg mx-auto">9 tools. Infinite content. One subscription.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card-luxury p-5 animate-fade-in">
                <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center mb-3">
                  <f.icon className="w-4 h-4 text-gold" />
                </div>
                <h3 className="font-semibold text-sm text-dark mb-1">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION CONTROL PREVIEW */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-8 sm:p-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs mb-6">
              <Wand2 className="w-3 h-3" />
              Mission Control
            </div>
            <div className="bg-dark/90 rounded-2xl p-4 sm:p-6 text-left shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-rose" />
                <div className="w-2 h-2 rounded-full bg-gold/50" />
                <div className="w-2 h-2 rounded-full bg-gold/30" />
                <span className="text-[10px] text-gray-500 ml-2">onepost-ai ~ mission</span>
              </div>
              <p className="text-sm text-cream/80 font-mono mb-3">
                <span className="text-gold">$</span> Find 10 trending beauty products, create Shopify pages, and post to all socials
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-cream/60">Researching trending beauty products...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-cream/60">Found 12 products with 65%+ margins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-cream/80">Creating Shopify pages...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-cream/80">AI avatar video rendering...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-cream/80">Publishing to TikTok, IG, FB, YouTube...</span>
                </div>
                <div className="pt-2 border-t border-cream/10">
                  <span className="text-gold">✅ Published to 7 platforms in 3m 42s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR CREATORS */}
      <section className="py-20 px-4 bg-warm-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title text-dark mb-4">
            Built for the creator<br />who's <span className="gradient-gold">ready to scale.</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            You know your niche. You know your products. You just don't have time to film, edit, 
            caption, hashtag, schedule, and post to 7 platforms every day. That's my job now.
          </p>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Posts/Week", value: "21+" },
              { label: "Platforms", value: "7" },
              { label: "Time to Post", value: "&lt;5 min" },
              { label: "Retainers", value: "$3k-30k" },
            ].map((s) => (
              <div key={s.label} className="card-luxury p-4">
                <p className="text-2xl font-bold text-gold">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CROSS-PROMO: AXEL AI */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card-luxury p-8 text-center border-rose/20">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-rose flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
              <Brain className="w-5 h-5 text-dark" />
            </div>
            <h3 className="text-lg font-bold text-dark mb-2">
              Meet <span className="gradient-gold">Axel AI</span>
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Your 24/7/365 personal assistant that never sleeps. Manage tasks, automate workflows, 
              research anything, and get shit done — all through natural conversation. 
              Think Jarvis, but yours.
            </p>
            <a href="https://github.com/AureaHavenTech" target="_blank" rel="noopener noreferrer">
              <button className="mt-5 px-5 py-2.5 rounded-xl text-xs font-medium border border-gold/30 text-gold hover:bg-gold/10 transition-all inline-flex items-center gap-1.5">
                Learn More
                <ExternalLink className="w-3 h-3" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* PRICING BRIEF */}
      <section className="py-20 px-4 bg-gradient-to-b from-warm-white/50 to-cream">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section-title text-dark mb-4">
            One price. <span className="gradient-gold">Unlimited creation.</span>
          </h2>
          <p className="text-sm text-gray-400 mb-8">No tiers. No per-post fees. Just results.</p>

          <div className="glass-panel p-8 max-w-sm mx-auto">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Flat Rate</p>
            <p className="text-5xl font-bold text-dark">
              $29
              <span className="text-sm font-normal text-gray-400">/month</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-left">
              {[
                "Unlimited content creation",
                "All 7 platforms",
                "AI avatar videos",
                "Shopify page creator",
                "Ad creator (Meta, TikTok, IG)",
                "Content calendar & scheduling",
                "Market research tools",
                "Portfolio builder",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                  <Check className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <button className="mt-6 w-full px-6 py-3 rounded-xl text-sm font-semibold bg-dark text-cream hover:bg-charcoal transition-all shadow-lg">
                Start 3-Day Free Trial
              </button>
            </Link>
            <p className="mt-2 text-[10px] text-gray-400">No credit card. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gold/10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-xs font-semibold text-dark mb-3">Product</p>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-[11px] text-gray-400 hover:text-dark">Pricing</Link>
                <Link href="/login" className="block text-[11px] text-gray-400 hover:text-dark">Login</Link>
                <Link href="/about" className="block text-[11px] text-gray-400 hover:text-dark">About</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-dark mb-3">Resources</p>
              <div className="space-y-2">
                <Link href="/faq" className="block text-[11px] text-gray-400 hover:text-dark">FAQ</Link>
                <Link href="/support" className="block text-[11px] text-gray-400 hover:text-dark">Support</Link>
                <Link href="/contact" className="block text-[11px] text-gray-400 hover:text-dark">Contact</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-dark mb-3">Company</p>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-[11px] text-gray-400 hover:text-dark">Dashboard</Link>
                <Link href="/dashboard/owner" className="block text-[11px] text-gray-400 hover:text-dark">Founder</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-dark mb-3">Social</p>
              <div className="space-y-2">
                <a href="https://tiktok.com/@funkycoldmedemaa" target="_blank" rel="noopener noreferrer" className="block text-[11px] text-gray-400 hover:text-dark">TikTok</a>
                <a href="https://instagram.com/funkycoldmedemaa" target="_blank" rel="noopener noreferrer" className="block text-[11px] text-gray-400 hover:text-dark">Instagram</a>
                <a href="https://twitter.com/funkycoldmedemaa" target="_blank" rel="noopener noreferrer" className="block text-[11px] text-gray-400 hover:text-dark">Twitter / X</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gold/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-gray-400">
              © 2026 OnePost AI. All rights reserved.
            </p>
            <p className="text-[10px] text-gray-400">
              Built by <span className="text-gold">@funkycoldmedemaa</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}