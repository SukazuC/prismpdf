import { PDFDocument } from "pdf-lib";

export type CutMethod = "range" | "extract" | "split";

type RangeInput = { start: number; end: number };

export type CutResult = {
  blobs: Blob[];
  fileNames: string[];
};

/**
 * Cut pages from a single PDF file using the specified method.
 */
export async function cutPdfPages(
  file: File,
  method: CutMethod,
  params: {
    ranges?: RangeInput[];
    selectedPageIndices?: number[]; // 1-based
    pagesPerChunk?: number;
  },
  sourceFileName: string
): Promise<CutResult> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  switch (method) {
    case "range":
      return cutByRanges(sourcePdf, params.ranges || [], sourceFileName);
    case "extract":
      return cutExtract(sourcePdf, params.selectedPageIndices || [], sourceFileName);
    case "split":
      return cutSplitEvery(sourcePdf, params.pagesPerChunk || 1, sourceFileName);
    default:
      throw new Error(`Unknown cut method: ${method}`);
  }
}

async function cutByRanges(
  sourcePdf: PDFDocument,
  ranges: RangeInput[],
  sourceFileName: string
): Promise<CutResult> {
  const blobs: Blob[] = [];
  const fileNames: string[] = [];
  const baseName = sourceFileName.replace(/\.pdf$/i, "");

  for (let ri = 0; ri < ranges.length; ri++) {
    const range = ranges[ri];
    const newPdf = await PDFDocument.create();
    const indices: number[] = [];

    for (let i = range.start; i <= range.end; i++) {
      if (i >= 1 && i <= sourcePdf.getPageCount()) {
        indices.push(i - 1);
      }
    }

    if (indices.length === 0) continue;

    const copiedPages = await newPdf.copyPages(sourcePdf, indices);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    const bytes = await newPdf.save();
    blobs.push(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
    fileNames.push(`${baseName}-pages-${range.start}-${range.end}.pdf`);
  }

  return { blobs, fileNames };
}

async function cutExtract(
  sourcePdf: PDFDocument,
  selectedIndices: number[],
  sourceFileName: string
): Promise<CutResult> {
  const newPdf = await PDFDocument.create();
  const indices = selectedIndices
    .filter((i) => i >= 1 && i <= sourcePdf.getPageCount())
    .map((i) => i - 1);

  if (indices.length === 0) {
    throw new Error("No valid pages selected");
  }

  const copiedPages = await newPdf.copyPages(sourcePdf, indices);
  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  const bytes = await newPdf.save();
  const baseName = sourceFileName.replace(/\.pdf$/i, "");
  return {
    blobs: [new Blob([new Uint8Array(bytes)], { type: "application/pdf" })],
    fileNames: [`${baseName}-extracted.pdf`],
  };
}

async function cutSplitEvery(
  sourcePdf: PDFDocument,
  pagesPerChunk: number,
  sourceFileName: string
): Promise<CutResult> {
  const totalPages = sourcePdf.getPageCount();
  const blobs: Blob[] = [];
  const fileNames: string[] = [];
  const baseName = sourceFileName.replace(/\.pdf$/i, "");

  let chunkIndex = 0;
  for (let start = 0; start < totalPages; start += pagesPerChunk) {
    const end = Math.min(start + pagesPerChunk, totalPages);
    const newPdf = await PDFDocument.create();
    const indices: number[] = [];

    for (let i = start; i < end; i++) {
      indices.push(i);
    }

    const copiedPages = await newPdf.copyPages(sourcePdf, indices);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    const bytes = await newPdf.save();
    blobs.push(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }));
    chunkIndex++;
    fileNames.push(`${baseName}-split-${String(chunkIndex).padStart(3, "0")}.pdf`);
  }

  return { blobs, fileNames };
}
