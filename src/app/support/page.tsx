"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageCircle, Bot, Send, Zap } from "lucide-react";

export default function SupportPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hey! I'm OnePost AI Support. How can I help you today? I can answer questions about posting, Shopify, account setup, or anything else." },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: input }]);
    const userInput = input;
    setInput("");

    setTimeout(() => {
      const responses: Record<string, string> = {
        "post": "To post content, go to the Dashboard and either upload a video, use AI Generate, or type a command in Mission Control. You'll be asked which platforms to post to.",
        "shopify": "To create a Shopify product page, use the Shopify mode in the Dashboard. Enter the product name, niche, and price — AI builds the complete page with SEO and images.",
        "account": "Connect your social accounts in Settings > Social API Connections. One-time OAuth setup for TikTok, Instagram, Facebook, YouTube, LinkedIn, Snapchat, and Pinterest.",
        "avatar": "Upload 3-5 photos of yourself in AI Avatar mode. AI creates a digital twin that can appear in UGC videos — no filming needed.",
        "affiliate": "Our Ambassador Program gives you 10% lifetime commission on referrals. Sign up in Settings > Affiliate Program to get your unique link.",
        "auto exec": "Auto Exec and OnePost AI work together. Auto Exec runs your dropshipping billing 24/7, OnePost AI creates and publishes your marketing. Check out autoexec.app for more info.",
      };

      const found = Object.entries(responses).find(([key]) => userInput.toLowerCase().includes(key));
      const reply = found ? found[1] : "I can help with posting, Shopify pages, account setup, AI avatars, the affiliate program, and more. Could you tell me more about what you need?";
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>

        <div className="mt-8 glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center"><Bot className="w-5 h-5 text-indigo-400" /></div>
            <div><h2 className="font-semibold text-zinc-200 text-sm">AI Support</h2><p className="text-xs text-zinc-500">Available 24/7</p></div>
          </div>

          <div className="p-4 space-y-3 h-[400px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === "user" 
                    ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-200" 
                    : "bg-zinc-900/60 border border-white/5 text-zinc-300"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <Input value={input} onChange={e => setInput(e.target.value)} 
                placeholder="Ask anything..." className="bg-zinc-900/60"
                onKeyDown={e => e.key === "Enter" && sendMessage()} />
              <Button variant="glow" size="sm" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}