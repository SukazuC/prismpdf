"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { StatCard } from "@/components/cards/StatCard";
import { demoPages } from "@/lib/demo-data";
import { useRouter } from "next/navigation";
import { Download, FileDown, TrendingDown, FileText } from "lucide-react";

const compressionLevels = [
  { id: "low", label: "Low", desc: "Best quality, ~10% smaller", savings: 10 },
  { id: "balanced", label: "Balanced", desc: "Good quality, ~60% smaller", savings: 60 },
  { id: "strong", label: "Strong", desc: "Smaller size, ~80% smaller", savings: 80 },
];

export default function CompressPdfPage() {
  const router = useRouter();
  const [level, setLevel] = useState("balanced");
  const [optimizeImages, setOptimizeImages] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(false);

  const selectedLevel = compressionLevels.find((l) => l.id === level) || compressionLevels[1];
  const originalSize = 4200000; // 4.2 MB demo
  const estimatedSize = Math.round(originalSize * (1 - selectedLevel.savings / 100));
  const savedBytes = originalSize - estimatedSize;

  const handleCompress = () => {
    router.push("/processing?operation=compress&fileName=annual-report-2024-compressed.pdf&next=/success");
  };

  return (
    <AppShell backdropVariant="editor">
      <section className="page-shell pt-8 pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#f8fafc] break-words">Compress PDF</h1>
          <p className="text-sm text-slate-400 mt-1">
            Reduce file size while preserving quality
          </p>
        </div>

        {/* Savings stats */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard label="Original size" value="4.2 MB" accent="cyan" icon={<FileText size={18} />} />
          <StatCard label="Estimated size" value={`${(estimatedSize / 1024 / 1024).toFixed(1)} MB`} accent="green" icon={<FileDown size={18} />} />
          <StatCard label="You save" value={`~${selectedLevel.savings}%`} accent="magenta" icon={<TrendingDown size={18} />} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-5">
          {/* Left settings */}
          <div className="space-y-4">
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-4">Compression level</h3>
              <div className="space-y-3">
                {compressionLevels.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLevel(l.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      level === l.id
                        ? "bg-gradient-to-r from-[rgba(53,213,255,0.15)] to-[rgba(168,85,247,0.15)] border border-cyan-400/50"
                        : "bg-[rgba(148,163,184,0.04)] border border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.25)]"
                    }`}
                    aria-pressed={level === l.id}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${level === l.id ? "text-cyan-300" : "text-slate-300"}`}>
                        {l.label}
                      </span>
                      <span className="text-xs text-green-400">~{l.savings}% smaller</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{l.desc}</p>
                  </button>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-4">Additional options</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Optimize images</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={optimizeImages}
                    onClick={() => setOptimizeImages(!optimizeImages)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      optimizeImages
                        ? "bg-gradient-to-r from-[#28c7ff] to-[#a855f7]"
                        : "bg-[rgba(148,163,184,0.2)]"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        optimizeImages ? "translate-x-[22px]" : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Remove metadata</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={removeMetadata}
                    onClick={() => setRemoveMetadata(!removeMetadata)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      removeMetadata
                        ? "bg-gradient-to-r from-[#28c7ff] to-[#a855f7]"
                        : "bg-[rgba(148,163,184,0.2)]"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        removeMetadata ? "translate-x-[22px]" : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </GlassPanel>

            <GradientButton onClick={handleCompress} size="lg" className="w-full">
              <Download size={18} />
              Compress PDF
            </GradientButton>

            <p className="text-xs text-slate-500 text-center">
              Savings are estimated. Actual results may vary.
            </p>
          </div>

          {/* Right preview */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Original</p>
                <GlassPanel className="p-4" intensity="soft">
                  <div className="aspect-[5/7] max-w-[200px] mx-auto rounded-lg overflow-hidden border border-[rgba(148,163,184,0.15)] bg-white">
                    <img src={demoPages[0].thumbnailUrl} alt="Original preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-slate-400 text-center mt-2">4.2 MB</p>
                </GlassPanel>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Estimated result</p>
                <GlassPanel className="p-4" intensity="soft">
                  <div className="aspect-[5/7] max-w-[200px] mx-auto rounded-lg overflow-hidden border border-[rgba(148,163,184,0.15)] bg-white">
                    <img src={demoPages[0].thumbnailUrl} alt="Compressed preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-slate-400 text-center mt-2">{(estimatedSize / 1024 / 1024).toFixed(1)} MB</p>
                </GlassPanel>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom cards */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <GlassPanel className="p-5" intensity="soft">
            <h4 className="text-sm font-semibold text-[#f8fafc] mb-2">Estimated download size</h4>
            <p className="text-2xl font-bold text-green-400">{(estimatedSize / 1024 / 1024).toFixed(1)} MB</p>
            <p className="text-xs text-slate-400 mt-1">
              Reduced from {(originalSize / 1024 / 1024).toFixed(1)} MB (save {formatSavedBytes(savedBytes)})
            </p>
          </GlassPanel>
          <GlassPanel className="p-5" intensity="soft">
            <h4 className="text-sm font-semibold text-[#f8fafc] mb-2">Recommendation</h4>
            <p className="text-sm text-slate-300">
              {level === "strong"
                ? "Best for email attachments and web uploads with size limits."
                : level === "low"
                  ? "Best for print-ready documents where quality matters most."
                  : "Balanced compression for everyday use — good quality, small size."}
            </p>
          </GlassPanel>
        </div>
      </section>
    </AppShell>
  );
}

function formatSavedBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
