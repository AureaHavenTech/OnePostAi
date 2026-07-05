"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";
import {
  Camera,
  Check,
  Globe,
  Image,
  Music,
  MessageCircle,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  BarChart3,
  Calendar,
  Hash,
  Share2
} from "lucide-react";

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const features = [
    {
      icon: Image,
      title: "Full Video & Photo Editor",
      description: "A professional-grade editing suite like CapCut or Canva. Trim, crop, add effects, text, transitions — or let AI auto-edit your raw footage into a polished video.",
    },
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "No footage? No problem. Type an idea or paste a product URL and AI generates a complete video, ad creative, or social post for you from scratch.",
    },
    {
      icon: Camera,
      title: "Auto-Publish Across Platforms",
      description: "Schedule and publish your edited content to Instagram, TikTok, Twitter, YouTube, and more from ONE dashboard. No more jumping between apps.",
    },
    {
      icon: Hash,
      title: "Viral Hashtag Discovery",
      description: "Automatically picks the best trending hashtags for your niche so your content gets discovered by the right audience.",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI analyzes when your audience is most active and schedules posts at optimal times automatically.",
    },
    {
      icon: BarChart3,
      title: "Cross-Platform Analytics",
      description: "See how all your content performs across every platform in one unified dashboard. Know what works and double down.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      desc: "Perfect for getting started with content automation.",
      price: 19,
      features: ["1 social platform", "10 scheduled posts/mo", "Basic analytics", "Hashtag suggestions"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      desc: "For serious creators who need multi-platform reach.",
      price: 49,
      features: ["5 social platforms", "50 scheduled posts/mo", "Advanced analytics", "AI content generation", "Auto hashtags", "Priority support"],
      cta: "Go Pro",
      popular: true,
    },
    {
      name: "Unlimited",
      desc: "For agencies and power users. No limits, full power.",
      price: 99,
      features: ["Unlimited platforms", "Unlimited posts", "Real-time analytics", "AI content + repurpose", "Custom branding", "Dedicated manager"],
      cta: "Go Unlimited",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#12121a] text-white selection:bg-[#c9a96e]/50 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[#1e1e2a] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#e8d4a8] flex items-center justify-center shadow-lg shadow-[#c9a96e]/20">
            <span className="text-lg font-bold text-[#12121a]">O</span>
          </div>
          <span className="ml-3 font-bold text-white tracking-tight">OnePost AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Launch App <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-44 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#c9a96e]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/20 mb-6 tracking-wider uppercase">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#c9a96e] animate-pulse" />
          Content That Moves
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight md:leading-none text-white">
          Post everywhere.{" "}
          <span className="bg-gradient-to-r from-[#c9a96e] via-[#d4b87a] to-[#e8d4a8] bg-clip-text text-transparent">
            From one place.
          </span>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
          Upload your own video or photos and edit them in a professional-grade editing suite — or just type an idea and AI creates it for you. OnePost AI has a full editor like CapCut or Canva, auto-generates viral captions, picks trending hashtags, and publishes across every platform. No jumping between apps. No staring at a blank page.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login">
            <Button size="lg" className="text-base px-8 py-4">
              Start Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#pricing">
            <Button variant="outline" size="lg" className="text-base px-8 py-4">
              View Pricing
            </Button>
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>30-day money-back guarantee · No risk</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-[#1e1e2a] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Everything you need to create content that moves</h2>
            <p className="mt-4 text-slate-400 text-lg">Stop juggling tabs, apps, and logins. OnePost AI brings it all together.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="bg-[#0a0a0f]/40 border-[#1e1e2a] hover:border-[#c9a96e]/30 transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-[#c9a96e]/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-[#c9a96e]" />
                  </div>
                  <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-[#1e1e2a] bg-[#0a0a0f]/20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Create once. Post everywhere.</h2>
            <p className="mt-4 text-slate-400 text-lg">Three simple steps to never stress about content again.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center font-bold text-xl text-[#c9a96e] mb-6 shadow-lg shadow-[#c9a96e]/5">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Upload or Describe</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Upload your own video/photo or just type an idea. OnePost AI handles it either way.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center font-bold text-xl text-[#c9a96e] mb-6 shadow-lg shadow-[#c9a96e]/5">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Edit or Auto-Generate</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Use the full editor to trim, crop, add effects — or let AI auto-edit it into a polished video. Captions and hashtags are generated automatically.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center font-bold text-xl text-[#c9a96e] mb-6 shadow-lg shadow-[#c9a96e]/5">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Publish & Analyze</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                Schedule posts across all platforms in one click. Track performance in a unified dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-24 border-t border-[#1e1e2a] bg-[#0a0a0f]/10 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/20 mb-6 tracking-wider uppercase">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#c9a96e]" />
            The Story Behind OnePost AI
          </span>
          <blockquote className="text-2xl md:text-3xl font-semibold text-white leading-relaxed max-w-3xl mx-auto">
            &ldquo;I was managing content for multiple businesses from my phone. Logging in and out of platforms, 
            researching hashtags, scheduling manually — it was a full-time job. I needed one place to do it all. So I built it.&rdquo;
          </blockquote>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
            OnePost AI was born from real frustration. It&apos;s the content tool every busy creator wished existed.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <span className="h-px w-8 bg-[#1e1e2a]"></span>
            <span>— Founder, OnePost AI</span>
            <span className="h-px w-8 bg-[#1e1e2a]"></span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-[#1e1e2a] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">Simple, flat pricing</h2>
            <p className="mt-4 text-slate-400 text-lg">
              One price. No hidden fees. <span className="text-emerald-400 font-semibold">30-day money-back guarantee</span> on every plan.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative flex flex-col h-full bg-[#0a0a0f]/30 transition-all duration-300 border-[#1e1e2a] hover:border-[#c9a96e]/30 ${plan.popular ? 'border-[#c9a96e] shadow-2xl shadow-[#c9a96e]/10 scale-105 z-10' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/20">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
                  <p className="text-sm text-slate-400 min-h-[40px] mt-2">{plan.desc}</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">${plan.price}</span>
                    <span className="text-slate-400 text-sm ml-2">/ month</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="border-t border-[#1e1e2a]/60 my-4"></div>
                  <ul className="space-y-3">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start space-x-3 text-sm text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Link href="/login" className="w-full">
                    <Button variant={plan.popular ? "default" : "outline"} className="w-full py-3 font-semibold">
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 border-t border-[#1e1e2a] bg-[#0a0a0f]/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-emerald-500/5 to-[#c9a96e]/5 border border-emerald-500/10 rounded-2xl p-10 md:p-14">
            <ShieldCheck className="h-14 w-14 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">30-Day Money-Back Guarantee</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-2">
              Try OnePost AI risk-free. If you&apos;re not satisfied within 30 days, get a full refund. No questions asked.
            </p>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              We&apos;re confident OnePost AI will save you hours every week. But if it doesn&apos;t work for you, we&apos;ll refund every penny.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button size="lg" className="text-base px-8 py-4">
                  Start Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}