'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/ui/footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = { name: formData.get('name') as string, email: formData.get('email') as string, message: formData.get('message') as string };
    await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => {});
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-serif">One Post AI</span>
        </Link>
        <Link href="/dashboard"><Button variant="primary" size="sm">Dashboard</Button></Link>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 font-serif">Contact Us</h1>
          <p className="text-slate-400 text-lg">We&apos;d love to hear from you</p>
        </div>

        {submitted ? (
          <Card className="p-10 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2 font-serif">Message Sent!</h2>
            <p className="text-slate-400">We&apos;ll get back to you within 24 hours.</p>
            <Link href="/" className="mt-6 inline-block"><Button variant="primary">Back Home</Button></Link>
          </Card>
        ) : (
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input name="name" required className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input name="email" type="email" required className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea name="message" required rows={5} className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none" placeholder="How can we help?" />
              </div>
              <Button type="submit" disabled={loading} variant="primary" className="w-full py-3">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}