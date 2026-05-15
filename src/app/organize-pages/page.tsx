"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { PdfPageGrid } from "@/components/editor/PdfPageGrid";
import { SelectionBar } from "@/components/editor/SelectionBar";
import { StatCard } from "@/components/cards/StatCard";
import { demoPages } from "@/lib/demo-data";
import type { PdfPage } from "@/lib/pdf/types";
import { useRouter } from "next/navigation";
import { Layers, Download, FileText } from "lucide-react";
import Link from "next/link";

export default function OrganizePagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PdfPage[]>(demoPages.filter((p) => p.fileId === "annual-report-2024"));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [gridColumns, setGridColumns] = useState(6);
  const [undoStack, setUndoStack] = useState<PdfPage[][]>([]);
  const [redoStack, setRedoStack] = useState<PdfPage[][]>([]);

  const totalPages = pages.length;
  const selectedCount = selectedIds.size;

  // Save state for undo
  const saveState = useCallback(
    (newPages: PdfPage[]) => {
      setUndoStack((prev) => [...prev.slice(-20), pages]); // max 20 undo levels
      setRedoStack([]);
      setPages(newPages);
    },
    [pages]
  );

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(pages.map((p) => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const newPages = pages.filter((p) => !selectedIds.has(p.id));
    saveState(newPages);
    setSelectedIds(new Set());
  };

  const handleRotateLeft = () => {
    if (selectedIds.size === 0) return;
    const newPages = pages.map((p) => {
      if (selectedIds.has(p.id)) {
        const newRotation: Record<number, 0 | 90 | 180 | 270> = {
          0: 270,
          90: 0,
          180: 90,
          270: 180,
        };
        return { ...p, rotation: newRotation[p.rotation] ?? 0 };
      }
      return p;
    });
    saveState(newPages);
  };

  const handleRotateRight = () => {
    if (selectedIds.size === 0) return;
    const newPages = pages.map((p) => {
      if (selectedIds.has(p.id)) {
        const newRotation: Record<number, 0 | 90 | 180 | 270> = {
          0: 90,
          90: 180,
          180: 270,
          270: 0,
        };
        return { ...p, rotation: newRotation[p.rotation] ?? 90 };
      }
      return p;
    });
    saveState(newPages);
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.size === 0) return;
    const newPages = [...pages];
    let maxGlobal = pages.reduce((max, p) => Math.max(max, p.globalIndex), -1);
    const inserted: PdfPage[] = [];
    pages.forEach((p) => {
      if (selectedIds.has(p.id)) {
        maxGlobal++;
        inserted.push({
          ...p,
          id: `${p.id}-dup-${Date.now()}-${maxGlobal}`,
          globalIndex: maxGlobal,
          selected: false,
        });
      }
    });
    // Insert duplicates after the last selected original
    const lastSelectedIdx = pages.reduce(
      (max, p, i) => (selectedIds.has(p.id) ? i : max),
      -1
    );
    newPages.splice(lastSelectedIdx + 1, 0, ...inserted);
    saveState(newPages);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((prevStack) => [...prevStack, pages]);
    setUndoStack((prevStack) => prevStack.slice(0, -1));
    setPages(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prevStack) => [...prevStack, pages]);
    setRedoStack((prevStack) => prevStack.slice(0, -1));
    setPages(next);
  };

  const handleExport = () => {
    router.push("/processing?operation=organize&fileName=organized-document.pdf&next=/success");
  };

  return (
    <AppShell backdropVariant="editor">
      <section className="page-shell pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <Link href="/tools" className="hover:text-slate-200 transition-colors">
            Tools
          </Link>
          <span>/</span>
          <span className="text-slate-200">Organize Pages</span>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#f8fafc] break-words">Organize Pages</h1>
            <p className="text-sm text-slate-400 mt-1">
              Reorder, rotate, delete, or duplicate pages
            </p>
          </div>
          <GradientButton onClick={handleExport} size="lg">
            <Download size={18} />
            Export PDF
          </GradientButton>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard label="Total pages" value={totalPages} accent="cyan" icon={<Layers size={18} />} />
          {selectedCount > 0 && (
            <StatCard label="Selected" value={selectedCount} accent="violet" icon={<FileText size={18} />} />
          )}
        </div>

        {/* Main three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_270px] gap-4">
          {/* Left sidebar - Document info */}
          <div className="space-y-4">
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Document</h3>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(148,163,184,0.04)]">
                <FileText size={16} className="text-cyan-300" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-300 truncate">Annual Report 2024.pdf</p>
                  <p className="text-xs text-slate-500">{totalPages} pages</p>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-[rgba(148,163,184,0.08)] transition-colors"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-[rgba(148,163,184,0.08)] transition-colors"
                >
                  Deselect all
                </button>
                {selectedCount > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleRotateLeft}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-[rgba(148,163,184,0.08)] transition-colors"
                    >
                      Rotate left
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateRight}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-[rgba(148,163,184,0.08)] transition-colors"
                    >
                      Rotate right
                    </button>
                    <button
                      type="button"
                      onClick={handleDuplicateSelected}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-[rgba(148,163,184,0.08)] transition-colors"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteSelected}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-[rgba(251,113,133,0.1)] transition-colors"
                    >
                      Delete selected ({selectedCount})
                    </button>
                  </>
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Navigation</h3>
              <div className="space-y-1 text-xs text-slate-400">
                <p>Shift+click to range select</p>
                <p>Delete to remove selected</p>
                <p>Ctrl+Z to undo</p>
              </div>
            </GlassPanel>
          </div>

          {/* Center - Page grid */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <EditorToolbar
                onUndo={handleUndo}
                onRedo={handleRedo}
                onZoomIn={() => setGridColumns((c) => Math.min(c + 1, 10))}
                onZoomOut={() => setGridColumns((c) => Math.max(c - 1, 2))}
                onRotateLeft={handleRotateLeft}
                onRotateRight={handleRotateRight}
                onDelete={handleDeleteSelected}
                onDuplicate={handleDuplicateSelected}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
                selectionCount={selectedCount}
              />
            </div>

            {/* Selection bar */}
            <SelectionBar
              totalCount={totalPages}
              selectedCount={selectedCount}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onDeleteSelected={handleDeleteSelected}
            />

            {/* Page grid */}
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
                <p className="text-slate-400">No pages remain in this document</p>
                <button
                  type="button"
                  onClick={handleUndo}
                  className="mt-2 text-sm text-cyan-300 hover:text-cyan-200"
                  disabled={undoStack.length === 0}
                >
                  {undoStack.length > 0 ? "Undo last action" : "Upload a new file to begin"}
                </button>
              </GlassPanel>
            )}
          </div>

          {/* Right - Properties/actions */}
          <div className="space-y-4">
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Properties</h3>
              {selectedCount === 1 ? (() => {
                const selected = pages.find((p) => selectedIds.has(p.id));
                return selected ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Page</span>
                      <span className="text-slate-200">{selected.localIndex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rotation</span>
                      <span className="text-slate-200">{selected.rotation}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source</span>
                      <span className="text-slate-200 truncate max-w-[120px]">{selected.sourceFileName}</span>
                    </div>
                  </div>
                ) : null;
              })() : selectedCount > 1 ? (
                <p className="text-sm text-slate-400">{selectedCount} pages selected</p>
              ) : (
                <p className="text-sm text-slate-500">Select a page to view properties</p>
              )}
            </GlassPanel>

            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Output</h3>
              <p className="text-xs text-slate-400">
                {totalPages} pages · organized-document.pdf
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="mt-3 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#28c7ff] via-[#1668ff] via-[#a855f7] to-[#f04cff] text-white text-sm font-semibold"
              >
                Export PDF
              </button>
            </GlassPanel>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
