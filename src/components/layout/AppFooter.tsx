import Link from "next/link";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { Lock } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="mt-auto pt-20 pb-8 px-4">
      <div className="page-shell">
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 rounded-2xl bg-[rgba(7,15,35,0.68)] backdrop-blur-2xl border border-[rgba(148,163,184,0.22)]">
          {/* Gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(168,85,247,0.14))" }}
            aria-hidden="true"
          />

          {/* Left */}
          <div className="relative z-10 flex items-center gap-4">
            <BrandLogo variant="full" className="h-6 w-auto" />
            <span className="text-slate-500 text-sm hidden sm:inline">
              &copy; {new Date().getFullYear()} PrismPDF
            </span>
          </div>

          {/* Center links */}
          <div className="relative z-10 flex items-center gap-6 text-sm">
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
          <div className="relative z-10 flex items-center gap-2 text-sm text-slate-500">
            <Lock size={14} />
            <span>Secure by design. Built for simplicity.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
