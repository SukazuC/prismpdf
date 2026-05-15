import type { WorkspaceState, PendingTask, ResultArtifact } from "@/lib/workspace/workspace-types";
import { mergeWorkspacePages } from "@/lib/pdf/operations/merge-client";
import { cutPdfPages, type CutMethod } from "@/lib/pdf/operations/cut-client";
import { organizeWorkspacePdf } from "@/lib/pdf/operations/organize-client";
import { createZipBlob } from "@/lib/files/zip-results";
import { convertPdfToImages, packageImageResults } from "@/lib/pdf/operations/convert-images-client";
import { extractPdfText, createTextBlob } from "@/lib/pdf/operations/extract-text-client";
import { postWorkerFile } from "@/lib/worker/worker-client";

type CutSettings = {
  method?: CutMethod;
  ranges?: { start: number; end: number }[];
  selectedPageIndices?: number[];
  pagesPerChunk?: number;
};

export class TaskError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskError";
  }
}

export async function runTask(state: WorkspaceState, task: PendingTask): Promise<ResultArtifact> {
  switch (task.operation) {
    case "merge":
      return runMergeClient(state, task);
    case "cut":
      return runCutClient(state, task);
    case "organize":
      return runOrganizeClient(state, task);
    case "convert":
      return runConvertClient(state, task);
    case "compress":
      return runCompressClient(state, task);
    default:
      throw new TaskError(`Unknown operation: ${(task as { operation: string }).operation}`);
  }
}

async function runCutClient(state: WorkspaceState, task: PendingTask): Promise<ResultArtifact> {
  const files = state.files.filter((f) => f.status === "ready");
  if (files.length === 0) {
    throw new TaskError("No file available for cut operation");
  }

  const file = files[0];
  const settings = task.settings as CutSettings;
  const method = settings.method || "extract";
  const selectedPageIndices = settings.selectedPageIndices;
  const pagesPerChunk = settings.pagesPerChunk;

  const result = await cutPdfPages(file.file, method, {
    ranges: settings.ranges,
    selectedPageIndices,
    pagesPerChunk,
  }, file.name);

  // Create ZIP if multiple files, or single blob
  if (result.blobs.length > 1) {
    const zipBlob = await createZipBlob(
      result.blobs.map((blob, i) => ({ name: result.fileNames[i], blob }))
    );
    const objectUrl = URL.createObjectURL(zipBlob);
    return {
      id: `result-${Date.now()}`,
      name: `${file.name.replace(/\.pdf$/i, "")}-cut.zip`,
      mimeType: "application/zip",
      sizeBytes: zipBlob.size,
      blob: zipBlob,
      objectUrl,
      operation: "cut",
      createdAt: Date.now(),
    };
  }

  const blob = result.blobs[0];
  const objectUrl = URL.createObjectURL(blob);
  return {
    id: `result-${Date.now()}`,
    name: result.fileNames[0],
    mimeType: "application/pdf",
    sizeBytes: blob.size,
    blob,
    objectUrl,
    operation: "cut",
    createdAt: Date.now(),
  };
}

async function runOrganizeClient(state: WorkspaceState, _task: PendingTask): Promise<ResultArtifact> {
  const files = state.files.filter((f) => f.status === "ready");
  if (files.length === 0) {
    throw new TaskError("No file available for organize operation");
  }

  const file = files[0];
  const blob = await organizeWorkspacePdf(file, state.pages);
  const objectUrl = URL.createObjectURL(blob);

  return {
    id: `result-${Date.now()}`,
    name: `organized-${file.name}`,
    mimeType: "application/pdf",
    sizeBytes: blob.size,
    blob,
    objectUrl,
    operation: "organize",
    createdAt: Date.now(),
  };
}

async function runMergeClient(state: WorkspaceState, task: PendingTask): Promise<ResultArtifact> {
  const files = state.files.filter((f) => f.status === "ready");
  if (files.length < 2) {
    throw new TaskError("At least 2 files are required for merge");
  }

  const blob = await mergeWorkspacePages(files, state.pages);
  const objectUrl = URL.createObjectURL(blob);

  return {
    id: `result-${Date.now()}`,
    name: task.settings?.outputName as string || "merged-document.pdf",
    mimeType: "application/pdf",
    sizeBytes: blob.size,
    blob,
    objectUrl,
    operation: "merge",
    createdAt: Date.now(),
  };
}

async function runConvertClient(state: WorkspaceState, task: PendingTask): Promise<ResultArtifact> {
  const files = state.files.filter((f) => f.status === "ready");
  if (files.length === 0) {
    throw new TaskError("No file available for conversion");
  }

  const file = files[0];
  const format = task.settings?.format as string || "jpg";
  switch (format) {
    case "jpg":
    case "png": {
      const mimeType = format === "jpg" ? "image/jpeg" as const : "image/png" as const;
      const results = await convertPdfToImages(file.file, mimeType);
      const { blob, name } = await packageImageResults(results);
      const objectUrl = URL.createObjectURL(blob);
      return {
        id: `result-${Date.now()}`,
        name,
        mimeType: format === "jpg" ? "image/jpeg" : "image/png",
        sizeBytes: blob.size,
        blob,
        objectUrl,
        operation: "convert",
        createdAt: Date.now(),
      };
    }

    case "txt": {
      const { text, hasText } = await extractPdfText(file.file);
      const outputText = hasText
        ? text
        : "No selectable text found in this PDF. OCR is not available yet.";
      const blob = createTextBlob(outputText, file.name.replace(/\.pdf$/i, "") + ".txt");
      const objectUrl = URL.createObjectURL(blob);
      return {
        id: `result-${Date.now()}`,
        name: file.name.replace(/\.pdf$/i, "") + ".txt",
        mimeType: "text/plain",
        sizeBytes: blob.size,
        blob,
        objectUrl,
        operation: "convert",
        createdAt: Date.now(),
      };
    }

    case "docx":
    case "pptx": {
      const formData = new FormData();
      formData.append("file", file.file, file.name);

      const endpoint = format === "docx" ? "/convert/docx" : "/convert/pptx";
      const blob = await postWorkerFile(endpoint, formData);
      const ext = format === "docx" ? "docx" : "pptx";
      const mimeType = format === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      const objectUrl = URL.createObjectURL(blob);

      return {
        id: `result-${Date.now()}`,
        name: file.name.replace(/\.pdf$/i, "") + "." + ext,
        mimeType,
        sizeBytes: blob.size,
        blob,
        objectUrl,
        operation: "convert",
        createdAt: Date.now(),
      };
    }

    default:
      throw new TaskError(`Unsupported conversion format: ${format}`);
  }
}

async function runCompressClient(state: WorkspaceState, task: PendingTask): Promise<ResultArtifact> {
  const files = state.files.filter((f) => f.status === "ready");
  if (files.length === 0) {
    throw new TaskError("No file available for compression");
  }

  const file = files[0];
  const level = (task.settings?.level as string) || "balanced";

  const formData = new FormData();
  formData.append("file", file.file, file.name);
  formData.append("level", level);

  const blob = await postWorkerFile("/compress", formData);
  const objectUrl = URL.createObjectURL(blob);
  return {
    id: `result-${Date.now()}`,
    name: `compressed-${file.name}`,
    mimeType: "application/pdf",
    sizeBytes: blob.size,
    blob,
    objectUrl,
    operation: "compress",
    createdAt: Date.now(),
  };
}
