'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING_TIERS } from '@/lib/types';

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#12121a', color: '#e8e0d4' }}>
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#12121a]/80 backdrop-blur-xl border-b border-[#2a2a3a]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="One Post AI Logo" className="h-9 w-auto" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#about" className="nav-link">About</a>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <button onClick={() => router.push('/dashboard')} className="btn-primary text-sm px-5 py-2">Dashboard</button>
              ) : (
                <>
                  <button onClick={() => router.push('/auth/login')} className="btn-secondary text-sm px-5 py-2">Log In</button>
                  <button onClick={() => router.push('/auth/signup')} className="btn-primary text-sm px-5 py-2">Get Started</button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#c9a96e]/8 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 text-[#c9a96e] text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-[#c9a96e] animate-pulse" />
            AI-Powered Content Creation
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Content That
            <br />
            <span className="gradient-text"> Moves</span>
          </h1>
          <p className="text-xl text-[#a09080] mb-10 max-w-2xl mx-auto leading-relaxed">
            The creator&apos;s diamond. One Post AI lets you create, schedule, and publish content across 
            every platform from one place. AI picks viral hashtags, optimizes posting times, and gives 
            you cross-platform analytics. This is the tool that takes away all the grunt work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/auth/signup')} className="btn-primary text-lg px-8 py-4">
              Start Creating Free
            </button>
            <button onClick={() => router.push('/pricing')} className="btn-secondary text-lg px-8 py-4">
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Everything You Need</h2>
            <p className="text-[#a09080] text-lg">Powerful features to streamline your content workflow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'AI Writing Assistant', desc: 'Generate engaging content with AI. From blog posts to social media captions, write faster with smart suggestions.', icon: '✍️' },
              { title: 'Multi-Platform Publishing', desc: 'Post across ALL social media from one place — Instagram, TikTok, Twitter, YouTube, LinkedIn, and more. One click, everywhere.', icon: '🚀' },
              { title: 'Viral Hashtag Engine', desc: 'AI automatically picks trending, high-converting hashtags for your content. No more guessing — just better reach.', icon: '🏷️' },
              { title: 'Smart Scheduling', desc: 'Find the best times to post. Our AI analyzes engagement patterns to schedule your content at optimal moments.', icon: '📅' },
              { title: 'Cross-Platform Analytics', desc: 'Track performance across all platforms in one dashboard. Understand what works and double down on your best content.', icon: '📊' },
              { title: 'Content Library', desc: 'Store, organize, and reuse your best content. Build a library of proven posts and templates.', icon: '📚' },
            ].map((f, i) => (
              <div key={i} className="card p-8 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{f.title}</h3>
                <p className="text-[#a09080] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4" style={{ backgroundColor: '#0d0d15' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Simple Pricing</h2>
            <p className="text-[#a09080] text-lg">Choose the plan that fits your content needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <div key={i} className={`card p-8 flex flex-col ${tier.highlighted ? 'border-[#c9a96e]/40 animate-glow relative' : ''}`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#c9a96e] to-[#b8944a] text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{tier.name}</h3>
                <p className="text-[#a09080] text-sm mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: '#e8e0d4' }}>${tier.price}</span>
                  <span className="text-[#a09080]">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm" style={{ color: '#d4cdc0' }}>
                      <svg className="w-5 h-5 text-[#c9a96e] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => router.push('/auth/signup')} className={tier.highlighted ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Ready to Transform Your Content Workflow?</h2>
          <p className="text-[#a09080] text-lg mb-8">Join creators who are publishing better content in less time. Start your 30-day free trial today.</p>
          <button onClick={() => router.push('/auth/signup')} className="btn-primary text-lg px-10 py-4">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#2a2a3a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#c9a96e] to-[#b8944a] flex items-center justify-center text-white font-bold text-xs">1P</div>
            <span className="text-sm font-semibold" style={{ color: '#e8e0d4' }}>One Post AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#a09080]">
            <span>Works alongside <a href="https://autoexec-nine.vercel.app" className="text-[#c9a96e] hover:text-[#d4b87a]">Axel AI</a></span>
            <span>·</span>
            <a href="https://aurahaven.shop" target="_blank" className="text-[#c9a96e] hover:text-[#d4b87a]">Shop Aura Haven</a>
            <span>·</span>
            <span>© 2026 One Post AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}