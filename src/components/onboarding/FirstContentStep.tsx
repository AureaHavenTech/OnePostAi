"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";

const examplePrompts = [
  { text: "Create an unboxing video for my sleep gummies, post to TikTok and IG 3x/week", icon: "📦" },
  { text: "Make a product demo for my skincare serum, trending hook style, all platforms", icon: "✨" },
  { text: "Generate a storytelling video about my brand story, post weekly on YouTube", icon: "📖" },
  { text: "Create AI twin videos reviewing my supplement line, casual UGC style", icon: "🤖" },
];

interface FirstContentStepProps {
  onNext: (prompt: string) => void;
  onBack: () => void;
}

export default function FirstContentStep({ onNext, onBack }: FirstContentStepProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setSelectedExample(example);
  };

  const handleContinue = () => {
    onNext(prompt || examplePrompts[0].text);
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-4 pt-8 pb-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream mb-2">
            Let&apos;s create your first post
          </h2>
          <p className="text-xs text-cream/50">
            Just tell the AI what you need. It handles everything.
          </p>
        </div>

        {/* Prompt input */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-cream/60 mb-2">
            What do you want to create?
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setSelectedExample(null);
              }}
              placeholder="Describe your content — be as specific as you like..."
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl bg-dark border border-cream/10 text-cream placeholder:text-cream/20 text-sm focus:outline-none focus:border-gold/40 transition-all resize-none"
            />
            <div className="absolute bottom-3 right-3">
              <Sparkles className="w-4 h-4 text-gold/40" />
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Lightbulb className="w-3 h-3 text-gold/40" />
            <span className="text-[10px] text-cream/40 uppercase tracking-wider">Example prompts</span>
          </div>
          <div className="space-y-2">
            {examplePrompts.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(ex.text)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 ${
                  selectedExample === ex.text
                    ? "border-gold/40 bg-gold/5"
                    : "border-cream/10 bg-dark hover:border-gold/20"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-sm mt-0.5">{ex.icon}</span>
                  <span
                    className={`text-xs leading-relaxed ${
                      selectedExample === ex.text ? "text-cream" : "text-cream/50"
                    }`}
                  >
                    {ex.text}
                  </span>
                  <ArrowRight
                    className={`w-3 h-3 ml-auto flex-shrink-0 mt-0.5 transition-colors ${
                      selectedExample === ex.text ? "text-gold" : "text-cream/20"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pro tip */}
        <div className="mb-8 p-3 rounded-xl bg-gold/5 border border-gold/10">
          <p className="text-[10px] text-gold/60 leading-relaxed">
            <span className="font-semibold">Pro tip:</span> Be specific! Mention your product, preferred style, platforms, and posting frequency. The AI adapts to every detail.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl text-xs font-medium border border-cream/10 text-cream/50 hover:border-cream/30 hover:text-cream/70 transition-all"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 py-3 rounded-xl text-xs font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-lg shadow-gold/10 inline-flex items-center justify-center gap-1.5"
          >
            Create Content
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
