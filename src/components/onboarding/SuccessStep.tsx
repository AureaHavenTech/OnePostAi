"use client";

import React, { useEffect, useState } from "react";
import { Check, ArrowRight, Zap, Film, CalendarDays, MessageSquareText } from "lucide-react";
import Link from "next/link";

interface SuccessStepProps {
  brandName: string;
  prompt: string;
}

const pipelineSteps = [
  { icon: MessageSquareText, label: "Script Generated", delay: 0 },
  { icon: Film, label: "Video Created", delay: 800 },
  { icon: Zap, label: "Captions & Hashtags", delay: 1600 },
  { icon: CalendarDays, label: "Scheduled", delay: 2400 },
];

export default function SuccessStep({ brandName, prompt }: SuccessStepProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    pipelineSteps.forEach((step, i) => {
      setTimeout(() => {
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.add(i);
          return next;
        });
        if (i === pipelineSteps.length - 1) {
          setTimeout(() => setShowFinal(true), 600);
        }
      }, step.delay);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="max-w-md w-full">
        {!showFinal ? (
          <>
            {/* Pipeline animation */}
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream mb-2">
              Creating your content
            </h2>
            <p className="text-xs text-cream/50 mb-8">
              AI is generating everything for {brandName || "your brand"}
            </p>

            <div className="space-y-3 mb-8">
              {pipelineSteps.map((step, i) => {
                const done = completedSteps.has(i);
                const Icon = step.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      done
                        ? "border-gold/30 bg-gold/5"
                        : "border-cream/5 bg-dark"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        done ? "bg-gold/20" : "bg-cream/5"
                      }`}
                    >
                      {done ? (
                        <Check className="w-5 h-5 text-gold" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-cream/20 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${done ? "text-cream" : "text-cream/30"}`}>
                        {step.label}
                      </p>
                      {done && (
                        <p className="text-[10px] text-gold/60 mt-0.5">
                          {i === 0 && "Hook + script + captions"}
                          {i === 1 && "15-sec video with text overlays"}
                          {i === 2 && "Platform-optimized for each"}
                          {i === 3 && "Optimal times across 7 platforms"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Loading prompt preview */}
            <div className="p-3 rounded-xl bg-dark border border-cream/5 text-left">
              <p className="text-[10px] text-cream/30 mb-1">Your prompt:</p>
              <p className="text-xs text-cream/60 italic">&ldquo;{prompt}&rdquo;</p>
            </div>
          </>
        ) : (
          <>
            {/* Success celebration */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping opacity-30" style={{ animationDuration: "2s" }} />
              <div className="w-20 h-20 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center mx-auto relative z-10">
                <Check className="w-8 h-8 text-gold" />
              </div>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream mb-2">
              You&apos;re all set!
            </h2>
            <p className="text-sm text-cream/50 mb-2 max-w-xs mx-auto">
              Your first post for <span className="text-gold font-semibold">{brandName || "your brand"}</span> is being created and scheduled.
            </p>
            <p className="text-xs text-gold/60 mb-10 flex items-center justify-center gap-1.5">
              <Zap className="w-3 h-3" />
              Content goes live at optimal times — automatically.
            </p>

            <Link href="/dashboard">
              <button className="px-10 py-3.5 rounded-xl text-sm font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-xl shadow-gold/20 hover:shadow-gold/30 inline-flex items-center gap-2">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>

            <Link href="/support">
              <button className="block mx-auto mt-3 text-xs text-cream/40 hover:text-gold transition-colors">
                Try AI Chat instead
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
