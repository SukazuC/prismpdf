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
    <header className="sticky top-0 z-50 pt-4 px-4">
      <nav className="page-shell">
        <div className="relative flex items-center justify-between h-[72px] px-6 rounded-2xl bg-[rgba(7,15,35,0.68)] backdrop-blur-2xl border border-[rgba(148,163,184,0.22)] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
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
          <Link href="/" className="relative z-10 flex items-center gap-2 shrink-0">
            <BrandLogo variant="full" className="h-7 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 relative z-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
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
          <div className="relative z-10 flex items-center gap-3">
            <Link href="/upload">
              <GradientButton size="sm">Choose PDF Files</GradientButton>
            </Link>
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden relative z-10 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[rgba(148,163,184,0.08)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden mt-2 p-4 rounded-2xl bg-[rgba(7,15,35,0.9)] backdrop-blur-2xl border border-[rgba(148,163,184,0.22)] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
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
