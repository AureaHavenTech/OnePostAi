"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, TrendingUp, Zap, RefreshCw, Sparkles, Clock, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const ideaTemplates = [
  { icon: "🔥", title: "Hot Take", desc: "Share an unpopular opinion in your niche" },
  { icon: "📦", title: "Unboxing", desc: "Showcase a new product or haul" },
  { icon: "💰", title: "Money Talk", desc: "Breakdown of earnings or savings" },
  { icon: "📊", title: "Comparison", desc: "X vs Y — which is better?" },
  { icon: "🎯", title: "Tutorial", desc: "Step-by-step how-to guide" },
  { icon: "💡", title: "Life Hack", desc: "A tip that saves time or money" },
  { icon: "📖", title: "Storytime", desc: "Personal experience or journey" },
  { icon: "⭐", title: "Review", desc: "Honest product or service review" },
];

export default function IdeasPage() {
  const [niche, setNiche] = useState("");
  const [ideas, setIdeas] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generateIdeas = () => {
    if (!niche) return;
    setLoading(true);
    setTimeout(() => {
      setIdeas([
        `"Why I stopped using [competitor] and switched to ${niche}" — honest story`,
        `"3 things nobody tells you about ${niche} (I learned the hard way)"`,
        `"The $0 ${niche} hack that changed everything for me"`,
        `"I tried ${niche} for 30 days — here's what actually happened"`,
        `"Stop doing [common mistake] in ${niche} — do this instead"`,
        `"How I make money with ${niche} — full breakdown"`,
        `"The truth about ${niche} that nobody talks about"`,
        `"5 ways ${niche} makes my life easier (link in bio)"`,
        `"Day in the life using ${niche} — real results shown"`,
        `"${niche} for beginners: start here (save this post)"`,
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Content Idea Engine</h1>
        <p className="text-zinc-500 mt-1 text-sm">Never stare at a blank screen again. AI generates viral-ready ideas.</p>
      </div>

      {/* Idea Generator */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-200">What's your niche?</h3>
            <p className="text-xs text-zinc-500">Tell us what you post about and get ideas tailored to you.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="e.g., sleep products, tech reviews, mom life, fitness"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="flex-1"
          />
          <Button variant="glow" onClick={generateIdeas} disabled={!niche || loading}>
            {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Zap className="w-4 h-4 mr-2" /> Generate Ideas</>}
          </Button>
        </div>
      </div>

      {/* Trending Templates */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Trending Post Templates
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ideaTemplates.map((t) => (
            <button
              key={t.title}
              className="glass-card p-4 text-left hover:border-indigo-500/20 transition-all duration-200 group"
              onClick={() => {
                setNiche(t.title);
              }}
            >
              <span className="text-2xl">{t.icon}</span>
              <p className="text-sm font-medium text-zinc-200 mt-2 group-hover:text-indigo-300 transition-colors">{t.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Ideas */}
      {ideas && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-indigo-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Viral Ideas for &ldquo;{niche}&rdquo;
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setIdeas(null)}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              New Ideas
            </Button>
          </div>

          {ideas.map((idea, i) => (
            <div key={i} className="glass-card p-4 hover:border-indigo-500/20 transition-all cursor-pointer group">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-400 text-xs flex items-center justify-center font-medium shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors">{idea}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">High viral potential</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">Works for all platforms</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="text-xs">Use</Button>
                  <Link href="/dashboard">
                    <Button variant="glow" size="sm" className="text-xs">
                      Create <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-2">
            <Link href="/dashboard/calendar">
              <Button variant="outline" size="lg">
                <Clock className="w-4 h-4 mr-2" />
                Schedule All Ideas
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}