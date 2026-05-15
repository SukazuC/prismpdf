import { PDFDocument, degrees } from "pdf-lib";
import type { WorkspaceFile, WorkspacePage } from "@/lib/workspace/workspace-types";

/**
 * Merge pages from workspace files into a single PDF.
 * Respects page order, rotation, and exclusion of deleted pages.
 */
export async function mergeWorkspacePages(
  files: WorkspaceFile[],
  pages: WorkspacePage[]
): Promise<Blob> {
  const byFileId = new Map(files.map((f) => [f.id, f.file]));
  const loaded = new Map<string, PDFDocument>();
  const out = await PDFDocument.create();

  const sortedPages = [...pages]
    .filter((p) => !p.deleted)
    .sort((a, b) => a.outputIndex - b.outputIndex);

  for (const page of sortedPages) {
    const sourceFile = byFileId.get(page.fileId);
    if (!sourceFile) continue;

    let sourceDoc = loaded.get(page.fileId);
    if (!sourceDoc) {
      const arrayBuffer = await sourceFile.arrayBuffer();
      sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      loaded.set(page.fileId, sourceDoc);
    }

    const sourceIndex = page.sourcePageIndex - 1;
    if (sourceIndex < 0 || sourceIndex >= sourceDoc.getPageCount()) continue;

    const [copied] = await out.copyPages(sourceDoc, [sourceIndex]);
    if (page.rotation) {
      copied.setRotation(degrees(page.rotation));
    }
    out.addPage(copied);
  }

  const pdfBytes = await out.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
}
