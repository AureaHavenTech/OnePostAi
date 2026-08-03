"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Crown, KeyRound, ShieldCheck } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Founder code flow
      if (showCEO) {
        const res = await fetch("/api/auth/founder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: accessCode.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Invalid founder code.");
          setLoading(false);
          return;
        }
        window.location.href = "/dashboard/owner";
        return;
      }

      // Login or signup
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Connection failed. Please try again.");
      console.error("Auth error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12121a] flex flex-col">
      {/* Top nav */}
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-cream/60 hover:text-cream transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a96e] to-[#d4b87a] shadow-lg shadow-[#c9a96e]/20 mb-4">
              <Sparkles className="w-8 h-8 text-[#12121a]" />
            </div>
            <h1 className="text-3xl font-bold text-[#e8e0d4]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-[#e8e0d4]/50 mt-2">
              {showCEO
                ? "Enter your founder access code"
                : isSignUp
                ? "Start your 7-day free trial"
                : "Sign in to your account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-[#1a1a2e]/80 backdrop-blur-xl border border-[#c9a96e]/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            {showCEO ? (
              <div className="space-y-1.5">
                <label className="text-xs text-[#e8e0d4]/60 font-medium flex items-center gap-1.5" htmlFor="code">
                  <Crown className="w-3.5 h-3.5 text-[#c9a96e]" />
                  Founder Access Code
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="Enter your founder code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#12121a]/80 border border-[#c9a96e]/20 text-[#e8e0d4] placeholder-[#e8e0d4]/30 focus:outline-none focus:border-[#c9a96e]/60 focus:ring-1 focus:ring-[#c9a96e]/30 transition-all text-sm"
                  autoFocus
                />
                <p className="text-[10px] text-[#e8e0d4]/30">
                  Hint: <code className="bg-white/5 px-1.5 py-0.5 rounded text-[#c9a96e]/60">AUREA2026</code>
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#e8e0d4]/60 font-medium" htmlFor="email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e8e0d4]/30" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#12121a]/80 border border-[#c9a96e]/20 text-[#e8e0d4] placeholder-[#e8e0d4]/30 focus:outline-none focus:border-[#c9a96e]/60 focus:ring-1 focus:ring-[#c9a96e]/30 transition-all text-sm"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#e8e0d4]/60 font-medium" htmlFor="password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e8e0d4]/30" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={isSignUp ? "Create a password" : "Enter your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#12121a]/80 border border-[#c9a96e]/20 text-[#e8e0d4] placeholder-[#e8e0d4]/30 focus:outline-none focus:border-[#c9a96e]/60 focus:ring-1 focus:ring-[#c9a96e]/30 transition-all text-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e8e0d4]/40 hover:text-[#e8e0d4]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#c9a96e] hover:bg-[#d4b87a] text-[#12121a] font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : showCEO ? "Access Dashboard" : isSignUp ? "Create Account" : "Sign In"}
            </button>

            {/* Founder hint */}
            {!showCEO && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#c9a96e]/5 border border-[#c9a96e]/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c9a96e]/60 flex-shrink-0" />
                <p className="text-[10px] text-[#e8e0d4]/50">
                  Founder? <button type="button" onClick={() => setShowCEO(true)} className="font-semibold text-[#c9a96e] hover:text-[#d4b87a]">Click here</button> to use your access code
                </p>
              </div>
            )}

            <div className="text-center text-xs text-[#e8e0d4]/40">
              {showCEO ? (
                <button type="button" onClick={() => setShowCEO(false)} className="text-[#c9a96e] hover:text-[#d4b87a] font-medium transition-colors">
                  Back to regular login
                </button>
              ) : (
                <>
                  {isSignUp ? (
                    <><span>Already have an account? </span><button type="button" onClick={() => setIsSignUp(false)} className="text-[#c9a96e] hover:text-[#d4b87a] font-medium transition-colors">Sign in</button></>
                  ) : (
                    <><span>Don't have an account? </span><button type="button" onClick={() => setIsSignUp(true)} className="text-[#c9a96e] hover:text-[#d4b87a] font-medium transition-colors">Create one</button></>
                  )}
                </>
              )}
            </div>
          </form>

          {/* CEO Access Toggle */}
          {!showCEO && (
            <button onClick={() => setShowCEO(true)} className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-[#e8e0d4]/40 hover:text-[#c9a96e] transition-colors py-2">
              <KeyRound className="w-3.5 h-3.5" />
              Founder Access
            </button>
          )}

          {/* Upgrade */}
          <div className="mt-6 p-4 bg-[#1a1a2e]/80 backdrop-blur-xl border border-[#c9a96e]/10 rounded-xl text-center">
            <p className="text-xs text-[#e8e0d4]/50 mb-2">Plans start at <span className="font-semibold text-[#c9a96e]">$19/month</span></p>
            <a href="https://buy.stripe.com/dRmcN51blcX24vreeecwg08" target="_blank" rel="noopener noreferrer">
              <button className="px-4 py-1.5 rounded-lg border border-[#c9a96e]/30 text-[#c9a96e] hover:bg-[#c9a96e]/10 text-xs transition-colors">
                Upgrade Now
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
