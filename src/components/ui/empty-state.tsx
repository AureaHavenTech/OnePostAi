"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: "default" | "large";
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = "default",
  children,
}: EmptyStateProps) {
  const isLarge = variant === "large";

  const ActionButton = () => {
    if (!actionLabel) return null;
    const className =
      "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-lg shadow-gold/10 hover:shadow-gold/20";

    if (actionHref) {
      return (
        <Link href={actionHref}>
          <button className={className}>
            <Sparkles className="w-3.5 h-3.5" />
            {actionLabel}
          </button>
        </Link>
      );
    }

    return (
      <button onClick={onAction} className={className}>
        <Sparkles className="w-3.5 h-3.5" />
        {actionLabel}
      </button>
    );
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-4 ${
        isLarge ? "py-20" : "py-12"
      }`}
    >
      {/* Decorative background glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gold/5 blur-3xl scale-150" />
        {icon ? (
          <img
            src={icon}
            alt=""
            className={`relative z-10 ${isLarge ? "w-24 h-24" : "w-16 h-16"} opacity-80`}
          />
        ) : (
          <div
            className={`relative z-10 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center ${
              isLarge ? "w-24 h-24" : "w-16 h-16"
            }`}
          >
            <Sparkles
              className={`text-gold/40 ${isLarge ? "w-10 h-10" : "w-7 h-7"}`}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <h3
        className={`font-heading font-semibold text-cream mb-2 ${
          isLarge ? "text-xl sm:text-2xl" : "text-lg"
        }`}
      >
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-cream/50 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {ActionButton()}

      {children && <div className="mt-6 w-full max-w-sm">{children}</div>}

      {/* Decorative bottom dots */}
      <div className="flex items-center gap-2 mt-8 opacity-30">
        <div className="w-1 h-1 rounded-full bg-gold" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
        <div className="w-1 h-1 rounded-full bg-gold" />
      </div>
    </div>
  );
}
