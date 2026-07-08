"use client";
import React, { useState } from "react";
import { POST_TRIAL_OPTIONS } from "@/lib/credits";
import { CreditPurchaseModal } from "@/components/ui/credit-purchase";
import { X, Sparkles, ShieldCheck, ArrowRight, Zap, Coins, Gift } from "lucide-react";

interface UpgradeModalProps {
  limitType?: string;
  onClose?: () => void;
  open?: boolean;
}

const OPTION_ICONS: Record<string, React.ReactNode> = {
  "upgrade-monthly": <Sparkles className="h-5 w-5 text-brand-400" />,
  "buy-credits": <Coins className="h-5 w-5 text-brand-400" />,
  "continue-free": <Gift className="h-5 w-5 text-slate-400" />,
};

export function UpgradeModal({ limitType, onClose, open = true }: UpgradeModalProps) {
  const [showCredits, setShowCredits] = useState(false);

  if (!open) return null;

  const limitLabel = limitType
    ? limitType.replace(/([A-Z])/g, " $1").toLowerCase()
    : "usage";

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-md bg-slate-950 border border-brand-500/20 rounded-2xl shadow-2xl shadow-brand-500/10 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-brand-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Trial Limit Reached</h2>
              <p className="text-sm text-slate-400">
                You&apos;ve reached the free limit for <strong className="text-slate-200">{limitLabel}</strong>.
              </p>
            </div>

            {/* 3 Post-Trial Options */}
            <div className="space-y-2.5 mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                Choose how to continue
              </h3>
              {POST_TRIAL_OPTIONS.map((option) => (
                <a
                  key={option.id}
                  href={option.href}
                  onClick={(e) => {
                    if (option.id === "buy-credits") {
                      e.preventDefault();
                      setShowCredits(true);
                    }
                  }}
                  className={`block p-3.5 rounded-xl border transition-all ${
                    option.highlight
                      ? "border-brand-500/40 bg-brand-500/10 hover:bg-brand-500/15"
                      : option.id === "continue-free"
                      ? "border-slate-800/60 bg-slate-900/20 hover:bg-slate-900/40"
                      : "border-slate-800 bg-slate-900/30 hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      option.highlight ? "bg-brand-500/15" : "bg-slate-800/50"
                    }`}>
                      {OPTION_ICONS[option.id] || <Zap className="h-5 w-5 text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          option.highlight ? "text-brand-300" : "text-white"
                        }`}>
                          {option.title}
                        </span>
                        {option.highlight && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/20">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                    </div>
                    <ArrowRight className={`h-4 w-4 shrink-0 ${
                      option.highlight ? "text-brand-400" : "text-slate-600"
                    }`} />
                  </div>
                </a>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>30-day money-back guarantee on all plans</span>
            </div>
          </div>
        </div>
      </div>

      <CreditPurchaseModal open={showCredits} onClose={() => setShowCredits(false)} />
    </>
  );
}