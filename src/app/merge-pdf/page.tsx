"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { Dropzone } from "@/components/upload/Dropzone";
import { PdfPageGrid } from "@/components/editor/PdfPageGrid";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { StatCard } from "@/components/cards/StatCard";
import { FileRow } from "@/components/pdf/FileRow";
import { formatBytes, demoFiles, demoPages } from "@/lib/demo-data";
import type { PdfPage, UploadedFile } from "@/lib/pdf/types";
import { useRouter } from "next/navigation";
import { Files, Layers, Download } from "lucide-react";

export default function MergePdfPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>(
    demoFiles.map((f) => ({ ...f, status: "ready" as const, type: "application/pdf" }))
  );
  const [pages] = useState<PdfPage[]>(demoPages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [gridColumns, setGridColumns] = useState(6);

  const totalPages = useMemo(() => pages.length, [pages]);
  const totalSize = useMemo(
    () => files.reduce((sum, f) => sum + f.sizeBytes, 0),
    [files]
  );

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFilesAccepted = (_accepted: File[]) => {
    // In demo mode, just add existing demo files
    // Real implementation would read actual files
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = () => {
    router.push("/processing?operation=merge&fileName=merged-output.pdf&next=/success");
  };

  return (
    <AppShell backdropVariant="editor">
      <section className="page-shell pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#f8fafc] break-words">Merge PDF</h1>
            <p className="text-sm text-slate-400 mt-1">
              Combine multiple PDFs into a single document
            </p>
          </div>
          <GradientButton onClick={handleMerge} size="lg">
            <Download size={18} />
            Merge PDFs
          </GradientButton>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard label="Files" value={files.length} accent="cyan" icon={<Files size={18} />} />
          <StatCard label="Total pages" value={totalPages} accent="violet" icon={<Layers size={18} />} />
          <StatCard label="Total size" value={formatBytes(totalSize)} accent="green" icon={<Download size={18} />} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-5">
          {/* Left sidebar */}
          <div className="space-y-4">
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Upload files</h3>
              <div className="space-y-2">
                {files.map((f) => (
                  <FileRow key={f.id} file={f} onRemove={handleRemoveFile} />
                ))}
              </div>
              <div className="mt-3">
                <Dropzone
                  onFilesAccepted={handleFilesAccepted}
                  title="Add more PDFs"
                  subtitle=""
                  ctaLabel="Browse"
                  className="min-h-0"
                  accept={[".pdf"]}
                  multiple={true}
                />
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Merge settings</h3>
              <p className="text-xs text-slate-400">
                Pages will be merged in the order shown below. Drag to reorder.
              </p>
            </GlassPanel>

            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Output file</h3>
              <p className="text-xs text-slate-400">merged-document.pdf</p>
              <p className="text-xs text-slate-500 mt-1">
                {formatBytes(totalSize)} &middot; {totalPages} pages
              </p>
            </GlassPanel>
          </div>

          {/* Right canvas */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <EditorToolbar
                onZoomIn={() => setGridColumns((c) => Math.min(c + 1, 10))}
                onZoomOut={() => setGridColumns((c) => Math.max(c - 1, 2))}
                gridMode={true}
                selectionCount={selectedIds.size}
              />
            </div>

            {/* Page grid */}
            <div className="min-h-[400px]">
              {pages.length > 0 ? (
                <PdfPageGrid
                  pages={pages}
                  columns={gridColumns}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                  showDragHandle={true}
                />
              ) : (
                <GlassPanel className="p-12 text-center" intensity="soft">
                  <p className="text-slate-400">Upload PDFs to see page previews</p>
                </GlassPanel>
              )}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <GlassPanel className="p-6 mt-8" intensity="soft">
          <h3 className="section-title text-[#f8fafc] mb-2">How it works</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-slate-400">
            <div className="flex gap-3">
              <span className="text-cyan-300 font-bold">1</span>
              <span>Upload the PDFs you want to combine</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-300 font-bold">2</span>
              <span>Drag to reorder pages in the desired sequence</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-300 font-bold">3</span>
              <span>Click merge to combine them into one PDF</span>
            </div>
          </div>
        </GlassPanel>
      </section>
    </AppShell>
  );
}
