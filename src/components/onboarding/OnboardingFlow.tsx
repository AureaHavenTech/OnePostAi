"use client";

import React, { useState, useCallback } from "react";
import WelcomeStep from "./WelcomeStep";
import ConnectPlatformsStep from "./ConnectPlatformsStep";
import AddBrandStep from "./AddBrandStep";
import FirstContentStep from "./FirstContentStep";
import SuccessStep from "./SuccessStep";

const TOTAL_STEPS = 5;
const STEP_LABELS = ["Welcome", "Connect", "Brand", "Create", "Done"];

interface OnboardingData {
  brandName: string;
  selectedTypes: string[];
  prompt: string;
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [data, setData] = useState<OnboardingData>({
    brandName: "",
    selectedTypes: [],
    prompt: "",
  });

  const goNext = useCallback(() => {
    setDirection("forward");
    setExiting(true);
    setTimeout(() => {
      setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
      setExiting(false);
    }, 250);
  }, []);

  const goBack = useCallback(() => {
    setDirection("back");
    setExiting(true);
    setTimeout(() => {
      setStep((s) => Math.max(s - 1, 0));
      setExiting(false);
    }, 250);
  }, []);

  const handleSkip = useCallback(() => {
    window.location.href = "/dashboard";
  }, []);

  const handleBrandNext = useCallback(
    (brandData: { brandName: string; selectedTypes: string[] }) => {
      setData((prev) => ({
        ...prev,
        brandName: brandData.brandName,
        selectedTypes: brandData.selectedTypes,
      }));
      goNext();
    },
    [goNext]
  );

  const handleContentNext = useCallback(
    (prompt: string) => {
      setData((prev) => ({ ...prev, prompt }));
      goNext();
    },
    [goNext]
  );

  return (
    <div className="min-h-screen bg-dark font-body">
      {/* Progress bar + dots */}
      {step < TOTAL_STEPS - 1 && (
        <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-4 pb-2 bg-dark/90 backdrop-blur-md">
          <div className="max-w-md mx-auto">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-3">
              {STEP_LABELS.map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      i < step
                        ? "bg-gold"
                        : i === step
                        ? "bg-gold animate-pulse"
                        : "bg-cream/15"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-medium transition-colors duration-300 ${
                      i <= step ? "text-cream/60" : "text-cream/20"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress track */}
            <div className="h-0.5 bg-cream/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / (TOTAL_STEPS - 2)) * 100}%` }}
              />
            </div>

            {/* Step counter + skip */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-cream/30">
                Step {step + 1} of {TOTAL_STEPS - 1}
              </span>
              {step < TOTAL_STEPS - 2 && (
                <button
                  onClick={handleSkip}
                  className="text-[10px] text-cream/20 hover:text-cream/50 transition-colors"
                >
                  Skip all
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step content with transition */}
      <div className="pt-16">
        <div
          className={`transition-all duration-300 ease-out ${
            exiting
              ? direction === "forward"
                ? "opacity-0 -translate-x-6"
                : "opacity-0 translate-x-6"
              : "opacity-100 translate-x-0"
          }`}
        >
          {step === 0 && <WelcomeStep onNext={goNext} onSkip={handleSkip} />}
          {step === 1 && <ConnectPlatformsStep onNext={goNext} onBack={goBack} />}
          {step === 2 && <AddBrandStep onNext={handleBrandNext} onBack={goBack} />}
          {step === 3 && <FirstContentStep onNext={handleContentNext} onBack={goBack} />}
          {step === 4 && <SuccessStep brandName={data.brandName} prompt={data.prompt} />}
        </div>
      </div>
    </div>
  );
}
