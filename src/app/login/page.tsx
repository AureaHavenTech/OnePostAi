"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    // Store auth state first
    try {
      localStorage.setItem("onepost_auth", JSON.stringify({
        email: email.trim() || "demo@onepost.ai",
        role: target.includes("owner") ? "owner" : "user",
        authenticated: true,
        timestamp: Date.now(),
      }));
    } catch (_) { /* ignore */ }

    // Primary: window.location.href is the most reliable redirect
    window.location.href = target;

    // Secondary: router.push as fallback (runs first if SPA navigation works)
    try {
      router.push(target);
    } catch (_) {
      // window.location.href already set above, will execute
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate brief auth delay for UX feel
    await new Promise((r) => setTimeout(r, 600));

    try {
      // CEO access code check — works in both modes
      const enteredCode = showCEO ? accessCode : password;
      if (enteredCode.toUpperCase().trim() === "AUREA2026") {
        navigateAfterLogin("/dashboard/owner");
        return;
      }

      // Demo mode: accept any credentials (no password length check)
      if (!email.trim() && !showCEO) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      navigateAfterLogin("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      {/* Top nav */}
      <div className="p-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold to-gold-light shadow-lg shadow-gold/20 mb-4">
              <Sparkles className="w-8 h-8 text-dark" />
            </div>
            <h1 className="text-3xl font-bold text-dark font-playfair">
              {isSignUp ? "Start Your Free Trial" : "Welcome Back"}
            </h1>
            <p className="text-sm text-charcoal/60 mt-2">
              {showCEO
                ? "Enter your founder access code"
                : isSignUp
                ? "7 days free · No credit card required"
                : "Sign in to your account"}
            </p>
          </div>

          {/* Feature bullets (signup only, non-CEO) */}
          {isSignUp && !showCEO && (
            <div className="mb-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[#6b5a5e]">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> AI generates content</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Auto-publish to 7 platforms</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Cancel anytime</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md border border-[#c9a84c]/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs animate-fadeIn">
                {error}
              </div>
            )}

            {showCEO ? (
              <div className="space-y-1.5">
                <label className="text-xs text-[#6b5a5e] font-medium" htmlFor="code">
                  <Crown className="w-3.5 h-3.5 inline mr-1 text-[#c9a84c]" />
                  Founder Access Code
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter your code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="bg-[#f5f0ea] border-gray-200"
                  autoFocus
                />
                <p className="text-[10px] text-[#6b5a5e]/50">
                  Hint: <code className="bg-[#f5f0ea] px-1 rounded">AUREA2026</code>
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#6b5a5e] font-medium" htmlFor="email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5a5e]" />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-[#f5f0ea] border-gray-200" autoFocus />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#6b5a5e] font-medium" htmlFor="password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5a5e]" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Any password works (demo mode)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 bg-[#f5f0ea] border-gray-200" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5a5e] hover:text-[#1a1614]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <Button type="submit" variant="glow" size="lg" className="w-full text-sm" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : showCEO ? "Access Dashboard" : isSignUp ? "Start Free Trial" : "Sign In"}
            </Button>

            {/* CEO code hint in regular mode */}
            {!showCEO && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gold/5 border border-gold/10">
                <ShieldCheck className="w-3.5 h-3.5 text-gold/60 flex-shrink-0" />
                <p className="text-[10px] text-gold/60">
                  CEO? Use <span className="font-semibold">AUREA2026</span> as your password
                </p>
              </div>
            )}

            <div className="text-center text-xs text-[#6b5a5e]">
              {showCEO ? (
                <button type="button" onClick={() => setShowCEO(false)} className="text-[#c9a84c] hover:text-[#c9a84c]/80 font-medium">
                  Back to regular login
                </button>
              ) : (
                <>
                  {isSignUp ? (
                    <><span>Already have an account? </span><button type="button" onClick={() => setIsSignUp(false)} className="text-[#c9a84c] hover:text-[#c9a84c]/80 font-medium">Sign in</button></>
                  ) : (
                    <><span>Don't have an account? </span><button type="button" onClick={() => setIsSignUp(true)} className="text-[#c9a84c] hover:text-[#c9a84c]/80 font-medium">Start 7-day trial</button></>
                  )}
                </>
              )}
            </div>
          </form>

          {/* CEO Access Toggle */}
          {!showCEO && (
            <button onClick={() => setShowCEO(true)} className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-[#6b5a5e] hover:text-[#c9a84c] transition-colors py-2">
              <KeyRound className="w-3.5 h-3.5" />
              Founder Access
            </button>
          )}

          {/* Upgrade to paid */}
          <div className="mt-6 p-4 bg-white/80 backdrop-blur-md border border-[#c9a84c]/10 rounded-xl text-center">
            <p className="text-xs text-[#6b5a5e] mb-2">After your 7-day trial, plans start at <span className="font-semibold text-[#12121a]">$19/month</span></p>
            <a href="https://buy.stripe.com/dRmcN51blcX24vreeecwg08" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs">
                Upgrade Now
              </Button>
            </a>
          </div>

          <p className="text-center text-[10px] text-[#6b5a5e] mt-4">Demo mode: any credentials work. No real data stored.</p>
        </div>
      </div>
    </div>
  );
}
