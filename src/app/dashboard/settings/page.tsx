"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink, Unlink, Smartphone, Globe, Camera, User, Save, Loader2, Upload, X } from "lucide-react";
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
  const [profile, setProfile] = useState({
    name: "",
    avatar: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("onepostai_profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {}
    } else {
      // Default demo profile
      setProfile({ name: "Aurea Haven", avatar: "", bio: "Content creator | Founder @ Aura Haven Tech" });
    }
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProfile(prev => ({ ...prev, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate saving
    setTimeout(() => {
      localStorage.setItem("onepostai_profile", JSON.stringify(profile));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const handleConnect = (id: string) => {
    if (connected.includes(id)) {
      setConnected(prev => prev.filter(p => p !== id));
    } else {
      alert(`This would open ${id}'s authorization page in a new window.\n\nYou'd log in, approve access, and the app gets a token to post on your behalf.\n\nOne-time setup, just like connecting any app to your social accounts.`);
      setConnected(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#2d2a24] dark:text-[#f5f0e8]">Settings</h1>
        <p className="text-sm text-[#8a7f72] dark:text-[#8a7f72] mt-1">
          Customize your profile and connect your accounts.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white/80 dark:bg-[#1e1c18]/80 backdrop-blur-xl border border-[#e8dfd2] dark:border-[#3d3832] rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-[#2d2a24] dark:text-[#f5f0e8] flex items-center gap-2">
          <User className="h-5 w-5 text-gold" />
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center overflow-hidden border-2 border-gold/30 shadow-lg">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold text-white flex items-center justify-center shadow-lg hover:bg-gold-light transition-colors border-2 border-white"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2d2a24] dark:text-[#f5f0e8]">Profile Photo</p>
            <p className="text-xs text-[#8a7f72] mt-0.5">Upload a photo to personalize your dashboard</p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8a7f72] uppercase tracking-wider">Display Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your display name"
            className="w-full bg-cream/50 dark:bg-[#24211d]/50 text-dark dark:text-[#f5f0e8] placeholder-gray-400 outline-none border border-gold/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold/40 transition-colors"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8a7f72] uppercase tracking-wider">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell the world about yourself"
            rows={3}
            className="w-full bg-cream/50 dark:bg-[#24211d]/50 text-dark dark:text-[#f5f0e8] placeholder-gray-400 outline-none border border-gold/10 rounded-xl px-4 py-2.5 text-sm focus:border-gold/40 transition-colors resize-none"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-light text-white hover:shadow-lg hover:shadow-gold/30 disabled:opacity-60"
        >
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : saved ? (
            <><Check className="h-4 w-4" /> Saved!</>
          ) : (
            <><Save className="h-4 w-4" /> Save Profile</>
          )}
        </button>
      </div>

      {/* Account Connections */}
      <div>
        <h2 className="text-lg font-bold text-[#2d2a24] dark:text-[#f5f0e8] mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-gold" />
          Account Connections
        </h2>
        <p className="text-sm text-[#8a7f72] dark:text-[#8a7f72] mb-4">
          Connect your social accounts once. OnePost AI posts everywhere with one click.
        </p>
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
      </div>

      <div className="bg-white/80 dark:bg-[#1e1c18]/80 backdrop-blur-xl border border-[#e8dfd2] dark:border-[#3d3832] rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="font-semibold text-[#2d2a24] dark:text-[#f5f0e8] flex items-center gap-2">
          <Globe className="w-4 h-4 text-gold" />
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
      <div className="bg-white/80 dark:bg-[#1e1c18]/80 backdrop-blur-xl border border-[#e8dfd2] dark:border-[#3d3832] rounded-2xl p-6 shadow-sm">
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