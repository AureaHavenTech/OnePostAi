"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Check, Crown, KeyRound } from "lucide-react";
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

    setTimeout(() => {
      // CEO access code check
      if (showCEO && accessCode.toUpperCase() === "AUREA2026") {
        setLoading(false);
        router.push("/dashboard/owner");
        return;
      }
      
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
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
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] flex items-center justify-center mb-4 shadow-xl shadow-[#c9a84c]/20">
              <Sparkles className="w-6 h-6 text-[#1a1614]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1614]">
              {showCEO ? "CEO Access" : isSignUp ? "Start Your 3-Day Trial" : "Welcome Back"}
            </h1>
            <p className="text-[#6b5a5e] mt-1.5 text-sm">
              {showCEO ? "Enter your founder access code" : isSignUp ? "No credit card needed. Cancel anytime." : "Sign in to your dashboard."}
            </p>
          </div>

          {isSignUp && !showCEO && (
            <div className="mb-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[#6b5a5e]">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> AI generates content</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Auto-publish to 7 platforms</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Cancel anytime</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-md border border-[#c9a84c]/10 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
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
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#6b5a5e] font-medium" htmlFor="email">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5a5e]" />
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-[#f5f0ea] border-gray-200" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#6b5a5e] font-medium" htmlFor="password">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b5a5e]" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 bg-[#f5f0ea] border-gray-200" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5a5e] hover:text-[#1a1614]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <Button type="submit" variant="glow" size="lg" className="w-full text-sm" disabled={loading}>
              {loading ? "Loading..." : showCEO ? "Access Dashboard" : isSignUp ? "Start Free Trial" : "Sign In"}
            </Button>

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
                    <><span>Don't have an account? </span><button type="button" onClick={() => setIsSignUp(true)} className="text-[#c9a84c] hover:text-[#c9a84c]/80 font-medium">Start 3-day trial</button></>
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
            <p className="text-xs text-[#6b5a5e] mb-2">After your 3-day trial, it's <span className="font-semibold text-[#1a1614]">$29/month</span></p>
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