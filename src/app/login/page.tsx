"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Check, Crown, KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showCEO, setShowCEO] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigateAfterLogin = (target: string) => {
    try {
      localStorage.setItem("onepost_auth", JSON.stringify({
        email: email.trim() || "demo@onepost.ai",
        role: target.includes("owner") ? "owner" : "user",
        authenticated: true,
        timestamp: Date.now(),
      }));
    } catch (_) {}

    window.location.href = target;
    try { router.push(target); } catch (_) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));

    try {
      const enteredCode = showCEO ? accessCode : password;
      if (enteredCode.toUpperCase().trim() === "AUREA2026") {
        navigateAfterLogin("/dashboard/owner");
        return;
      }
      if (!email.trim() && !showCEO) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }
      navigateAfterLogin("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-luxury flex flex-col">
      {/* Top nav */}
      <div className="p-4">
        <Link href="/" className="btn-ghost inline-flex items-center gap-1.5 text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-light shadow-lg shadow-gold/20 mb-4">
              <Sparkles className="w-8 h-8 text-dark" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-cream">
              {isSignUp ? "Start Your Free Trial" : "Welcome Back"}
            </h1>
            <p className="text-sm text-cream/50 mt-2">
              {showCEO
                ? "Enter your founder access code"
                : isSignUp
                ? "7 days free · No credit card required"
                : "Sign in to your account"}
            </p>
          </div>

          {/* Feature bullets */}
          {isSignUp && !showCEO && (
            <div className="mb-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-cream/45">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> AI generates content</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> Auto-publish to 7 platforms</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-gold" /> Cancel anytime</span>
            </div>
          )}

          {/* Form card */}
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            {showCEO ? (
              <div className="space-y-1.5">
                <label className="text-xs text-cream/60 font-medium flex items-center gap-1.5" htmlFor="code">
                  <Crown className="w-3.5 h-3.5 text-gold" /> Founder Access Code
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="Enter your code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="input-luxury"
                  autoFocus
                />
                <p className="text-[10px] text-cream/30">Hint: <code className="bg-white/5 px-1.5 py-0.5 rounded text-gold/60">AUREA2026</code></p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-cream/60 font-medium" htmlFor="email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
                    <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-luxury pl-10" autoFocus />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-cream/60 font-medium" htmlFor="password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
                    <input id="password" type={showPassword ? "text" : "password"} placeholder="Any password works (demo mode)" value={password} onChange={(e) => setPassword(e.target.value)} className="input-luxury pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn-gold w-full text-sm" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : showCEO ? "Access Dashboard" : isSignUp ? "Start Free Trial" : "Sign In"}
            </button>

            {!showCEO && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gold/5 border border-gold/10">
                <ShieldCheck className="w-3.5 h-3.5 text-gold/60 flex-shrink-0" />
                <p className="text-[10px] text-cream/50">
                  CEO? Use <span className="font-semibold text-gold">AUREA2026</span> as your password
                </p>
              </div>
            )}

            <div className="text-center text-xs text-cream/40">
              {showCEO ? (
                <button type="button" onClick={() => setShowCEO(false)} className="text-gold hover:text-gold-light font-medium transition-colors">
                  Back to regular login
                </button>
              ) : (
                <>
                  {isSignUp ? (
                    <><span>Already have an account? </span><button type="button" onClick={() => setIsSignUp(false)} className="text-gold hover:text-gold-light font-medium transition-colors">Sign in</button></>
                  ) : (
                    <><span>Don't have an account? </span><button type="button" onClick={() => setIsSignUp(true)} className="text-gold hover:text-gold-light font-medium transition-colors">Start 7-day trial</button></>
                  )}
                </>
              )}
            </div>
          </form>

          {/* CEO Access Toggle */}
          {!showCEO && (
            <button onClick={() => setShowCEO(true)} className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-cream/40 hover:text-gold transition-colors py-2">
              <KeyRound className="w-3.5 h-3.5" /> Founder Access
            </button>
          )}

          {/* Upgrade */}
          <div className="mt-6 p-4 glass-card text-center">
            <p className="text-xs text-cream/50 mb-2">After your 7-day trial, plans start at <span className="font-semibold text-gold">$19/month</span></p>
            <a href="https://buy.stripe.com/dRmcN51blcX24vreeecwg08" target="_blank" rel="noopener noreferrer">
              <button className="btn-outline text-xs">Upgrade Now</button>
            </a>
          </div>

          <p className="text-center text-[10px] text-cream/30 mt-4">Demo mode: any credentials work. No real data stored.</p>
        </div>
      </div>
    </div>
  );
}
