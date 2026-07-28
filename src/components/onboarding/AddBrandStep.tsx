"use client";

import React, { useState } from "react";
import { Upload, Plus, X } from "lucide-react";

const contentTypes = [
  { id: "unboxing", label: "Unboxing", icon: "/icon-unboxing.svg" },
  { id: "voiceover", label: "Voiceover", icon: "/icon-voiceover.svg" },
  { id: "talking-head", label: "Talking Head", icon: "/icon-talking-head.svg" },
  { id: "ai-twin", label: "AI Twin", icon: "/icon-ai-twin.svg" },
  { id: "product-demo", label: "Product Demo", icon: "/icon-product-demo.svg" },
  { id: "trending-hook", label: "Trending Hook", icon: "/icon-trending-hook.svg" },
  { id: "storytelling", label: "Storytelling", icon: "/icon-storytelling.svg" },
];

interface AddBrandStepProps {
  onNext: (data: { brandName: string; selectedTypes: string[] }) => void;
  onBack: () => void;
}

export default function AddBrandStep({ onNext, onBack }: AddBrandStepProps) {
  const [brandName, setBrandName] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(["unboxing", "voiceover"]));

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    onNext({ brandName: brandName || "My Brand", selectedTypes: Array.from(selectedTypes) });
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-4 pt-8 pb-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cream mb-2">
            Add your first brand
          </h2>
          <p className="text-xs text-cream/50">
            You can manage multiple brands later in the dashboard.
          </p>
        </div>

        {/* Brand name input */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-cream/60 mb-2">
            Brand Name
          </label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Mellow Sleep"
            className="w-full px-4 py-3 rounded-xl bg-dark border border-cream/10 text-cream placeholder:text-cream/20 text-sm focus:outline-none focus:border-gold/40 transition-all"
          />
        </div>

        {/* Logo upload placeholder */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-cream/60 mb-2">
            Brand Logo
          </label>
          <div className="border-2 border-dashed border-cream/10 rounded-xl p-6 text-center hover:border-gold/20 transition-all cursor-pointer group">
            <Upload className="w-6 h-6 text-cream/20 mx-auto mb-2 group-hover:text-gold/40 transition-colors" />
            <p className="text-xs text-cream/30">
              <span className="text-gold/60">Upload</span> or drag & drop
            </p>
            <p className="text-[10px] text-cream/20 mt-1">PNG or JPG, max 2MB</p>
          </div>
        </div>

        {/* Content types */}
        <div className="mb-8">
          <label className="block text-xs font-medium text-cream/60 mb-3">
            Content types you want
          </label>
          <div className="grid grid-cols-2 gap-2">
            {contentTypes.map((ct) => {
              const selected = selectedTypes.has(ct.id);
              return (
                <button
                  key={ct.id}
                  onClick={() => toggleType(ct.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-300 ${
                    selected
                      ? "border-gold/30 bg-gold/5"
                      : "border-cream/10 bg-dark hover:border-gold/15"
                  }`}
                >
                  <img src={ct.icon} alt={ct.label} className="w-7 h-7 flex-shrink-0" />
                  <span className={`text-xs font-medium ${selected ? "text-cream" : "text-cream/50"}`}>
                    {ct.label}
                  </span>
                  {selected && (
                    <X
                      className="w-3 h-3 text-gold/40 ml-auto flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleType(ct.id);
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
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
            className="flex-1 py-3 rounded-xl text-xs font-semibold bg-gold text-dark hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
