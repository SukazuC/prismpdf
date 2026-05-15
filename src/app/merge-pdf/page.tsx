"use client";

import { useState, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { Dropzone } from "@/components/upload/Dropzone";
import { SortablePdfPageGrid } from "@/components/editor/SortablePdfPageGrid";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { StatCard } from "@/components/cards/StatCard";
import { FileRow } from "@/components/pdf/FileRow";
import { DocumentIntake } from "@/components/pdf/DocumentIntake";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { getVisiblePages } from "@/lib/workspace/workspace-selectors";
import { formatBytes } from "@/lib/files/download";
import { readPdfDocument } from "@/lib/pdf/read-pdf-document";
import { useRouter } from "next/navigation";
import { Files, Layers, Download } from "lucide-react";
import type { WorkspacePage } from "@/lib/workspace/workspace-types";
import type { UploadedFileStatus } from "@/lib/pdf/types";

export default function MergePdfPage() {
  const router = useRouter();
  const { state, dispatch } = useWorkspace();
  const [gridColumns, setGridColumns] = useState(6);

  const visiblePages = useMemo(() => getVisiblePages(state), [state]);
  const totalPages = useMemo(() => visiblePages.length, [visiblePages]);
  const totalSize = useMemo(
    () => state.files.reduce((sum, f) => sum + f.sizeBytes, 0),
    [state.files]
  );

  const hasFiles = state.files.length > 0;

  const handleSelect = useCallback(
    (id: string) => {
      dispatch({ type: "selectionToggle", pageId: id });
    },
    [dispatch]
  );

  const handleReorder = useCallback(
    (pages: WorkspacePage[]) => {
      dispatch({ type: "pagesReordered", pages });
    },
    [dispatch]
  );

  const handleRemoveFile = useCallback(
    (id: string) => {
      dispatch({ type: "fileRemoved", fileId: id });
    },
    [dispatch]
  );

  const handleMerge = useCallback(() => {
    dispatch({
      type: "taskCreated",
      task: {
        id: `task-${Date.now()}`,
        operation: "merge",
        settings: { outputName: "merged-document.pdf" },
        createdAt: Date.now(),
      },
    });
    router.push("/processing");
  }, [dispatch, router]);

  const handleReady = useCallback(() => {
    // File is ready, user presses continue - shows editor automatically
  }, []);

  const handleAddMoreFiles = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        
        dispatch({
          type: "filesAdded",
          files: [{
            id,
            file,
            name: file.name,
            sizeBytes: file.size,
            mimeType: file.type || "application/pdf",
            pageCount: 0,
            status: "reading",
          }],
        });

        const info = await readPdfDocument(file);

        if (info.error) {
          dispatch({ type: "fileStatusChanged", fileId: id, status: "error", error: info.error });
          continue;
        }

        dispatch({ type: "fileStatusChanged", fileId: id, status: "ready", pageCount: info.pageCount });

        const pages: WorkspacePage[] = [];
        for (let i = 0; i < info.pageCount; i++) {
          const thumb = info.thumbnails.find((t) => t.pageIndex === i);
          pages.push({
            id: `${id}-p${i + 1}`,
            fileId: id,
            sourceFileName: file.name,
            sourcePageIndex: i + 1,
            outputIndex: -1,
            thumbnailUrl: thumb?.url,
            width: thumb?.width,
            height: thumb?.height,
            rotation: 0,
          });
        }
        dispatch({ type: "pagesAdded", pages });
      }
    },
    [dispatch]
  );

  // State: No files → show DocumentIntake
  if (!hasFiles) {
    return (
      <AppShell backdropVariant="editor">
        <section className="page-shell pt-8 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-[28px] font-bold text-[#f8fafc]">Merge PDF</h1>
              <p className="text-sm text-slate-400 mt-1">
                Combine multiple PDFs into a single document
              </p>
            </div>
            <DocumentIntake operation="merge" onReady={handleReady} />
          </div>
        </section>
      </AppShell>
    );
  }

  // State: Has files → show editor
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
          <GradientButton onClick={handleMerge} size="lg" disabled={state.files.filter(f => f.status === "ready").length < 2}>
            <Download size={18} />
            Merge PDFs
          </GradientButton>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard label="Files" value={state.files.length} accent="cyan" icon={<Files size={18} />} />
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
                {state.files.map((f) => (
                  <FileRow
                    key={f.id}
                    file={{
                      id: f.id,
                      name: f.name,
                      sizeBytes: f.sizeBytes,
                      pageCount: f.pageCount,
                      type: f.mimeType,
                      status: f.status === "reading" ? "uploading" : f.status as UploadedFileStatus,
                    }}
                    onRemove={() => handleRemoveFile(f.id)}
                  />
                ))}
              </div>
              <div className="mt-3">
                <Dropzone
                  onFilesAccepted={handleAddMoreFiles}
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
                selectionCount={state.selectedPageIds.length}
              />
            </div>

            {/* Sortable page grid */}
            <div className="min-h-[400px]">
              {visiblePages.length > 0 ? (
                <SortablePdfPageGrid
                  pages={visiblePages}
                  columns={gridColumns}
                  selectedIds={new Set(state.selectedPageIds)}
                  onSelect={handleSelect}
                  onReorder={handleReorder}
                />
              ) : (
                <GlassPanel className="p-12 text-center" intensity="soft">
                  <p className="text-slate-400">No pages remain</p>
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
