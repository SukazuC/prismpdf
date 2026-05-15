"use client";

import { useMemo } from "react";
import type { PageRange } from "@/lib/pdf/types";

type RangeTimelineProps = {
  pageCount: number;
  ranges: PageRange[];
  onChange: (ranges: PageRange[]) => void;
};

export function RangeTimeline({ pageCount, ranges, onChange }: RangeTimelineProps) {
  const selectedPages = useMemo(() => {
    const set = new Set<number>();
    for (const r of ranges) {
      for (let p = r.start; p <= r.end; p++) {
        set.add(p);
      }
    }
    return set;
  }, [ranges]);

  if (pageCount === 0) {
    return (
      <div className="text-sm text-slate-500 py-4 text-center">
        No pages to display.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => {
          const isSelected = selectedPages.has(pageNum);
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => {
                // Toggle single page selection
                const existingRange = ranges.find(
                  (r) => r.start <= pageNum && r.end >= pageNum
                );
                if (existingRange) {
                  // Remove this page from ranges - rebuild
                  const newRanges = ranges
                    .flatMap((r) => {
                      if (pageNum < r.start || pageNum > r.end) return [r];
                      const result: PageRange[] = [];
                      if (r.start <= pageNum - 1)
                        result.push({ id: `${r.id}-a`, start: r.start, end: pageNum - 1 });
                      if (pageNum + 1 <= r.end)
                        result.push({ id: `${r.id}-b`, start: pageNum + 1, end: r.end });
                      return result.length > 0 ? result : [];
                    })
                    // Re-assign stable-ish IDs (we don't rely on id for rendering key)
                    .map((r, idx) => ({ ...r, id: `tl-${idx}` }));
                  onChange(newRanges);
                } else {
                  // Add this page
                  onChange([...ranges, { id: `tl-${Date.now()}`, start: pageNum, end: pageNum }]);
                }
              }}
              className={`h-8 rounded-sm text-[10px] font-medium transition-all flex-1 ${
                isSelected
                  ? "bg-gradient-to-r from-[rgba(53,213,255,0.6)] to-[rgba(168,85,247,0.5)] text-white border-0"
                  : "bg-[rgba(148,163,184,0.06)] text-slate-500 border border-[rgba(148,163,184,0.1)] hover:bg-[rgba(148,163,184,0.12)]"
              }`}
              aria-label={`Page ${pageNum}${isSelected ? " (selected)" : ""}`}
              aria-pressed={isSelected}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Range labels */}
      {ranges.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {ranges.map((r, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-md bg-[rgba(53,213,255,0.1)] border border-[rgba(53,213,255,0.2)] text-cyan-300"
            >
              {r.start === r.end ? `Page ${r.start}` : `Pages ${r.start}-${r.end}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
