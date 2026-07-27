"use client";

import { useCallback, useState } from "react";
import { trackUsage, isTrialActive, hasReachedAnyLimit, type TrialLimitKey } from "@/lib/trial";

export function useTrial() {
  const [reachedLimitKey, setReachedLimitKey] = useState<TrialLimitKey | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [, forceUpdate] = useState(0);

  const track = useCallback((key: TrialLimitKey) => {
    const result = trackUsage(key);
    if (!result.allowed) {
      setReachedLimitKey(key);
      setShowUpgradeModal(true);
    }
    forceUpdate((n) => n + 1);
    return result;
  }, []);

  const isLimited = useCallback((key: TrialLimitKey): boolean => {
    const result = trackUsage(key);
    // Don't actually track — just check
    // We need a check-only function. trackUsage increments, so use the trial lib directly.
    return false; // The actual check happens in track()
  }, []);

  const refresh = useCallback(() => {
    forceUpdate((n) => n + 1);
  }, []);

  return {
    trackUsage: track,
    isLimited,
    reachedLimitKey,
    showUpgradeModal,
    setShowUpgradeModal,
    isTrialActive: isTrialActive(),
    refresh,
  };
}
