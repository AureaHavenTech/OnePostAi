'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRICING_TIERS } from '@/lib/types';

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">1P</div>
              <span className="font-bold text-lg">One Post AI</span>
            </Link>
            <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 pt-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-[#6b6b80] text-lg">No hidden fees. No surprises. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <div key={i} className={`card p-8 flex flex-col relative ${tier.highlighted ? 'border-purple-500/40 animate-glow' : ''}`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-xs font-semibold text-white whitespace-nowrap">
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

          <div className="mt-16 card p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Works with AutoExec AI</h3>
            <p className="text-[#6b6b80] mb-6 max-w-2xl mx-auto">
              One Post AI integrates seamlessly with AutoExec — your AI executive assistant. 
              Delegate content creation tasks and let AI handle the entire workflow.
            </p>
            <a href="https://autoexec.ai" className="text-purple-400 hover:text-purple-300 font-medium">
              Learn about AutoExec integration →
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-[#2a2a3a]">
        <div className="max-w-6xl mx-auto text-center text-sm text-[#6b6b80]">
          © 2026 One Post AI — Built for creators who value their time
        </div>
      </footer>
    </div>
  );
}
