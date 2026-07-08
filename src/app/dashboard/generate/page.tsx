"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Hash, Image, FileText, Loader2, Copy, Check, Wand2 } from "lucide-react";
import Link from "next/link";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("captions");
  const [generatedContent, setGeneratedContent] = useState<{type:string;content:string}[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number|null>(null);

  const generateContent = async (type: string) => {
    if (!prompt.trim()) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    const results: {type:string;content:string}[] = [];
    if (type === "captions") {
      results.push({ type:"caption", content:`✨ ${prompt} — The game changer you needed!\n\nDouble tap if you agree! ❤️` });
      results.push({ type:"caption", content:`Stop scrolling. ${prompt} changes everything. 🚀` });
      results.push({ type:"caption", content:`I tried ${prompt} so you don't have to... I'm SHOOK 😱` });
    } else if (type === "hashtags") {
      results.push({ type:"hashtags", content:`#${prompt.replace(/\s/g,'')} #viral #trending #fyp #contentcreator #marketing` });
      results.push({ type:"hashtags", content:`#${prompt.replace(/\s/g,'')} #explore #viralvideo #digitalmarketing` });
    } else if (type === "ads") {
      results.push({ type:"ad", content:`Headline: Transform Your Life with ${prompt}\n\nBody: Tired of the same old results? Join 10,000+ happy customers.\n\nCTA: Get Started Today →` });
    } else if (type === "ideas") {
      results.push({ type:"idea", content:`📱 "5 Things I Wish I Knew Before Trying ${prompt}"` });
      results.push({ type:"idea", content:`🎥 "${prompt} Changed My Life in 30 Days"` });
    }
    setGeneratedContent(results);
    setGenerating(false);
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const tabs = [
    { id:"captions", label:"Captions", icon:FileText },
    { id:"hashtags", label:"Hashtags", icon:Hash },
    { id:"ads", label:"Ad Copies", icon:Wand2 },
    { id:"ideas", label:"Ideas", icon:Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#12121a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[#1e1e2a] px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#d4b87a] flex items-center justify-center">
            <span className="text-sm font-black text-[#12121a]">OP</span>
          </div>
          <span className="font-bold text-white text-sm">AI Generate</span>
        </Link>
      </header>
      <main className="pt-24 pb-24 px-6 max-w-4xl mx-auto">
        <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-6 mb-6">
          <h1 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <Sparkles className="h-5 w-5 text-[#c9a96e] inline mr-2" />AI Content Generator
          </h1>
          <p className="text-sm text-slate-400 mb-4">Describe your idea and AI creates content for you</p>
          <Textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="e.g., A new eco-friendly water bottle..."
            className="min-h-[80px] bg-[#12121a] border-[#1e1e2a] focus:border-[#c9a96e]/50" />
        </div>

        <div className="flex gap-1 mb-6 bg-[#0a0a0f]/60 border border-[#1e1e2a] rounded-xl p-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setGeneratedContent([]); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-[#c9a96e]/10 text-[#c9a96e]" : "text-slate-400 hover:text-white"
                }`}>
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        <Button onClick={() => generateContent(activeTab)} disabled={generating || !prompt.trim()}
          className="mb-6 bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] text-[#12121a] font-bold rounded-xl shadow-lg shadow-[#c9a96e]/20">
          {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
          : <><Sparkles className="h-4 w-4 mr-2" /> Generate {activeTab}</>}
        </Button>

        <div className="space-y-3">
          {generatedContent.filter(g => {
            if (activeTab === "captions") return g.type === "caption";
            if (activeTab === "hashtags") return g.type === "hashtags";
            if (activeTab === "ads") return g.type === "ad";
            if (activeTab === "ideas") return g.type === "idea";
            return false;
          }).map((item, i) => (
            <div key={i} className="bg-[#0a0a0f]/40 border border-[#1e1e2a] hover:border-[#c9a96e]/20 rounded-xl p-4 transition-all">
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{item.content}</p>
              <Button variant="ghost" size="sm" onClick={() => copyText(item.content, i)}
                className="mt-2 text-[#c9a96e] hover:text-[#d4b87a]">
                {copiedIndex === i ? <><Check className="h-3.5 w-3.5 mr-1" /> Copied</> : <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>}
              </Button>
            </div>
          ))}
          {!generating && generatedContent.filter(g => {
            if (activeTab === "captions") return g.type === "caption";
            if (activeTab === "hashtags") return g.type === "hashtags";
            if (activeTab === "ads") return g.type === "ad";
            if (activeTab === "ideas") return g.type === "idea";
            return false;
          }).length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">Enter a topic and click generate</p>
          )}
        </div>
      </main>
    </div>
  );
}
