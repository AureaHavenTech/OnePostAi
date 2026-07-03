"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Hash, Sparkles, CheckCircle, Smartphone, Monitor, Square, Wand2, Link2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformContent {
  title: string;
  description: string;
  hashtags: string[];
}

interface CampaignData {
  tiktok: PlatformContent;
  instagram: PlatformContent;
  youtube: PlatformContent;
  linkedin: PlatformContent;
}

const mockCampaign: CampaignData = {
  tiktok: {
    title: "🔥 You Won't Believe How Easy This Is!",
    description: "Stop overthinking your content strategy. 🛑\n\nHere's the truth: consistency beats perfection every single time.\n\n👇 Drop a 🎯 if you're ready to level up!\n\n#ContentCreator #GrowthHack",
    hashtags: ["fyp", "viral", "contentcreator", "growthhack", "marketingtips", "smallbusiness", "trending", "explorepage", "hack", "goforit"],
  },
  instagram: {
    title: "The One Tool Every Creator Needs 🚀",
    description: "Spending hours editing for each platform? Not anymore.\n\nOnePost AI handles the hard work so you can focus on creating.\n\n✅ Auto-resize for every format\n✅ AI-powered captions\n✅ Post everywhere at once\n\nSave this post for later! 📌",
    hashtags: ["instagramtips", "contentcreator", "socialmediamanager", "aitools", "productivityhacks", "marketingstrategy", "reelstips", "growthhacking", "creatorcommunity", "viralcontent"],
  },
  youtube: {
    title: "I Tested the Ultimate Content Automation Tool",
    description: "In this video, I walk through how OnePost AI is changing the game for content creators.\n\n📌 What we cover:\n0:00 - Intro\n0:45 - The multi-platform problem\n2:30 - How OnePost AI solves it\n5:15 - Live demo\n8:00 - Final thoughts\n\nSubscribe for more content creation tips! 🔔",
    hashtags: ["contentcreation", "aitools", "productivity", "youtubetips", "automation", "creator", "techreview", "socialmedia", "workflow", "digitalmarketing"],
  },
  linkedin: {
    title: "Why I Automate 80% of My Content Distribution",
    description: "As a content creator, I realized something crucial:\n\nThe platforms are different, but your message shouldn't be fragmented.\n\nOnePost AI lets me:\n• Upload once\n• Auto-format for each network\n• Schedule simultaneous publishing\n\nResult? 3x more reach with 1/10th the effort.\n\nWhat's your biggest content bottleneck? Let's discuss below 👇",
    hashtags: ["contentstrategy", "productivity", "aicontent", "socialmediamarketing", "creatoreconomy", "businesstips", "marketingautomation", "growthmindset", "digitalstrategy", "contentmarketing"],
  },
};

interface CampaignViewProps {
  fileName?: string;
  onBack: () => void;
  mode?: "upload" | "generate" | "ideas";
  brandUrl?: string;
  topic?: string;
  selectedPlatforms?: string[];
}

export function CampaignView({ fileName, onBack, mode, brandUrl, topic }: CampaignViewProps) {
  const [activePlatform, setActivePlatform] = useState("tiktok");
  const [scheduledDate, setScheduledDate] = useState("");
  const [published, setPublished] = useState(false);
  const [campaign] = useState<CampaignData>(mockCampaign);

  const platforms = [
    { id: "tiktok", label: "TikTok", icon: "♬", color: "text-pink-400", bestFor: "Viral reach" },
    { id: "instagram", label: "Instagram", icon: "📸", color: "text-orange-400", bestFor: "Reels & engagement" },
    { id: "youtube", label: "YouTube", icon: "▶", color: "text-red-400", bestFor: "Long-form search" },
    { id: "linkedin", label: "LinkedIn", icon: "💼", color: "text-blue-400", bestFor: "Professional trust" },
  ];

  const handlePublish = () => {
    setPublished(true);
    setTimeout(() => setPublished(false), 4000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Campaign Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-zinc-100">
              {mode === "generate" ? "AI Generated Content" : "Campaign Review"}
            </h2>
            {mode === "generate" && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                AI Created
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            {mode === "generate" ? `Brand: ${brandUrl || topic}` : fileName}
          </p>
          {mode === "generate" && (
            <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              UGC-style video with stock footage, AI voiceover, captions, and affiliate link
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to Create
        </Button>
      </div>

      {/* Smart Format Recommendation */}
      <div className="glass-card p-4 border-indigo-500/20">
        <div className="flex items-center gap-2 text-sm text-indigo-300 mb-2">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">Smart Format Recommendation</span>
        </div>
        <p className="text-xs text-zinc-400">
          Based on your content type and current trends, we recommend posting <strong className="text-zinc-200">Instagram Reel</strong> and <strong className="text-zinc-200">TikTok</strong> first (highest viral potential), then cross-post to YouTube Shorts and LinkedIn.
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN - Media Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Auto-Edited Previews</h3>

          {/* TikTok/Reels - 9:16 */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Smartphone className="w-3.5 h-3.5" />
                <span>TikTok / Reels — 9:16</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium">Best for reels</span>
            </div>
            <div className="aspect-9-16 max-h-[240px] rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/5 overflow-hidden">
              <div className="text-center p-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center mb-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-xs text-zinc-600">Auto-edited preview</p>
                <p className="text-[10px] text-zinc-700 mt-1">
                  {mode === "generate" ? "AI Generated Video" : fileName}
                </p>
                <p className="text-[10px] text-green-500/60 mt-2">Cuts • Transitions • Text overlay • Effects applied</p>
              </div>
            </div>
          </div>

          {/* Instagram/Facebook - 1:1 */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Square className="w-3.5 h-3.5" />
                <span>Instagram Feed — 1:1</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-medium">Square crop</span>
            </div>
            <div className="aspect-1-1 max-h-[200px] rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/5 overflow-hidden">
              <div className="text-center p-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                  <Square className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-xs text-zinc-600">Auto-cropped 1:1</p>
              </div>
            </div>
          </div>

          {/* YouTube/X - 16:9 */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Monitor className="w-3.5 h-3.5" />
                <span>YouTube / X — 16:9</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-medium">Widescreen</span>
            </div>
            <div className="aspect-16-9 max-h-[180px] rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/5 overflow-hidden">
              <div className="text-center p-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                  <Monitor className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs text-zinc-600">Auto-cropped 16:9</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - AI Copywriting */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">AI Captions & Hashtags</h3>

          <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              {platforms.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="text-xs">
                  <span className={p.color}>{p.icon}</span>
                  <span className="ml-1.5 hidden sm:inline">{p.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {platforms.map((platform) => {
              const content = campaign[platform.id as keyof CampaignData];
              return (
                <TabsContent key={platform.id} value={platform.id}>
                  <div className="glass-card p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{platform.bestFor}</span>
                      {platform.id === "tiktok" || platform.id === "instagram" ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-medium">Recommended</span>
                      ) : null}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Viral Headline</label>
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-zinc-200 font-medium">{content.title}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Description / Caption</label>
                      <div className="rounded-lg bg-zinc-900/60 p-3 border border-white/5">
                        <p className="text-sm text-zinc-300 whitespace-pre-line">{content.description}</p>
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        Trending Hashtags
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {content.hashtags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>

      {/* Affiliate Link */}
      {mode === "generate" && (
        <div className="glass-card p-4 border-purple-500/20">
          <div className="flex items-center gap-3">
            <Link2 className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-zinc-200 font-medium">Affiliate Link Attached</p>
              <p className="text-xs text-zinc-500">Your link will be auto-placed in bio and description for commission tracking.</p>
            </div>
            <Button variant="outline" size="sm">Edit Link</Button>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-48 h-9 text-xs bg-zinc-900/60 border-white/10"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Schedule publish</span>
            </div>
          </div>

          <Button
            variant="glow"
            size="lg"
            onClick={handlePublish}
            className={cn("w-full sm:w-auto", published && "bg-green-500 hover:bg-green-400")}
          >
            {published ? (
              <><CheckCircle className="w-5 h-5 mr-2" /> Published Successfully!</>
            ) : (
              <>{mode === "generate" ? "🔥 Approve & Auto-Publish Everywhere" : "🚀 Approve & Auto-Publish Everywhere"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}