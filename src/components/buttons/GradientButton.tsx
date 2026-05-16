"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

type GradientButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  ariaLabel?: string;
};

export function GradientButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ariaLabel,
}: GradientButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[rgba(56,189,248,0.9)] focus-visible:shadow-[0_0_0_6px_rgba(56,189,248,0.16)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100";

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-2.5",
  };

  const variants: Record<string, string> = {
    primary: `
      bg-gradient-to-r from-[#28c7ff] via-[#1668ff] via-[#a855f7] to-[#f04cff]
      text-white
      shadow-[0_0_32px_rgba(59,130,246,0.42),0_0_42px_rgba(168,85,247,0.28)]
      hover:shadow-[0_0_40px_rgba(59,130,246,0.54),0_0_52px_rgba(168,85,247,0.36)]
      hover:scale-[1.02] active:scale-[0.98]
    `,
    secondary: `
      bg-[rgba(7,15,35,0.68)]
      border border-[rgba(148,163,184,0.22)]
      text-slate-200
      backdrop-blur-2xl
      hover:bg-[rgba(12,25,55,0.78)] hover:border-[rgba(148,163,184,0.36)]
      hover:scale-[1.02] active:scale-[0.98]
      shadow-[0_8px_32px_rgba(0,0,0,0.32)]
    `,
    ghost: `
      bg-transparent
      text-slate-300
      hover:bg-[rgba(148,163,184,0.08)]
      active:bg-[rgba(148,163,184,0.14)]
    `,
    danger: `
      bg-gradient-to-r from-[#fb7185] to-[#f43f5e]
      text-white
      shadow-[0_0_24px_rgba(251,113,133,0.36)]
      hover:shadow-[0_0_32px_rgba(251,113,133,0.48)]
      hover:scale-[1.02] active:scale-[0.98]
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {/* Inner highlight for primary */}
      {variant === "primary" && (
        <span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 whitespace-nowrap">{children}</span>
    </button>
  );
}
