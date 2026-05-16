"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { FormatPicker } from "@/components/pdf/FormatPicker";
import { DocumentIntake } from "@/components/pdf/DocumentIntake";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { getVisiblePages, getActiveFile } from "@/lib/workspace/workspace-selectors";
import { useRouter } from "next/navigation";
import { Download, FileText, AlertTriangle, Globe, Cpu } from "lucide-react";

const formatOptions = [
  { value: "jpg", label: "JPG (.jpg)", mode: "local" as const, desc: "Each page as a JPEG image" },
  { value: "png", label: "PNG (.png)", mode: "local" as const, desc: "Each page as a PNG image" },
  { value: "txt", label: "Text (.txt)", mode: "local" as const, desc: "Extract selectable text" },
  { value: "docx", label: "Word (.docx)", mode: "server" as const, desc: "Best-effort editable document" },
  { value: "pptx", label: "PowerPoint (.pptx)", mode: "server" as const, desc: "Visual slide deck" },
];

export default function ConvertPdfPage() {
  const router = useRouter();
  const { state, dispatch } = useWorkspace();
  const [format, setFormat] = useState("jpg");

  const activeFile = getActiveFile(state);
  const hasFile = activeFile?.status === "ready";
  const visiblePages = getVisiblePages(state);
  const selectedFormat = formatOptions.find((f) => f.value === format);

  const workerUnavailable = selectedFormat?.mode === "server" &&
    !process.env.NEXT_PUBLIC_PDF_WORKER_URL;
  const canConvert = !workerUnavailable;

  const handleConvert = () => {
    dispatch({
      type: "taskCreated",
      task: {
        id: `task-${Date.now()}`,
        operation: "convert",
        settings: { format },
        createdAt: Date.now(),
      },
    });
    router.push("/processing");
  };

  if (!hasFile) {
    return (
      <AppShell backdropVariant="editor">
        <section className="page-shell pt-8 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-[28px] font-bold text-[#f8fafc]">Convert PDF</h1>
              <p className="text-sm text-slate-400 mt-1">
                Convert your PDF to any format you need
              </p>
            </div>
            <DocumentIntake operation="convert" onReady={() => {}} />
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell backdropVariant="editor">
      <section className="page-shell pt-8 pb-28 lg:pb-16">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#f8fafc] break-words">Convert PDF</h1>
          <p className="text-sm text-slate-400 mt-1">
            Convert your PDF to any format you need
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-5">
          <div className="order-2 space-y-4 lg:order-1">
            <GlassPanel className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#f8fafc]">Source file</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => activeFile && dispatch({ type: "fileRemoved", fileId: activeFile.id })}
                    className="text-xs text-slate-400 hover:text-red-300 transition-colors"
                  >
                    Remove file
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "workspaceReset" })}
                    className="text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    Replace file
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(148,163,184,0.04)]">
                <FileText size={16} className="text-cyan-300" />
                <div className="min-w-0">
                  <span className="text-sm text-slate-300 truncate block">
                    {activeFile?.name || "document.pdf"}
                  </span>
                  <span className="text-xs text-slate-500">{visiblePages.length} pages</span>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Settings</h3>
              <FormatPicker
                options={formatOptions.map((f) => ({ value: f.value, label: f.label }))}
                selected={format}
                onChange={setFormat}
              />
              {selectedFormat && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  {selectedFormat.mode === "local" ? (
                    <>
                      <Globe size={12} className="text-green-400" />
                      <span className="text-green-400">Browser-local</span>
                    </>
                  ) : (
                    <>
                      <Cpu size={12} className="text-cyan-400" />
                      <span className="text-cyan-400">Server processed</span>
                    </>
                  )}
                  <span className="text-slate-500">· {selectedFormat.desc}</span>
                </div>
              )}
            </GlassPanel>

            {workerUnavailable && (
              <GlassPanel className="p-4 border-[rgba(251,113,133,0.3)]" intensity="soft">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-[#f8fafc]">Worker unavailable</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      This conversion requires a processing server. Set NEXT_PUBLIC_PDF_WORKER_URL to enable it.
                    </p>
                  </div>
                </div>
              </GlassPanel>
            )}

            <GradientButton
              onClick={handleConvert}
              size="lg"
              className="hidden w-full lg:inline-flex"
              disabled={!canConvert}
            >
              <Download size={18} />
              Convert to {format.toUpperCase()}
            </GradientButton>
          </div>

          <div className="order-1 min-w-0 space-y-4 lg:order-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">Source</p>
                <GlassPanel className="p-4" intensity="soft">
                  <div className="aspect-[5/7] max-w-[180px] mx-auto rounded-lg overflow-hidden border border-[rgba(148,163,184,0.15)] bg-white">
                    {visiblePages[0]?.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Source preview uses a dynamic PDF thumbnail object URL.
                      <img src={visiblePages[0].thumbnailUrl} alt="Source" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[rgba(148,163,184,0.06)] flex items-center justify-center">
                        <FileText size={24} className="text-slate-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    {visiblePages.length} page{visiblePages.length !== 1 ? "s" : ""}
                  </p>
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
                  <p className="text-xs text-slate-400 text-center mt-2">
                    .{format} format
                  </p>
                </GlassPanel>
              </div>
            </div>

            <GlassPanel className="p-5" intensity="soft">
              <h4 className="text-sm font-semibold text-[#f8fafc] mb-3">Supported conversions</h4>
              <div className="flex flex-wrap gap-2">
                {formatOptions.map((opt) => (
                  <span
                    key={opt.value}
                    onClick={() => setFormat(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      format === opt.value
                        ? "bg-[rgba(53,213,255,0.15)] border-cyan-400/50 text-cyan-300"
                        : "bg-[rgba(148,163,184,0.04)] border-[rgba(148,163,184,0.12)] text-slate-300 hover:border-[rgba(148,163,184,0.3)]"
                    }`}
                  >
                    {opt.label}
                    {opt.mode === "server" && (
                      <span className="ml-1 text-[10px] text-cyan-400">· server</span>
                    )}
                  </span>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(148,163,184,0.15)] bg-[rgba(7,15,35,0.92)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <GradientButton onClick={handleConvert} size="lg" className="w-full" disabled={!canConvert}>
          <Download size={18} />
          Convert to {format.toUpperCase()}
        </GradientButton>
      </div>
    </AppShell>
  );
}
