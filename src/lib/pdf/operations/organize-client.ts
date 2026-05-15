import { PDFDocument, degrees } from "pdf-lib";
import type { WorkspaceFile, WorkspacePage } from "@/lib/workspace/workspace-types";

export async function organizeWorkspacePdf(
  file: WorkspaceFile,
  pages: WorkspacePage[]
): Promise<Blob> {
  const arrayBuffer = await file.file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const newPdf = await PDFDocument.create();

  const sortedPages = [...pages]
    .filter((p) => !p.deleted && p.fileId === file.id)
    .sort((a, b) => a.outputIndex - b.outputIndex);

  for (const pageMeta of sortedPages) {
    const sourceIndex = pageMeta.sourcePageIndex - 1;
    if (sourceIndex < 0 || sourceIndex >= sourcePdf.getPageCount()) continue;

    const [copiedPage] = await newPdf.copyPages(sourcePdf, [sourceIndex]);

    if (pageMeta.rotation) {
      copiedPage.setRotation(degrees(pageMeta.rotation));
    }

    newPdf.addPage(copiedPage);
  }

  const pdfBytes = await newPdf.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}
