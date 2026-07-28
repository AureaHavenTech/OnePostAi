"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Globe, Loader2, Check, AlertCircle, Clock, Send, ExternalLink,
  RefreshCw, Filter, ToggleLeft, ToggleRight, Eye, Image, Video,
  ChevronDown, Users, Zap, X, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────
type PlatformKey = "tiktok" | "instagram" | "facebook" | "youtube" | "linkedin" | "snapchat" | "pinterest";

interface PlatformAccount {
  key: PlatformKey;
  name: string;
  icon: string;
  color: string;
  bgClass: string;
  connected: boolean;
  username: string;
  followers: string;
}

interface ScheduledPost {
  id: string;
  content_id: string;
  platform: PlatformKey;
  scheduled_at: string;
  status: string;
  optimal_score?: number;
  brand?: string;
  hook?: string;
  content?: string;
  mediaType?: "image" | "video";
  perPlatform: Record<PlatformKey, { status: "idle" | "publishing" | "done" | "error"; postUrl?: string; error?: string }>;
}

const PLATFORM_ACCOUNTS: PlatformAccount[] = [
  { key: "tiktok", name: "TikTok", icon: "♬", color: "text-[#ff0050]", bgClass: "bg-[#ff0050]/10 border-[#ff0050]/20", connected: true, username: "@mellow.sleep", followers: "12.4K" },
  { key: "instagram", name: "Instagram", icon: "📸", color: "text-[#e1306c]", bgClass: "bg-[#e1306c]/10 border-[#e1306c]/20", connected: true, username: "@mellow.sleep", followers: "8.9K" },
  { key: "facebook", name: "Facebook", icon: "👍", color: "text-[#1877f2]", bgClass: "bg-[#1877f2]/10 border-[#1877f2]/20", connected: true, username: "Mellow Sleep", followers: "5.2K" },
  { key: "youtube", name: "YouTube", icon: "▶", color: "text-[#ff0000]", bgClass: "bg-[#ff0000]/10 border-[#ff0000]/20", connected: false, username: "", followers: "" },
  { key: "linkedin", name: "LinkedIn", icon: "💼", color: "text-[#0a66c2]", bgClass: "bg-[#0a66c2]/10 border-[#0a66c2]/20", connected: false, username: "", followers: "" },
  { key: "snapchat", name: "Snapchat", icon: "👻", color: "text-[#fffc00]", bgClass: "bg-[#fffc00]/10 border-[#fffc00]/20", connected: false, username: "", followers: "" },
  { key: "pinterest", name: "Pinterest", icon: "📌", color: "text-[#e60023]", bgClass: "bg-[#e60023]/10 border-[#e60023]/20", connected: true, username: "@mellowsleep", followers: "3.1K" },
];

const MOCK_SCHEDULE: ScheduledPost[] = [
  {
    id: "sched-001", content_id: "c-001", platform: "tiktok", scheduled_at: "2026-07-10T09:00:00Z", status: "pending", optimal_score: 0.92,
    brand: "Mellow Sleep", hook: "POV: You finally found sleep gummies that work", content: "Your bedtime ritual starts here. Melatonin-free, 100% natural. 🌙✨ #MellowSleep #SleepWell",
    mediaType: "video", perPlatform: { tiktok: { status: "idle" }, instagram: { status: "idle" }, facebook: { status: "idle" }, youtube: { status: "idle" }, linkedin: { status: "idle" }, snapchat: { status: "idle" }, pinterest: { status: "idle" } }
  },
  {
    id: "sched-002", content_id: "c-002", platform: "instagram", scheduled_at: "2026-07-10T17:00:00Z", status: "pending", optimal_score: 0.85,
    brand: "Mellow Sleep", hook: "Behind the brand: natural ingredients", content: "We source the purest botanicals for the best sleep of your life. Here's how we do it. 🌿",
    mediaType: "image", perPlatform: { tiktok: { status: "idle" }, instagram: { status: "idle" }, facebook: { status: "idle" }, youtube: { status: "idle" }, linkedin: { status: "idle" }, snapchat: { status: "idle" }, pinterest: { status: "idle" } }
  },
  {
    id: "sched-003", content_id: "c-003", platform: "facebook", scheduled_at: "2026-07-11T08:00:00Z", status: "pending", optimal_score: 0.78,
    brand: "Mellow Sleep", hook: "10,000 happy sleepers can't be wrong", content: "Join the community that switched to Mellow Sleep. Wake up refreshed, every single morning. ☀️",
    mediaType: "video", perPlatform: { tiktok: { status: "idle" }, instagram: { status: "idle" }, facebook: { status: "idle" }, youtube: { status: "idle" }, linkedin: { status: "idle" }, snapchat: { status: "idle" }, pinterest: { status: "idle" } }
  },
  {
    id: "sched-004", content_id: "c-004", platform: "pinterest", scheduled_at: "2026-07-11T14:00:00Z", status: "posted", optimal_score: 0.91,
    brand: "Mellow Sleep", hook: "Bedroom aesthetic with Mellow Sleep", content: "Transform your bedtime into a luxury ritual. Pin your dream sleep setup. 🛏️✨",
    mediaType: "image", perPlatform: { tiktok: { status: "idle" }, instagram: { status: "idle" }, facebook: { status: "idle" }, youtube: { status: "idle" }, linkedin: { status: "idle" }, snapchat: { status: "idle" }, pinterest: { status: "done", postUrl: "https://pinterest.com/pin/mock-004" } }
  },
];

// ── Helpers ────────────────────────────────────────────────
function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  });
}

// ── Component ──────────────────────────────────────────────
export default function PublishPage() {
  // Connected accounts
  const [accounts, setAccounts] = useState<PlatformAccount[]>(PLATFORM_ACCOUNTS);

  // Posts (from API or mock)
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selection state
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PlatformKey>>(new Set());

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishAll, setIsPublishAll] = useState(false);

  // UI state
  const [filter, setFilter] = useState<string>("all");
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Load posts ──────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
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
        content: contentMap[s.content_id]?.content || "",
        mediaType: (contentMap[s.content_id]?.mediaType as "image" | "video") || "image",
        perPlatform: Object.fromEntries(
          PLATFORM_ACCOUNTS.map(a => [a.key, { status: "idle" as const }])
        ) as ScheduledPost["perPlatform"],
      }));
      setPosts(merged.length > 0 ? merged : MOCK_SCHEDULE);
    } catch {
      setPosts(MOCK_SCHEDULE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // ── Select post ─────────────────────────────────────────
  const selectPost = (post: ScheduledPost) => {
    setSelectedPostId(post.id);
    setShowPreview(false);
    // Default: select all connected platforms that match this post's platform
    const defaults = new Set<PlatformKey>();
    accounts.filter(a => a.connected).forEach(a => defaults.add(a.key));
    // Also ensure the post's original platform is selected
    defaults.add(post.platform);
    setSelectedPlatforms(defaults);
  };

  const selectedPost = posts.find(p => p.id === selectedPostId) || null;

  // ── Toggle platform for current post ────────────────────
  const togglePlatform = (key: PlatformKey) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // ── Toggle account connection ───────────────────────────
  const toggleAccountConnection = (key: PlatformKey) => {
    setAccounts(prev => prev.map(a =>
      a.key === key ? { ...a, connected: !a.connected, username: !a.connected ? `@user_${key}` : a.username } : a
    ));
  };

  // ── Publish single post ─────────────────────────────────
  const publishSelected = async () => {
    if (!selectedPost || selectedPlatforms.size === 0) {
      setToast({ type: "error", message: "Select at least one platform to publish." });
      return;
    }

    setIsPublishing(true);
    setIsPublishAll(false);
    setToast(null);

    // Mark post as publishing
    setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, status: "publishing" } : p));

    for (const platform of selectedPlatforms) {
      // Update per-platform to publishing
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? {
        ...p, perPlatform: { ...p.perPlatform, [platform]: { status: "publishing" as const } }
      } : p));

      // Simulate API call
      await new Promise(r => setTimeout(r, 700 + Math.random() * 1000));
      const success = Math.random() > 0.08;

      setPosts(prev => prev.map(p => p.id === selectedPost.id ? {
        ...p, perPlatform: {
          ...p.perPlatform, [platform]: {
            status: success ? "done" as const : "error" as const,
            postUrl: success ? `https://${platform}.com/post/mock-${Date.now()}` : undefined,
            error: success ? undefined : "Publish failed. Try again.",
          }
        }
      } : p));
    }

    // Check if all succeeded
    const allDone = Array.from(selectedPlatforms).every(platform => {
      const post = posts.find(p => p.id === selectedPost.id);
      return post?.perPlatform[platform]?.status === "done";
    });

    setPosts(prev => prev.map(p => p.id === selectedPost.id ? {
      ...p, status: allDone ? "posted" : "failed"
    } : p));

    setIsPublishing(false);
    setToast({
      type: allDone ? "success" : "error",
      message: allDone
        ? `Published to ${selectedPlatforms.size} platform${selectedPlatforms.size > 1 ? "s" : ""}! 🎉`
        : "Some platforms failed. Check details below."
    });
  };

  // ── Publish All ─────────────────────────────────────────
  const publishAll = async () => {
    const pending = posts.filter(p => p.status === "pending" || p.status === "failed");
    if (pending.length === 0) {
      setToast({ type: "error", message: "No pending posts to publish." });
      return;
    }

    setIsPublishing(true);
    setIsPublishAll(true);
    setToast(null);

    let totalPlatforms = 0;
    let successCount = 0;

    for (const post of pending) {
      const platforms = accounts.filter(a => a.connected).map(a => a.key);
      if (platforms.length === 0) continue;

      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: "publishing" } : p));

      for (const platform of platforms) {
        totalPlatforms++;
        setPosts(prev => prev.map(p => p.id === post.id ? {
          ...p, perPlatform: { ...p.perPlatform, [platform]: { status: "publishing" as const } }
        } : p));

        await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
        const success = Math.random() > 0.08;
        if (success) successCount++;

        setPosts(prev => prev.map(p => p.id === post.id ? {
          ...p, perPlatform: {
            ...p.perPlatform, [platform]: {
              status: success ? "done" as const : "error" as const,
              postUrl: success ? `https://${platform}.com/post/mock-${Date.now()}` : undefined,
              error: success ? undefined : "Failed",
            }
          }
        } : p));
      }

      const allDone = platforms.every(pf => {
        const p = posts.find(pp => pp.id === post.id);
        return p?.perPlatform[pf]?.status === "done";
      });
      setPosts(prev => prev.map(p => p.id === post.id ? {
        ...p, status: allDone ? "posted" : "failed"
      } : p));
    }

    setIsPublishing(false);
    setIsPublishAll(false);
    setSelectedPostId(null);
    setSelectedPlatforms(new Set());
    setToast({
      type: "success",
      message: `Published ${successCount}/${totalPlatforms} across ${pending.length} post${pending.length > 1 ? "s" : ""}! 🚀`
    });
  };

  // ── Refresh ─────────────────────────────────────────────
  const refresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  // ── Toast auto-dismiss ──────────────────────────────────
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Derived data ────────────────────────────────────────
  const connectedCount = accounts.filter(a => a.connected).length;
  const pendingCount = posts.filter(p => p.status === "pending").length;
  const postedCount = posts.filter(p => p.status === "posted").length;
  const failedCount = posts.filter(p => p.status === "failed").length;

  const filteredPosts = filter === "all"
    ? posts
    : posts.filter(p => p.status === filter);

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Toast ─────────────────────────────────────── */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-slideUp backdrop-blur-md",
          toast.type === "success" ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-700" : "bg-red-500/20 border border-red-500/30 text-red-700"
        )}>
          {toast.type === "success" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark font-playfair">Publish</h1>
          <p className="text-sm text-charcoal/60 mt-1">Multi-platform publishing command center</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={cn("w-4 h-4 mr-1.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="glow" size="sm" onClick={publishAll} disabled={isPublishing || pendingCount === 0}>
            {isPublishing && isPublishAll ? (
              <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Publishing All...</>
            ) : (
              <><Zap className="w-4 h-4 mr-1.5" /> Publish All ({pendingCount})</>
            )}
          </Button>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", count: posts.length, color: "text-dark" },
          { label: "Pending", count: pendingCount, color: "text-amber-600" },
          { label: "Published", count: postedCount, color: "text-emerald-600" },
          { label: "Failed", count: failedCount, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white/80 backdrop-blur-md border border-gold/10 rounded-xl p-4">
            <div className={cn("text-2xl font-bold", s.color)}>{s.count}</div>
            <div className="text-xs text-charcoal/50 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Connected Accounts ─────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-md border border-gold/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            Connected Accounts
          </h2>
          <span className="text-xs text-charcoal/50">{connectedCount} / {accounts.length} connected</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {accounts.map(acc => (
            <div key={acc.key} className={cn(
              "p-4 rounded-xl border transition-all duration-200",
              acc.connected ? cn(acc.bgClass, "opacity-100") : "border-gray-200 bg-gray-50/50 opacity-60"
            )}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{acc.icon}</span>
                <button onClick={() => toggleAccountConnection(acc.key)} className="hover:opacity-80 transition-opacity">
                  {acc.connected
                    ? <ToggleRight className={cn("w-6 h-6", acc.color)} />
                    : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                </button>
              </div>
              <div className="text-xs font-medium text-dark/80">{acc.name}</div>
              {acc.connected ? (
                <>
                  <div className="text-[10px] text-charcoal/50 mt-0.5">{acc.username}</div>
                  <div className="text-[10px] text-charcoal/40">{acc.followers} followers</div>
                </>
              ) : (
                <div className="text-[10px] text-charcoal/30 mt-0.5">Not connected</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content: List + Detail ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Post List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" />
              Scheduled Posts
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-white/60 border border-gold/10 rounded-xl p-1">
            {(["all", "pending", "posted", "failed"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("flex-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                  filter === f ? "bg-gold/10 text-gold" : "text-charcoal/50 hover:text-charcoal/70")}>
                {f}
              </button>
            ))}
          </div>

          {/* Post list */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="bg-white/80 border border-gold/10 rounded-xl p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-3" />
                <p className="text-sm text-charcoal/50">Loading scheduled posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white/80 border border-gold/10 rounded-xl p-12 text-center">
                <Clock className="w-8 h-8 text-charcoal/20 mx-auto mb-3" />
                <p className="text-sm text-charcoal/50">No {filter !== "all" ? filter : ""} posts</p>
              </div>
            ) : (
              filteredPosts.map(post => {
                const isSelected = selectedPostId === post.id;
                const acc = accounts.find(a => a.key === post.platform);
                return (
                  <button key={post.id} onClick={() => selectPost(post)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200",
                      isSelected
                        ? "border-gold/30 bg-gold/5 shadow-sm"
                        : "border-gray-100 bg-white/60 hover:border-gold/20 hover:bg-white"
                    )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gold">{post.brand}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        post.status === "posted" ? "bg-emerald-100 text-emerald-700" :
                        post.status === "publishing" ? "bg-amber-100 text-amber-700" :
                        post.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      )}>{post.status}</span>
                    </div>
                    <p className="text-sm text-dark/80 line-clamp-2">{post.hook}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-sm", acc?.color)}>{acc?.icon}</span>
                      <span className="text-[10px] text-charcoal/40 ml-auto">{formatTime(post.scheduled_at)}</span>
                      {post.optimal_score && (
                        <span className="text-[10px] text-emerald-600">{(post.optimal_score * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detail & Publish Controls */}
        <div className="lg:col-span-2">
          {!selectedPost ? (
            <div className="bg-white/80 border border-gold/10 rounded-2xl p-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-gold/40" />
              </div>
              <h3 className="text-lg font-semibold text-dark/50 mb-2">Select a post</h3>
              <p className="text-sm text-charcoal/50 max-w-sm mx-auto">
                Choose a scheduled post from the list to preview and publish across multiple platforms
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Post Content Card */}
              <div className="bg-white/80 backdrop-blur-md border border-gold/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs text-gold font-medium">{selectedPost.brand}</span>
                    <h3 className="text-lg font-semibold text-dark mt-1">{selectedPost.hook}</h3>
                  </div>
                  <span className="text-xs text-charcoal/50">{formatTime(selectedPost.scheduled_at)}</span>
                </div>
                <p className="text-sm text-charcoal/70 mb-4 leading-relaxed">{selectedPost.content}</p>

                {/* Media preview toggle */}
                <button onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-xs text-gold hover:text-gold/80 transition-colors mb-3">
                  {selectedPost.mediaType === "video" ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>

                {showPreview && (
                  <div className="aspect-video rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {selectedPost.mediaType === "video" ? (
                      <div className="text-center"><Video className="w-10 h-10 text-gray-300 mx-auto mb-2" /><span className="text-xs text-gray-400">Video Preview</span></div>
                    ) : (
                      <div className="text-center"><Image className="w-10 h-10 text-gray-300 mx-auto mb-2" /><span className="text-xs text-gray-400">Image Preview</span></div>
                    )}
                  </div>
                )}
              </div>

              {/* Platform Selection */}
              <div className="bg-white/80 backdrop-blur-md border border-gold/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-dark/70 mb-3">Select Platforms</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {accounts.filter(a => a.connected).map(acc => {
                    const isSelected = selectedPlatforms.has(acc.key);
                    const perPlat = selectedPost.perPlatform[acc.key];
                    return (
                      <button key={acc.key} onClick={() => !isPublishing && togglePlatform(acc.key)}
                        disabled={isPublishing}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all duration-200",
                          isSelected ? cn(acc.bgClass, "ring-1 ring-gold/30") : "border-gray-100 bg-white/50 hover:border-gray-200",
                          isPublishing && "opacity-60 cursor-not-allowed"
                        )}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg">{acc.icon}</span>
                          {perPlat?.status === "done" && <Check className="w-4 h-4 text-emerald-500" />}
                          {perPlat?.status === "publishing" && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                          {perPlat?.status === "error" && <X className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="text-xs font-medium text-dark/80">{acc.name}</div>
                      </button>
                    );
                  })}
                </div>
                {accounts.filter(a => a.connected).length === 0 && (
                  <p className="text-xs text-charcoal/50 text-center py-4">Connect accounts above to enable publishing</p>
                )}
              </div>

              {/* Per-Platform Status */}
              {Array.from(selectedPlatforms).some(p => selectedPost.perPlatform[p]?.status !== "idle") && (
                <div className="bg-white/80 backdrop-blur-md border border-gold/10 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-dark/70 mb-3">Publish Status</h3>
                  <div className="space-y-2">
                    {Array.from(selectedPlatforms).map(key => {
                      const acc = accounts.find(a => a.key === key);
                      const perPlat = selectedPost.perPlatform[key];
                      if (!perPlat || perPlat.status === "idle") return null;
                      return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{acc?.icon}</span>
                            <div>
                              <div className="text-sm text-dark/80">{acc?.name}</div>
                              {perPlat.status === "done" && perPlat.postUrl && (
                                <a href={perPlat.postUrl} target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-gold hover:underline flex items-center gap-1">
                                  View post <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {perPlat.status === "error" && perPlat.error && (
                                <div className="text-xs text-red-500">{perPlat.error}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            {perPlat.status === "publishing" && <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
                            {perPlat.status === "done" && <Check className="w-5 h-5 text-emerald-500" />}
                            {perPlat.status === "error" && <X className="w-5 h-5 text-red-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Publish Button */}
              <Button variant="glow" size="lg" className="w-full" onClick={publishSelected}
                disabled={isPublishing || selectedPlatforms.size === 0}>
                {isPublishing && !isPublishAll ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Publishing to {selectedPlatforms.size} platform{selectedPlatforms.size > 1 ? "s" : ""}...</>
                ) : (
                  <><Send className="w-5 h-5 mr-2" />
                    Publish to {selectedPlatforms.size} Platform{selectedPlatforms.size !== 1 ? "s" : ""}</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
