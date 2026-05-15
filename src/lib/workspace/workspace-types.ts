export type WorkspaceFileStatus = "queued" | "reading" | "ready" | "error";

export type WorkspaceFile = {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  mimeType: string;
  pageCount: number;
  status: WorkspaceFileStatus;
  error?: string;
};

export type WorkspacePage = {
  id: string;
  fileId: string;
  sourceFileName: string;
  sourcePageIndex: number; // 1-based
  outputIndex: number;     // 0-based current display order
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  rotation: 0 | 90 | 180 | 270;
  deleted?: boolean;
};

export type PendingTask = {
  id: string;
  operation: "merge" | "cut" | "organize" | "compress" | "convert";
  settings: Record<string, unknown>;
  createdAt: number;
};

export type ResultArtifact = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob;
  objectUrl: string;
  operation: string;
  createdAt: number;
};

export type WorkspaceState = {
  files: WorkspaceFile[];
  pages: WorkspacePage[];
  selectedPageIds: string[];
  activeFileId?: string;
  pendingTask?: PendingTask;
  result?: ResultArtifact;
  errors: string[];
};
