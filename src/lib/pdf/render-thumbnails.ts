import { getPdfJs } from "@/lib/pdf/pdfjs";
import { getThumbnailScale } from "@/lib/pdf/thumbnail-scale";
import type { PdfPageThumbnail } from "@/lib/pdf/types";

const MAX_INITIAL_PAGES = 32;

export type ThumbnailResult = {
  pageCount: number;
  thumbnails: PdfPageThumbnail[];
  error?: string;
};

/**
 * Render thumbnails for the first N pages of a PDF.
 * Returns object URLs that must be revoked on cleanup.
 */
export async function renderThumbnails(
  file: File,
  maxPages: number = MAX_INITIAL_PAGES
): Promise<ThumbnailResult> {
  try {
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    const thumbnails: PdfPageThumbnail[] = [];

    const pagesToRender = Math.min(pageCount, maxPages);

    for (let i = 1; i <= pagesToRender; i++) {
      try {
        const page = await pdf.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: getThumbnailScale(baseViewport.width) });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        await page.render({ canvas: canvas, canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", 0.8)
        );

        if (blob) {
          const url = URL.createObjectURL(blob);
          thumbnails.push({
            pageId: `${file.name}-p${i}`,
            pageNumber: i,
            url,
            width: Math.round(viewport.width),
            height: Math.round(viewport.height),
          });
        }

        // Cleanup canvas
        canvas.width = 0;
        canvas.height = 0;
      } catch (pageError) {
        // Skip pages that fail to render
        console.warn(`Failed to render page ${i}:`, pageError);
      }
    }

    pdf.destroy();

    return {
      pageCount,
      thumbnails,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load PDF";
    return {
      pageCount: 0,
      thumbnails: [],
      error: message,
    };
  }
}

/**
 * Revoke object URLs for thumbnails to prevent memory leaks.
 */
export function revokeThumbnailUrls(thumbnails: PdfPageThumbnail[]) {
  for (const t of thumbnails) {
    URL.revokeObjectURL(t.url);
  }
}

/**
 * Render a single PDF page to a blob for image export.
 */
export async function renderPageToImage(
  file: File,
  pageNumber: number,
  format: "image/png" | "image/jpeg" = "image/png",
  scale: number = 1.5
): Promise<Blob | null> {
  try {
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      pdf.destroy();
      return null;
    }

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      pdf.destroy();
      return null;
    }

    await page.render({ canvas: canvas, canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format, 0.92)
    );

    canvas.width = 0;
    canvas.height = 0;
    pdf.destroy();

    return blob;
  } catch {
    return null;
  }
}
