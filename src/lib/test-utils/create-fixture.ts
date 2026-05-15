import { PDFDocument, PageSizes } from "pdf-lib";

export async function createFixturePdf(pageCount: number): Promise<Blob> {
  const doc = await PDFDocument.create();

  for (let i = 1; i <= pageCount; i++) {
    const page = doc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    page.drawText(`Page ${i}`, {
      x: 50,
      y: height - 50,
      size: 24,
      maxWidth: width - 100,
    });
    page.drawText(`This is test page ${i} of the fixture PDF.`, {
      x: 50,
      y: height - 100,
      size: 12,
      maxWidth: width - 100,
    });
  }

  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

export function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: "application/pdf" });
}
