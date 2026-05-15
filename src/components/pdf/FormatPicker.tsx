"use client";

import { Check } from "lucide-react";

type FormatOption = {
  value: string;
  label: string;
  description?: string;
};

type FormatPickerProps = {
  options: FormatOption[];
  selected: string;
  onChange: (value: string) => void;
};

export function FormatPicker({ options, selected, onChange }: FormatPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isSelected
                ? "bg-gradient-to-r from-[rgba(53,213,255,0.15)] to-[rgba(168,85,247,0.15)] border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(53,213,255,0.15)]"
                : "bg-[rgba(7,15,35,0.5)] border border-[rgba(148,163,184,0.15)] text-slate-400 hover:border-[rgba(148,163,184,0.3)] hover:text-slate-300"
            }`}
            aria-pressed={isSelected}
          >
            {isSelected && <Check size={14} className="text-cyan-300" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
