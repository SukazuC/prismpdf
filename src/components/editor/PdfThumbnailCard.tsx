"use client";

import { Check, GripVertical, RotateCw } from "lucide-react";
import type { PdfPage } from "@/lib/pdf/types";

type PdfThumbnailCardProps = {
  page: PdfPage;
  selected?: boolean;
  showDragHandle?: boolean;
  showCheckbox?: boolean;
  isDimmed?: boolean;
  onSelect?: (id: string) => void;
  onRotate?: (id: string, degrees: 90 | -90) => void;
};

export function PdfThumbnailCard({
  page,
  selected = false,
  showDragHandle = false,
  showCheckbox = true,
  isDimmed = false,
  onSelect,
  onRotate,
}: PdfThumbnailCardProps) {
  const rotationStyle =
    page.rotation === 90
      ? "rotate-90"
      : page.rotation === 180
        ? "rotate-180"
        : page.rotation === 270
          ? "-rotate-90"
          : "";

  return (
    <div
      className={`relative group rounded-xl overflow-hidden transition-all duration-200 ${
        isDimmed ? "opacity-40" : ""
      } ${selected ? "ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(53,213,255,0.3)] scale-[1.02]" : "ring-1 ring-[rgba(148,163,184,0.15)] hover:ring-[rgba(148,163,184,0.3)]"}`}
    >
      {/* Thumbnail */}
      <div
        className={`relative bg-white aspect-[5/7] cursor-pointer ${rotationStyle} transition-transform`}
        onClick={() => onSelect?.(page.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.(page.id);
          }
        }}
        aria-pressed={selected}
        aria-label={`Page ${page.localIndex}${selected ? " (selected)" : ""}`}
      >
        <img
          src={page.thumbnailUrl}
          alt={`Page ${page.localIndex}`}
          className="w-full h-full object-cover"
          draggable={false}
          loading="lazy"
        />

        {/* Selection checkbox */}
        {showCheckbox && (
          <div className="absolute top-2 left-2">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                selected
                  ? "bg-cyan-400 border-cyan-400"
                  : "border-[rgba(148,163,184,0.3)] bg-[rgba(0,0,0,0.3)]"
              }`}
            >
              {selected && <Check size={12} className="text-white" />}
            </div>
          </div>
        )}

        {/* Drag handle */}
        {showDragHandle && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-[rgba(0,0,0,0.5)] text-slate-300 cursor-grab">
            <GripVertical size={14} />
          </div>
        )}

        {/* Page number */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(0,0,0,0.6)] text-slate-300">
          {page.globalIndex + 1}
        </div>

        {/* Rotate icon */}
        {onRotate && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRotate?.(page.id, 90);
            }}
            className="absolute bottom-2 right-2 p-1 rounded bg-[rgba(0,0,0,0.5)] text-slate-300 opacity-0 group-hover:opacity-100 hover:text-cyan-300 transition-all"
            aria-label={`Rotate page ${page.localIndex}`}
          >
            <RotateCw size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
