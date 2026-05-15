"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { FormatPicker } from "@/components/pdf/FormatPicker";
import { demoPages } from "@/lib/demo-data";
import { useRouter } from "next/navigation";
import { Download, FileText, AlertTriangle } from "lucide-react";

const formatOptions = [
  { value: "docx", label: "Word (.docx)" },
  { value: "jpg", label: "JPG (.jpg)" },
  { value: "png", label: "PNG (.png)" },
  { value: "pptx", label: "PowerPoint (.pptx)" },
  { value: "txt", label: "Text (.txt)" },
];

const formatConversionStatus: Record<string, "ready" | "demo" | "coming-soon"> = {
  docx: "demo",
  jpg: "ready",
  png: "ready",
  pptx: "coming-soon",
  txt: "demo",
};

export default function ConvertPdfPage() {
  const router = useRouter();
  const [format, setFormat] = useState("jpg");
  const [mergeAll, setMergeAll] = useState(false);

  const status = formatConversionStatus[format] || "demo";

  const handleConvert = () => {
    router.push(`/processing?operation=convert&fileName=document.${format}&next=/success`);
  };

  return (
    <AppShell backdropVariant="editor">
      <section className="page-shell pt-8 pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#f8fafc] break-words">Convert PDF</h1>
          <p className="text-sm text-slate-400 mt-1">
            Convert your PDF to any format you need
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-5">
          {/* Left sidebar */}
          <div className="space-y-4">
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Source file</h3>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(148,163,184,0.04)]">
                <FileText size={16} className="text-cyan-300" />
                <span className="text-sm text-slate-300 truncate">Annual Report 2024.pdf</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">12 pages · 4.2 MB</p>
            </GlassPanel>

            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Settings</h3>
              <div className="space-y-4">
                {format === "jpg" || format === "png" ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Merge all pages into one file</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={mergeAll}
                      onClick={() => setMergeAll(!mergeAll)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        mergeAll
                          ? "bg-gradient-to-r from-[#28c7ff] to-[#a855f7]"
                          : "bg-[rgba(148,163,184,0.2)]"
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          mergeAll ? "translate-x-[22px]" : "translate-x-[2px]"
                        }`}
                      />
                    </button>
                  </div>
                ) : null}
                <p className="text-xs text-slate-500">
                  {format === "jpg" || format === "png"
                    ? "Each page will be saved as a separate image file."
                    : format === "txt"
                      ? "Extracts text content. Layout may differ from source."
                      : "Conversion preserves layout and formatting where possible."}
                </p>
              </div>
            </GlassPanel>

            {/* Status info */}
            {status === "demo" && (
              <GlassPanel className="p-4 border-[rgba(236,76,255,0.2)]" intensity="soft">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-magenta flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-[#f8fafc]">Preview mode</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      This conversion is in preview. Final fidelity will be confirmed before launch.
                    </p>
                  </div>
                </div>
              </GlassPanel>
            )}

            {status === "coming-soon" && (
              <GlassPanel className="p-4 border-[rgba(236,76,255,0.2)]" intensity="soft">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-magenta flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-[#f8fafc]">Coming soon</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Real PPTX conversion will be available in a future update.
                    </p>
                  </div>
                </div>
              </GlassPanel>
            )}

            <GradientButton
              onClick={handleConvert}
              size="lg"
              className="w-full"
              disabled={status === "coming-soon"}
            >
              <Download size={18} />
              Convert to {format.toUpperCase()}
            </GradientButton>
          </div>

          {/* Right workspace */}
          <div className="space-y-4">
            {/* Format picker */}
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Output format</h3>
              <FormatPicker options={formatOptions} selected={format} onChange={setFormat} />
            </GlassPanel>

            {/* Preview comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Source</p>
                <GlassPanel className="p-4" intensity="soft">
                  <div className="aspect-[5/7] max-w-[180px] mx-auto rounded-lg overflow-hidden border border-[rgba(148,163,184,0.15)] bg-white">
                    <img src={demoPages[0].thumbnailUrl} alt="Source" className="w-full h-full object-cover" />
                  </div>
                </GlassPanel>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                  Output preview
                </p>
                <GlassPanel className="p-4" intensity="soft">
                  <div className="aspect-[5/7] max-w-[180px] mx-auto rounded-lg overflow-hidden border border-[rgba(148,163,184,0.15)] flex items-center justify-center bg-[rgba(7,15,35,0.5)]">
                    <FileText size={40} className="text-cyan-300/50" />
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>
        </div>

        {/* Supported formats strip */}
        <GlassPanel className="p-5 mt-6" intensity="soft">
          <h4 className="text-sm font-semibold text-[#f8fafc] mb-3">Supported conversions</h4>
          <div className="flex flex-wrap gap-2">
            {formatOptions.map((opt) => {
              const s = formatConversionStatus[opt.value];
              return (
                <span
                  key={opt.value}
                  onClick={() => s !== "coming-soon" && setFormat(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    format === opt.value
                      ? "bg-[rgba(53,213,255,0.15)] border-cyan-400/50 text-cyan-300"
                      : s === "coming-soon"
                        ? "bg-[rgba(148,163,184,0.04)] border-[rgba(148,163,184,0.12)] text-slate-500 opacity-60 cursor-not-allowed"
                        : "bg-[rgba(148,163,184,0.04)] border-[rgba(148,163,184,0.12)] text-slate-300 hover:border-[rgba(148,163,184,0.3)]"
                  }`}
                >
                  {opt.label}
                  {s === "coming-soon" && " (soon)"}
                  {s === "demo" && " *"}
                </span>
              );
            })}
          </div>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
