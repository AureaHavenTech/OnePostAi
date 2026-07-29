"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
}

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Shortcut[] = [
    {
      key: "Ctrl+K / ⌘K",
      description: "Open search",
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-search], [placeholder*="search" i], [placeholder*="Search" i], input[type="search"]'
        );
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      key: "Ctrl+D / ⌘D",
      description: "Go to dashboard",
      action: () => router.push("/dashboard"),
    },
    {
      key: "Ctrl+S / ⌘S",
      description: "Go to settings",
      action: () => router.push("/dashboard/settings"),
    },
    {
      key: "Esc",
      description: "Close modal / dropdown",
      action: () => {
        // Press Escape natively to close any open dialogs
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      },
    },
    {
      key: "?",
      description: "Show keyboard shortcuts",
      action: () => setShowHelp(true),
    },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture shortcuts when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (tag === "DIV" && (e.target as HTMLElement).getAttribute("contenteditable") === "true");

      // Esc always works
      if (e.key === "Escape" && showHelp) {
        e.preventDefault();
        setShowHelp(false);
        return;
      }

      // ? always works (unless in an input)
      if (e.key === "?" && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Modified shortcuts don't apply in inputs
      if (isInput) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          '[data-search], input[type="search"], [placeholder*="search" i], [placeholder*="Search" i]'
        );
        if (searchInput) {
          searchInput.focus();
        }
      }

      if (mod && e.key === "d") {
        e.preventDefault();
        router.push("/dashboard");
      }

      if (mod && e.key === "s") {
        e.preventDefault();
        router.push("/dashboard/settings");
      }
    },
    [router, showHelp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowHelp(false)}
      />
      {/* Modal */}
      <div className="relative bg-[#1a1a24] border border-[#2a2a38] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#e8e0d4] font-['Playfair_Display']">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setShowHelp(false)}
            className="text-[#8a8a9a] hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0"
            >
              <span className="text-[#a0a0b0] text-sm">{s.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-[#2a2a38] text-[#c9a96e] rounded-md border border-[#3a3a48]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-[#6a6a7a] text-xs mt-4 text-center">
          Press <kbd className="px-1 text-[#c9a96e]">?</kbd> anytime to show this menu
        </p>
      </div>
    </div>
  );
}
