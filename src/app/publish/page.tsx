"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, CalendarClock, CheckCircle2, Loader2, ArrowLeft, Globe, Hash, Image } from "lucide-react";

const platforms = [
  { id: "instagram", name: "Instagram", icon: "📸" },
  { id: "tiktok", name: "TikTok", icon: "♬" },
  { id: "facebook", name: "Facebook", icon: "👍" },
  { id: "youtube", name: "YouTube", icon: "▶" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "pinterest", name: "Pinterest", icon: "📌" },
  { id: "twitter", name: "Twitter/X", icon: "🐦" },
];

export default function PublishPage() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [results, setResults] = useState<{platform:string;success:boolean;message:string}[]>([]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    setPublishing(true);
    setPublished(false);
    setResults([]);
    for (const platform of selectedPlatforms) {
      await new Promise(r => setTimeout(r, 800));
      setResults(prev => [...prev, { platform, success: true, message: "Published!" }]);
    }
    setPublishing(false);
    setPublished(true);
  };

  return (
    <div className="min-h-screen bg-[#12121a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[#1e1e2a] px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#d4b87a] flex items-center justify-center">
            <span className="text-sm font-black text-[#12121a]">OP</span>
          </div>
          <span className="font-bold text-white text-sm">Publish</span>
        </Link>
        <Link href="/dashboard"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Dashboard</Button></Link>
      </header>
      <main className="pt-28 pb-24 px-6 max-w-3xl mx-auto">
        <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-8 space-y-6">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}><Send className="h-6 w-6 text-[#c9a96e] inline mr-3" />Cross-Platform Publish</h1>
          <div>
            <label className="text-sm font-bold text-slate-300 mb-2 block">Content</label>
            <Textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Write your post content..."
              className="min-h-[100px] bg-[#12121a] border-[#1e1e2a] focus:border-[#c9a96e]/50" />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-300 mb-2 block">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(p => (
                <button key={p.id} onClick={() => togglePlatform(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedPlatforms.includes(p.id) ? "bg-[#c9a96e]/10 border-[#c9a96e]/30 text-[#c9a96e]" : "bg-[#12121a] border-[#1e1e2a] text-slate-500"
                  }`}>{p.icon} {p.name}</button>
              ))}
            </div>
          </div>
          <Button onClick={handlePublish} disabled={publishing || !content.trim()}
            className="w-full py-4 text-sm font-bold bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] text-[#12121a] rounded-xl shadow-lg shadow-[#c9a96e]/20 disabled:opacity-50">
            {publishing ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Publishing...</>
            : published ? <><CheckCircle2 className="h-5 w-5 text-emerald-600 mr-2" /> Published!</>
            : <><Send className="h-5 w-5 mr-2" /> Publish Now</>}
          </Button>
          {results.length > 0 && (
            <div className="bg-[#12121a] border border-[#1e1e2a] rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-bold text-slate-300">Results</h3>
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={r.success ? "text-emerald-400" : "text-amber-400"}>{r.success ? "✓" : "⏳"}</span>
                  <span className="font-bold text-slate-300">{r.platform}</span>
                  <span className="text-slate-500">{r.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="border-t border-[#1e1e2a] py-8 px-6 text-center text-sm text-slate-500">
        <p>&copy; 2026 Aura Haven Tech. All rights reserved.</p>
      </footer>
    </div>
  );
}
