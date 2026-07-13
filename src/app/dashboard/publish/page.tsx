"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, Check, AlertCircle, Clock, Send, ExternalLink, RefreshCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORM_MAP: Record<string, { label: string; icon: string; color: string }> = {
  tiktok: { label: "TikTok", icon: "♬", color: "text-pink-400" },
  instagram: { label: "Instagram", icon: "📸", color: "text-orange-400" },
  facebook: { label: "Facebook", icon: "👍", color: "text-blue-400" },
  youtube: { label: "YouTube", icon: "▶", color: "text-red-400" },
  linkedin: { label: "LinkedIn", icon: "💼", color: "text-blue-300" },
  snapchat: { label: "Snapchat", icon: "👻", color: "text-yellow-400" },
  pinterest: { label: "Pinterest", icon: "📌", color: "text-red-500" },
};

interface PublishableItem {
  id: string;
  content_id: string;
  platform: string;
  scheduled_at: string;
  status: string;
  optimal_score?: number;
  brand?: string;
  hook?: string;
}

export default function PublishPage() {
  const [items, setItems] = useState<PublishableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<Record<string, "idle" | "publishing" | "done" | "error">>({});
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedRes, contentRes] = await Promise.all([
        fetch("/api/schedule").then(r => r.json()),
        fetch("/api/content").then(r => r.json()),
      ]);
      const contentMap: Record<string, any> = {};
      (contentRes.data || []).forEach((c: any) => { contentMap[c.id] = c; });
      const merged = (schedRes.data || []).map((s: any) => ({
        ...s,
        brand: contentMap[s.content_id]?.brand || "Untitled",
        hook: contentMap[s.content_id]?.hook || "",
      }));
      setItems(merged);
    } catch (err) {
      setError("Failed to load scheduled posts. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const publishItem = async (item: PublishableItem) => {
    setPublishing(prev => ({ ...prev, [item.id]: "publishing" }));
    setError(null);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: item.platform,
          mediaUrl: `https://onepostai.vercel.app/content/${item.content_id}`,
          caption: item.hook || "Check this out!",
          title: item.brand || "New Post",
          hashtags: [],
        }),
      });
      if (!res.ok) throw new Error("Publish failed");
      setPublishing(prev => ({ ...prev, [item.id]: "done" }));
      setSuccessMsg(`✅ Published to ${PLATFORM_MAP[item.platform]?.label || item.platform}!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setPublishing(prev => ({ ...prev, [item.id]: "error" }));
      setError(`Failed to publish to ${item.platform}.`);
    }
  };

  const filtered = filter === "all" ? items : items.filter(i => i.status === filter);
  const pendingCount = items.filter(i => i.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">📤 Publish</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Review and publish your scheduled content to connected platforms.
          </p>
        </div>
        <Button variant="glow" size="sm" onClick={loadItems} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-1.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 rounded hover:bg-red-500/20 transition-colors">
            ✕
          </button>
        </div>
      )}

      {/* Stats bar */}
      {!loading && items.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-zinc-500 glass-card p-3">
          <span>Total: <strong className="text-zinc-300">{items.length}</strong></span>
          <span>Pending: <strong className="text-amber-400">{pendingCount}</strong></span>
          <span>Posted: <strong className="text-green-400">{items.filter(i => i.status === "posted").length}</strong></span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3">
        {["all", "pending", "posted", "failed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
              filter === f ? "bg-gold/10 text-gold" : "text-zinc-500 hover:text-zinc-300")}>
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="glass-card p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading scheduled posts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
            <Send className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">No {filter !== "all" ? filter : ""} posts to publish</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
            {filter === "pending" 
              ? "All your scheduled posts have been published. Great work!"
              : "Create and schedule content from the dashboard first, then come here to publish."}
          </p>
          <a href="/dashboard">
            <Button variant="glow" size="sm">➕ Create Content</Button>
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const p = PLATFORM_MAP[item.platform] || { label: item.platform, icon: "📱", color: "text-zinc-400" };
            const pubState = publishing[item.id] || "idle";
            const time = new Date(item.scheduled_at).toLocaleString();

            return (
              <div key={item.id} className={cn(
                "glass-card p-4 flex items-center gap-4 transition-all",
                pubState === "done" && "border-green-500/30 bg-green-500/5",
                pubState === "error" && "border-red-500/30 bg-red-500/5",
              )}>
                {/* Platform icon */}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", p.color, "bg-white/5")}>
                  {p.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-zinc-200">{item.brand || "Untitled"}</span>
                    <span className={cn("text-xs font-medium capitalize", p.color)}>{p.label}</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{item.hook || "No description"}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                    {item.optimal_score && (
                      <span>Score: {Math.round(item.optimal_score * 100)}%</span>
                    )}
                  </div>
                </div>

                {/* Status / Action */}
                <div className="flex items-center gap-2">
                  {item.status === "posted" ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <Check className="w-3.5 h-3.5" /> Posted
                    </span>
                  ) : pubState === "done" ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <Check className="w-3.5 h-3.5" /> Published
                    </span>
                  ) : pubState === "publishing" ? (
                    <Button variant="ghost" size="sm" disabled>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" /> Publishing...
                    </Button>
                  ) : pubState === "error" ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-400">Failed</span>
                      <Button variant="ghost" size="sm" onClick={() => publishItem(item)} className="text-xs">
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <Button variant="glow" size="sm" onClick={() => publishItem(item)} className="text-xs">
                      <Send className="w-3.5 h-3.5 mr-1" /> Publish
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}