import type { WorkspaceState, WorkspaceFile, WorkspacePage, PendingTask, ResultArtifact, PdfOperation } from "./workspace-types";

export type WorkspaceAction =
  | { type: "filesAdded"; files: WorkspaceFile[] }
  | { type: "fileStatusChanged"; fileId: string; status: "queued" | "reading" | "ready" | "error"; error?: string; pageCount?: number }
  | { type: "fileRemoved"; fileId: string }
  | { type: "pagesAdded"; pages: WorkspacePage[] }
  | { type: "pagesReordered"; pages: WorkspacePage[] }
  | { type: "pageUpdated"; pageId: string; updates: Partial<WorkspacePage> }
  | { type: "pagesDeleted"; pageIds: string[] }
  | { type: "pagesDuplicated"; newPages: WorkspacePage[] }
  | { type: "selectionSet"; pageIds: string[] }
  | { type: "selectionToggle"; pageId: string }
  | { type: "selectionClear" }
  | { type: "activeFileChanged"; fileId?: string }
  | { type: "taskCreated"; task: PendingTask }
  | { type: "operationChanged"; operation?: PdfOperation }
  | { type: "resultReady"; result: ResultArtifact }
  | { type: "workspaceReset" };

export const initialWorkspaceState: WorkspaceState = {
  files: [],
  pages: [],
  selectedPageIds: [],
  errors: [],
};

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "filesAdded":
      return { ...state, files: [...state.files, ...action.files] };

    case "fileStatusChanged":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.fileId
            ? { ...f, status: action.status, error: action.error, pageCount: action.pageCount ?? f.pageCount }
            : f
        ),
      };

    case "fileRemoved": {
      const removedFileIds = new Set([action.fileId]);
      return {
        ...state,
        files: state.files.filter((f) => !removedFileIds.has(f.id)),
        pages: state.pages.filter((p) => !removedFileIds.has(p.fileId)),
        selectedPageIds: state.selectedPageIds.filter(
          (id) => !state.pages.find((p) => p.id === id && removedFileIds.has(p.fileId))
        ),
      };
    }

    case "pagesAdded": {
      const startIndex = state.pages.length;
      return {
        ...state,
        pages: [
          ...state.pages,
          ...action.pages.map((p, i) => ({ ...p, outputIndex: startIndex + i })),
        ],
      };
    }

    case "pagesReordered":
      return { ...state, pages: action.pages };

    case "pageUpdated":
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === action.pageId ? { ...p, ...action.updates } : p
        ),
      };

    case "pagesDeleted": {
      const deletedSet = new Set(action.pageIds);
      return {
        ...state,
        pages: state.pages.filter((p) => !deletedSet.has(p.id)),
        selectedPageIds: state.selectedPageIds.filter((id) => !deletedSet.has(id)),
      };
    }

    case "pagesDuplicated":
      return {
        ...state,
        pages: [...state.pages, ...action.newPages],
      };

    case "selectionSet":
      return { ...state, selectedPageIds: action.pageIds };

    case "selectionToggle": {
      const has = state.selectedPageIds.includes(action.pageId);
      return {
        ...state,
        selectedPageIds: has
          ? state.selectedPageIds.filter((id) => id !== action.pageId)
          : [...state.selectedPageIds, action.pageId],
      };
    }

    case "selectionClear":
      return { ...state, selectedPageIds: [] };

    case "activeFileChanged":
      return { ...state, activeFileId: action.fileId };

    case "operationChanged":
      return { ...state, activeOperation: action.operation };

    case "taskCreated":
      return { ...state, pendingTask: action.task };

    case "resultReady": {
      if (state.result?.objectUrl) {
        URL.revokeObjectURL(state.result.objectUrl);
      }
      return { ...state, result: action.result, pendingTask: undefined };
    }

    case "workspaceReset": {
      for (const p of state.pages) {
        if (p.thumbnailUrl) URL.revokeObjectURL(p.thumbnailUrl);
      }
      if (state.result?.objectUrl) {
        URL.revokeObjectURL(state.result.objectUrl);
      }
      return initialWorkspaceState;
    }

    default:
      return state;
  }
}
