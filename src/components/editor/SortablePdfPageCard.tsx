"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { WorkspacePage } from "@/lib/workspace/workspace-types";
import { GripVertical, RotateCw } from "lucide-react";

type SortablePdfPageCardProps = {
  page: WorkspacePage;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export function SortablePdfPageCard({
  page,
  isSelected,
  onSelect,
}: SortablePdfPageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const rotationStyle = page.rotation
    ? { transform: `rotate(${page.rotation}deg)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative min-w-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-cyan-400 shadow-[0_0_20px_rgba(53,213,255,0.2)]"
          : "border-[rgba(148,163,184,0.15)] hover:border-[rgba(148,163,184,0.35)]"
      } ${isDragging ? "shadow-2xl z-50" : ""}`}
      onClick={() => onSelect(page.id)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(page.id);
        }
      }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center rounded-md bg-[rgba(7,15,35,0.7)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} className="text-slate-300" />
      </div>

      {/* Rotate badge */}
      {page.rotation !== 0 && (
        <div className="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center rounded-md bg-[rgba(124,60,255,0.6)]">
          <RotateCw size={12} className="text-white" />
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-[5/7] bg-[rgba(148,163,184,0.06)] flex items-center justify-center overflow-hidden"
        style={rotationStyle}
      >
        {page.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- PDF thumbnails are generated from dynamic canvas/object URLs.
          <img
            src={page.thumbnailUrl}
            alt={`Page ${page.sourcePageIndex}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="text-xs text-slate-500">{page.sourcePageIndex}</span>
        )}
      </div>

      {/* Page number */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[rgba(7,15,35,0.85)] to-transparent p-2 pt-4">
        <span className="text-[11px] font-medium text-slate-300">
          {page.sourcePageIndex}
        </span>
      </div>
    </div>
  );
}
