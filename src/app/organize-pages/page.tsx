"use client";

import { useState, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { SortablePdfPageGrid } from "@/components/editor/SortablePdfPageGrid";
import { SelectionBar } from "@/components/editor/SelectionBar";
import { StatCard } from "@/components/cards/StatCard";
import { DocumentIntake } from "@/components/pdf/DocumentIntake";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { getVisiblePages, getActiveFile } from "@/lib/workspace/workspace-selectors";
import type { WorkspacePage } from "@/lib/workspace/workspace-types";
import { useRouter } from "next/navigation";
import { Layers, Download, FileText } from "lucide-react";
import Link from "next/link";

export default function OrganizePagesPage() {
  const router = useRouter();
  const { state, dispatch } = useWorkspace();
  const [gridColumns, setGridColumns] = useState(6);

  const [undoStack, setUndoStack] = useState<WorkspacePage[][]>([]);
  const [redoStack, setRedoStack] = useState<WorkspacePage[][]>([]);

  const visiblePages = getVisiblePages(state);
  const activeFile = getActiveFile(state);
  const totalPages = visiblePages.length;
  const selectedCount = state.selectedPageIds.length;
  const hasFile = state.files.length > 0;

  const saveState = useCallback(
    (newPages: WorkspacePage[]) => {
      setUndoStack((prev) => [...prev.slice(-20), state.pages]);
      setRedoStack([]);
      dispatch({ type: "pagesReordered", pages: newPages });
    },
    [state.pages, dispatch]
  );

  const handleSelect = (id: string) => {
    dispatch({ type: "selectionToggle", pageId: id });
  };

  const handleSelectAll = () => {
    const ids = visiblePages.map((p) => p.id);
    dispatch({ type: "selectionSet", pageIds: ids });
  };

  const handleDeselectAll = () => {
    dispatch({ type: "selectionClear" });
  };

  const handleDeleteSelected = () => {
    if (selectedCount === 0) return;
    const deletedIds = new Set(state.selectedPageIds);
    const newPages = state.pages.map((p) =>
      deletedIds.has(p.id) ? { ...p, deleted: true } : p
    );
    saveState(newPages);
    dispatch({ type: "selectionClear" });
  };

  const handleRotateLeft = () => {
    if (selectedCount === 0) return;
    const newPages = state.pages.map((p) => {
      if (state.selectedPageIds.includes(p.id)) {
        const newRotation: Record<number, 0 | 90 | 180 | 270> = {
          0: 270, 90: 0, 180: 90, 270: 180,
        };
        return { ...p, rotation: newRotation[p.rotation] ?? 0 };
      }
      return p;
    });
    saveState(newPages);
  };

  const handleRotateRight = () => {
    if (selectedCount === 0) return;
    const newPages = state.pages.map((p) => {
      if (state.selectedPageIds.includes(p.id)) {
        const newRotation: Record<number, 0 | 90 | 180 | 270> = {
          0: 90, 90: 180, 180: 270, 270: 0,
        };
        return { ...p, rotation: newRotation[p.rotation] ?? 90 };
      }
      return p;
    });
    saveState(newPages);
  };

  const handleDuplicateSelected = () => {
    if (selectedCount === 0) return;
    const newPages: WorkspacePage[] = [];
    let maxOutputIndex = state.pages.reduce((max, p) => Math.max(max, p.outputIndex), -1);

    state.pages.forEach((p) => {
      if (state.selectedPageIds.includes(p.id)) {
        maxOutputIndex++;
        newPages.push({
          ...p,
          id: `${p.id}-dup-${Date.now()}-${maxOutputIndex}`,
          outputIndex: maxOutputIndex,
        });
      }
    });

    const allPages = [...state.pages, ...newPages];
    saveState(allPages);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((prevStack) => [...prevStack, state.pages]);
    setUndoStack((prevStack) => prevStack.slice(0, -1));
    dispatch({ type: "pagesReordered", pages: prev });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prevStack) => [...prevStack, state.pages]);
    setRedoStack((prevStack) => prevStack.slice(0, -1));
    dispatch({ type: "pagesReordered", pages: next });
  };

  const handleReorder = useCallback(
    (pages: WorkspacePage[]) => {
      saveState(pages);
    },
    [saveState]
  );

  const handleExport = () => {
    dispatch({
      type: "taskCreated",
      task: {
        id: `task-${Date.now()}`,
        operation: "organize",
        settings: {},
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
              <h1 className="text-[28px] font-bold text-[#f8fafc]">Organize Pages</h1>
              <p className="text-sm text-slate-400 mt-1">
                Reorder, rotate, delete, or duplicate pages
              </p>
            </div>
            <DocumentIntake operation="organize" onReady={() => {}} />
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell backdropVariant="editor">
      <section className="page-shell pt-8 pb-16">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <Link href="/tools" className="hover:text-slate-200 transition-colors">
            Tools
          </Link>
          <span>/</span>
          <span className="text-slate-200">Organize Pages</span>
        </div>

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

        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard label="Total pages" value={totalPages} accent="cyan" icon={<Layers size={18} />} />
          {selectedCount > 0 && (
            <StatCard label="Selected" value={selectedCount} accent="violet" icon={<FileText size={18} />} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)_270px] gap-4">
          <div className="space-y-4">
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Document</h3>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(148,163,184,0.04)]">
                <FileText size={16} className="text-cyan-300" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-300 truncate">
                    {activeFile?.name || "document.pdf"}
                  </p>
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

          <div className="space-y-4">
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

            <SelectionBar
              totalCount={totalPages}
              selectedCount={selectedCount}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onDeleteSelected={handleDeleteSelected}
            />

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

          <div className="space-y-4">
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Properties</h3>
              {selectedCount === 1 ? (() => {
                const selected = visiblePages.find((p) => state.selectedPageIds.includes(p.id));
                return selected ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Page</span>
                      <span className="text-slate-200">{selected.sourcePageIndex}</span>
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
                {totalPages} pages · organized-{activeFile?.name || "document.pdf"}
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
