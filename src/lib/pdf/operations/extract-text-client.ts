import { getPdfJs } from "@/lib/pdf/pdfjs";

export async function extractPdfText(
  file: File,
  pageRange?: { start: number; end: number }
): Promise<{ text: string; pageCount: number; hasText: boolean }> {
  const pdfjsLib = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  const start = pageRange?.start || 1;
  const end = pageRange?.end || totalPages;
  const textParts: string[] = [];
  let totalChars = 0;

  for (let i = start; i <= Math.min(end, totalPages); i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => (item as { str?: string }).str ?? "")
        .join(" ");

      if (pageText.trim()) {
        textParts.push(`--- Page ${i} ---\n${pageText}`);
        totalChars += pageText.length;
      } else {
        textParts.push(`--- Page ${i} ---\n[No selectable text found on this page]`);
      }
    } catch {
      textParts.push(`--- Page ${i} ---\n[Error reading text from this page]`);
    }
  }

  pdf.destroy();

  const fullText = textParts.join("\n\n");
  return {
    text: fullText,
    pageCount: totalPages,
    hasText: totalChars > 0,
  };
}

export function createTextBlob(text: string): Blob {
  return new Blob([text], { type: "text/plain;charset=utf-8" });
}
