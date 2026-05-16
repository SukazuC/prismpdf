"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { GradientButton } from "@/components/buttons/GradientButton";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Merge", href: "/merge-pdf" },
  { label: "Compress", href: "/compress-pdf" },
  { label: "Convert", href: "/convert-pdf" },
  { label: "Cut PDF", href: "/cut-pdf" },
  { label: "All tools", href: "/tools" },
];

export function AppHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-3 pt-4 sm:px-4">
      <nav className="page-shell">
        <div className="relative flex h-[72px] items-center justify-between gap-3 rounded-2xl border border-[rgba(148,163,184,0.22)] bg-[rgba(7,15,35,0.68)] px-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:px-6">
          {/* Gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(168,85,247,0.14))" }}
            aria-hidden="true"
          />
          {/* Top highlight */}
          <div
            className="pointer-events-none absolute top-0 left-8 right-8 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.3), transparent)" }}
            aria-hidden="true"
          />

          {/* Logo */}
          <Link href="/" className="relative z-10 flex shrink-0 items-center gap-2">
            <BrandLogo variant="full" className="h-9 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="relative z-10 hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-cyan-300 bg-[rgba(53,213,255,0.1)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[rgba(148,163,184,0.08)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right CTA */}
          <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/upload">
              <GradientButton size="sm" className="whitespace-nowrap">
                <span className="sm:hidden">Upload</span>
                <span className="hidden sm:inline lg:hidden">Choose PDF</span>
                <span className="hidden lg:inline">Choose PDF Files</span>
              </GradientButton>
            </Link>
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="relative z-10 rounded-lg p-2 text-slate-400 hover:bg-[rgba(148,163,184,0.08)] hover:text-slate-200 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="mt-2 rounded-2xl border border-[rgba(148,163,184,0.22)] bg-[rgba(7,15,35,0.9)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl lg:hidden">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-cyan-300 bg-[rgba(53,213,255,0.1)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[rgba(148,163,184,0.08)]"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}
