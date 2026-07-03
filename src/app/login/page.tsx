"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
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
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Back button */}
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
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-4 shadow-xl shadow-gold/20">
              <Sparkles className="w-6 h-6 text-dark" />
            </div>
            <h1 className="text-2xl font-bold text-dark">
              {isSignUp ? "Start Your 3-Day Trial" : "Welcome Back"}
            </h1>
            <p className="text-gray-400 mt-1.5 text-sm">
              {isSignUp
                ? "No credit card needed. Cancel anytime."
                : "Sign in to your dashboard."}
            </p>
          </div>

          {/* Benefits list for signup */}
          {isSignUp && (
            <div className="mb-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> AI avatar videos</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Auto-publish</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Cancel anytime</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="card-luxury p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-warm-white border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-warm-white border-gray-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="glow" size="lg" className="w-full text-sm" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Start Free Trial" : "Sign In"}
            </Button>

            <div className="text-center text-xs text-gray-400">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setIsSignUp(false)} className="text-gold hover:text-gold/80 font-medium">
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button type="button" onClick={() => setIsSignUp(true)} className="text-gold hover:text-gold/80 font-medium">
                    Start 3-day trial
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Demo notice */}
          <p className="text-center text-[10px] text-gray-400 mt-5">
            Demo mode: any credentials work. No real data stored.
          </p>
        </div>
      </div>
    </div>
  );
}