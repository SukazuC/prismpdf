"use client";

import { GlassPanel } from "@/components/glass/GlassPanel";
import type { PdfPage } from "@/lib/pdf/types";

type PdfPreviewPaneProps = {
  pages: PdfPage[];
  label: string;
  emptyMessage?: string;
};

export function PdfPreviewPane({ pages, label, emptyMessage = "No pages to preview" }: PdfPreviewPaneProps) {
  if (pages.length === 0) {
    return (
      <GlassPanel className="p-8 flex items-center justify-center" intensity="soft">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </GlassPanel>
    );
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pages.slice(0, 6).map((page) => (
          <div
            key={page.id}
            className="flex-shrink-0 w-24 aspect-[5/7] rounded-lg overflow-hidden border border-[rgba(148,163,184,0.15)] bg-white"
          >
            <img
              src={page.thumbnailUrl}
              alt={`Page ${page.localIndex}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        {pages.length > 6 && (
          <div className="flex-shrink-0 w-24 aspect-[5/7] rounded-lg border border-[rgba(148,163,184,0.15)] bg-[rgba(7,15,35,0.5)] flex items-center justify-center">
            <span className="text-xs text-slate-500">+{pages.length - 6}</span>
          </div>
        )}
      </div>
    </div>
  );
}
