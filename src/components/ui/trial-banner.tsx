"use client";

import React, { useEffect, useState } from "react";
import { getTrialStats, getTrialRemainingText } from "@/lib/trial";
import { X } from "lucide-react";

export function TrialBanner() {
  const [visible, setVisible] = useState(true);
  const [stats, setStats] = useState<ReturnType<typeof getTrialStats> | null>(null);
  const [remainingText, setRemainingText] = useState("");

  useEffect(() => {
    const update = () => {
      const s = getTrialStats();
      setStats(s);
      setRemainingText(getTrialRemainingText());
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!visible || !stats) return null;
  if (!stats.active && stats.hoursRemaining <= 0) return null;

  const maxPercent = Math.max(
    stats.usage.contentGenerations / stats.limits.contentGenerations,
    stats.usage.imageGenerations / stats.limits.imageGenerations,
    stats.usage.scheduledPosts / stats.limits.scheduledPosts,
    stats.usage.connectedAccounts / stats.limits.connectedAccounts,
  ) * 100;

  return (
    <div className="bg-slate-900/80 border-b border-brand-500/20 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider whitespace-nowrap">
            Free Trial
          </span>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {remainingText}
          </span>
          <div className="flex-1 max-w-[200px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, maxPercent)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {stats.usage.contentGenerations}/{stats.limits.contentGenerations} gens ·{" "}
            {stats.usage.scheduledPosts}/{stats.limits.scheduledPosts} posts
          </span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-slate-600 hover:text-slate-400 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
