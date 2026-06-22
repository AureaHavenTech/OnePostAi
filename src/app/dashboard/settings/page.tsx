"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink, Unlink, Smartphone, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const platforms = [
  { id: "tiktok", name: "TikTok", icon: "♬", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { id: "instagram", name: "Instagram", icon: "📸", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "facebook", name: "Facebook", icon: "👍", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "youtube", name: "YouTube", icon: "▶", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "text-blue-300", bg: "bg-blue-300/10", border: "border-blue-300/20" },
  { id: "snapchat", name: "Snapchat", icon: "👻", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
];

export default function SettingsPage() {
  const [connected, setConnected] = useState<string[]>(["tiktok", "instagram"]);

  const handleConnect = (id: string) => {
    // In production: window.location.href = `https://${id}.com/oauth/authorize?...`
    // For demo: toggle connected state
    if (connected.includes(id)) {
      setConnected(prev => prev.filter(p => p !== id));
    } else {
      // Simulate OAuth popup
      alert(`This would open ${id}'s authorization page in a new window.\n\nYou'd log in, approve access, and the app gets a token to post on your behalf.\n\nOne-time setup, just like connecting any app to your social accounts.`);
      setConnected(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#2d2a24] dark:text-[#f5f0e8]">Account Connections</h1>
        <p className="text-sm text-[#8a7f72] dark:text-[#8a7f72] mt-1">
          Connect your social accounts once. OnePost AI posts everywhere with one click.
        </p>
      </div>

      <div className="space-y-3">
        {platforms.map((p) => {
          const isConnected = connected.includes(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                isConnected
                  ? `${p.bg} ${p.border}`
                  : "bg-white/50 dark:bg-[#24211d]/50 border-[#e8dfd2] dark:border-[#3d3832]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", p.bg)}>
                  <span className={cn("text-lg", p.color)}>{p.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#2d2a24] dark:text-[#f5f0e8]">{p.name}</p>
                  <p className="text-xs text-[#8a7f72]">
                    {isConnected ? "Connected — can post on your behalf" : "Not connected"}
                  </p>
                </div>
              </div>

              <Button
                variant={isConnected ? "outline" : "glow"}
                size="sm"
                onClick={() => handleConnect(p.id)}
              >
                {isConnected ? (
                  <><Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Connected</>
                ) : (
                  <><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Connect</>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6 space-y-3">
        <h3 className="font-semibold text-[#2d2a24] dark:text-[#f5f0e8] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#eab308]" />
          How it works
        </h3>
        <div className="space-y-2 text-sm text-[#8a7f72]">
          <p>1. Click "Connect" on any platform → it opens that platform's login</p>
          <p>2. You log in and approve access (just like signing in with Google)</p>
          <p>3. OnePost AI gets a token and stores it securely</p>
          <p>4. From then on, one post = published everywhere automatically</p>
          <p className="text-xs mt-2">🔒 You can disconnect anytime. Your tokens are encrypted.</p>
        </div>
      </div>

      {/* Connected accounts summary */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-[#2d2a24] dark:text-[#f5f0e8] mb-3">
          Your connected accounts
        </h3>
        {connected.length === 0 ? (
          <p className="text-sm text-[#8a7f72]">No accounts connected yet. Connect above to get started.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {connected.map(id => {
              const p = platforms.find(p => p.id === id);
              return (
                <div key={id} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium", p?.bg, p?.color, p?.border)}>
                  <span>{p?.icon}</span>
                  {p?.name}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-[#8a7f72] mt-3">
          🚀 One post → {connected.length} platforms simultaneously
        </p>
      </div>
    </div>
  );
}