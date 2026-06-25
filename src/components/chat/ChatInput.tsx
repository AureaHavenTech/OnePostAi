"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Zap } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EXAMPLE_PROMPTS = [
  "Find me 50 SaaS companies hiring senior React developers in California and find their recruiter emails",
  "Research the top 20 AI startups that raised Series A in 2026 and compile founder contact info",
  "Scrape list of early-stage startups raising Seed rounds in SF and draft a personalized outreach pitch",
];

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showExamples, setShowExamples] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    setShowExamples(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    setShowExamples(false);
    // Focus the textarea
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      {/* Example prompts (shown when no messages yet) */}
      {showExamples && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            Try an example
          </p>
          <div className="grid gap-2">
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(prompt)}
                className="text-left p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-brand-500/30 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <Zap className="h-4 w-4 text-brand-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-slate-400 group-hover:text-slate-200 leading-relaxed">
                    {prompt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end gap-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-2 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/30 transition-all duration-200 shadow-xl shadow-black/20">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Tell Axel AI what to do... (e.g., \"Find me 50 SaaS companies hiring in SF and draft an intro email\")"}
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 resize-none outline-none px-3 py-2 max-h-[200px] leading-relaxed min-h-[44px]"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0 shadow-lg shadow-brand-500/20"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 px-1">
          {disabled ? "Axel AI is processing your request..." : "Press Enter to send · Shift+Enter for new line"}
        </p>
      </form>
    </div>
  );
}