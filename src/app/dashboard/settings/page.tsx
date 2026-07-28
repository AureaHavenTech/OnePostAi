"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ExternalLink, Camera, PencilLine, X, Loader2, Globe, Mail, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const LS_CACHE_KEY = "onepostai_user_cache";

interface UserData {
  id: string;
  email: string;
  name: string;
  is_admin: number;
  avatar_url: string | null;
  subscription: { tier: string; status: string } | null;
}

const platforms = [
  { id: "tiktok", name: "TikTok", icon: "♬", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { id: "instagram", name: "Instagram", icon: "📸", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "facebook", name: "Facebook", icon: "👍", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "youtube", name: "YouTube", icon: "▶", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "text-blue-300", bg: "bg-blue-300/10", border: "border-blue-300/20" },
  { id: "snapchat", name: "Snapchat", icon: "👻", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "pinterest", name: "Pinterest", icon: "📌", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
];

function getCachedUser(): UserData | null {
  try {
    const raw = localStorage.getItem(LS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCachedUser(user: UserData): void {
  try {
    localStorage.setItem(LS_CACHE_KEY, JSON.stringify(user));
  } catch { /* quota exceeded — ignore */ }
}

export default function SettingsPage() {
  const [connected, setConnected] = useState<string[]>(["tiktok", "instagram"]);
  const [user, setUser] = useState<UserData | null>(getCachedUser);
  const [loading, setLoading] = useState(!getCachedUser());
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Editable name state
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Fetch user from real auth API
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", { credentials: "include" });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setCachedUser(data.user);
        setAvatarPreview(data.user.avatar_url || null);
      } else {
        // Keep cached user if fetch fails with a session error
        if (!getCachedUser()) {
          setError(data.error || "Could not load profile");
        }
      }
    } catch {
      if (!getCachedUser()) {
        setError("Network error — using cached profile");
      }
    } finally {
      setLoading(false);
      setFetchAttempted(true);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Name editing handlers
  const startEditingName = () => {
    setNameDraft(user?.name || "");
    setEditingName(true);
  };

  const cancelEditingName = () => {
    setEditingName(false);
    setNameDraft("");
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === user?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setCachedUser(data.user);
        setEditingName(false);
      } else {
        setError(data.error || "Failed to update name");
      }
    } catch {
      setError("Network error updating name");
    } finally {
      setSavingName(false);
    }
  };

  // Avatar upload handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally first
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);

      // Upload to server
      setUploadingAvatar(true);
      try {
        const res = await fetch("/api/auth", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ avatar_url: dataUrl }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setCachedUser(data.user);
        } else {
          setError(data.error || "Failed to save avatar");
        }
      } catch {
        setError("Network error uploading avatar");
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConnect = (id: string) => {
    if (connected.includes(id)) {
      setConnected(prev => prev.filter(p => p !== id));
    } else {
      alert(`This would open ${id}'s authorization page in a new window.\n\nYou'd log in, approve access, and the app gets a token to post on your behalf.\n\nOne-time setup, just like connecting any app to your social accounts.`);
      setConnected(prev => [...prev, id]);
    }
  };

  // Generate avatar initials fallback
  const initials = (user?.name || "U")
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const tierLabel = (tier: string) => {
    switch (tier) {
      case "pro": return { label: "Pro", color: "text-gold", bg: "bg-gold/10", icon: Crown };
      case "agency": return { label: "Agency", color: "text-purple-400", bg: "bg-purple-500/10", icon: Zap };
      default: return { label: tier.charAt(0).toUpperCase() + tier.slice(1), color: "text-gray-400", bg: "bg-gray-500/10", icon: Zap };
    }
  };

  const tierInfo = user?.subscription ? tierLabel(user.subscription.tier) : null;
  const TierIcon = tierInfo?.icon;

  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      {/* ---- PROFILE SECTION ---- */}
      <div>
        <h1 className="text-2xl font-bold text-[#2d2a24] dark:text-[#f5f0e8]">Profile</h1>
        <p className="text-sm text-[#8a7f72] dark:text-[#8a7f72] mt-1">
          Manage your personal info and connected accounts.
        </p>
      </div>

      {/* Loading state */}
      {loading && !user && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader2 className="w-5 h-5 text-gold animate-spin" />
          <span className="text-sm text-[#8a7f72]">Loading profile…</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/10 rounded">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Profile card */}
      {user && (
        <div className="glass-card p-6 space-y-5">
          {/* Avatar row */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/30 flex items-center justify-center bg-gold/10">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-gold">{initials}</span>
                )}
              </div>
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1 min-w-0">
              {/* Name row */}
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameDraft}
                    onChange={e => setNameDraft(e.target.value)}
                    className="h-9 text-sm max-w-[200px]"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") cancelEditingName();
                    }}
                    disabled={savingName}
                  />
                  <Button size="sm" variant="glow" onClick={saveName} disabled={savingName}>
                    {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditingName} disabled={savingName}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#2d2a24] dark:text-[#f5f0e8] truncate">
                    {user.name}
                  </h2>
                  <button
                    onClick={startEditingName}
                    className="p-1 hover:bg-gold/10 rounded-md transition-colors"
                    title="Edit name"
                  >
                    <PencilLine className="w-3.5 h-3.5 text-[#8a7f72] hover:text-gold" />
                  </button>
                </div>
              )}

              {/* Email */}
              <p className="text-sm text-[#8a7f72] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>

              {/* Subscription badge */}
              {tierInfo && TierIcon && (
                <div className={cn(
                  "inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium",
                  tierInfo.bg, tierInfo.color
                )}>
                  <TierIcon className="w-3 h-3" />
                  {tierInfo.label} plan
                  {user.subscription?.status !== "active" && (
                    <span className="opacity-70">({user.subscription?.status})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- ACCOUNT CONNECTIONS SECTION ---- */}
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

      {/* How it works */}
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
