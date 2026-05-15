"use client";

import { type ReactNode } from "react";

type IconButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel: string;
  active?: boolean;
};

export function IconButton({
  children,
  className = "",
  disabled = false,
  onClick,
  ariaLabel,
  active = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        relative inline-flex items-center justify-center
        w-9 h-9 rounded-lg
        transition-all duration-150
        disabled:opacity-30 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-[rgba(56,189,248,0.9)]
        ${
          active
            ? "bg-[rgba(53,213,255,0.14)] text-cyan-300 shadow-[inset_0_0_0_1px_rgba(53,213,255,0.3)]"
            : "text-slate-400 hover:bg-[rgba(148,163,184,0.1)] hover:text-slate-200"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}
