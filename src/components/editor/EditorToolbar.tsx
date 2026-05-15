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
  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[rgba(7,15,35,0.6)] backdrop-blur-sm border border-[rgba(148,163,184,0.15)]">
      {/* Selection info */}
      {selectionCount > 0 && (
        <span className="text-xs text-cyan-300 font-medium mr-2 px-2 py-1 rounded bg-[rgba(53,213,255,0.1)]">
          {selectionCount} selected
        </span>
      )}

      {/* View controls */}
      {onZoomOut && <IconButton ariaLabel="Zoom out" onClick={onZoomOut}><ZoomOut size={16} /></IconButton>}
      {onZoomIn && <IconButton ariaLabel="Zoom in" onClick={onZoomIn}><ZoomIn size={16} /></IconButton>}

      <div className="w-px h-6 bg-[rgba(148,163,184,0.15)] mx-1" />

      {/* Undo/Redo */}
      {onUndo && <IconButton ariaLabel="Undo" onClick={onUndo} disabled={!canUndo}><Undo2 size={16} /></IconButton>}
      {onRedo && <IconButton ariaLabel="Redo" onClick={onRedo} disabled={!canRedo}><Redo2 size={16} /></IconButton>}

      <div className="w-px h-6 bg-[rgba(148,163,184,0.15)] mx-1" />

      {/* Edit actions */}
      {onRotateLeft && <IconButton ariaLabel="Rotate left" onClick={onRotateLeft}><RotateCcw size={16} /></IconButton>}
      {onRotateRight && <IconButton ariaLabel="Rotate right" onClick={onRotateRight}><RotateCw size={16} /></IconButton>}
      {onDuplicate && <IconButton ariaLabel="Duplicate" onClick={onDuplicate}><Copy size={16} /></IconButton>}
      {onDelete && <IconButton ariaLabel="Delete" onClick={onDelete}><Trash2 size={16} /></IconButton>}

      <div className="w-px h-6 bg-[rgba(148,163,184,0.15)] mx-1" />

      {/* View toggles */}
      {onGridToggle && (
        <IconButton ariaLabel="Grid view" active={gridMode} onClick={onGridToggle}>
          <Grid3X3 size={16} />
        </IconButton>
      )}
      {onListToggle && (
        <IconButton ariaLabel="List view" active={!gridMode} onClick={onListToggle}>
          <List size={16} />
        </IconButton>
      )}
    </div>
  );
}
