"use client";

import React, { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = "Loading...",
  fullScreen = true,
}: LoadingScreenProps) {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center"
    : "flex items-center justify-center py-20";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-8">
        {/* OP Monogram with pulse */}
        <div className="relative">
          {/* Outer pulse ring */}
          <div
            className="absolute -inset-8 rounded-full border border-gold/20 animate-ping opacity-20"
            style={{ animationDuration: "3s" }}
          />
          {/* Middle pulse ring */}
          <div
            className="absolute -inset-4 rounded-full border border-gold/30 animate-ping opacity-30"
            style={{ animationDuration: "2s", animationDelay: "0.5s" }}
          />
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-full bg-gold/5 blur-lg" />

          {/* Logo */}
          <img
            src="/op-icon-512.svg"
            alt="OnePost AI"
            className="relative z-10 w-20 h-20 drop-shadow-[0_0_30px_rgba(201,169,110,0.25)]"
          />
        </div>

        {/* Loading text with animated dots */}
        <div className="flex items-center gap-1">
          <p className="text-sm text-cream/50 font-medium">
            {message}
          </p>
          <span className="text-sm text-gold font-medium w-5 text-left">
            {".".repeat(dotCount)}
          </span>
        </div>

        {/* Gold progress bar */}
        <div className="w-40 h-0.5 bg-cream/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold via-gold-light to-gold rounded-full animate-shimmer"
            style={{
              backgroundSize: "200% 100%",
              animation: "shimmerLoader 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmerLoader {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
}
