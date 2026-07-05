"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Send, Loader2, CheckCircle2, XCircle, Clock, 
  Globe, Hash, CalendarDays, Image, Link2, AlertCircle,
  Instagram, Youtube, Music, Linkedin, MessageCircle, 
  Eye, EyeOff, FileText, RefreshCw, CheckSquare, Square
} from "lucide-react";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", color: "hover:border-pink-500/50 hover:bg-pink-500/5" },
  { id: "facebook", label: "Facebook", icon: "👍", color: "hover:border-blue-500/50 hover:bg-blue-500/5" },
  { id: "tiktok", label: "TikTok", icon: "♬", color: "hover:border-pink-400/50 hover:bg-pink-400/5" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "hover:border-red-500/50 hover:bg-red-500/5" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "hover:border-blue-400/50 hover:bg-blue-400/5" },
  { id: "pinterest", label: "Pinterest", icon: "📌", color: "hover:border-red-600/50 hover:bg-red-600/5" },
  { id: "twitter", label: "Twitter/X", icon: "🐦", color: "hover:border-sky-500/50 hover:bg-sky-500/5" },
  { id: "threads", label: "Threads", icon: "🧵", color: "hover:border-gray-400/50 hover:bg-gray-400/5" },
  { id: "bluesky", label: "Bluesky", icon: "🦋", color: "hover:border-blue-300/50 hover:bg-blue-300/5" },
  { id: "reddit", label: "Reddit", icon: "🤖", color: "hover:border-orange-500/50 hover:bg-orange-500/5" },
];

interface Post {
  id: string;
  platform: string;
  content: string;
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledFor?: string;
  publishedAt?: string;
  url?: string;
}

export default function CreatePage() {
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "tiktok"]);
  const [scheduleMode, setScheduleMode] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<Record<string, string>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [mode, setMode] = useState("demo");
  const [error, setError] = useState("");

  // Fetch post history on load
  useEffect(() => {
    fetchPosts();
    fetchMode();
  }, []);

  const fetchMode = async () => {
    try {
      const res = await fetch("/api/publish");
      const data = await res.json();
      if (data.mode) setMode(data.mode);
    } catch {}
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch {}
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    if (!caption.trim()) {
      setError("Please enter post content");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setError("Select at least one platform");
      return;
    }
    if (scheduleMode === "later" && (!scheduleDate || !scheduleTime)) {
      setError("Set a schedule date and time");
      return;
    }

    setError("");
    setPublishing(true);
    const hashtagArray = hashtags.split(/[,\s]+/).filter(h => h.trim());
    const scheduledFor = scheduleMode === "later" 
      ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      : undefined;

    // Publish to each selected platform
    for (const platform of selectedPlatforms) {
      setPublishProgress(prev => ({ ...prev, [platform]: "publishing..." }));

      try {
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform,
            caption: caption.trim(),
            mediaUrl: mediaUrl || undefined,
            title: caption.trim().substring(0, 100),
            hashtags: hashtagArray,
            scheduledFor,
          }),
        });

        const result = await res.json();
        
        if (result.success) {
          setPublishProgress(prev => ({ ...prev, [platform]: "done" }));
          
          // Save post to history
          await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: caption.trim().substring(0, 50),
              content: caption.trim(),
              platform,
              status: scheduledFor ? "scheduled" : "published",
              scheduled_for: scheduledFor,
            }),
          });
        } else {
          setPublishProgress(prev => ({ ...prev, [platform]: "failed" }));
        }
      } catch {
        setPublishProgress(prev => ({ ...prev, [platform]: "failed" }));
      }
    }

    // Wait a moment, then refresh
    setTimeout(() => {
      setPublishing(false);
      setPublishProgress({});
      if (scheduleMode !== "later") {
        setCaption("");
        setMediaUrl("");
        setHashtags("");
      }
      fetchPosts();
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Published</Badge>;
      case "scheduled": return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case "draft": return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      case "failed": return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-gold" />
            Create & Post
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Write once, publish everywhere
          </p>
        </div>
        <Badge className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold ${
          mode === "production" 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}>
          {mode === "production" ? "🔴 Live" : "🟡 Demo Mode"}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Post Creator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Input */}
          <div className="bg-white/80 backdrop-blur-xl border border-gold/10 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-dark mb-3">
              Post Content
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your post caption here... OnePost AI will optimize it for each platform."
              rows={5}
              className="w-full bg-cream/50 text-dark placeholder-gray-400 resize-none outline-none border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/40 transition-colors"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-gray-400">{caption.length} characters</span>
            </div>
          </div>

          {/* Media URL */}
          <div className="bg-white/80 backdrop-blur-xl border border-gold/10 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-dark mb-3 flex items-center gap-2">
              <Image className="h-4 w-4 text-gold" />
              Media URL (optional)
            </label>
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-... or upload from device"
              className="w-full bg-cream/50 text-dark placeholder-gray-400 outline-none border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/40 transition-colors"
            />
          </div>

          {/* Hashtags */}
          <div className="bg-white/80 backdrop-blur-xl border border-gold/10 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-dark mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4 text-gold" />
              Hashtags (comma separated)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="viral, trending, summer2026, aurahaven"
              className="w-full bg-cream/50 text-dark placeholder-gray-400 outline-none border border-gold/10 rounded-xl px-4 py-3 text-sm focus:border-gold/40 transition-colors"
            />
          </div>

          {/* Platform Selector */}
          <div className="bg-white/80 backdrop-blur-xl border border-gold/10 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-dark mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-gold" />
              Platforms ({selectedPlatforms.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    selectedPlatforms.includes(p.id)
                      ? "bg-gold/10 border-gold/30 text-gold"
                      : "bg-cream/50 border-gold/5 text-gray-400 hover:text-dark hover:border-gold/20"
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span>{p.label}</span>
                  {selectedPlatforms.includes(p.id) && (
                    <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-gold" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white/80 backdrop-blur-xl border border-gold/10 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-medium text-dark mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gold" />
              Schedule
            </label>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setScheduleMode("now")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  scheduleMode === "now"
                    ? "bg-gold/10 border-gold/30 text-gold"
                    : "bg-cream/50 border-gold/5 text-gray-400"
                }`}
              >
                <Send className="h-3.5 w-3.5 inline mr-1.5" />
                Publish Now
              </button>
              <button
                onClick={() => setScheduleMode("later")}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  scheduleMode === "later"
                    ? "bg-gold/10 border-gold/30 text-gold"
                    : "bg-cream/50 border-gold/5 text-gray-400"
                }`}
              >
                <Clock className="h-3.5 w-3.5 inline mr-1.5" />
                Schedule Later
              </button>
            </div>
            {scheduleMode === "later" && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="bg-cream/50 text-dark border border-gold/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold/40 outline-none"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-cream/50 text-dark border border-gold/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold/40 outline-none"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={publishing || !caption.trim() || selectedPlatforms.length === 0}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-light text-white hover:shadow-lg hover:shadow-gold/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {publishing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Publishing to {selectedPlatforms.length} platform(s)...
              </>
            ) : scheduleMode === "later" ? (
              <>
                <CalendarDays className="h-5 w-5" />
                Schedule Post to {selectedPlatforms.length} Platform(s)
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
              </>
            )}
          </button>

          {/* Publish Progress */}
          {Object.keys(publishProgress).length > 0 && (
            <div className="bg-white/80 backdrop-blur-xl border border-gold/10 rounded-2xl p-5 shadow-sm space-y-3">
              <p className="text-xs font-semibold text-dark">Publishing Status</p>
              {Object.entries(publishProgress).map(([platform, status]) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-base">{PLATFORMS.find(p => p.id === platform)?.icon}</span>
                    <span className="text-dark font-medium capitalize">{platform}</span>
                  </div>
                  {status === "publishing..." ? (
                    <div className="flex items-center gap-1.5 text-amber-500 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Publishing...
                    </div>
                  ) : status === "done" ? (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Published
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-500 text-xs">
                      <XCircle className="h-3 w-3" />
                      Failed
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Demo Mode Banner */}
          {mode === "demo" && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-400">🟡 Demo Mode</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Posts are simulated. To publish to real social platforms, set{" "}
                    <code className="text-gold bg-gold/10 px-1 rounded">NEXT_PUBLIC_SOCIAL_API_MODE=production</code> 
                    {" "}and add your API keys.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Post History Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-dark flex items-center gap-2">
              <FileText className="h-4 w-4 text-gold" />
              Post History
            </h2>
            <button onClick={() => setShowHistory(!showHistory)} className="text-gold text-xs hover:underline">
              {showHistory ? "Hide" : "Show"}
            </button>
          </div>

          {showHistory && (
            <div className="bg-white/80 backdrop-blur-xl border border-gold/10 rounded-2xl shadow-sm divide-y divide-gold/5 max-h-[600px] overflow-y-auto">
              {posts.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No posts yet</p>
                  <p className="text-[10px] text-gray-300 mt-1">Your published posts will appear here</p>
                </div>
              ) : (
                posts.slice(0, 20).map((post, idx) => {
                  const platform = PLATFORMS.find(p => p.id === post.platform);
                  return (
                    <div key={post.id || idx} className="p-4 hover:bg-gold/5 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{platform?.icon || "📝"}</span>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            {post.platform}
                          </span>
                        </div>
                        {getStatusBadge(post.status)}
                      </div>
                      <p className="text-[11px] text-dark line-clamp-2 leading-relaxed">
                        {post.content?.substring(0, 120) || "No content"}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {post.scheduledFor && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(post.scheduledFor).toLocaleDateString()}
                          </span>
                        )}
                        {post.publishedAt && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white/80 backdrop-blur-xl border border-gold/10 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-dark mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cream/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gold">{posts.filter(p => p.status === "published").length}</p>
                <p className="text-[10px] text-gray-400">Published</p>
              </div>
              <div className="bg-cream/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gold">{posts.filter(p => p.status === "scheduled").length}</p>
                <p className="text-[10px] text-gray-400">Scheduled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
