"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Check, Menu, X, ChevronDown, ExternalLink, Brain, Zap, Film, ShoppingBag, Globe, MessageSquareText, CalendarDays, TrendingUp, Music2 } from "lucide-react";

const contentTypes = [
  { icon: "/icon-unboxing.svg", label: "Unboxing Video", desc: "AI-generated unboxing with product reveals & sparkles" },
  { icon: "/icon-voiceover.svg", label: "Voiceover", desc: "Professional narration with trending sound sync" },
  { icon: "/icon-talking-head.svg", label: "Talking Head", desc: "UGC-style presenter with natural delivery" },
  { icon: "/icon-ai-twin.svg", label: "AI Twin", desc: "Your digital avatar — never be on camera again" },
  { icon: "/icon-product-demo.svg", label: "Product Demo", desc: "Spotlight your product with cinematic reveals" },
  { icon: "/icon-trending-hook.svg", label: "Trending Hook", desc: "Viral-first formats optimized for the FYP" },
  { icon: "/icon-storytelling.svg", label: "Storytelling", desc: "Narrative-driven content that builds your brand" },
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

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const observerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-visible");
          }
        });
      },
      { threshold: 0.15 }
    );
    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-dark text-cream font-body overflow-x-hidden">
      <style jsx global>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .animate-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .gold-gradient {
          background: linear-gradient(135deg, #c9a96e 0%, #d4b87a 40%, #e8d4a0 60%, #c9a96e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gold-border-glow {
          box-shadow: 0 0 20px rgba(201, 169, 110, 0.15), 0 0 40px rgba(201, 169, 110, 0.05);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(201, 169, 110, 0.1) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201, 169, 110, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(201, 169, 110, 0); }
        }
        .animate-pulse-gold {
          animation: pulse-gold 2s ease-in-out infinite;
        }
        .content-card:hover .content-icon {
          filter: brightness(1.3) drop-shadow(0 0 8px rgba(201, 169, 110, 0.5));
        }
      `}</style>

      {/* ===== NAVIGATION ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-dark/90 backdrop-blur-xl border-b border-gold/10 shadow-lg shadow-black/20" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img src="/op-logo.svg" alt="OnePost AI" className="h-8 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#content-types" className="text-xs text-cream/60 hover:text-gold transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-xs text-cream/60 hover:text-gold transition-colors font-medium">How It Works</a>
              <Link href="/pricing" className="text-xs text-cream/60 hover:text-gold transition-colors font-medium">Pricing</Link>
              <Link href="/login">
                <button className="px-5 py-2 rounded-xl text-xs font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-lg shadow-gold/20 hover:shadow-gold/30">
                  Start Free Trial
                </button>
              </Link>
            </nav>
            <button className="md:hidden p-2 text-cream" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {navOpen && (
            <div className="md:hidden pb-4 border-t border-gold/10 pt-4 flex flex-col gap-3 bg-dark">
              <a href="#content-types" className="text-sm text-cream/70 py-1">Features</a>
              <a href="#how-it-works" className="text-sm text-cream/70 py-1">How It Works</a>
              <Link href="/pricing" className="text-sm text-cream/70 py-1">Pricing</Link>
              <Link href="/login"><button className="w-full px-5 py-2.5 rounded-xl text-sm font-semibold bg-gold text-dark">Start Free Trial</button></Link>
            </div>
          )}
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section aria-label="Hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-light/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-xs text-gold mb-8 animate-on-scroll" ref={(el) => { observerRefs.current[0] = el; }}>
            <Sparkles className="w-3 h-3" />
            The only app you need. Just talk to it.
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.05] mb-6 animate-on-scroll" ref={(el) => { observerRefs.current[1] = el; }}>
            One conversation.<br />
            <span className="gold-gradient">Everything publishes.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-cream/60 max-w-2xl mx-auto leading-relaxed mb-4 animate-on-scroll" ref={(el) => { observerRefs.current[2] = el; }}>
            "Create an unboxing video for Mellow Sleep gummies, post to TikTok and IG Reels every 2 days."
          </p>
          <p className="text-sm text-gold font-medium mb-10 animate-on-scroll" ref={(el) => { observerRefs.current[3] = el; }}>
            AI generates the script, video, captions, hashtags — and schedules it all. No other app needed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 animate-on-scroll" ref={(el) => { observerRefs.current[4] = el; }}>
            <Link href="/login">
              <button className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-lg shadow-gold/20 hover:shadow-gold/30 inline-flex items-center gap-2 animate-pulse-gold">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/support">
              <button className="px-8 py-3.5 rounded-xl text-sm font-medium text-cream/70 border border-gold/20 hover:border-gold/50 hover:text-cream transition-all inline-flex items-center gap-2">
                <MessageSquareText className="w-4 h-4" /> Try AI Chat
              </button>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-cream/40 mb-10 animate-on-scroll" ref={(el) => { observerRefs.current[5] = el; }}>
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> 7-day free trial</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-cream/20" />
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> No credit card</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-cream/20" />
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> AI generates everything</span>
          </div>

          {/* Hero Workflow Illustration */}
          <div className="max-w-3xl mx-auto animate-on-scroll gold-border-glow rounded-2xl" ref={(el) => { observerRefs.current[6] = el; }}>
            <img src="/hero-workflow.svg" alt="OnePost AI Workflow: One Conversation → AI Generates Everything → One Click to Publish" className="w-full h-auto" />
          </div>

          {/* Platform icons row */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 animate-on-scroll" ref={(el) => { observerRefs.current[7] = el; }}>
            {["TikTok", "Instagram", "Facebook", "YouTube", "LinkedIn", "Snapchat", "Pinterest"].map((p) => (
              <span key={p} className="text-[10px] text-cream/30 uppercase tracking-widest font-medium">{p}</span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-[10px] text-cream/30 uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4 text-cream/20" />
        </div>
      </section>

      {/* ===== SOCIAL PROOF — COMPETITIVE POSITIONING ===== */}
      <section aria-label="Stats" className="py-16 px-4 border-y border-gold/5 bg-dark/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {stats.map((s, i) => (
              <div key={s.label} className="animate-on-scroll p-6" ref={(el) => { observerRefs.current[10 + i] = el; }} style={{ transitionDelay: `${i * 100}ms` }}>
                <p className="text-3xl sm:text-4xl font-heading font-bold gold-gradient">{s.value}</p>
                <p className="text-xs text-cream/50 mt-2 font-medium tracking-wide uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTENT TYPE SHOWCASE ===== */}
      <section aria-label="Content types" id="content-types" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll" ref={(el) => { observerRefs.current[20] = el; }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/5 border border-gold/10 text-[10px] text-gold uppercase tracking-widest mb-4">
              Content Types
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">
              7 formats.<br className="sm:hidden" />
              <span className="gold-gradient"> Infinite content.</span>
            </h2>
            <p className="text-sm text-cream/50 max-w-lg mx-auto">
              No filming. No editing. No recording. AI generates every format from a single prompt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contentTypes.map((ct, i) => (
              <div
                key={ct.label}
                className="content-card animate-on-scroll group relative bg-dark border border-gold/10 rounded-2xl p-6 hover:border-gold/30 hover:bg-[#1a1a28] transition-all duration-500 cursor-default"
                ref={(el) => { observerRefs.current[30 + i] = el; }}
                style={{ transitionDelay: `${i * 75}ms` }}
              >
                {/* Subtle background glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(400px_circle_at_center,rgba(201,169,110,0.04)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <img src={ct.icon} alt={ct.label} className="content-icon w-14 h-14 mb-4 transition-all duration-500" />
                  <h3 className="font-heading font-semibold text-sm text-cream mb-1 group-hover:text-gold transition-colors duration-300">{ct.label}</h3>
                  <p className="text-xs text-cream/40 leading-relaxed">{ct.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section aria-label="How it works" id="how-it-works" className="py-24 px-4 bg-dark/50 border-y border-gold/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll" ref={(el) => { observerRefs.current[50] = el; }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/5 border border-gold/10 text-[10px] text-gold uppercase tracking-widest mb-4">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">
              Type it.<br className="sm:hidden" />
              <span className="gold-gradient"> Forget it.</span>
            </h2>
            <p className="text-sm text-cream/50 max-w-lg mx-auto">
              One message. AI handles everything from creation to publishing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Tell It What You Need", desc: "Type or talk — \"Create an unboxing video for my sleep gummies, post to TikTok and IG every 2 days.\" Conversational, no forms.", highlight: "Conversational AI" },
              { step: "2", title: "AI Generates Everything", desc: "Scripts, videos, images, captions, hashtags, product pages, ad campaigns — all from one prompt. 20+ AI capabilities combined.", highlight: "20+ AI models" },
              { step: "3", title: "Posts to Your Platforms", desc: "One click publishes to your connected platforms at optimal times. Smart scheduling handles the calendar — set once, it runs automatically.", highlight: "Multi-platform" },
            ].map((item, i) => (
              <div key={item.step} className="animate-on-scroll relative group" ref={(el) => { observerRefs.current[60 + i] = el; }} style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="bg-dark border border-gold/10 rounded-2xl p-6 h-full hover:border-gold/30 transition-all duration-500">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-all duration-300">
                    <span className="text-sm font-bold text-gold">{item.step}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-cream mb-2">{item.title}</h3>
                  <p className="text-xs text-cream/50 leading-relaxed mb-3">{item.desc}</p>
                  <span className="text-[10px] text-gold/60 font-medium uppercase tracking-wider">{item.highlight}</span>
                </div>
                {/* Connector arrow for desktop */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gold/30">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPETITIVE KILL ZONE ===== */}
      <section aria-label="Apps replaced" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll" ref={(el) => { observerRefs.current[70] = el; }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/5 border border-gold/10 text-[10px] text-gold uppercase tracking-widest mb-4">
              Competitive Edge
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">
              One app.<br className="sm:hidden" />
              <span className="gold-gradient"> Replaces 20+.</span>
            </h2>
            <p className="text-sm text-cream/50 max-w-lg mx-auto">
              No competitor does everything. Users stitch together 6 apps to do what OnePost does in a single message.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {competitorsReplaced.map((comp, i) => (
              <div key={comp.name} className="animate-on-scroll bg-dark border border-gold/10 rounded-xl p-4 hover:border-gold/30 transition-all duration-300 group" ref={(el) => { observerRefs.current[80 + i] = el; }} style={{ transitionDelay: `${i * 75}ms` }}>
                <comp.icon className="w-5 h-5 text-gold/60 mb-2 group-hover:text-gold transition-colors" />
                <p className="text-xs font-semibold text-cream/80 group-hover:text-cream">{comp.name}</p>
                <p className="text-[10px] text-cream/40 mt-0.5">{comp.what}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center animate-on-scroll" ref={(el) => { observerRefs.current[90] = el; }}>
            <p className="text-sm text-cream/40 italic">
              ChatGPT + HeyGen + InVideo + Later + Canva + Midjourney —{" "}
              <span className="gold-gradient font-semibold not-italic">all in one app.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ===== MISSION CONTROL PREVIEW ===== */}
      <section aria-label="Who it's for" className="py-24 px-4 bg-dark/50 border-y border-gold/5">
        <div className="max-w-4xl mx-auto">
          <div className="animate-on-scroll" ref={(el) => { observerRefs.current[100] = el; }}>
            <div className="bg-[#0d0d14] border border-gold/10 rounded-2xl p-6 sm:p-8 shadow-2xl gold-border-glow">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-gold/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-gold/30" />
                <span className="text-[10px] text-cream/30 ml-2 font-mono">onepost ~ mission-control</span>
              </div>
              <p className="text-sm text-cream/70 font-mono mb-4">
                <span className="text-gold">$</span> Create unboxing video for Mellow Sleep gummies, post 3x/week to TikTok & IG at peak times
              </p>
              <div className="space-y-2.5 text-xs font-mono">
                {[
                  { status: "done", text: "Generated viral script with trending hook (pattern interrupt + curiosity gap)" },
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
                <div className="pt-3 border-t border-gold/10">
                  <span className="text-gold">✅ Campaign complete. 21 posts scheduled. Next: Tuesday 8:00 PM EST (TikTok peak).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING CTA ===== */}
      <section aria-label="Pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center animate-on-scroll" ref={(el) => { observerRefs.current[110] = el; }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/5 border border-gold/10 text-[10px] text-gold uppercase tracking-widest mb-4">
            Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">
            From <span className="gold-gradient">$19/month.</span>
          </h2>
          <p className="text-sm text-cream/50 mb-8 max-w-md mx-auto">
            Cheaper than one lunch out. Less than any single tool it replaces.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            {[
              { name: "Basic", price: "$19", desc: "AI content generation, 7 platforms, smart scheduling", cta: "Start Free" },
              { name: "Pro", price: "$49", desc: "Multi-brand, AI avatar, trend analytics, 2-week scheduling", cta: "Start Free", featured: true },
              { name: "Agency", price: "$99", desc: "10 brands, team collab, white-label, API access", cta: "Start Free" },
            ].map((plan, i) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 border transition-all duration-300 ${plan.featured ? "border-gold/40 bg-gold/5 gold-border-glow" : "border-gold/10 bg-dark hover:border-gold/30"}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gold text-dark text-[10px] font-semibold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading font-semibold text-sm text-cream mb-1">{plan.name}</h3>
                <p className="text-3xl font-heading font-bold gold-gradient mb-2">{plan.price}<span className="text-xs text-cream/40 font-body font-normal">/month</span></p>
                <p className="text-xs text-cream/50 mb-4 leading-relaxed">{plan.desc}</p>
                <Link href="/login">
                  <button className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${plan.featured ? "bg-gold text-dark hover:bg-gold-light" : "border border-gold/30 text-gold hover:bg-gold/10"}`}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-cream/40">7-day free trial • No credit card • Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </section>

      {/* ===== AXEL AI CROSS-PROMO ===== */}
      <section aria-label="Axel AI cross-sell" className="py-16 px-4 bg-dark/50 border-t border-gold/5">
        <div className="max-w-3xl mx-auto">
          <div className="animate-on-scroll bg-dark border border-gold/10 rounded-2xl p-8 text-center hover:border-gold/30 transition-all duration-500" ref={(el) => { observerRefs.current[120] = el; }}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20">
              <Brain className="w-5 h-5 text-dark" />
            </div>
            <h3 className="font-heading font-bold text-lg text-cream mb-2">
              Meet <span className="gold-gradient">Axel AI™</span>
            </h3>
            <p className="text-xs text-cream/50 max-w-md mx-auto leading-relaxed">
              Your intelligent AI business assistant. Organize tasks, draft content, plan your business, manage your calendar — handles the heavy lifting 24/7.
            </p>
            <a href="https://axelai-eight.vercel.app" target="_blank" rel="noopener noreferrer">
              <button className="mt-5 px-5 py-2.5 rounded-xl text-xs font-medium border border-gold/30 text-gold hover:bg-gold/10 transition-all inline-flex items-center gap-1.5">
                Learn More <ExternalLink className="w-3 h-3" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section aria-label="Final CTA" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.08)_0%,transparent_60%)]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center animate-on-scroll" ref={(el) => { observerRefs.current[130] = el; }}>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold tracking-tight mb-4">
            Ready to stop <span className="gold-gradient">juggling 6 apps?</span>
          </h2>
          <p className="text-sm text-cream/50 mb-8 max-w-md mx-auto">
            One conversation. One app. One click to publish everywhere. Start your free trial today.
          </p>
          <Link href="/login">
            <button className="px-10 py-4 rounded-xl text-sm font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-xl shadow-gold/20 hover:shadow-gold/40 inline-flex items-center gap-2 animate-pulse-gold">
              Start 7-Day Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gold/10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div>
              <p className="text-xs font-semibold text-cream mb-3">Product</p>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Pricing</Link>
                <Link href="/login" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Login</Link>
                <Link href="/about" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">About</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-cream mb-3">Resources</p>
              <div className="space-y-2">
                <Link href="/faq" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">FAQ</Link>
                <Link href="/support" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">AI Chat</Link>
                <Link href="/contact" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-cream mb-3">Company</p>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Dashboard</Link>
                <Link href="/dashboard/owner" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Founder Access</Link>
                <Link href="/dashboard/affiliates" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Ambassador Program</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-cream mb-3">Legal</p>
              <div className="space-y-2">
                <Link href="/terms" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Terms</Link>
                <Link href="/privacy" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Privacy</Link>
                <Link href="/cookies" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Cookies</Link>
                <Link href="/refund" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Refund</Link>
                <Link href="/dpa" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">DPA</Link>
                <Link href="/acceptable-use" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Acceptable Use</Link>
                <Link href="/affiliate-terms" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Affiliate Terms</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-cream mb-3">Social</p>
              <div className="space-y-2">
                <a href="https://tiktok.com/@funkycoldmedemaa" target="_blank" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">TikTok</a>
                <a href="https://instagram.com/funkycoldmedemaa" target="_blank" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Instagram</a>
                <a href="https://twitter.com/funkycoldmedemaa" target="_blank" className="block text-[11px] text-cream/40 hover:text-gold transition-colors">Twitter / X</a>
              </div>
            </div>
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
