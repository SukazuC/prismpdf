"use client";

import { useCallback, type CSSProperties } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import type { WorkspacePage } from "@/lib/workspace/workspace-types";
import { SortablePdfPageCard } from "./SortablePdfPageCard";

type SortablePdfPageGridProps = {
  pages: WorkspacePage[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onReorder: (pages: WorkspacePage[]) => void;
  columns?: number;
};

export function SortablePdfPageGrid({
  pages,
  selectedIds,
  onSelect,
  onReorder,
  columns = 6,
}: SortablePdfPageGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...pages];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      // Update outputIndex
      const withIndices = reordered.map((p, i) => ({ ...p, outputIndex: i }));
      onReorder(withIndices);
    },
    [pages, onReorder]
  );

  const activePage = activeId ? pages.find((p) => p.id === activeId) : null;
  const gridStyle = {
    "--grid-columns": Math.min(columns, pages.length || 1),
  } as CSSProperties;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div
          className="grid max-w-full grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-3 md:grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))] lg:[grid-template-columns:repeat(var(--grid-columns),minmax(0,1fr))]"
          style={gridStyle}
        >
          {pages.map((page) => (
            <SortablePdfPageCard
              key={page.id}
              page={page}
              isSelected={selectedIds.has(page.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activePage ? (
          <div className="aspect-[5/7] max-w-[180px] rounded-xl overflow-hidden border-2 border-cyan-400 shadow-2xl">
            {activePage.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- Drag previews reuse dynamic PDF thumbnail object URLs.
              <img
                src={activePage.thumbnailUrl}
                alt={`Page ${activePage.sourcePageIndex}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[rgba(148,163,184,0.12)] flex items-center justify-center">
                <span className="text-slate-400">{activePage.sourcePageIndex}</span>
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
