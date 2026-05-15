import { describe, it, expect, beforeAll } from "vitest";
import { createFixturePdf, blobToFile } from "@/lib/test-utils/create-fixture";
import { mergeWorkspacePages } from "@/lib/pdf/operations/merge-client";
import { cutPdfPages } from "@/lib/pdf/operations/cut-client";
import { organizeWorkspacePdf } from "@/lib/pdf/operations/organize-client";
import type { WorkspaceFile, WorkspacePage } from "@/lib/workspace/workspace-types";

async function getPageCount(blob: Blob): Promise<number> {
  const { PDFDocument } = await import("pdf-lib");
  const arrayBuffer = await blob.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return doc.getPageCount();
}

describe("mergeWorkspacePages", () => {
  let pdf2: Blob;
  let pdf3: Blob;
  let file2: File;
  let file3: File;

  beforeAll(async () => {
    pdf2 = await createFixturePdf(2);
    pdf3 = await createFixturePdf(3);
    file2 = blobToFile(pdf2, "two-pages.pdf");
    file3 = blobToFile(pdf3, "three-pages.pdf");
  });

  it("merges two PDFs into one with correct page count", async () => {
    const files: WorkspaceFile[] = [
      {
        id: "file-2",
        file: file2,
        name: "two-pages.pdf",
        sizeBytes: file2.size,
        mimeType: "application/pdf",
        pageCount: 2,
        status: "ready",
      },
      {
        id: "file-3",
        file: file3,
        name: "three-pages.pdf",
        sizeBytes: file3.size,
        mimeType: "application/pdf",
        pageCount: 3,
        status: "ready",
      },
    ];

    const pages: WorkspacePage[] = [
      { id: "p1", fileId: "file-2", sourceFileName: "two-pages.pdf", sourcePageIndex: 1, outputIndex: 0, rotation: 0 },
      { id: "p2", fileId: "file-2", sourceFileName: "two-pages.pdf", sourcePageIndex: 2, outputIndex: 1, rotation: 0 },
      { id: "p3", fileId: "file-3", sourceFileName: "three-pages.pdf", sourcePageIndex: 1, outputIndex: 2, rotation: 0 },
      { id: "p4", fileId: "file-3", sourceFileName: "three-pages.pdf", sourcePageIndex: 2, outputIndex: 3, rotation: 0 },
      { id: "p5", fileId: "file-3", sourceFileName: "three-pages.pdf", sourcePageIndex: 3, outputIndex: 4, rotation: 0 },
    ];

    const result = await mergeWorkspacePages(files, pages);
    const pageCount = await getPageCount(result);
    expect(pageCount).toBe(5);
  });

  it("respects page order and rotation", async () => {
    const files: WorkspaceFile[] = [
      {
        id: "file-2",
        file: file2,
        name: "two-pages.pdf",
        sizeBytes: file2.size,
        mimeType: "application/pdf",
        pageCount: 2,
        status: "ready",
      },
    ];

    const pages: WorkspacePage[] = [
      { id: "p2", fileId: "file-2", sourceFileName: "two-pages.pdf", sourcePageIndex: 2, outputIndex: 0, rotation: 90 },
      { id: "p1", fileId: "file-2", sourceFileName: "two-pages.pdf", sourcePageIndex: 1, outputIndex: 1, rotation: 0 },
    ];

    const result = await mergeWorkspacePages(files, pages);
    const pageCount = await getPageCount(result);
    expect(pageCount).toBe(2);
  });

  it("excludes deleted pages", async () => {
    const files: WorkspaceFile[] = [
      {
        id: "file-3",
        file: file3,
        name: "three-pages.pdf",
        sizeBytes: file3.size,
        mimeType: "application/pdf",
        pageCount: 3,
        status: "ready",
      },
    ];

    const pages: WorkspacePage[] = [
      { id: "p1", fileId: "file-3", sourceFileName: "three-pages.pdf", sourcePageIndex: 1, outputIndex: 0, rotation: 0 },
      { id: "p2", fileId: "file-3", sourceFileName: "three-pages.pdf", sourcePageIndex: 2, outputIndex: 1, rotation: 0, deleted: true },
      { id: "p3", fileId: "file-3", sourceFileName: "three-pages.pdf", sourcePageIndex: 3, outputIndex: 2, rotation: 0 },
    ];

    const result = await mergeWorkspacePages(files, pages);
    const pageCount = await getPageCount(result);
    expect(pageCount).toBe(2);
  });
});

describe("cutPdfPages", () => {
  let pdf6: Blob;
  let file6: File;

  beforeAll(async () => {
    pdf6 = await createFixturePdf(6);
    file6 = blobToFile(pdf6, "six-pages.pdf");
  });

  it("extracts specific pages", async () => {
    const result = await cutPdfPages(file6, "extract", { selectedPageIndices: [1, 3, 5] }, "six-pages.pdf");
    expect(result.blobs.length).toBe(1);
    const pageCount = await getPageCount(result.blobs[0]);
    expect(pageCount).toBe(3);
  });

  it("splits by range", async () => {
    const result = await cutPdfPages(file6, "range", {
      ranges: [{ start: 1, end: 2 }, { start: 5, end: 6 }],
    }, "six-pages.pdf");
    expect(result.blobs.length).toBe(2);
    expect(await getPageCount(result.blobs[0])).toBe(2);
    expect(await getPageCount(result.blobs[1])).toBe(2);
    expect(result.fileNames[0]).toBe("six-pages-pages-1-2.pdf");
    expect(result.fileNames[1]).toBe("six-pages-pages-5-6.pdf");
  });

  it("splits every N pages", async () => {
    const result = await cutPdfPages(file6, "split", { pagesPerChunk: 2 }, "six-pages.pdf");
    expect(result.blobs.length).toBe(3);
    expect(await getPageCount(result.blobs[0])).toBe(2);
    expect(await getPageCount(result.blobs[1])).toBe(2);
    expect(await getPageCount(result.blobs[2])).toBe(2);
  });

  it("handles uneven split", async () => {
    const result = await cutPdfPages(file6, "split", { pagesPerChunk: 4 }, "six-pages.pdf");
    expect(result.blobs.length).toBe(2);
    expect(await getPageCount(result.blobs[0])).toBe(4);
    expect(await getPageCount(result.blobs[1])).toBe(2);
  });
});

describe("organizeWorkspacePdf", () => {
  let pdf4: Blob;
  let file4: File;

  beforeAll(async () => {
    pdf4 = await createFixturePdf(4);
    file4 = blobToFile(pdf4, "four-pages.pdf");
  });

  it("exports pages in given order", async () => {
    const file: WorkspaceFile = {
      id: "file-4",
      file: file4,
      name: "four-pages.pdf",
      sizeBytes: file4.size,
      mimeType: "application/pdf",
      pageCount: 4,
      status: "ready",
    };

    const pages: WorkspacePage[] = [
      { id: "p4", fileId: "file-4", sourceFileName: "four-pages.pdf", sourcePageIndex: 4, outputIndex: 0, rotation: 0 },
      { id: "p3", fileId: "file-4", sourceFileName: "four-pages.pdf", sourcePageIndex: 3, outputIndex: 1, rotation: 0 },
      { id: "p2", fileId: "file-4", sourceFileName: "four-pages.pdf", sourcePageIndex: 2, outputIndex: 2, rotation: 0 },
      { id: "p1", fileId: "file-4", sourceFileName: "four-pages.pdf", sourcePageIndex: 1, outputIndex: 3, rotation: 0 },
    ];

    const result = await organizeWorkspacePdf(file, pages);
    const pageCount = await getPageCount(result);
    expect(pageCount).toBe(4);
  });

  it("handles deleted pages", async () => {
    const file: WorkspaceFile = {
      id: "file-4",
      file: file4,
      name: "four-pages.pdf",
      sizeBytes: file4.size,
      mimeType: "application/pdf",
      pageCount: 4,
      status: "ready",
    };

    const pages: WorkspacePage[] = [
      { id: "p1", fileId: "file-4", sourceFileName: "four-pages.pdf", sourcePageIndex: 1, outputIndex: 0, rotation: 0 },
      { id: "p2", fileId: "file-4", sourceFileName: "four-pages.pdf", sourcePageIndex: 2, outputIndex: 1, rotation: 0, deleted: true },
      { id: "p3", fileId: "file-4", sourceFileName: "four-pages.pdf", sourcePageIndex: 3, outputIndex: 2, rotation: 0 },
      { id: "p4", fileId: "file-4", sourceFileName: "four-pages.pdf", sourcePageIndex: 4, outputIndex: 3, rotation: 0, deleted: true },
    ];

    const result = await organizeWorkspacePdf(file, pages);
    const pageCount = await getPageCount(result);
    expect(pageCount).toBe(2);
  });
});
