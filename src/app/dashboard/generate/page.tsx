"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Send, Loader2, CheckCircle2, Clock,
  Image, Hash, Music, TrendingUp, CalendarDays, Share2,
  Eye, Edit3, Monitor, Camera, Globe, Volume2,
  AlertCircle, Copy, Check, ArrowRight, Bot,
} from "lucide-react";

type ContentType = "caption" | "hashtags" | "ad" | "image" | "video";
type Platform = "instagram" | "tiktok" | "youtube" | "linkedin" | "twitter" | "all";

const CONTENT_TYPES: { id: ContentType; label: string; icon: string; desc: string }[] = [
  { id: "caption", label: "Captions", icon: "✍️", desc: "Engaging, viral-worthy post captions" },
  { id: "hashtags", label: "Hashtags", icon: "#️⃣", desc: "Trending, high-reach hashtag sets" },
  { id: "ad", label: "Ad Creatives", icon: "📢", desc: "Conversion-optimized ad copy" },
  { id: "image", label: "Images", icon: "🖼️", desc: "AI-generated image descriptions & assets" },
  { id: "video", label: "Videos", icon: "🎬", desc: "Full video scripts & storyboards" },
];

const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: "instagram", label: "Instagram", icon: "📸", color: "hover:border-pink-500/50 hover:bg-pink-500/5" },
  { id: "tiktok", label: "TikTok", icon: "♬", color: "hover:border-pink-400/50 hover:bg-pink-400/5" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "hover:border-red-500/50 hover:bg-red-500/5" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "hover:border-blue-400/50 hover:bg-blue-400/5" },
  { id: "twitter", label: "Twitter/X", icon: "🐦", color: "hover:border-sky-500/50 hover:bg-sky-500/5" },
  { id: "all", label: "All Platforms", icon: "🌐", color: "hover:border-brand-500/50 hover:bg-brand-500/5" },
];

interface GeneratedContent {
  caption: string;
  hashtags: string[];
  image: { url: string; alt: string; width: number; height: number };
  adCopy: { headline: string; body: string; cta: string; valueProp: string };
  videoScript: string;
  engagement: { estimatedViews: number; estimatedLikes: number; estimatedShares: number };
  bestTimeToPost: string;
  trendingSounds: string[];
  contentId: string;
  isDemo: boolean;
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>("caption");
  const [platform, setPlatform] = useState<Platform>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError("");
    setGenerated(null);

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          contentType,
          platform,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenerated(data.generated);
        setShowPreview(true);
      } else {
        setError(data.error || "Generation failed");
      }
    } catch (err) {
      setError("Failed to connect to generation service");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#12121a] text-[#e8e0d4]">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-brand-500/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AI Content Generator</h1>
              <p className="text-xs text-slate-400">Describe what you want — AI creates it</p>
            </div>
          </div>
          {generated && (
            <Badge variant="success" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              {generated.isDemo ? "Demo Mode" : "AI Generated"}
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid lg:grid-cols-5 gap-8">
        {/* Left Panel - Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic Input */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              Describe Your Content
            </h2>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Create a 15-second trending video about fish with viral sounds"
              className="w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {[
                "15-sec trending video about AI tools",
                "Instagram carousel about morning routine",
                "LinkedIn post about leadership tips",
                "TikTok dance challenge promotion",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setTopic(prompt)}
                  className="text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-full transition-colors border border-slate-700/50"
                >
                  {prompt.length > 30 ? prompt.slice(0, 30) + "..." : prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type Selection */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
            <h2 className="text-sm font-semibold text-white">Content Type</h2>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setContentType(type.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    contentType === type.id
                      ? "border-brand-500 bg-brand-500/10 text-brand-300"
                      : "border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-lg mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
            <h2 className="text-sm font-semibold text-white">Platform</h2>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    platform === p.id
                      ? "border-brand-500 bg-brand-500/10 text-brand-300"
                      : "border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full py-6 text-base"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-3 space-y-6">
          {!generated ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-brand-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Ready to Create</h2>
              <p className="text-slate-400 text-sm max-w-md">
                Describe your content idea on the left and hit generate. AI will create platform-optimized content with captions, hashtags, and creative assets.
              </p>
              <div className="mt-6 flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Captions</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Hashtags</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Ad Copy</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Scripts</span>
              </div>
            </div>
          ) : (
            <>
              {/* Generated Content Preview */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-brand-500" />
                    Generated Preview
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-[10px]">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                    </Badge>
                    <button
                      onClick={() => copyToClipboard(generated.caption)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Caption */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Caption</h3>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                      <p className="text-sm text-slate-200 whitespace-pre-line">{generated.caption}</p>
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider flex items-center gap-1">
                      <Hash className="h-3 w-3" /> Hashtags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {generated.hashtags.map((tag) => (
                        <span key={tag} className="text-xs bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Image */}
                  {contentType === "image" && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider flex items-center gap-1">
                        <Image className="h-3 w-3" /> Image Suggestion
                      </h3>
                      <div className="rounded-lg overflow-hidden border border-slate-800">
                        <img src={generated.image.url} alt={generated.image.alt} className="w-full h-48 object-cover" />
                      </div>
                    </div>
                  )}

                  {/* Ad Copy */}
                  {contentType === "ad" && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Ad Creative</h3>
                      <div className="bg-slate-950 border border-brand-500/20 rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-bold text-white">{generated.adCopy.headline}</h4>
                        <p className="text-xs text-slate-400">{generated.adCopy.body}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <span className="text-xs text-brand-400 font-semibold">{generated.adCopy.cta}</span>
                          <Badge variant="success" className="text-[10px]">{generated.adCopy.valueProp}</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Script */}
                  {contentType === "video" && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider flex items-center gap-1">
                        <Music2 className="h-3 w-3" /> Video Script & Sound
                      </h3>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{generated.videoScript}</pre>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {generated.trendingSounds.map((sound) => (
                          <span key={sound} className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Music className="h-3 w-3" /> {sound}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engagement Metrics */}
                  <div className="border-t border-slate-800 pt-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Estimated Performance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-lg font-bold text-white">{generated.engagement.estimatedViews.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">Views</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-lg font-bold text-white">{generated.engagement.estimatedLikes.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">Likes</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-lg font-bold text-white">{generated.engagement.estimatedShares.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">Shares</div>
                      </div>
                    </div>
                  </div>

                  {/* Best Time & Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-brand-500/5 border border-brand-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-brand-400" />
                      <div className="text-xs text-slate-400">
                        Best time to post: <span className="text-brand-300 font-semibold">{generated.bestTimeToPost}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => copyToClipboard(generated.caption)}>
                        <Copy className="h-3 w-3 mr-1" /> Copy
                      </Button>
                      <Button size="sm" onClick={() => {
                        // Navigate to create page with pre-filled content
                        window.location.href = `/dashboard/create?caption=${encodeURIComponent(generated.caption)}&hashtags=${encodeURIComponent(generated.hashtags.join(" "))}&platform=${platform}`;
                      }}>
                        <Edit3 className="h-3 w-3 mr-1" /> Edit & Post
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}