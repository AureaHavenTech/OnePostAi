"use client";

import React, { useState } from "react";
import { Check, Link2 } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  short: string;
  color: string;
}

const platforms: Platform[] = [
  { id: "tiktok", name: "TikTok", short: "TT", color: "#c9a96e" },
  { id: "instagram", name: "Instagram", short: "IG", color: "#d4b87a" },
  { id: "facebook", name: "Facebook", short: "FB", color: "#c9a96e" },
  { id: "youtube", name: "YouTube", short: "YT", color: "#d4b87a" },
  { id: "linkedin", name: "LinkedIn", short: "in", color: "#c9a96e" },
  { id: "snapchat", name: "Snapchat", short: "SC", color: "#d4b87a" },
  { id: "pinterest", name: "Pinterest", short: "P", color: "#c9a96e" },
];

interface ConnectPlatformsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ConnectPlatformsStep({ onNext, onBack }: ConnectPlatformsStepProps) {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const connectedCount = connected.size;

  const toggle = (id: string) => {
    setConnected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-4 pt-8 pb-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream mb-2">
            Connect your platforms
          </h2>
          <p className="text-xs text-cream/50">
            Select where you want to publish. Connect them later in Settings.
          </p>
        </div>

        {/* Platform grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {platforms.map((p) => {
            const isConnected = connected.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 text-left ${
                  isConnected
                    ? "border-gold/40 bg-gold/5 shadow-[0_0_15px_rgba(201,169,110,0.1)]"
                    : "border-cream/10 bg-dark hover:border-gold/20"
                }`}
              >
                {/* Platform badge */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isConnected ? "bg-gold/20 text-gold" : "bg-cream/5 text-cream/40"
                  }`}
                >
                  {p.short}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${isConnected ? "text-cream" : "text-cream/60"}`}>
                    {p.name}
                  </p>
                  <p className={`text-[10px] ${isConnected ? "text-gold" : "text-cream/30"}`}>
                    {isConnected ? "Connected" : "Tap to connect"}
                  </p>
                </div>
                {isConnected && (
                  <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-dark" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link2 className="w-3.5 h-3.5 text-gold/40" />
          <span className="text-xs text-cream/40">
            {connectedCount} of {platforms.length} connected
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl text-xs font-medium border border-cream/10 text-cream/50 hover:border-cream/30 hover:text-cream/70 transition-all"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-xl text-xs font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
          >
            {connectedCount === 0 ? "Skip for now" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
