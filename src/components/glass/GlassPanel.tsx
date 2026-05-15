"use client";

import { type ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
  intensity?: "soft" | "default" | "strong";
  as?: "section" | "div" | "aside" | "article";
};

export function GlassPanel({
  children,
  className = "",
  intensity = "default",
  as: Tag = "div",
}: GlassPanelProps) {
  const intensityStyles = {
    soft: "bg-[rgba(7,15,35,0.5)] border-[rgba(148,163,184,0.15)]",
    default: "bg-[rgba(7,15,35,0.68)] border-[rgba(148,163,184,0.22)]",
    strong: "bg-[rgba(12,25,55,0.78)] border-[rgba(148,163,184,0.32)]",
  };

  return (
    <Tag
      className={`relative overflow-hidden rounded-2xl backdrop-blur-2xl border ${intensityStyles[intensity]} shadow-[0_24px_80px_rgba(0,0,0,0.42)] ${className}`}
    >
      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(168,85,247,0.14))",
        }}
        aria-hidden="true"
      />
      {/* Top highlight line */}
      <div
        className="pointer-events-none absolute top-0 left-8 right-8 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(148,163,184,0.3), transparent)",
        }}
        aria-hidden="true"
      />
      {/* Inner border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow: "inset 0 1px 0 rgba(148,163,184,0.12)",
        }}
        aria-hidden="true"
      />
      {children}
    </Tag>
  );
}
