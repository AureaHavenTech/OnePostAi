"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Send, Image, Hash, CalendarClock, CheckCircle2, Loader2, Globe, Copy, Check } from "lucide-react";
import Link from "next/link";

const platforms = [
  { id: "instagram", name: "Instagram", icon: "📸" },
  { id: "tiktok", name: "TikTok", icon: "♬" },
  { id: "facebook", name: "Facebook", icon: "👍" },
  { id: "youtube", name: "YouTube", icon: "▶" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "pinterest", name: "Pinterest", icon: "📌" },
  { id: "twitter", name: "Twitter/X", icon: "🐦" },
];

export default function CreatePage() {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [history, setHistory] = useState<{id:number;content:string;platforms:string[];status:string;date:string}[]>([]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    setPublishing(true);
    await new Promise(r => setTimeout(r, 2000));
    const now = new Date().toLocaleDateString();
    setHistory(prev => [{ id: Date.now(), content: content.slice(0,40)+"...", platforms: [...selectedPlatforms], status: "published", date: now }, ...prev]);
    setPublishing(false);
    setPublished(true);
    setContent(""); setMediaUrl(""); setHashtags("");
    setTimeout(() => setPublished(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#12121a] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-[#1e1e2a] px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#d4b87a] flex items-center justify-center">
            <span className="text-sm font-black text-[#12121a]">OP</span>
          </div>
          <span className="font-bold text-white text-sm">Create & Post</span>
        </Link>
      </header>
      <main className="pt-24 pb-24 px-6 max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-6 space-y-5">
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                <Sparkles className="h-5 w-5 text-[#c9a96e] inline mr-2" />Create Post
              </h1>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Content</label>
                <Textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder="What do you want to share?"
                  className="min-h-[100px] bg-[#12121a] border-[#1e1e2a] focus:border-[#c9a96e]/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block"><Image className="h-3 w-3 inline mr-1" /> Media URL</label>
                <Input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://example.com/image.jpg"
                  className="bg-[#12121a] border-[#1e1e2a] focus:border-[#c9a96e]/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block"><Hash className="h-3 w-3 inline mr-1" /> Hashtags</label>
                <Input value={hashtags} onChange={e => setHashtags(e.target.value)} placeholder="viral, trending, content"
                  className="bg-[#12121a] border-[#1e1e2a] focus:border-[#c9a96e]/50" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block"><Globe className="h-3 w-3 inline mr-1" /> Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <button key={p.id} onClick={() => togglePlatform(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        selectedPlatforms.includes(p.id) ? "bg-[#c9a96e]/10 border-[#c9a96e]/30 text-[#c9a96e]" : "bg-[#12121a] border-[#1e1e2a] text-slate-500"
                      }`}>{p.icon} {p.name}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handlePublish} disabled={publishing || !content.trim()}
                className="w-full py-4 bg-gradient-to-r from-[#c9a96e] to-[#d4b87a] text-[#12121a] font-bold rounded-xl shadow-lg shadow-[#c9a96e]/20 disabled:opacity-50">
                {publishing ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Publishing...</>
                : published ? <><CheckCircle2 className="h-5 w-5 text-emerald-600 mr-2" /> Posted!</>
                : <><Send className="h-5 w-5 mr-2" /> Publish</>}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Quick Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Published</span><span className="text-emerald-400 font-bold">{history.filter(h=>h.status==="published").length}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Scheduled</span><span className="text-[#c9a96e] font-bold">{history.filter(h=>h.status==="scheduled").length}</span></div>
              </div>
            </div>
            {history.length > 0 && (
              <div className="bg-[#0a0a0f]/40 border border-[#1e1e2a] rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">Post History</h3>
                <div className="space-y-2">
                  {history.map(h => (
                    <div key={h.id} className="p-2 rounded-lg bg-[#12121a] border border-[#1e1e2a]">
                      <p className="text-xs text-slate-300 truncate">{h.content}</p>
                      <span className="text-[9px] text-emerald-400">{h.status} · {h.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
