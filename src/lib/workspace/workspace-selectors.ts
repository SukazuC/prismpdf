import type { WorkspaceState, WorkspacePage } from "./workspace-types";

export function getActiveFile(state: WorkspaceState) {
  if (!state.activeFileId) return undefined;
  return state.files.find((f) => f.id === state.activeFileId);
}

export function getVisiblePages(state: WorkspaceState): WorkspacePage[] {
  return state.pages
    .filter((p) => !p.deleted)
    .sort((a, b) => a.outputIndex - b.outputIndex);
}

export function getPagesByFile(state: WorkspaceState, fileId: string): WorkspacePage[] {
  return state.pages
    .filter((p) => p.fileId === fileId && !p.deleted)
    .sort((a, b) => a.sourcePageIndex - b.sourcePageIndex);
}

export function getFileForPage(state: WorkspaceState, pageId: string) {
  const page = state.pages.find((p) => p.id === pageId);
  if (!page) return undefined;
  return state.files.find((f) => f.id === page.fileId);
}

export function getSelectedPages(state: WorkspaceState): WorkspacePage[] {
  return state.pages.filter((p) => state.selectedPageIds.includes(p.id));
}
