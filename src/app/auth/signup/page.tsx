'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!name || !email || !password) {
        setError("All fields are required");
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="h-10 w-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white font-serif">One Post AI</span>
          </Link>
          <h1 className="text-3xl font-bold text-white font-serif">Create Your Account</h1>
          <p className="text-slate-400 mt-2">Start creating and publishing content</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters" className="w-full pl-10 pr-10 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} variant="primary" className="w-full py-3">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
            </p>
          </form>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}