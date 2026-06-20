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
    <div className="min-h-screen">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3a]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">1P</div>
              <span className="font-bold text-lg">One Post AI</span>
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
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            AI-Powered Content Creation
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Create Content That
            <span className="gradient-text"> Stands Out</span>
          </h1>
          <p className="text-xl text-[#6b6b80] mb-10 max-w-2xl mx-auto leading-relaxed">
            One Post AI helps you write, edit, schedule, and publish content across all platforms. 
            Powered by AI, designed for creators who value their time.
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
            <h2 className="section-title mb-4">Everything You Need</h2>
            <p className="text-[#6b6b80] text-lg">Powerful features to streamline your content workflow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'AI Writing Assistant', desc: 'Generate engaging content with AI. From blog posts to social media captions, write faster with smart suggestions.', icon: '✍️' },
              { title: 'Multi-Platform Publishing', desc: 'Publish to all your platforms simultaneously. Schedule posts and let One Post AI handle the distribution.', icon: '🚀' },
              { title: 'Smart Scheduling', desc: 'Find the best times to post. Our AI analyzes engagement patterns to optimize your publishing schedule.', icon: '📅' },
              { title: 'AutoExec Integration', desc: 'Seamlessly works with AutoExec AI. Delegate content tasks and let AI handle the heavy lifting.', icon: '🤖' },
              { title: 'Analytics Dashboard', desc: 'Track performance across all platforms. Understand what works and double down on your best content.', icon: '📊' },
              { title: 'Content Library', desc: 'Store, organize, and reuse your best content. Build a library of proven posts and templates.', icon: '📚' },
            ].map((f, i) => (
              <div key={i} className="card p-8 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
                <p className="text-[#6b6b80] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-[#0d0d15]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Simple Pricing</h2>
            <p className="text-[#6b6b80] text-lg">Choose the plan that fits your content needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <div key={i} className={`card p-8 flex flex-col ${tier.highlighted ? 'border-purple-500/40 animate-glow relative' : ''}`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-[#6b6b80] text-sm mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-[#6b6b80]">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <svg className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Content Workflow?</h2>
          <p className="text-[#6b6b80] text-lg mb-8">Join creators who are publishing better content in less time. Start your free trial today.</p>
          <button onClick={() => router.push('/auth/signup')} className="btn-primary text-lg px-10 py-4">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#2a2a3a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-xs">1P</div>
            <span className="text-sm font-semibold">One Post AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#6b6b80]">
            <span>Works alongside <a href="https://autoexec.ai" className="text-purple-400 hover:text-purple-300">AutoExec AI</a></span>
            <span>© 2026 One Post AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
