"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Check, Menu, X, ChevronDown, ExternalLink, Brain, Zap, Film, ShoppingBag, Globe, MessageSquareText, CalendarDays, TrendingUp, Music2 } from "lucide-react";

const contentTypes = [
  { label: "Unboxing Video", desc: "AI-generated unboxing with product reveals & sparkles", emoji: "📦" },
  { label: "Voiceover", desc: "Professional narration with trending sound sync", emoji: "🎙️" },
  { label: "Talking Head", desc: "UGC-style presenter with natural delivery", emoji: "🎬" },
  { label: "AI Twin", desc: "Your digital avatar — never be on camera again", emoji: "👤" },
  { label: "Product Demo", desc: "Spotlight your product with cinematic reveals", emoji: "✨" },
  { label: "Trending Hook", desc: "Viral-first formats optimized for the FYP", emoji: "🔥" },
  { label: "Storytelling", desc: "Narrative-driven content that builds your brand", emoji: "📖" },
];

const competitorsReplaced = [
  { name: "ChatGPT / Claude", what: "Scripts & Copy", icon: MessageSquareText },
  { name: "HeyGen / Synthesia", what: "AI Avatars", icon: Film },
  { name: "InVideo / CapCut", what: "Video Editing", icon: Zap },
  { name: "Later / Buffer", what: "Scheduling", icon: CalendarDays },
  { name: "Canva", what: "Design", icon: Globe },
  { name: "Midjourney", what: "Images", icon: Sparkles },
  { name: "Trending APIs", what: "Viral Research", icon: TrendingUp },
  { name: "Shopify Apps", what: "Product Pages", icon: ShoppingBag },
];

const stats = [
  { value: "20+", label: "Apps Replaced" },
  { value: "7", label: "Platforms, 1 Click" },
  { value: "<5 min", label: "From Idea to Post" },
  { value: "24/7", label: "Autonomous Content" },
];

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { document.body.style.overflow = navOpen ? "hidden" : ""; }, [navOpen]);

  return (
    <div className="min-h-screen bg-gradient-luxury text-cream overflow-x-hidden">

      {/* ===== NAVIGATION ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-dark/95 backdrop-blur-xl border-b border-gold/10 scroll-shadow" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/op-logo.svg" alt="OnePost AI" className="h-8 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#content-types" className="text-xs text-cream/60 hover:text-gold transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-xs text-cream/60 hover:text-gold transition-colors font-medium">How It Works</a>
              <Link href="/pricing" className="text-xs text-cream/60 hover:text-gold transition-colors font-medium">Pricing</Link>
              <Link href="/login"><button className="btn-gold text-xs px-5 py-2">Start Free Trial</button></Link>
            </nav>
            <button className="md:hidden p-2 text-cream" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <AnimatePresence>
            {navOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden pb-4 border-t border-gold/10 pt-4 flex flex-col gap-3 bg-dark overflow-hidden">
                <a href="#content-types" className="text-sm text-cream/70 py-1" onClick={() => setNavOpen(false)}>Features</a>
                <a href="#how-it-works" className="text-sm text-cream/70 py-1" onClick={() => setNavOpen(false)}>How It Works</a>
                <Link href="/pricing" className="text-sm text-cream/70 py-1" onClick={() => setNavOpen(false)}>Pricing</Link>
                <Link href="/login" onClick={() => setNavOpen(false)}><button className="w-full btn-gold">Start Free Trial</button></Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-gold" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-light/5 rounded-full blur-3xl animate-pulse-gold" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-xs text-gold mb-8">
            <Sparkles className="w-3 h-3" /> The only app you need. Just talk to it.
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.05] mb-6">
            One conversation.<br />
            <span className="text-gradient-gold">Everything publishes.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-base sm:text-lg text-cream/60 max-w-2xl mx-auto leading-relaxed mb-4">
            "Create an unboxing video for Mellow Sleep gummies, post to TikTok and IG Reels every 2 days."
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="text-sm text-gold font-medium mb-10">
            AI generates the script, video, captions, hashtags — and schedules it all. No other app needed.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/login"><button className="btn-gold inline-flex items-center gap-2 animate-pulse-gold">Start Free Trial <ArrowRight className="w-4 h-4" /></button></Link>
            <Link href="/support"><button className="btn-outline inline-flex items-center gap-2"><MessageSquareText className="w-4 h-4" /> Try AI Chat</button></Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-cream/40 mb-10">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> 7-day free trial</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-cream/20" />
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> No credit card</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-cream/20" />
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> AI generates everything</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="max-w-3xl mx-auto rounded-2xl border border-gold/10" style={{ boxShadow: "0 0 40px rgba(201, 169, 110, 0.1)" }}>
            <img src="/hero-workflow.svg" alt="OnePost AI Workflow" className="w-full h-auto" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8">
            {["TikTok", "Instagram", "Facebook", "YouTube", "LinkedIn", "Snapchat", "Pinterest"].map((p) => (
              <span key={p} className="text-[10px] text-cream/30 uppercase tracking-widest font-medium">{p}</span>
            ))}
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] text-cream/30 uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4 text-cream/20" />
        </motion.div>
      </section>

      {/* ===== STATS ===== */}
      <motion.section {...fadeIn} className="py-16 px-4 border-y border-gold/5 bg-dark-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6">
                <p className="text-3xl sm:text-4xl font-heading font-bold text-gradient-gold">{s.value}</p>
                <p className="text-xs text-cream/50 mt-2 font-medium tracking-wide uppercase">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ===== CONTENT TYPES ===== */}
      <section id="content-types" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <span className="badge-gold mb-4">Content Types</span>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">7 formats.<br className="sm:hidden" /> <span className="text-gradient-gold">Infinite content.</span></h2>
            <p className="text-sm text-cream/50 max-w-lg mx-auto">No filming. No editing. No recording. AI generates every format from a single prompt.</p>
          </motion.div>

          <motion.div {...staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contentTypes.map((ct, i) => (
              <motion.div key={ct.label} variants={staggerItem} transition={{ delay: i * 0.05 }} className="glass-card p-6 group cursor-default">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(400px_circle_at_center,rgba(201,169,110,0.04)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <span className="text-4xl mb-4 block">{ct.emoji}</span>
                  <h3 className="font-heading font-semibold text-sm text-cream mb-1 group-hover:text-gold transition-colors">{ct.label}</h3>
                  <p className="text-xs text-cream/40 leading-relaxed">{ct.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-4 bg-dark-card/30 border-y border-gold/5">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <span className="badge-gold mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">Type it.<br className="sm:hidden" /> <span className="text-gradient-gold">Forget it.</span></h2>
            <p className="text-sm text-cream/50 max-w-lg mx-auto">One message. AI handles everything from creation to publishing.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Tell It What You Need", desc: "Type or talk — \"Create an unboxing video for my sleep gummies, post to TikTok and IG every 2 days.\" Conversational, no forms.", highlight: "Conversational AI" },
              { step: "2", title: "AI Generates Everything", desc: "Scripts, videos, images, captions, hashtags, product pages, ad campaigns — all from one prompt. 20+ AI capabilities combined.", highlight: "20+ AI models" },
              { step: "3", title: "Publishes Everywhere", desc: "One click posts to all 7 platforms at optimal times. Smart scheduling handles the calendar. Set once, runs autonomously.", highlight: "7 platforms" },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass-card p-6 relative group">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-all duration-300">
                  <span className="text-sm font-bold text-gold">{item.step}</span>
                </div>
                <h3 className="font-heading font-semibold text-sm text-cream mb-2">{item.title}</h3>
                <p className="text-xs text-cream/50 leading-relaxed mb-3">{item.desc}</p>
                <span className="badge-gold">{item.highlight}</span>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-3 text-gold/30"><ArrowRight className="w-5 h-5" /></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPETITIVE KILL ZONE ===== */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16">
            <span className="badge-gold mb-4">Competitive Edge</span>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">One app.<br className="sm:hidden" /> <span className="text-gradient-gold">Replaces 20+.</span></h2>
            <p className="text-sm text-cream/50 max-w-lg mx-auto">No competitor does everything. Users stitch together 6 apps to do what OnePost does in a single message.</p>
          </motion.div>

          <motion.div {...staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {competitorsReplaced.map((comp, i) => (
              <motion.div key={comp.name} variants={staggerItem} transition={{ delay: i * 0.05 }} className="glass-card p-4 group" style={{ transform: "none" }}>
                <comp.icon className="w-5 h-5 text-gold/60 mb-2 group-hover:text-gold transition-colors" />
                <p className="text-xs font-semibold text-cream/80 group-hover:text-cream">{comp.name}</p>
                <p className="text-[10px] text-cream/40 mt-0.5">{comp.what}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p {...fadeIn} className="mt-8 text-center text-sm text-cream/40 italic">
            ChatGPT + HeyGen + InVideo + Later + Canva + Midjourney —{" "}
            <span className="text-gradient-gold font-semibold not-italic">all in one app.</span>
          </motion.p>
        </div>
      </section>

      {/* ===== MISSION CONTROL ===== */}
      <section className="py-24 px-4 bg-dark-card/30 border-y border-gold/5">
        <motion.div {...fadeIn} className="max-w-4xl mx-auto">
          <div className="glass-card p-6 sm:p-8" style={{ boxShadow: "0 0 40px rgba(201, 169, 110, 0.08)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" /><div className="w-2.5 h-2.5 rounded-full bg-gold/50" /><div className="w-2.5 h-2.5 rounded-full bg-gold/30" />
              <span className="text-[10px] text-cream/30 ml-2 font-mono">onepost ~ mission-control</span>
            </div>
            <p className="text-sm text-cream/70 font-mono mb-4">
              <span className="text-gold">$</span> Create unboxing video for Mellow Sleep gummies, post 3x/week to TikTok & IG at peak times
            </p>
            <div className="space-y-2.5 text-xs font-mono">
              {[
                { status: "done", text: "Generated viral script with trending hook" },
                { status: "done", text: "Created 15-sec video — unboxing style, text overlays, trending audio" },
                { status: "done", text: "Wrote platform-optimized captions: TikTok (casual), IG (polished)" },
                { status: "active", text: "Analyzing optimal posting times — Tues 8pm, Thurs 3pm, Sat 11am" },
                { status: "pending", text: "Scheduling 21 posts across 2 platforms for the next 2 weeks..." },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === "done" ? "bg-gold" : item.status === "active" ? "bg-gold animate-pulse" : "bg-cream/20"}`} />
                  <span className={item.status === "done" ? "text-cream/60" : item.status === "active" ? "text-cream/80" : "text-cream/30"}>{item.text}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-gold/10"><span className="text-gold">✅ Campaign complete. 21 posts scheduled. Next: Tuesday 8:00 PM EST.</span></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== PRICING CTA ===== */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <span className="badge-gold mb-4">Pricing</span>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">From <span className="text-gradient-gold">$19/month.</span></h2>
            <p className="text-sm text-cream/50 mb-8 max-w-md mx-auto">Cheaper than one lunch out. Less than any single tool it replaces.</p>
          </motion.div>

          <motion.div {...staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            {[
              { name: "Basic", price: "$19", desc: "AI content generation, 7 platforms, smart scheduling" },
              { name: "Pro", price: "$49", desc: "Multi-brand, AI avatar, trend analytics, 2-week scheduling", featured: true },
              { name: "Agency", price: "$99", desc: "10 brands, team collab, white-label, API access" },
            ].map((plan, i) => (
              <motion.div key={plan.name} variants={staggerItem} className={`glass-card p-6 text-left relative ${plan.featured ? "border-gold/40 bg-gold/[0.03]" : ""}`} style={plan.featured ? { boxShadow: "0 0 30px rgba(201,169,110,0.12)" } : {}}>
                {plan.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-dark text-[10px] font-semibold uppercase tracking-wider">Most Popular</div>}
                <h3 className="font-heading font-semibold text-sm text-cream mb-1">{plan.name}</h3>
                <p className="text-3xl font-heading font-bold text-gradient-gold mb-2">{plan.price}<span className="text-xs text-cream/40 font-body font-normal">/month</span></p>
                <p className="text-xs text-cream/50 mb-4 leading-relaxed">{plan.desc}</p>
                <Link href="/login"><button className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${plan.featured ? "btn-gold" : "btn-outline"}`}>Start Free</button></Link>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-[10px] text-cream/40">7-day free trial • No credit card • Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </section>

      {/* ===== AXEL AI CROSS-PROMO ===== */}
      <section className="py-16 px-4 bg-dark-card/30 border-t border-gold/5">
        <motion.div {...fadeIn} className="max-w-3xl mx-auto">
          <div className="glass-card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
              <Brain className="w-5 h-5 text-dark" />
            </div>
            <h3 className="font-heading font-bold text-lg text-cream mb-2">Meet <span className="text-gradient-gold">Axel AI™</span></h3>
            <p className="text-xs text-cream/50 max-w-md mx-auto leading-relaxed">Your autonomous AI executive assistant. Research, email outreach, data gathering, analytics — executes end-to-end. Like a full-time employee who never sleeps.</p>
            <a href="https://axelai-eight.vercel.app" target="_blank" rel="noopener noreferrer">
              <button className="btn-outline mt-5 inline-flex items-center gap-1.5 text-xs">Learn More <ExternalLink className="w-3 h-3" /></button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <motion.div {...fadeIn} className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">Ready to stop <span className="text-gradient-gold">juggling 6 apps?</span></h2>
          <p className="text-sm text-cream/50 mb-8 max-w-md mx-auto">One conversation. One app. One click to publish everywhere. Start your free trial today.</p>
          <Link href="/login"><button className="btn-gold px-10 py-4 inline-flex items-center gap-2 animate-pulse-gold text-sm">Start 7-Day Free Trial <ArrowRight className="w-4 h-4" /></button></Link>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gold/10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div><p className="text-xs font-semibold text-cream mb-3">Product</p><div className="space-y-2"><Link href="/pricing" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Pricing</Link><Link href="/login" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Login</Link><Link href="/about" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">About</Link></div></div>
            <div><p className="text-xs font-semibold text-cream mb-3">Resources</p><div className="space-y-2"><Link href="/faq" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">FAQ</Link><Link href="/support" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">AI Chat</Link><Link href="/contact" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Contact</Link></div></div>
            <div><p className="text-xs font-semibold text-cream mb-3">Company</p><div className="space-y-2"><Link href="/dashboard" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Dashboard</Link><Link href="/dashboard/owner" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Founder Access</Link><Link href="/dashboard/affiliates" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Ambassador Program</Link></div></div>
            <div><p className="text-xs font-semibold text-cream mb-3">Legal</p><div className="space-y-2"><Link href="/terms" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Terms</Link><Link href="/privacy" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Privacy</Link><Link href="/cookies" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Cookies</Link><Link href="/refund" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Refund</Link><Link href="/dpa" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">DPA</Link><Link href="/acceptable-use" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Acceptable Use</Link><Link href="/affiliate-terms" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Affiliate Terms</Link></div></div>
            <div><p className="text-xs font-semibold text-cream mb-3">Social</p><div className="space-y-2"><a href="https://tiktok.com/@funkycoldmedemaa" target="_blank" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">TikTok</a><a href="https://instagram.com/funkycoldmedemaa" target="_blank" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Instagram</a><a href="https://twitter.com/funkycoldmedemaa" target="_blank" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Twitter / X</a></div></div>
          </div>
          <div className="border-t border-gold/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-cream/30">© 2026 Aura Haven Tech. All rights reserved.</p>
            <p className="text-[10px] text-cream/30">Built with <span className="text-gold">♥</span> by @funkycoldmedemaa</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
