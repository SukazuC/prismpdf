"use client";

import { Check } from "lucide-react";

type Step = {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "error";
};

type ProcessingStepperProps = {
  steps: Step[];
  className?: string;
};

export function ProcessingStepper({ steps, className = "" }: ProcessingStepperProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, idx) => {
        const isComplete = step.status === "complete";
        const isActive = step.status === "active";
        const isError = step.status === "error";

        return (
          <div key={step.id} className="flex items-center gap-3">
            {/* Step indicator */}
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                isComplete
                  ? "bg-green-500 text-white"
                  : isActive
                    ? "bg-gradient-to-r from-[#28c7ff] to-[#a855f7] text-white shadow-[0_0_16px_rgba(53,213,255,0.4)]"
                    : isError
                      ? "bg-red-500 text-white"
                      : "bg-[rgba(148,163,184,0.1)] text-slate-500"
              }`}
            >
              {isComplete ? (
                <Check size={14} />
              ) : isError ? (
                <span>!</span>
              ) : (
                idx + 1
              )}
            </div>

            {/* Label */}
            <span
              className={`text-sm ${
                isComplete
                  ? "text-slate-300"
                  : isActive
                    ? "text-[#f8fafc] font-medium"
                    : isError
                      ? "text-red-400"
                      : "text-slate-500"
              }`}
            >
              {step.label}
            </span>

            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  isComplete ? "bg-green-500/50" : "bg-[rgba(148,163,184,0.1)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
