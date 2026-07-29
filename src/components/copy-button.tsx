"use client";

import React, { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function CopyButton({ text, label = "Copy", className = "", size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
      document.body.removeChild(textarea);
    }
  }, [text]);

  const sizeClass = size === "sm" ? "p-1.5 text-xs" : "p-2 text-sm";

  if (copied) {
    return (
      <button
        className={`inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ${sizeClass} ${className}`}
        disabled
      >
        <Check className="w-3 h-3" />
        Copied!
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#a0a0b0] hover:text-white border border-white/10 hover:border-white/20 transition-all ${sizeClass} ${className}`}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
    >
      <Copy className="w-3 h-3" />
      {size === "md" && <span>{label}</span>}
    </button>
  );
}
