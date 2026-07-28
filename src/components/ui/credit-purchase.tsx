"use client";
import React, { useState } from "react";
import { CREDIT_PACKS, addCredits, getCreditBalance, getCreditStats, type CreditPack } from "@/lib/credits";
import { Sparkles, ShieldCheck, Check, X, Zap, ArrowRight, Loader2, Coins } from "lucide-react";

interface CreditPurchaseProps {
  open: boolean;
  onClose: () => void;
  onPurchaseComplete?: (pack: CreditPack) => void;
}

export function CreditPurchaseModal({ open, onClose, onPurchaseComplete }: CreditPurchaseProps) {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState<string | null>(null);
  const stats = getCreditStats();

  if (!open) return null;

  const handlePurchase = async (pack: CreditPack) => {
    setSelectedPack(pack.id);
    setPurchasing(true);

    // Simulate purchase delay
    await new Promise((r) => setTimeout(r, 1500));

    addCredits(pack.credits);
    setPurchasing(false);
    setPurchased(pack.id);
    onPurchaseComplete?.(pack);

    // Reset after animation
    setTimeout(() => {
      setPurchased(null);
      setSelectedPack(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-950 border border-brand-500/20 rounded-2xl shadow-2xl shadow-brand-500/10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20 flex items-center justify-center">
                <Coins className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Buy Credits</h2>
                <p className="text-xs text-slate-400">Pay-as-you-go for premium AI actions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Current Balance */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Your Credit Balance</span>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-brand-400" />
                <span className="text-xl font-bold text-white">{stats.balance}</span>
                <span className="text-xs text-slate-500">credits</span>
              </div>
            </div>
          </div>

          {/* Credit Packs */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Choose a Pack</h3>
            {CREDIT_PACKS.map((pack) => {
              const isSelected = selectedPack === pack.id;
              const isPurchased = purchased === pack.id;
              const isProcessing = isSelected && purchasing;

              return (
                <button
                  key={pack.id}
                  onClick={() => !isProcessing && !isPurchased && handlePurchase(pack)}
                  disabled={isProcessing || isPurchased}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isPurchased
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : isSelected && isProcessing
                      ? "border-brand-500/50 bg-brand-500/10"
                      : "border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50"
                  } ${pack.popular ? "ring-1 ring-brand-500/30" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        pack.popular ? "bg-brand-500/20" : "bg-slate-800"
                      }`}>
                        {isPurchased ? (
                          <Check className="h-5 w-5 text-emerald-400" />
                        ) : isProcessing ? (
                          <Loader2 className="h-5 w-5 text-brand-400 animate-spin" />
                        ) : (
                          <Zap className={`h-5 w-5 ${pack.popular ? "text-brand-400" : "text-slate-400"}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{pack.name}</span>
                          {pack.popular && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/20">
                              Best Value
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{pack.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">${pack.price}</div>
                      <div className="text-xs text-slate-500">{pack.credits} credits</div>
                    </div>
                  </div>

                  {/* Per-credit cost */}
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600">
                    <span>{(pack.price / pack.credits).toFixed(2)}¢ per credit</span>
                    {pack.id === "creator" && (
                      <span className="text-emerald-500"> — best rate</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Credit costs reference */}
          <details className="mb-6">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors">
              How many credits does each action cost?
            </summary>
            <div className="mt-3 space-y-1.5 bg-slate-900/30 border border-slate-800 rounded-lg p-3">
              {Object.entries(stats.costs).map(([action, cost]) => (
                <div key={action} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 capitalize">{action.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-slate-500">{cost} credit{cost > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </details>

          {/* Trust */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>30-day money-back guarantee on all purchases</span>
          </div>
        </div>
      </div>
    </div>
  );
}