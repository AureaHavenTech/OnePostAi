"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Wand2, Brain, Globe, Zap, Film, Menu, X, Check, ArrowRight, Play, Camera, Upload, Hash, CalendarDays, TrendingUp, ShoppingBag, BadgeCheck, Crown, Music2, MessageSquareText, Repeat2, Crop, Music, Users, DollarSign, Star, ExternalLink, Video, Image, MessageCircle, Share2 } from "lucide-react";

const features = [
  { icon: MessageSquareText, title: "AI Chat — Like ChatGPT", description: "Tell me what you need. Create 15-sec viral video for my mop brand, post every 2 days on TikTok and IG. I'll do it. Conversational, no filters, no canned responses." },
  { icon: Wand2, title: "AI Generate Videos From Text", description: "No recorded content? No problem. Give me a product name and I'll generate the script, create the video with viral text overlays, add music, and post it." },
  { icon: CalendarDays, title: "Smart Scheduling", description: "Schedule 3 posts/day for the next 2 weeks. I'll analyze optimal posting times per platform and schedule accordingly. Set it and forget it." },
  { icon: TrendingUp, title: "Viral Trend Analytics", description: "I scrape the internet for trending keywords, viral hooks, and optimal posting times per platform. Every post goes out when it'll get the most traction." },
  { icon: Globe, title: "Multi-Brand Management", description: "Mellow Sleep, Maverick Mop, Axel AI — manage separate brands, each with their own content calendar, platform selection, and posting schedule." },
  { icon: Film, title: "AI Video Generator", description: "Product photo + prompt → 15-second viral video with trending hooks, text overlays, music, and platform-optimized formatting. No filming needed." },
  { icon: Crop, title: "Auto-Resize for Every Platform", description: "One video → auto-formatted for 9:16 TikTok Reels, 1:1 Instagram, 16:9 YouTube. No manual work, no re-editing." },
  { icon: Hash, title: "Per-Platform Hashtags", description: "Different trending hashtags for TikTok, Instagram, YouTube, Pinterest — not copies, optimized for each platform's algorithm." },
  { icon: BadgeCheck, title: "Viral Captions & Hooks", description: "AI writes click-stopping hooks, platform-specific captions, and CTAs designed for maximum engagement and FYP traction." },
  { icon: Music, title: "Trending Audio & Sounds", description: "I find what's trending on TikTok, pull the right sounds, and match them to your content automatically." },
  { icon: Camera, title: "AI Avatar Videos", description: "Upload 5 photos → your AI twin creates UGC-style videos. Never be on camera again." },
  { icon: Crown, title: "Portfolio Builder", description: "Auto-build a pro portfolio that commands $3k-$30k monthly retainers. Show results, not effort." },
  { icon: Repeat2, title: "One-Click Multi-Platform Post", description: "Create once. Select platforms. One post publishes everywhere with correct specs, hashtags, and timing." },
  { icon: Users, title: "Affiliate Program", description: "10% lifetime commission on every referral. Promote both OnePost AI and Axel AI to double your earnings." },
  { icon: ShoppingBag, title: "Shopify Integration", description: "Complete product pages with SEO titles, conversion copy, images, and smart pricing. Ready to sell." },
  { icon: Zap, title: "Post to 7 Platforms", description: "TikTok, Instagram, Facebook, YouTube, LinkedIn, Snapchat, Pinterest — one connection, auto-publish everywhere." },
];

const platforms = [
  { name: "TikTok", icon: Music2 },
  { name: "Instagram", icon: MessageCircle },
  { name: "Facebook", icon: Globe },
  { name: "YouTube", icon: Video },
  { name: "LinkedIn", icon: Share2 },
  { name: "Snapchat", icon: Zap },
  { name: "Pinterest", icon: Hash },
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#1a1614]">
      {/* NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf7f2]/80 backdrop-blur-xl border-b border-[#c9a96e]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
<img src="/op-logo.svg" alt="OnePost AI" className="h-8 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/pricing" className="text-xs text-[#6b5a5e] hover:text-[#1a1614] transition-colors">Pricing</Link>
              <Link href="/about" className="text-xs text-[#6b5a5e] hover:text-[#1a1614] transition-colors">About</Link>
              <Link href="/faq" className="text-xs text-[#6b5a5e] hover:text-[#1a1614] transition-colors">FAQ</Link>
              <Link href="/support" className="text-xs text-[#6b5a5e] hover:text-[#1a1614] transition-colors">AI Chat</Link>
              <Link href="/login">
                <button className="px-5 py-2 rounded-xl text-xs font-medium bg-[#1a1614] text-[#faf7f2] hover:bg-[#2d2824] transition-all shadow-lg">
                  Start Free Trial
                </button>
              </Link>
            </nav>
            <button className="md:hidden p-2" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {navOpen && (
            <div className="md:hidden pb-4 border-t border-[#c9a96e]/10 pt-4 flex flex-col gap-3">
              <Link href="/pricing" className="text-sm text-[#6b5a5e] py-1">Pricing</Link>
              <Link href="/about" className="text-sm text-[#6b5a5e] py-1">About</Link>
              <Link href="/faq" className="text-sm text-[#6b5a5e] py-1">FAQ</Link>
              <Link href="/support" className="text-sm text-[#6b5a5e] py-1">AI Chat</Link>
              <Link href="/login"><button className="w-full px-5 py-2.5 rounded-xl text-sm font-medium bg-[#1a1614] text-[#faf7f2]">Start Free Trial</button></Link>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center pt-16 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 text-xs text-[#c9a96e] mb-8">
            <Sparkles className="w-3 h-3" />
            Just tell me what you need. I'll make it.
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-[#1a1614]">
            Your content.<br />
            <span className="bg-gradient-to-r from-[#c9a96e] to-[#e8c97a] bg-clip-text text-transparent">Handled.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#6b5a5e] max-w-2xl mx-auto leading-relaxed">
            "Create a 15-second viral video for my Maverick mop soap brand, post every 2 days on TikTok, Instagram, and YouTube — with trending hooks and optimal posting times."<br />
            <span className="text-[#1a1614] font-medium"> Done. No filming. No editing. No grunt work.</span>
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login">
              <button className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-[#1a1614] text-[#faf7f2] hover:bg-[#2d2824] transition-all shadow-lg shadow-[#1a1614]/10 hover:shadow-[#1a1614]/20 inline-flex items-center gap-2">
                Start 7-Day Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/support">
              <button className="px-8 py-3.5 rounded-xl text-sm font-medium text-[#6b5a5e] border border-gray-200 hover:border-[#c9a96e] hover:text-[#1a1614] transition-all inline-flex items-center gap-2">
                <MessageSquareText className="w-4 h-4" /> Try AI Chat
              </button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> 7-day free trial</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> No credit card</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> AI generates everything</span>
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
      <section className="py-20 px-4 bg-gradient-to-b from-[#faf7f2] to-[#f5f0ea]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight text-[#1a1614]">
              Tell me what to post.<br />
              <span className="bg-gradient-to-r from-[#c9a96e] to-[#e8c97a] bg-clip-text text-transparent">I'll schedule it all.</span>
            </h2>
            <p className="mt-3 text-sm text-[#6b5a5e] max-w-lg mx-auto">No content? No problem. AI generates everything from a prompt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Type or Talk", desc: '"Create 15-sec viral video for Mellow Sleep, post 3x/week on TikTok & IG Reels."' },
              { step: "02", title: "AI Does Everything", desc: "Generates script, creates video with trending hooks & text overlays, writes per-platform hashtags & captions." },
              { step: "03", title: "Auto-Schedules & Posts", desc: "Scheduled at optimal times per platform. Posts 3x/day. Set it and forget it for weeks." },
            ].map((item) => (
              <div key={item.step} className="bg-white/80 backdrop-blur-md border border-[#c9a96e]/10 rounded-2xl p-6 text-center hover:shadow-lg hover:shadow-[#c9a96e]/5 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xs font-bold text-[#c9a96e]">{item.step}</span>
                </div>
                <h3 className="font-semibold text-sm text-[#1a1614] mb-2">{item.title}</h3>
                <p className="text-xs text-[#6b5a5e] leading-relaxed italic">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight text-[#1a1614]">
              Everything you need.<br />
              <span className="bg-gradient-to-r from-[#c9a96e] to-[#e8c97a] bg-clip-text text-transparent">Nothing you don't.</span>
            </h2>
            <p className="mt-3 text-sm text-[#6b5a5e] max-w-lg mx-auto">16 tools. Infinite content. One subscription.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white/80 backdrop-blur-md border border-[#c9a96e]/10 rounded-2xl p-5 hover:shadow-lg hover:shadow-[#c9a96e]/5 transition-all duration-300 hover:border-[#c9a96e]/30">
                <div className="w-9 h-9 rounded-lg bg-[#c9a96e]/10 border border-[#c9a96e]/15 flex items-center justify-center mb-3">
                  <f.icon className="w-4 h-4 text-[#c9a96e]" />
                </div>
                <h3 className="font-semibold text-sm text-[#1a1614] mb-1">{f.title}</h3>
                <p className="text-xs text-[#6b5a5e] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION CONTROL PREVIEW */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#faf7f2] to-[#f5f0ea]/50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#f5f0ea]/60 backdrop-blur-md border border-[#c9a96e]/10 rounded-2xl p-8 sm:p-10 text-center shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a96e]/10 text-[#c9a96e] text-xs mb-6">
              <Wand2 className="w-3 h-3" />
              Mission Control
            </div>
            <div className="bg-[#1a1614]/90 rounded-2xl p-4 sm:p-6 text-left shadow-2xl border border-[#c9a96e]/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#d4a0a0]" />
                <div className="w-2 h-2 rounded-full bg-[#c9a96e]/50" />
                <div className="w-2 h-2 rounded-full bg-[#c9a96e]/30" />
                <span className="text-[10px] text-gray-500 ml-2">onepost-ai ~ mission</span>
              </div>
              <p className="text-sm text-[#faf7f2]/80 font-mono mb-3">
                <span className="text-[#c9a96e]">$</span> Create 15-sec viral video for Maverick mop soap, post every 2 days to TikTok & IG Reels
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#c9a96e] animate-pulse" /><span className="text-[#faf7f2]/60">Generating viral script with trending hook...</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#c9a96e] animate-pulse" /><span className="text-[#faf7f2]/60">Creating video with text overlays & music...</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[#faf7f2]/80">Writing per-platform captions & hashtags...</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[#faf7f2]/80">Analyzing optimal posting times per platform...</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[#faf7f2]/80">Scheduling 3 posts/week for next 2 weeks...</span></div>
                <div className="pt-2 border-t border-[#faf7f2]/10"><span className="text-[#c9a96e]">✅ Campaign created & published to 7 platforms. Next post: today 7:30pm EST (TikTok peak time)</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR CREATORS */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight text-[#1a1614] mb-4">
            Built for the creator<br />who's <span className="bg-gradient-to-r from-[#c9a96e] to-[#e8c97a] bg-clip-text text-transparent">ready to scale.</span>
          </h2>
          <p className="text-sm text-[#6b5a5e] max-w-xl mx-auto leading-relaxed">
            You know your niche. You know your products. You just don't have time to film, edit, caption, hashtag, schedule, and post to 7 platforms every day. That's my job now.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Posts/Week", value: "21+" },
              { label: "Platforms", value: "7" },
              { label: "Time to Post", value: "<5 min" },
              { label: "Retainers", value: "$3k-30k" },
            ].map((s) => (
              <div key={s.label} className="bg-white/80 backdrop-blur-md border border-[#c9a96e]/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-[#c9a96e]">{s.value}</p>
                <p className="text-[10px] text-[#6b5a5e] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AXEL AI CROSS-PROMO */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md border border-[#c9a96e]/10 rounded-2xl p-8 text-center border-[#d4a0a0]/20">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#d4a0a0] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#c9a96e]/20">
              <Brain className="w-5 h-5 text-[#1a1614]" />
            </div>
            <h3 className="text-lg font-bold text-[#12121a] mb-2">
              Meet <span className="text-[#c9a96e]">Axel AI™</span>
            </h3>
            <p className="text-xs text-[#6b5a5e] max-w-md mx-auto leading-relaxed">
              Your autonomous AI executive assistant. Describe any task — research, email outreach, webpages, data gathering, content, analytics — executes end-to-end. Like having a full-time employee who never sleeps.
            </p>
            <a href="https://axelai-eight.vercel.app" target="_blank" rel="noopener noreferrer">
              <button className="mt-5 px-5 py-2.5 rounded-xl text-xs font-medium border border-[#c9a96e]/30 text-[#c9a96e] hover:bg-[#c9a96e]/10 transition-all inline-flex items-center gap-1.5">
                Learn More <ExternalLink className="w-3 h-3" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#f5f0ea]/50 to-[#e8e0d4]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight text-[#12121a] mb-4 font-[family-name:var(--font-heading)]">
            Plans for every creator.<br /><span className="text-[#c9a96e]">From $19/month.</span>
          </h2>
          <p className="text-sm text-[#6b5a5e] mb-6">30-day money-back guarantee on all plans.</p>
          <Link href="/pricing">
            <button className="px-8 py-3.5 rounded-xl text-sm font-semibold bg-[#12121a] text-[#e8e0d4] hover:bg-[#2d2824] transition-all shadow-lg inline-flex items-center gap-2">
              See Plans & Pricing <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <p className="mt-3 text-[10px] text-[#6b5a5e]">7-day free trial • No credit card • Cancel anytime</p>
        </div>
      </section>

      {/* CROSS-PROMO BAR */}
      <div className="border-t border-[#c9a96e]/10 py-4 px-4 bg-gradient-to-r from-[#faf7f2] via-[#f5f0ea] to-[#faf7f2]">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse"></span>
            Try <a href="https://axelai-eight.vercel.app" target="_blank" className="text-[#c9a96e] hover:text-[#d4b87a] font-bold">Axel AI</a>
            {' '}- The Axle That Drives Your Business
          </span>
          <span>·</span>
          <a href="https://aurahaven.shop" target="_blank" className="text-[#c9a96e] hover:text-[#d4b87a] font-bold">Shop Aura Haven</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#c9a96e]/10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <p className="text-xs font-semibold text-[#1a1614] mb-3">Product</p>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">Pricing</Link>
                <Link href="/login" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">Login</Link>
                <Link href="/about" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">About</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1a1614] mb-3">Resources</p>
              <div className="space-y-2">
                <Link href="/faq" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">FAQ</Link>
                <Link href="/support" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">AI Chat</Link>
                <Link href="/contact" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">Contact</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1a1614] mb-3">Company</p>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">Dashboard</Link>
                <Link href="/dashboard/owner" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">Founder Access</Link>
                <Link href="/dashboard/affiliates" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">Ambassador Program</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1a1614] mb-3">Social</p>
              <div className="space-y-2">
                <a href="https://tiktok.com/@funkycoldmedemaa" target="_blank" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">TikTok</a>
                <a href="https://instagram.com/funkycoldmedemaa" target="_blank" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">Instagram</a>
                <a href="https://twitter.com/funkycoldmedemaa" target="_blank" className="block text-[11px] text-[#6b5a5e] hover:text-[#1a1614]">Twitter / X</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#c9a96e]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-[#6b5a5e]">© 2026 Aura Haven Tech. All rights reserved.</p>
            <p className="text-[10px] text-[#6b5a5e]">Built by <span className="text-[#c9a96e]">@funkycoldmedemaa</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}