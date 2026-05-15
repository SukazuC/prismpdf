"use client";

import { useEffect, useCallback } from "react";

type ShortcutMap = Record<
  string,
  (e: KeyboardEvent) => void
>;

/**
 * Hook to register keyboard shortcuts.
 * Automatically handles modifier key combos.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape and Ctrl+Z in inputs
        if (e.key !== "Escape" && !(e.key === "z" && (e.metaKey || e.ctrlKey))) {
          return;
        }
      }

      for (const [key, callback] of Object.entries(shortcuts)) {
        const parts = key.split("+");
        const mainKey = parts[parts.length - 1].toLowerCase();
        const needsCtrl = parts.includes("ctrl") || parts.includes("cmd");
        const needsShift = parts.includes("shift");
        const needsMeta = parts.includes("meta");

        const hasCtrlOrCmd = (e.metaKey || e.ctrlKey);
        const matchCtrl = needsCtrl ? hasCtrlOrCmd : !hasCtrlOrCmd;
        const matchShift = needsShift ? e.shiftKey : !e.shiftKey;
        // meta only if explicitly requested
        const matchMeta = needsMeta ? e.metaKey : true;

        if (
          e.key.toLowerCase() === mainKey &&
          matchCtrl &&
          matchShift &&
          matchMeta
        ) {
          e.preventDefault();
          callback(e);
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}
