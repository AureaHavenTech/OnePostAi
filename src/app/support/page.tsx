"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Ticket, MessageSquare, AlertCircle } from "lucide-react";

export default function SupportPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hey there! I'm your OnePost AI assistant. I can help you create content, set up campaigns, connect social accounts, and more. What do you need?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketMode, setTicketMode] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPriority, setTicketPriority] = useState("medium");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let reply = "";

      if (lower.includes("post") || lower.includes("publish") || lower.includes("social")) {
        reply = "To post content, head to the Dashboard and choose your mode — Upload Raw Content, AI Generate, or the Mission Control command bar. You'll get to pick which platforms (TikTok, Instagram, Facebook, YouTube, LinkedIn, Snapchat, Pinterest) and schedule when to publish. Want me to walk you through creating your first post?";
      } else if (lower.includes("shopify") || lower.includes("product") || lower.includes("store")) {
        reply = "The Shopify Page Creator is in the Dashboard under the Shopify mode. Tell me the product name, niche, and target price — I'll generate a complete product page with SEO-optimized title, conversion description, pricing, and images. Ready to create one?";
      } else if (lower.includes("avatar") || lower.includes("video") || lower.includes("film")) {
        reply = "AI Avatar mode lets you upload 3-5 photos of yourself. I'll build a digital twin that can appear in UGC-style videos — no camera needed. You can then tell me what you want your AI twin to say. Want to try it?";
      } else if (lower.includes("idea") || lower.includes("trend") || lower.includes("viral")) {
        reply = "The Content Idea Engine scans trending topics in your niche and hands you ready-to-post ideas with hooks, formats, and hashtag recommendations. Tell me your niche and I'll generate 10 viral-ready ideas for you!";
      } else if (lower.includes("profile") || lower.includes("photo") || lower.includes("picture") || lower.includes("upload")) {
        reply = "To upload your profile photo, go to the Owner Dashboard (if you're the founder) or Settings page. Click the Upload Photo button, select your image, and it'll be saved to your profile. If it's not working, try a JPG or PNG under 2MB.";
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
        reply = "Hey! 👋 Welcome to OnePost AI. I'm here to help you create amazing content. What would you like to do today? Post to social media? Create a Shopify page? Generate content ideas?";
      } else if (lower.includes("price") || lower.includes("cost") || lower.includes("trial") || lower.includes("plan")) {
        reply = "OnePost AI is $29/month flat rate — unlimited content, unlimited platforms. You get a 3-day free trial to try everything out. No credit card required to start. Want me to help you get set up?";
      } else if (lower.includes("ticket") || lower.includes("submit") || lower.includes("issue") || lower.includes("bug")) {
        reply = "Need to report a bug or issue? You can use the support ticket form below the chat — just click 'Submit a Ticket' and fill out the details. I'll help track it down!";
      } else if (lower.includes("help") || lower.includes("how") || lower.includes("what")) {
        reply = "I can help you with:\n\n📱 Posting to social media\n🛍️ Creating Shopify product pages\n🤖 Generating AI avatar videos\n💡 Finding content ideas\n📊 Researching trending products\n🔗 Connecting your social accounts\n\nWhat are you interested in?";
      } else {
        reply = "Great question! Let me help you with that. Could you give me a bit more detail so I can point you to exactly what you need? You can ask me about posting, Shopify, AI avatars, content ideas, market research, or account setup.";
      }

      setMessages(prev => [...prev, { role: "ai", text: reply }]);
      setLoading(false);
    }, 600);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSubmitted(true);
    setShowTicketForm(false);
    setTicketSubject("");
    setTicketMessage("");
    setTicketPriority("medium");
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] dark:bg-[#141416] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1c1c1e] dark:text-[#f5f0f1]">AI Support</h1>
          <p className="text-sm text-[#6b5a5e] dark:text-[#8a797d] mt-1">Available 24/7 — ask me anything about OnePost AI</p>
        </div>

        {/* Support Ticket Form */}
        <div className="mb-4">
          {!showTicketForm ? (
            <button
              onClick={() => setShowTicketForm(true)}
              className="w-full p-4 rounded-2xl border border-[#e0d5d8] dark:border-[#3d3537] bg-white dark:bg-[#1c1c1e] flex items-center gap-3 hover:bg-[#f5f0f1] dark:hover:bg-[#2a2426] transition-colors shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#c9a84c]" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm text-[#1c1c1e] dark:text-[#f5f0f1]">Submit a Support Ticket</p>
                <p className="text-xs text-[#6b5a5e] dark:text-[#8a797d]">Report bugs, request features, or ask for help</p>
              </div>
              <span className="ml-auto text-[#c9a84c] text-sm font-medium">Open →</span>
            </button>
          ) : (
            <div className="p-6 rounded-2xl border border-[#e0d5d8] dark:border-[#3d3537] bg-white dark:bg-[#1c1c1e] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1c1c1e] dark:text-[#f5f0f1] flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#c9a84c]" /> Submit a Ticket
                </h2>
                <button onClick={() => setShowTicketForm(false)} className="text-xs text-[#6b5a5e] hover:text-[#c9a84c] transition-colors">Cancel</button>
              </div>
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-[#6b5a5e] dark:text-[#8a797d] font-medium mb-1">Subject</label>
                  <Input
                    type="text"
                    value={ticketSubject}
                    onChange={e => setTicketSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="bg-[#f5f0f1] dark:bg-[#2a2426] border-0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6b5a5e] dark:text-[#8a797d] font-medium mb-1">Message</label>
                  <textarea
                    value={ticketMessage}
                    onChange={e => setTicketMessage(e.target.value)}
                    rows={4}
                    placeholder="Describe your issue in detail..."
                    className="w-full px-3 py-2 rounded-lg bg-[#f5f0f1] dark:bg-[#2a2426] border-0 text-sm resize-none outline-none text-[#1c1c1e] dark:text-[#f5f0f1]"
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-[#6b5a5e] dark:text-[#8a797d] font-medium">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={e => setTicketPriority(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#f5f0f1] dark:bg-[#2a2426] border-0 text-xs text-[#1c1c1e] dark:text-[#f5f0f1] outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <Button type="submit" variant="glow" size="sm" className="w-full">
                  <Send className="w-4 h-4 mr-1.5" /> Submit Ticket
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Confirmation toast */}
        {ticketSubmitted && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Ticket submitted! Our team will get back to you within 24 hours.
          </div>
        )}

        {/* AI Chat */}
        <div className="bg-white dark:bg-[#1c1c1e] border border-[#e0d5d8] dark:border-[#3d3537] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#e0d5d8] dark:border-[#3d3537] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d44a6a] to-[#eab308] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1c1c1e] dark:text-[#f5f0f1]">OnePost AI Assistant</p>
              <p className="text-xs text-[#6b5a5e] dark:text-[#8a797d]">Online • Powered by AI</p>
            </div>
            <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
            </span>
          </div>

          <div className="p-4 space-y-3 h-[320px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === "user" 
                      ? "bg-[#d44a6a]/20 text-[#d44a6a]" 
                      : "bg-[#eab308]/20 text-[#eab308]"
                  }`}>
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`p-3 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-[#d44a6a] text-white rounded-tr-none"
                      : "bg-[#f5f0f1] dark:bg-[#2a2426] text-[#1c1c1e] dark:text-[#f5f0f1] rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-[#eab308]/20 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-[#eab308]" />
                  </div>
                  <div className="p-3 rounded-xl bg-[#f5f0f1] dark:bg-[#2a2426] rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#d44a6a] animate-bounce" style={{ animationDelay: "0s" }} />
                      <div className="w-2 h-2 rounded-full bg-[#d44a6a] animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <div className="w-2 h-2 rounded-full bg-[#d44a6a] animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-[#e0d5d8] dark:border-[#3d3537]">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything about OnePost AI..."
                className="bg-[#f5f0f1] dark:bg-[#2a2426] border-0"
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <Button
                variant="glow"
                size="sm"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-[#8a797d] mt-2 text-center">
              I can help with posting, Shopify, AI avatars, ideas, research & more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}