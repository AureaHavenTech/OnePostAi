"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Crown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCodeField, setShowCodeField] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isCodeLogin, setIsCodeLogin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let body: any = {};

      // If "Access Code" tab is selected, do code-only login
      if (isCodeLogin) {
        if (!accessCode) {
          setError("Enter your access code");
          setLoading(false);
          return;
        }
        body = { adminCode: accessCode };
      } else {
        // Email + password login
        if (!email || !password) {
          setError("Email and password are required");
          setLoading(false);
          return;
        }
        body = { email, password, name };

        // If they also entered a code, send it along
        if (accessCode) {
          body.adminCode = accessCode;
        }
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.user) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12121a] text-white flex items-center justify-center p-6 selection:bg-[#c9a96e]/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.05),transparent_50%)] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-[#0a0a0f]/60 border-[#1e1e2a] backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-[#c9a96e]/10 flex items-center justify-center border border-[#c9a96e]/20 shadow-lg shadow-[#c9a96e]/5">
              <Camera className="h-8 w-8 text-[#c9a96e]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome to OnePost AI</CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your content dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {isCodeLogin ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-yellow-500/80 flex items-center gap-1.5 ml-1">
                    <Crown className="h-4 w-4" /> Access Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-yellow-500/40" />
                    <input
                      type="text"
                      placeholder="Enter your access code"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="w-full bg-yellow-500/5 border border-yellow-500/20 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/30 transition-all"
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-yellow-500/30 ml-1">Owner? Use AUREA2026 for CEO access</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCodeLogin(false)}
                  className="text-xs text-slate-500 hover:text-[#c9a96e] transition-colors"
                >
                  ← Sign in with email instead
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/50 transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-11 pr-11 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/50 transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Full Name <span className="text-slate-500">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 px-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e]/50 transition-all"
                  />
                </div>

                {/* Code field (hidden until clicked) */}
                {showCodeField && (
                  <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-xs font-medium text-yellow-500/60 flex items-center gap-1.5 ml-1">
                      <Crown className="h-3 w-3" /> Access / Promo / Discount Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="w-full bg-yellow-500/5 border border-yellow-500/20 rounded-xl py-2 px-4 text-sm text-white placeholder:text-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/30 transition-all"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCodeField(!showCodeField)}
                    className="text-xs text-slate-500 hover:text-[#c9a96e] transition-colors"
                  >
                    {showCodeField ? "− Hide code field" : "+ Have an access / promo / discount code?"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCodeLogin(true)}
                    className="text-xs text-yellow-500/50 hover:text-yellow-400 transition-colors"
                  >
                    CEO? Sign in with code
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="glow" 
              className="w-full py-6 rounded-xl font-bold text-base mt-2" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <>
                  Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>30-day money-back guarantee · Secure & Private</span>
          </div>
          <p className="text-xs text-slate-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>

      <div className="fixed bottom-8 left-0 right-0 text-center">
        <Link href="/" className="text-slate-500 hover:text-white text-sm transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}