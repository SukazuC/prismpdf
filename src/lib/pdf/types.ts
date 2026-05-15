export type UploadedFileStatus = "queued" | "uploading" | "ready" | "error";

export type UploadedFile = {
  id: string;
  file?: File;
  name: string;
  sizeBytes: number;
  pageCount?: number;
  type: string;
  thumbnails?: PdfPageThumbnail[];
  status: UploadedFileStatus;
  errorMessage?: string;
};

export type PdfPageThumbnail = {
  pageId: string;
  pageNumber: number;
  url: string;
  width?: number;
  height?: number;
};

export type PdfPage = {
  id: string;
  fileId: string;
  sourceFileName: string;
  globalIndex: number;
  localIndex: number;
  thumbnailUrl: string;
  rotation: 0 | 90 | 180 | 270;
  selected: boolean;
  width?: number;
  height?: number;
};

export type PageRange = {
  id: string;
  start: number;
  end: number;
};

export type OperationType = "merge" | "compress" | "convert" | "cut" | "organize";

export type ProcessingTask = {
  id: string;
  operation: OperationType;
  fileName: string;
  progress: number;
  currentStep: string;
  estimatedSecondsRemaining?: number;
  status: "queued" | "processing" | "success" | "error" | "cancelled";
};

export type ResultFile = {
  id: string;
  name: string;
  operation: OperationType;
  format: "pdf" | "docx" | "jpg" | "png" | "pptx" | "txt";
  sizeBytes: number;
  pageCount?: number;
  downloadUrl: string;
  previewUrl?: string;
  expiresAt?: string;
};
