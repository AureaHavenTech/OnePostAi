"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

export default function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  const [visible, setVisible] = useState(false);
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 3,
    }))
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 text-center overflow-hidden">
      {/* Gold particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-gold"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />

      {/* Content */}
      <div
        className={`relative z-10 transition-all duration-1000 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* OP Monogram with pulse */}
        <div className="relative mx-auto mb-8 w-28 h-28">
          <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping opacity-30" style={{ animationDuration: "3s" }} />
          <img
            src="/op-icon-512.svg"
            alt="OnePost AI"
            className="relative z-10 w-28 h-28 mx-auto drop-shadow-[0_0_30px_rgba(201,169,110,0.3)]"
          />
        </div>

        {/* Welcome text */}
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-cream mb-3">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">
            OnePost AI
          </span>
        </h1>
        <p className="text-sm text-cream/50 max-w-sm mx-auto leading-relaxed mb-2">
          The only app you need. One conversation, AI generates everything, one click to publish.
        </p>
        <p className="text-xs text-gold/60 flex items-center justify-center gap-1.5 mb-10">
          <Sparkles className="w-3 h-3" />
          Let&apos;s get you set up in under 2 minutes.
        </p>

        {/* CTA */}
        <button
          onClick={onNext}
          className="px-10 py-3.5 rounded-xl text-sm font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-xl shadow-gold/20 hover:shadow-gold/30"
        >
          Get Started
        </button>

        {/* Skip */}
        <button
          onClick={onSkip}
          className="block mx-auto mt-4 text-xs text-cream/30 hover:text-cream/60 transition-colors"
        >
          Skip setup — take me to the dashboard
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-15px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-20px) translateX(3px); }
        }
      `}</style>
    </div>
  );
}
