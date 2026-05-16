"use client";

import { IconButton } from "@/components/buttons/IconButton";
import { ZoomIn, ZoomOut, Grid3X3, List, RotateCcw, RotateCw, Trash2, Copy, Undo2, Redo2 } from "lucide-react";

type EditorToolbarProps = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onGridToggle?: () => void;
  onListToggle?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  gridMode?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  selectionCount?: number;
};

export function EditorToolbar({
  onZoomIn,
  onZoomOut,
  onGridToggle,
  onListToggle,
  onRotateLeft,
  onRotateRight,
  onDelete,
  onDuplicate,
  onUndo,
  onRedo,
  gridMode = true,
  canUndo = false,
  canRedo = false,
  selectionCount = 0,
}: EditorToolbarProps) {
  const groups = [
    selectionCount > 0
      ? [
          <span key="selection" className="shrink-0 text-xs text-cyan-300 font-medium px-2 py-1 rounded bg-[rgba(53,213,255,0.1)]">
            {selectionCount} selected
          </span>,
        ]
      : [],
    [
      onZoomOut && <IconButton key="zoom-out" ariaLabel="Zoom out" onClick={onZoomOut}><ZoomOut size={16} /></IconButton>,
      onZoomIn && <IconButton key="zoom-in" ariaLabel="Zoom in" onClick={onZoomIn}><ZoomIn size={16} /></IconButton>,
    ].filter(Boolean),
    [
      onUndo && <IconButton key="undo" ariaLabel="Undo" onClick={onUndo} disabled={!canUndo}><Undo2 size={16} /></IconButton>,
      onRedo && <IconButton key="redo" ariaLabel="Redo" onClick={onRedo} disabled={!canRedo}><Redo2 size={16} /></IconButton>,
    ].filter(Boolean),
    [
      onRotateLeft && <IconButton key="rotate-left" ariaLabel="Rotate left" onClick={onRotateLeft}><RotateCcw size={16} /></IconButton>,
      onRotateRight && <IconButton key="rotate-right" ariaLabel="Rotate right" onClick={onRotateRight}><RotateCw size={16} /></IconButton>,
      onDuplicate && <IconButton key="duplicate" ariaLabel="Duplicate" onClick={onDuplicate}><Copy size={16} /></IconButton>,
      onDelete && <IconButton key="delete" ariaLabel="Delete" onClick={onDelete}><Trash2 size={16} /></IconButton>,
    ].filter(Boolean),
    [
      onGridToggle && (
        <IconButton key="grid" ariaLabel="Grid view" active={gridMode} onClick={onGridToggle}>
          <Grid3X3 size={16} />
        </IconButton>
      ),
      onListToggle && (
        <IconButton key="list" ariaLabel="List view" active={!gridMode} onClick={onListToggle}>
          <List size={16} />
        </IconButton>
      ),
    ].filter(Boolean),
  ].filter((group) => group.length > 0);

  return (
    <div className="max-w-full overflow-x-auto whitespace-nowrap rounded-xl bg-[rgba(7,15,35,0.6)] backdrop-blur-sm border border-[rgba(148,163,184,0.15)]">
      <div className="flex w-max min-w-0 items-center gap-1 px-3 py-2">
        {groups.map((group, index) => (
          <div key={index} className="flex shrink-0 items-center gap-1">
            {index > 0 && <div className="w-px h-6 bg-[rgba(148,163,184,0.15)] mx-1" />}
            {group}
          </div>
        ))}
      </div>
    </div>
  );
}
