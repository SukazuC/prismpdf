"use client";

import { CheckSquare, Square } from "lucide-react";

type SelectionBarProps = {
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDeleteSelected?: () => void;
};

export function SelectionBar({
  totalCount,
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onDeleteSelected,
}: SelectionBarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[rgba(7,15,35,0.6)] border border-[rgba(148,163,184,0.15)]">
      <button
        type="button"
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        aria-label={allSelected ? "Deselect all" : "Select all"}
      >
        {allSelected ? <CheckSquare size={14} className="text-cyan-300" /> : <Square size={14} />}
        {allSelected ? "Deselect all" : "Select all"}
      </button>

      {selectedCount > 0 && (
        <>
          <span className="text-xs text-slate-500">|</span>
          <span className="text-xs text-cyan-300 font-medium">
            {selectedCount} of {totalCount} selected
          </span>
          {onDeleteSelected && (
            <>
              <span className="text-xs text-slate-500">|</span>
              <button
                type="button"
                onClick={onDeleteSelected}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Delete selected
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
