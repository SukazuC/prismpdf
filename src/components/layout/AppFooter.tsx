import Link from "next/link";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { Lock } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="mt-auto pt-20 pb-8 px-4">
      <div className="page-shell">
        <div className="relative flex flex-col items-center justify-between gap-6 rounded-2xl border border-[rgba(148,163,184,0.22)] bg-[rgba(7,15,35,0.68)] px-5 py-6 backdrop-blur-2xl sm:px-8 lg:flex-row lg:items-center">
          {/* Gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(168,85,247,0.14))" }}
            aria-hidden="true"
          />

          {/* Left */}
          <div className="relative z-10 flex shrink-0 items-center gap-4">
            <BrandLogo variant="full" className="h-6 w-auto" />
            <span className="hidden text-sm text-slate-500 sm:inline">
              &copy; {new Date().getFullYear()} PrismPDF
            </span>
          </div>

          {/* Center links */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm lg:gap-6">
            <Link href="/tools" className="text-slate-400 hover:text-slate-200 transition-colors">
              All tools
            </Link>
            <Link href="/upload" className="text-slate-400 hover:text-slate-200 transition-colors">
              Upload
            </Link>
            <Link href="/merge-pdf" className="text-slate-400 hover:text-slate-200 transition-colors">
              Merge
            </Link>
            <Link href="/compress-pdf" className="text-slate-400 hover:text-slate-200 transition-colors">
              Compress
            </Link>
          </div>

          {/* Right */}
          <div className="relative z-10 flex min-w-0 items-center justify-center gap-2 text-center text-sm text-slate-500 lg:shrink-0 lg:justify-end lg:text-left">
            <Lock size={14} className="shrink-0" />
            <span>Secure by design. Built for simplicity.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
