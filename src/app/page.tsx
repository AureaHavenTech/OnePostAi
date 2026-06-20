"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles, Wand2, Brain, Clock, Globe, Zap, Menu, X, Film, MessageSquareText, CalendarDays, Lightbulb, UserCheck, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Wand2,
      title: "Raw Video → Polished Content",
      description: "Drop a raw clip and AI edits it into platform-optimized videos with cuts, transitions, effects, and text overlays. No editing skills needed.",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Film,
      title: "AI Creates from Scratch",
      description: "No footage? No problem. Give it a brand name or topic and AI generates UGC-style videos with stock footage, voiceover, and captions.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Lightbulb,
      title: "Content Idea Engine",
      description: "Stuck? The ideation engine reads trends in your niche and suggests 10 viral-ready post ideas so you never run out of content.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: Globe,
      title: "Auto-Publish to All Platforms",
      description: "Smart posting knows where content performs best — Reels, TikToks, Shorts, Spotlights. It picks the right format and publishes everywhere at once.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: CalendarDays,
      title: "Set It & Forget It",
      description: "Schedule 20+ posts across days. Take the weekend off. The app runs your content calendar on autopilot with affiliate links built in.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: UserCheck,
      title: "No Camera Required",
      description: "AI avatars, text-to-video, screen captures with voiceover. Create pro UGC content without ever turning your camera on.",
      gradient: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="OnePost AI" className="h-8 w-auto" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Pricing</Link>
              <Link href="/faq" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">FAQ</Link>
              <Link href="/about" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">About</Link>
              <Link href="/support" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Support</Link>
              <Link href="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link href="/login?signup=true">
                <Button variant="glow" size="sm">
                  Start Free Trial
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <button className="md:hidden p-2 text-zinc-400 hover:text-zinc-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-zinc-900/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block text-sm text-zinc-400 py-2">Features</Link>
              <Link href="#pricing" className="block text-sm text-zinc-400 py-2">Pricing</Link>
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1"><Button variant="outline" className="w-full">Sign In</Button></Link>
                <Link href="/login?signup=true" className="flex-1"><Button variant="glow" className="w-full">Start Free</Button></Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-60 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Zero editing. Zero camera. Zero stress.
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1]">
            <span className="gradient-text">Post like a pro.</span>
            <br />
            <span className="text-zinc-100">Without being one.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto text-balance leading-relaxed">
            You shouldn't need a film degree, expensive editing software, or hours of your day 
            to post great content. Drop a raw video, a link, or just an idea — OnePost AI edits, 
            formats, captions, and publishes pro-level content across every platform. On autopilot.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login?signup=true">
              <Button variant="glow" size="xl" className="text-base">
                Stop Struggling. Start Posting.
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="xl" className="text-base">See How It Works</Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-600 flex-wrap">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> No editing skills needed</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> No camera required</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" /> 14-day free trial</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">Three ways to create</h2>
            <p className="mt-4 text-zinc-500 max-w-xl mx-auto">However content happens — upload, generate, or ideate — the app handles the rest.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Way 1 */}
            <div className="glass-card p-8 text-center hover:border-indigo-500/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-5">
                <Wand2 className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">1. Upload Raw Content</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Drop a video you shot on your phone or a single image. AI auto-edits it with cuts, transitions, effects, and text — turning it into polished platform-ready content.
              </p>
            </div>

            {/* Way 2 */}
            <div className="glass-card p-8 text-center hover:border-purple-500/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-5">
                <Film className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">2. AI Generate From Scratch</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                No footage? Give it a brand name, product link, or topic. AI creates UGC-style videos with stock footage, voiceover, captions, and your affiliate link baked in.
              </p>
            </div>

            {/* Way 3 */}
            <div className="glass-card p-8 text-center hover:border-pink-500/20 transition-all duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-5">
                <Lightbulb className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">3. Just Need Ideas?</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The ideation engine scans trending topics in your niche and hands you 10 ready-to-post ideas with hooks, descriptions, and hashtags. Pick one, hit publish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">
              Everything you need,{" "}
              <span className="gradient-text">nothing you don't</span>
            </h2>
            <p className="mt-4 text-zinc-500 max-w-xl mx-auto">
              Built for creators who want pro results without the pro workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group relative glass-card p-8 hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 flex items-center justify-center mb-5`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-3">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR THE 39-YEAR-OLD CREATOR */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 border-indigo-500/20">
            <h2 className="text-3xl font-bold text-zinc-100 mb-4">
              This app is for <span className="gradient-text">you</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Not the 20-year-olds with ring lights and editing rigs. <strong className="text-zinc-200">You.</strong><br /><br />
              The one with a full life, a real business, and zero time to figure out CapCut.<br />
              The one who knows their stuff but doesn't want to be on camera all day.<br />
              The one who wants to post 5 times a day without spending 5 hours doing it.<br /><br />
              <span className="text-indigo-300 font-semibold">Post like a pro. Without being one. That's the point.</span>
            </p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">
              One price. <span className="gradient-text">Everything.</span>
            </h2>
            <p className="mt-4 text-zinc-500">No tiers, no upsells, no surprises.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="glass-card p-8 border-indigo-500/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium">
                One Plan
              </div>
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-zinc-100">$29</span>
                  <span className="text-zinc-500">/month</span>
                </div>
                <p className="text-zinc-500 mt-2 text-sm">Flat rate. Unlimited content, unlimited platforms.</p>
              </div>

              <ul className="mt-8 space-y-4">
                {[
                  "AI auto-editing — raw video to polished content",
                  "AI video generation from scratch (brand/topic → video)",
                  "Content ideation engine — never run out of ideas",
                  "Auto-publish to TikTok, Instagram, YouTube, LinkedIn",
                  "Smart format selection (reels > feed, etc.)",
                  "Affiliate link management",
                  "Content calendar — schedule & forget",
                  "No camera required — AI avatars & voiceover",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/login?signup=true" className="block mt-8">
                <Button variant="glow" size="lg" className="w-full text-base">
                  Start Your 14-Day Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>

              <p className="text-center text-xs text-zinc-600 mt-4">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CROSS-PROMO: Auto Exec */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-8 border-indigo-500/20">
            <h2 className="text-2xl font-bold text-zinc-100">
              Run your entire business with{" "}
              <span className="gradient-text">Auto Exec</span>
            </h2>
            <p className="text-zinc-400 mt-4 max-w-lg mx-auto leading-relaxed">
              OnePost AI creates and publishes your content.{" "}
              <strong className="text-zinc-200">Auto Exec</strong> runs your 
              dropshipping business 24/7 — billing, Shopify orders, Stripe payments, 
              and customer management. Together they're a complete business system.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <a href="https://autoexec.app" target="_blank" rel="noopener noreferrer">
                <Button variant="glow" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Auto Exec
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8dfd2] dark:border-[#3d3832] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <img src="/logo.svg" alt="OnePost AI" className="h-8 w-auto mb-4" />
              <p className="text-sm text-[#8a7f72] dark:text-[#8a7f72] leading-relaxed">
                Post like a pro. Without being one.
              </p>
            </div>
            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-[#2d2a24] dark:text-[#f5f0e8] mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-[#6b6358] dark:text-[#c4b5a0]">
                <p>Features</p>
                <p>Pricing</p>
                <p>FAQ</p>
                <p>Support</p>
              </div>
            </div>
            {/* Connect */}
            <div>
              <h4 className="text-sm font-semibold text-[#2d2a24] dark:text-[#f5f0e8] mb-3">Connect</h4>
              <div className="space-y-2 text-sm text-[#6b6358] dark:text-[#c4b5a0]">
                <p>@aureahaven — TikTok</p>
                <p>@aureahaven — Instagram</p>
                <p>Aurea Haven — LinkedIn</p>
                <p>@aureahaven — Twitter/X</p>
              </div>
            </div>
            {/* Auto Exec */}
            <div>
              <h4 className="text-sm font-semibold text-[#2d2a24] dark:text-[#f5f0e8] mb-3">Also by Aurea</h4>
              <div className="space-y-2 text-sm text-[#6b6358] dark:text-[#c4b5a0]">
                <a href="https://autoexec.app" target="_blank" rel="noopener noreferrer" className="block hover:text-[#eab308] transition-colors">
                  Auto Exec — Dropshipping Automation
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-[#e8dfd2] dark:border-[#3d3832] text-center text-xs text-[#8a7f72] dark:text-[#8a7f72]">
            &copy; {new Date().getFullYear()} OnePost AI by Aurea Haven. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}