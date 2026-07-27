"use client";

import React, { useEffect } from "react";
import { useTrial } from "@/hooks/use-trial";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import type { TrialLimitKey } from "@/lib/trial";

interface TrialGuardProps {
  limitType: TrialLimitKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function TrialGuard({ limitType, children, fallback }: TrialGuardProps) {
  const { trackUsage, reachedLimitKey, showUpgradeModal, setShowUpgradeModal } = useTrial();
  const [blocked, setBlocked] = React.useState(false);

  useEffect(() => {
    // Check if we can proceed
    const result = trackUsage(limitType);
    if (!result.allowed) {
      setBlocked(true);
    }
  }, [limitType, trackUsage]);

  if (blocked) {
    return (
      <>
        {fallback ?? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-400 text-lg mb-4">
              You've reached the limit for this feature on your free trial.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-6 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors"
            >
              Upgrade to Continue
            </button>
          </div>
        )}
        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType={reachedLimitKey ?? limitType}
        />
      </>
    );
  }

  return <>{children}</>;
}
