"use client";

type TextFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
};

export function TextField({
  value,
  onChange,
  placeholder,
  label,
  error,
  className = "",
  onKeyDown,
}: TextFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm text-slate-400">{label}</label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full h-11 px-4 rounded-xl bg-[rgba(7,15,35,0.68)] backdrop-blur-2xl border text-sm text-[#f8fafc] placeholder:text-slate-500 focus:outline-none transition-all ${
          error
            ? "border-red-400 focus:border-red-400"
            : "border-[rgba(148,163,184,0.22)] focus:border-[rgba(56,189,248,0.5)]"
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${label}-error` : undefined}
      />
      {error && (
        <p id={`${label}-error`} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
