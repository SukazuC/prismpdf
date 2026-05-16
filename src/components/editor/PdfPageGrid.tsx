"use client";

import { PdfThumbnailCard } from "@/components/editor/PdfThumbnailCard";
import type { PdfPage } from "@/lib/pdf/types";
import type { CSSProperties } from "react";

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
  const gridStyle = {
    "--grid-columns": Math.min(columns, pages.length || 1),
  } as CSSProperties;

  return (
    <div
      className="grid max-w-full grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-3 md:grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] lg:[grid-template-columns:repeat(var(--grid-columns),minmax(0,1fr))]"
      style={gridStyle}
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
