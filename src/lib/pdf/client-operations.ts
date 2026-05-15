import { PDFDocument, PageSizes, degrees } from "pdf-lib";
import type { PageRange, PdfPage } from "@/lib/pdf/types";

/**
 * Merge multiple PDF files into one.
 * Preserves page dimensions from source files.
 */
export async function mergePdfFiles(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });
    const pageIndices = sourcePdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

    const pdfBytes = await mergedPdf.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

/**
 * Extract specific pages from a PDF file based on ranges.
 * Returns an array of blobs (one per range for split behavior).
 */
export async function extractPages(
  file: File,
  ranges: PageRange[]
): Promise<Blob[]> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });
  const totalPages = sourcePdf.getPageCount();
  const results: Blob[] = [];

  for (const range of ranges) {
    const safeStart = Math.max(1, Math.min(range.start, totalPages));
    const safeEnd = Math.max(safeStart, Math.min(range.end, totalPages));

    const newPdf = await PDFDocument.create();
    const indices: number[] = [];
    for (let i = safeStart - 1; i < safeEnd; i++) {
      indices.push(i);
    }
    const copiedPages = await newPdf.copyPages(sourcePdf, indices);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }
    const pdfBytes = await newPdf.save();
    results.push(new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }));
  }

  return results;
}

/**
 * Reorder/rotate/delete pages and export as a new PDF.
 * Takes ordered page objects and creates a PDF matching
 * the given order, applying rotation metadata.
 */
export async function organizePdf(
  file: File,
  pages: PdfPage[]
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  const newPdf = await PDFDocument.create();

  for (const pageMeta of pages) {
    // pageMeta.localIndex is 1-based
    const sourceIndex = pageMeta.localIndex - 1;
    if (sourceIndex < 0 || sourceIndex >= sourcePdf.getPageCount()) continue;

    const [copiedPage] = await newPdf.copyPages(sourcePdf, [sourceIndex]);

    // Apply rotation
    if (pageMeta.rotation !== 0) {
    copiedPage.setRotation(degrees(pageMeta.rotation));
    }

    newPdf.addPage(copiedPage);
  }

  const pdfBytes = await newPdf.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}

/**
 * Create a simple PDF with a single page containing text.
 * Useful for demo/testing.
 */
export async function createSimplePdf(text: string): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  page.drawText(text, {
    x: 50,
    y: height - 50,
    size: 12,
    maxWidth: width - 100,
  });

  const bytes = await pdfDoc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}
