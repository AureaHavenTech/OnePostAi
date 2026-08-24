"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link2, Unlink, ShieldCheck, ExternalLink, RefreshCw, AlertTriangle, Trash2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────
interface PlatformWithStatus {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  username?: string | null;
  avatar?: string | null;
  connectedAt?: string | null;
  status?: string | null;
  connectionId?: string | null;
  charLimit: number;
  videoMaxSec: number;
}

interface PlatformsResponse {
  platforms: PlatformWithStatus[];
  total: number;
  connected: number;
}

// ─── Platform color map for Tailwind-safe borders ──────────────────
const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#000000",
  instagram: "#E1306C",
  facebook: "#1877F2",
  youtube: "#FF0000",
  linkedin: "#0A66C2",
  snapchat: "#FFFC00",
  pinterest: "#E60023",
  twitter: "#000000",
};

function platformBorderColor(platform: string): string {
  return PLATFORM_COLORS[platform] || "#c9a96e";
}

// ─── Page ──────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const [platforms, setPlatforms] = useState<PlatformWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null); // platform id
  const [confirmDisconnectAll, setConfirmDisconnectAll] = useState(false);
  const [connectModal, setConnectModal] = useState<PlatformWithStatus | null>(null);
  const [mockUsername, setMockUsername] = useState("");

  // ─── Fetch platforms ───────────────────────────────────────────
  const fetchPlatforms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/social/platforms");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load platforms.");
      }
      const data: PlatformsResponse = await res.json();
      setPlatforms(data.platforms);
    } catch (err: any) {
      setError(err.message || "Could not load platform data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  // ─── Connect (mock flow) ────────────────────────────────────────
  const handleConnect = async () => {
    if (!connectModal || !mockUsername.trim()) return;
    setActionLoading(connectModal.id);
    try {
      const res = await fetch("/api/social/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: connectModal.id,
          accessToken: "mock_token_" + Date.now(),
          username: mockUsername.trim(),
          platformUserId: "mock_" + Math.random().toString(36).slice(2, 10),
          status: "active",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to connect.");
      }
      setConnectModal(null);
      setMockUsername("");
      await fetchPlatforms();
    } catch (err: any) {
      setError(err.message || "Could not connect.");
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Disconnect single ──────────────────────────────────────────
  const handleDisconnect = async (platform: PlatformWithStatus) => {
    if (!platform.connectionId) return;
    setActionLoading(platform.id);
    try {
      const res = await fetch(`/api/social/connections/${platform.connectionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to disconnect.");
      }
      await fetchPlatforms();
    } catch (err: any) {
      setError(err.message || "Could not disconnect.");
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Disconnect all ─────────────────────────────────────────────
  const handleDisconnectAll = async () => {
    setActionLoading("all");
    try {
      const connected = platforms.filter((p) => p.connected && p.connectionId);
      for (const p of connected) {
        await fetch(`/api/social/connections/${p.connectionId}`, { method: "DELETE" });
      }
      setConfirmDisconnectAll(false);
      await fetchPlatforms();
    } catch {
      setError("Could not disconnect all platforms.");
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Derived stats ──────────────────────────────────────────────
  const connectedCount = platforms.filter((p) => p.connected).length;

  // ─── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-4 w-72 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="skeleton h-5 w-20 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-9 w-full rounded-lg mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────────────
  if (error && platforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-heading text-cream mb-2">Connection Error</h2>
        <p className="text-cream/50 mb-4">{error}</p>
        <button onClick={fetchPlatforms} className="btn-outline text-sm">
          <RefreshCw className="w-4 h-4 mr-1.5 inline" /> Retry
        </button>
      </div>
    );
  }

  // ─── Empty state (shouldn't happen since 7 platforms always exist, but defensive) ──
  if (platforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Link2 className="w-12 h-12 text-cream/20 mb-4" />
        <h2 className="text-xl font-heading text-cream mb-2">No Platforms Available</h2>
        <p className="text-cream/50 mb-4">Platform data isn't loaded yet.</p>
        <button onClick={fetchPlatforms} className="btn-outline text-sm">Refresh</button>
      </div>
    );
  }

  // ─── Main content ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-cream">Connections Hub</h1>
          <p className="text-sm text-cream/50 mt-1">
            Connect your social media accounts once — use them everywhere.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20">
            <span className="text-xs text-cream/60">{connectedCount} of {platforms.length} connected</span>
          </div>
          {connectedCount > 0 && (
            <button
              onClick={() => setConfirmDisconnectAll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs transition-colors"
              disabled={actionLoading === "all"}
            >
              {actionLoading === "all" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Disconnect All
            </button>
          )}
        </div>
      </div>

      {/* Inline error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError("")} className="ml-auto text-red-400/60 hover:text-red-400">
            &times;
          </button>
        </div>
      )}

      {/* Disconnect all confirmation */}
      {confirmDisconnectAll && (
        <div className="glass-card p-4 border border-red-500/30">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-cream font-medium">Disconnect all platforms?</p>
              <p className="text-xs text-cream/50 mt-1">
                This will remove {connectedCount} connection{connectedCount !== 1 ? "s" : ""}. You'll need to re-authorize each platform to publish content.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={handleDisconnectAll} className="btn-outline text-xs py-1.5 px-4 text-red-400 border-red-500/30 hover:bg-red-500/10">
                  Yes, Disconnect All
                </button>
                <button onClick={() => setConfirmDisconnectAll(false)} className="text-xs text-cream/40 hover:text-cream transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className="glass-card p-5 flex flex-col transition-all hover:border-gold/50 group"
            style={{ borderColor: platform.connected ? `${platformBorderColor(platform.id)}40` : undefined }}
          >
            {/* Platform icon + name */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${platformBorderColor(platform.id)}15` }}
              >
                {platform.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-cream truncate">{platform.name}</h3>
                {platform.connected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-gold/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Connected
                  </span>
                ) : (
                  <span className="text-[10px] text-cream/30">Not connected</span>
                )}
              </div>
            </div>

            {/* Username / details if connected */}
            {platform.connected && platform.username && (
              <p className="text-xs text-cream/50 mb-1 truncate">@{platform.username}</p>
            )}
            {platform.connected && platform.connectedAt && (
              <p className="text-[10px] text-cream/30 mb-3">
                Since {new Date(platform.connectedAt).toLocaleDateString()}
              </p>
            )}
            {!platform.connected && (
              <p className="text-xs text-cream/30 mb-3 flex-1">
                {platform.charLimit.toLocaleString()} chars &bull; {platform.videoMaxSec}s video
              </p>
            )}

            {/* Action button */}
            <div className="mt-auto pt-3 border-t border-white/5">
              {platform.connected ? (
                <button
                  onClick={() => handleDisconnect(platform)}
                  disabled={actionLoading === platform.id}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs
                    border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === platform.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Unlink className="w-3.5 h-3.5" />
                  )}
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => {
                    setConnectModal(platform);
                    setMockUsername("");
                  }}
                  disabled={actionLoading === platform.id}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs
                    bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === platform.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5" />
                  )}
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connect Modal */}
      {connectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={() => setConnectModal(null)} />
          <div className="relative glass-card p-6 w-full max-w-sm z-10">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: `${platformBorderColor(connectModal.id)}15` }}
              >
                {connectModal.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cream">Connect {connectModal.name}</h3>
                <p className="text-[10px] text-cream/40">
                  Enter your {connectModal.name} username to link your account.
                </p>
              </div>
            </div>
            <input
              type="text"
              placeholder={`Your ${connectModal.name} username`}
              value={mockUsername}
              onChange={(e) => setMockUsername(e.target.value)}
              className="input-luxury mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            />
            <p className="text-[10px] text-cream/30 mb-4">
              OAuth authorization will be available soon. This mock flow links your account for testing.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleConnect}
                disabled={!mockUsername.trim() || actionLoading === connectModal.id}
                className="btn-gold flex-1 text-xs py-2"
              >
                {actionLoading === connectModal.id ? "Connecting..." : "Connect Account"}
              </button>
              <button
                onClick={() => setConnectModal(null)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
