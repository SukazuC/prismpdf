import { getPdfJs } from "@/lib/pdf/pdfjs";
import { createZipBlob } from "@/lib/files/zip-results";

export type ImageFormat = "image/jpeg" | "image/png";
const IMAGE_SCALE = 1.5;

export async function convertPdfToImages(
  file: File,
  format: ImageFormat,
  pageRange?: { start: number; end: number }
): Promise<{ blob: Blob; pageNumber: number; name: string }[]> {
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  const start = pageRange?.start || 1;
  const end = pageRange?.end || totalPages;
  const ext = format === "image/jpeg" ? "jpg" : "png";
  const baseName = file.name.replace(/\.pdf$/i, "");
  const results: { blob: Blob; pageNumber: number; name: string }[] = [];

  for (let i = start; i <= Math.min(end, totalPages); i++) {
    try {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: IMAGE_SCALE });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      await page.render({ canvas, canvasContext: ctx, viewport }).promise;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, format, 0.92)
      );

      if (blob) {
        results.push({
          blob,
          pageNumber: i,
          name: `${baseName}-page-${String(i).padStart(3, "0")}.${ext}`,
        });
      }

      canvas.width = 0;
      canvas.height = 0;
    } catch {
      // Skip failed pages
    }
  }

  pdf.destroy();
  return results;
}

export async function packageImageResults(
  results: { blob: Blob; pageNumber: number; name: string }[]
): Promise<{ blob: Blob; name: string }> {
  if (results.length === 1) {
    return { blob: results[0].blob, name: results[0].name };
  }

  const zipBlob = await createZipBlob(
    results.map((r) => ({ name: r.name, blob: r.blob }))
  );

  const baseName = results[0].name.replace(/-page-\d+\.\w+$/, "");
  return { blob: zipBlob, name: `${baseName}-images.zip` };
}
