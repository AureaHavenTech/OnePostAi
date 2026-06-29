'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Check, Globe, Send, MessageCircle, 
  BarChart3, CalendarDays, ArrowRight, ShieldCheck,
  CheckCircle2, Zap, Image as ImageIcon, FileText,
  Hash, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Footer } from "@/components/ui/footer";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
  }, []);

  const features = [
    {
      icon: FileText,
      title: "AI Writing Assistant",
      description: "Generate engaging content with AI. From blog posts to social media captions, write faster with smart suggestions that match your brand voice.",
    },
    {
      icon: Globe,
      title: "Multi-Platform Publishing",
      description: "Publish to all your platforms simultaneously — Twitter, LinkedIn, Instagram, Facebook, Blog. One click, everywhere.",
    },
    {
      icon: CalendarDays,
      title: "Smart Scheduling",
      description: "Find the best times to post. Our AI analyzes engagement patterns to optimize your publishing schedule for maximum reach.",
    },
    {
      icon: Zap,
      title: "AutoExec Integration",
      description: "Seamlessly works with Axel AI. Delegate content creation tasks and let AI handle the entire workflow end-to-end.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track performance across all platforms from one place. Understand what works and double down on your best content.",
    },
    {
      icon: Hash,
      title: "Viral Hashtag Engine",
      description: "Automatically picks viral hashtags optimized for each platform. Never research trending tags again.",
    },
  ];

  const pricingTiers = [
    {
      name: "Starter",
      monthlyPrice: 19,
      annualPrice: 15,
      description: "Perfect for getting started with content creation",
      features: [
        "50 posts/month",
        "Single platform",
        "Basic AI editor",
        "Schedule posts",
        "Email support",
      ],
      popular: false,
      cta: "Get Started"
    },
    {
      name: "Pro",
      monthlyPrice: 49,
      annualPrice: 39,
      description: "For serious content creators",
      features: [
        "200 posts/month",
        "All platforms",
        "Advanced AI editor",
        "Schedule & auto-publish",
        "Analytics dashboard",
        "Priority support",
        "AutoExec integration",
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      name: "Unlimited",
      monthlyPrice: 99,
      annualPrice: 79,
      description: "For teams and power users",
      features: [
        "Unlimited posts",
        "All platforms",
        "Full AI content suite",
        "Advanced scheduling",
        "Team collaboration",
        "API access",
        "AutoExec deep integration",
        "Dedicated support",
      ],
      popular: false,
      cta: "Contact Sales"
    },
  ];

  const price = (tier: typeof pricingTiers[0]) => isAnnual ? tier.annualPrice : tier.monthlyPrice;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-serif">One Post AI</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
        </nav>
        <div className="flex items-center space-x-3">
          {user ? (
            <Link href="/dashboard"><Button variant="primary" size="sm">Dashboard</Button></Link>
          ) : (
            <>
              <Link href="/auth/login"><Button variant="outline" size="sm">Sign In</Button></Link>
              <Link href="/auth/signup"><Button variant="primary" size="sm">Get Started</Button></Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-44 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
        <Badge variant="info" className="mb-6 px-4 py-1 text-xs tracking-wider uppercase font-semibold">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-brand-400 animate-pulse" />
          AI-Powered Content Creation
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-tight md:leading-none text-white font-serif">
          Content That <br/>
          <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-accent-400 bg-clip-text text-transparent">Moves</span>
        </h1>
        <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
          One Post AI helps you write, edit, schedule, and publish content across all platforms. 
          Powered by AI, designed for creators who value their time. Viral hashtags, optimal timing, 
          cross-platform analytics — all in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/auth/signup">
            <Button variant="primary" size="lg" className="text-base px-8 py-4">
              Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a href="#pricing">
            <Button variant="outline" size="lg" className="text-base px-8 py-4">
              View Pricing
            </Button>
          </a>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>30-day money-back guarantee · No risk</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-serif">Everything You Need</h2>
            <p className="mt-4 text-slate-400 text-lg">Powerful features to streamline your content workflow</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="bg-slate-900/40 border-slate-900 hover:border-slate-800 transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-brand-400" />
                  </div>
                  <CardTitle className="text-lg text-white font-bold font-serif">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-slate-900 bg-slate-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.05),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight text-white font-serif">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-slate-400 text-lg">Start free, upgrade as you grow. <span className="text-emerald-400 font-semibold">30-day money-back guarantee</span> on every plan.</p>
            <div className="mt-8 flex items-center justify-center space-x-4">
              <span className={`text-sm ${!isAnnual ? 'text-white font-semibold' : 'text-slate-400'}`}>Monthly Billing</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${isAnnual ? 'bg-brand-500' : 'bg-slate-800'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isAnnual ? 'translate-x-5' : ''}`} />
              </button>
              <span className={`text-sm flex items-center space-x-1.5 ${isAnnual ? 'text-white font-semibold' : 'text-slate-400'}`}>
                <span>Annual Billing</span>
                <Badge variant="success" className="text-[10px] px-1.5 py-0">Save 20%</Badge>
              </span>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {pricingTiers.map((tier, i) => (
              <Card key={i} className={`relative flex flex-col h-full bg-slate-900/30 transition-all duration-300 border-slate-900 hover:border-slate-800 ${
                tier.popular ? 'border-brand-500 shadow-2xl shadow-brand-500/10 scale-105 z-10' : ''
              }`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="info" className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold font-serif">{tier.name}</CardTitle>
                  <CardDescription className="min-h-[40px] mt-2">{tier.description}</CardDescription>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-white">${price(tier)}</span>
                    <span className="text-slate-400 text-sm ml-2">/ month</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="border-t border-slate-800/60 my-4" />
                  <ul className="space-y-3">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-start space-x-3 text-sm text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4">
                  <Link href="/auth/signup" className="w-full">
                    <Button variant={tier.popular ? "primary" : "outline"} className="w-full py-3 font-semibold">
                      {tier.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-slate-900 bg-slate-900/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-emerald-500/5 to-brand-500/5 border border-emerald-500/10 rounded-2xl p-10 md:p-14">
            <ShieldCheck className="h-14 w-14 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4 font-serif">30-Day Money-Back Guarantee</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-2">
              Try One Post AI risk-free. If you&apos;re not satisfied within 30 days, get a full refund. No questions asked.
            </p>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              We&apos;re confident One Post AI will transform your content workflow. But if it doesn&apos;t work for you, we&apos;ll refund every penny.
            </p>
            <div className="mt-8">
              <Link href="/auth/signup">
                <Button variant="primary" size="lg" className="text-base px-8 py-4">
                  Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
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