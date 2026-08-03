"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export default function LuxuryPage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      {...pageTransition}
      className={`min-h-screen bg-gradient-luxury ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function LuxurySection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      variants={item}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function LuxuryCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`glass-card p-6 ${hover ? "" : "hover:border-gold-dim hover:shadow-none hover:transform-none"} ${className}`}>
      {children}
    </div>
  );
}

export function LuxuryHeader({
  scrolled = false,
  transparent = false,
}: {
  scrolled?: boolean;
  transparent?: boolean;
}) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-dark/95 backdrop-blur-xl border-b border-gold/10 scroll-shadow"
          : transparent
          ? "bg-transparent"
          : "bg-dark/80 backdrop-blur-xl border-b border-gold/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/op-logo.svg" alt="OnePost AI" className="h-8 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-xs text-cream/60 hover:text-gold transition-colors">Pricing</Link>
          <Link href="/about" className="text-xs text-cream/60 hover:text-gold transition-colors">About</Link>
          <Link href="/login">
            <button className="btn-gold text-xs px-5 py-2">Start Free Trial</button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function LuxuryFooter() {
  return (
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
  );
}
