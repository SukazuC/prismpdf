"use client";

import { useState, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { TextField } from "@/components/forms/TextField";
import { PdfPageGrid } from "@/components/editor/PdfPageGrid";
import { RangeTimeline } from "@/components/editor/RangeTimeline";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { StatCard } from "@/components/cards/StatCard";
import { DocumentIntake } from "@/components/pdf/DocumentIntake";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { getVisiblePages } from "@/lib/workspace/workspace-selectors";
import { parseRanges } from "@/lib/ranges/parse-ranges";
import type { PageRange } from "@/lib/pdf/types";
import { useRouter } from "next/navigation";
import { Scissors, Layers, FileText } from "lucide-react";

export default function CutPdfPage() {
  const router = useRouter();
  const { state, dispatch } = useWorkspace();
  const [rangeInput, setRangeInput] = useState("");
  const [ranges, setRanges] = useState<PageRange[]>([]);
  const [parseError, setParseError] = useState("");
  const [method, setMethod] = useState<"range" | "extract" | "split">("range");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [gridColumns, setGridColumns] = useState(6);

  const visiblePages = useMemo(() => getVisiblePages(state), [state]);
  const pageCount = visiblePages.length;
  const activeFile = state.files.find(f => f.status === "ready");
  const hasFile = Boolean(activeFile);

  const handleRemoveFile = () => {
    if (!activeFile) return;
    setRangeInput("");
    setRanges([]);
    setParseError("");
    setSelectedIds(new Set());
    dispatch({ type: "fileRemoved", fileId: activeFile.id });
  };

  const handleReplaceFile = () => {
    setRangeInput("");
    setRanges([]);
    setParseError("");
    setSelectedIds(new Set());
    dispatch({ type: "workspaceReset" });
  };

  const selectedPages = useMemo(() => {
    try {
      return parseRanges(rangeInput, pageCount);
    } catch {
      return null;
    }
  }, [rangeInput, pageCount]);

  const outputPageCount = useMemo(() => {
    if (selectedPages?.ok) return selectedPages.selectedPages.length;
    return 0;
  }, [selectedPages]);
  const canCut =
    (method === "range" && outputPageCount > 0) ||
    (method === "extract" && selectedIds.size > 0) ||
    (method === "split" && Boolean(parseInt(rangeInput, 10)));

  const handleRangeChange = useCallback(
    (value: string) => {
      setRangeInput(value);
      const result = parseRanges(value, pageCount);
      if (result.ok) {
        setRanges(result.ranges);
        setParseError("");
      } else {
        setRanges([]);
        setParseError(value.trim() ? result.error : "");
      }
    },
    [pageCount]
  );

  const handleTimelineChange = useCallback(
    (newRanges: PageRange[]) => {
      setRanges(newRanges);
      const input = newRanges
        .map((r) => (r.start === r.end ? `${r.start}` : `${r.start}-${r.end}`))
        .join(", ");
      setRangeInput(input);
      setParseError("");
    },
    []
  );

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCut = () => {
    const settings: Record<string, unknown> = { method };
    if (method === "range") {
      settings.ranges = ranges;
    } else if (method === "extract") {
      settings.selectedPageIndices = Array.from(selectedIds)
        .map((id) => {
          const page = visiblePages.find((p) => p.id === id);
          return page?.sourcePageIndex;
        })
        .filter(Boolean);
    } else if (method === "split") {
      settings.pagesPerChunk = parseInt(rangeInput, 10) || 2;
    }

    dispatch({
      type: "taskCreated",
      task: {
        id: `task-${Date.now()}`,
        operation: "cut",
        settings,
        createdAt: Date.now(),
      },
    });
    router.push("/processing");
  };

  // Empty state
  if (!hasFile) {
    return (
      <AppShell backdropVariant="editor">
        <section className="page-shell pt-8 pb-16">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-[28px] font-bold text-[#f8fafc]">Cut PDF</h1>
              <p className="text-sm text-slate-400 mt-1">Extract or split pages from your PDF</p>
            </div>
            <DocumentIntake operation="cut" onReady={() => {}} />
          </div>
        </section>
      </AppShell>
    );
  }

  // Editor state
  return (
    <AppShell backdropVariant="editor">
      <section className="page-shell pt-8 pb-28 lg:pb-16">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#f8fafc] break-words">Cut PDF</h1>
          <p className="text-sm text-slate-400 mt-1">
            Extract or split pages from your PDF
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-6">
          <StatCard label="Total pages" value={pageCount} accent="cyan" icon={<Layers size={18} />} />
          <StatCard label="Selected" value={outputPageCount || selectedIds.size} accent="violet" icon={<Scissors size={18} />} />
          <StatCard label="Output pages" value={outputPageCount || "-"} accent="green" icon={<FileText size={18} />} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-5">
          {/* Left sidebar */}
          <div className="order-2 space-y-4 lg:order-1">
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Method</h3>
              <div className="space-y-2">
                {([
                  { id: "range" as const, label: "Split by range" },
                  { id: "extract" as const, label: "Extract selected pages" },
                  { id: "split" as const, label: "Split every N pages" },
                ]).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                      method === m.id
                        ? "bg-gradient-to-r from-[rgba(53,213,255,0.15)] to-[rgba(168,85,247,0.15)] border border-cyan-400/50 text-cyan-300"
                        : "bg-[rgba(148,163,184,0.04)] border border-[rgba(148,163,184,0.1)] text-slate-300 hover:border-[rgba(148,163,184,0.25)]"
                    }`}
                    aria-pressed={method === m.id}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </GlassPanel>

            {method === "range" && (
              <GlassPanel className="p-5">
                <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Range input</h3>
                <TextField
                  value={rangeInput}
                  onChange={handleRangeChange}
                  placeholder="e.g. 1-3, 6-8, 12-14"
                  error={parseError}
                  label="Enter page ranges"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Use commas to separate ranges. Example: 1-3, 5, 7-9
                </p>
              </GlassPanel>
            )}

            {method === "split" && (
              <GlassPanel className="p-5">
                <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Split settings</h3>
                <TextField
                  value={rangeInput}
                  onChange={(v) => setRangeInput(v)}
                  placeholder="e.g. 3"
                  label="Pages per document"
                />
              </GlassPanel>
            )}

            {/* Output summary */}
            <GlassPanel className="p-5">
              <h3 className="text-sm font-semibold text-[#f8fafc] mb-3">Output summary</h3>
              {outputPageCount > 0 || selectedIds.size > 0 ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pages extracted</span>
                    <span className="text-cyan-300 font-medium">{outputPageCount || selectedIds.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ranges</span>
                    <span className="text-slate-200">{ranges.length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Select pages to see output summary</p>
              )}
            </GlassPanel>

            <GradientButton
              onClick={handleCut}
              size="lg"
              className="hidden w-full lg:inline-flex"
              disabled={!canCut}
            >
              <Scissors size={18} />
              Cut PDF
            </GradientButton>
          </div>

          {/* Right editor */}
          <div className="order-1 min-w-0 space-y-4 lg:order-2">
            {/* Document header */}
            <GlassPanel className="p-4" intensity="soft">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-xs text-slate-400 hover:text-red-300 transition-colors"
                  >
                    Remove file
                  </button>
                  <button
                    type="button"
                    onClick={handleReplaceFile}
                    className="text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    Replace file
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-cyan-300" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#f8fafc]">
                    {activeFile?.name || "document.pdf"}
                  </p>
                  <p className="text-xs text-slate-400">{pageCount} pages</p>
                </div>
              </div>
            </GlassPanel>

            {/* Toolbar */}
            <div className="min-w-0">
              <EditorToolbar
                onZoomIn={() => setGridColumns((c) => Math.min(c + 1, 10))}
                onZoomOut={() => setGridColumns((c) => Math.max(c - 1, 2))}
              />
            </div>

            {/* Range timeline */}
            <RangeTimeline
              pageCount={pageCount}
              ranges={ranges}
              onChange={handleTimelineChange}
            />

            {/* Page grid */}
            {pageCount > 0 && (
              <PdfPageGrid
                pages={visiblePages.map(p => ({
                  id: p.id,
                  fileId: p.fileId,
                  sourceFileName: p.sourceFileName,
                  globalIndex: p.outputIndex,
                  localIndex: p.sourcePageIndex,
                  thumbnailUrl: p.thumbnailUrl || "",
                  rotation: p.rotation,
                  selected: state.selectedPageIds.includes(p.id),
                }))}
                columns={gridColumns}
                selectedIds={
                  method === "range" && selectedPages?.ok
                    ? new Set(
                        visiblePages
                          .filter((p) => selectedPages.selectedPages.includes(p.sourcePageIndex))
                          .map((p) => p.id)
                      )
                    : selectedIds
                }
                onSelect={handleSelect}
                showDragHandle={false}
              />
            )}
          </div>
        </div>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(148,163,184,0.15)] bg-[rgba(7,15,35,0.92)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <GradientButton onClick={handleCut} size="lg" className="w-full" disabled={!canCut}>
          <Scissors size={18} />
          Cut PDF
        </GradientButton>
      </div>
    </AppShell>
  );
}
