import { getPdfJs } from "@/lib/pdf/pdfjs";
import { getThumbnailScale } from "@/lib/pdf/thumbnail-scale";

const MAX_INITIAL_PAGES = 32;

export type PdfDocumentInfo = {
  pageCount: number;
  thumbnails: { pageIndex: number; url: string; width: number; height: number }[];
  error?: string;
};

export async function readPdfDocument(file: File): Promise<PdfDocumentInfo> {
  try {
    const pdfjsLib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    const thumbnails: PdfDocumentInfo["thumbnails"] = [];

    const pagesToRender = Math.min(pageCount, MAX_INITIAL_PAGES);

    for (let i = 1; i <= pagesToRender; i++) {
      try {
        const page = await pdf.getPage(i);
        const baseViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: getThumbnailScale(baseViewport.width) });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", 0.8)
        );

        if (blob) {
          thumbnails.push({
            pageIndex: i - 1,
            url: URL.createObjectURL(blob),
            width: Math.round(viewport.width),
            height: Math.round(viewport.height),
          });
        }

        canvas.width = 0;
        canvas.height = 0;
      } catch {
        // Skip failed pages
      }
    }

    pdf.destroy();
    return { pageCount, thumbnails };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read PDF";
    return { pageCount: 0, thumbnails: [], error: message };
  }
}
