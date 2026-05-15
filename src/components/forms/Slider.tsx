"use client";

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
};

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  className = "",
}: SliderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <label className="text-sm text-slate-400">{label}</label>}
          {showValue && (
            <span className="text-sm font-medium text-[#f8fafc]">
              {value}
              {max <= 100 ? "%" : ""}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[rgba(148,163,184,0.12)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#28c7ff] [&::-webkit-slider-thumb]:to-[#a855f7] [&::-webkit-slider-thumb]:shadow-[0_0_16px_rgba(53,213,255,0.4)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        aria-label={label || "Slider"}
      />
    </div>
  );
}
