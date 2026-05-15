"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { Download, FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatBytes } from "@/lib/demo-data";

type ResultFileCardProps = {
  name: string;
  sizeBytes: number;
  format: string;
  downloadUrl?: string;
  previewUrl?: string;
};

export function ResultFileCard({ name, sizeBytes, format, downloadUrl, previewUrl }: ResultFileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  return (
    <GlassPanel className="p-6">
      <div className="flex items-start gap-5">
        {/* Preview */}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="File preview"
            className="w-20 h-28 object-cover rounded-lg border border-[rgba(148,163,184,0.15)]"
          />
        ) : (
          <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-[rgba(53,213,255,0.1)] to-[rgba(168,85,247,0.1)] flex items-center justify-center border border-[rgba(148,163,184,0.15)]">
            <FileText size={32} className="text-cyan-300" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[#f8fafc] truncate">{name}</h3>
          <p className="text-sm text-slate-400 mt-1">
            {formatBytes(sizeBytes)} &middot; {format.toUpperCase()}
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <a href={downloadUrl} download={name}>
              <GradientButton size="sm">
                <Download size={16} />
                Download
              </GradientButton>
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[rgba(7,15,35,0.68)] border border-[rgba(148,163,184,0.22)] text-slate-300 hover:bg-[rgba(12,25,55,0.78)] transition-all"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy filename"}
            </button>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
