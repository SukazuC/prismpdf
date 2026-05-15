"use client";

import { PdfThumbnailCard } from "@/components/editor/PdfThumbnailCard";
import type { PdfPage } from "@/lib/pdf/types";

type PdfPageGridProps = {
  pages: PdfPage[];
  columns?: number;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
  onRotate?: (id: string, degrees: 90 | -90) => void;
  showDragHandle?: boolean;
  dimmedIds?: Set<string>;
};

export function PdfPageGrid({
  pages,
  columns = 6,
  selectedIds = new Set(),
  onSelect,
  onRotate,
  showDragHandle = false,
  dimmedIds = new Set(),
}: PdfPageGridProps) {
  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${Math.min(columns, pages.length || 1)}, minmax(0, 1fr))`,
      }}
    >
      {pages.map((page) => (
        <PdfThumbnailCard
          key={page.id}
          page={page}
          selected={selectedIds.has(page.id)}
          onSelect={onSelect}
          onRotate={onRotate}
          showDragHandle={showDragHandle}
          isDimmed={dimmedIds.has(page.id)}
        />
      ))}
    </div>
  );
}
