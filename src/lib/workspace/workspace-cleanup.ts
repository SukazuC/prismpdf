import type { WorkspaceState } from "./workspace-types";

export function revokeAllUrls(state: WorkspaceState) {
  for (const p of state.pages) {
    if (p.thumbnailUrl) URL.revokeObjectURL(p.thumbnailUrl);
  }
  if (state.result?.objectUrl) {
    URL.revokeObjectURL(state.result.objectUrl);
  }
}
