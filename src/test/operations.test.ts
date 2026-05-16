import { describe, it, expect, beforeAll } from "vitest";
import { PDFDocument } from "pdf-lib";
import { createFixturePdf, blobToFile } from "@/lib/test-utils/create-fixture";
import { mergeWorkspacePages } from "@/lib/pdf/operations/merge-client";
import { cutPdfPages } from "@/lib/pdf/operations/cut-client";
import { organizeWorkspacePdf } from "@/lib/pdf/operations/organize-client";
import type { WorkspaceFile, WorkspacePage } from "@/lib/workspace/workspace-types";

type PageSignature = {
  width: number;
  height: number;
  rotation: number;
};

async function getPageCount(blob: Blob): Promise<number> {
  const arrayBuffer = await blob.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return doc.getPageCount();
}

async function createSizedFixturePdf(sizes: [number, number][]): Promise<Blob> {
  const doc = await PDFDocument.create();

  sizes.forEach(([width, height], index) => {
    const page = doc.addPage([width, height]);
    page.drawText(`Page ${index + 1}`, { x: 20, y: height - 40, size: 18 });
  });

  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

async function getPageSignatures(blob: Blob): Promise<PageSignature[]> {
  const arrayBuffer = await blob.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return doc.getPages().map((page) => {
    const { width, height } = page.getSize();
    return {
      width,
      height,
      rotation: page.getRotation().angle,
    };
  });
}

function expectPageSignatures(actual: PageSignature[], expected: PageSignature[]) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((page, index) => {
    expect(actual[index].width).toBeCloseTo(page.width, 4);
    expect(actual[index].height).toBeCloseTo(page.height, 4);
    expect(actual[index].rotation).toBe(page.rotation);
  });
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

  it("preserves merge output order across distinct source pages", async () => {
    const sourceA = await createSizedFixturePdf([[210, 310], [220, 320]]);
    const sourceB = await createSizedFixturePdf([[230, 330], [240, 340]]);
    const fileA = blobToFile(sourceA, "source-a.pdf");
    const fileB = blobToFile(sourceB, "source-b.pdf");
    const files: WorkspaceFile[] = [
      {
        id: "source-a",
        file: fileA,
        name: "source-a.pdf",
        sizeBytes: fileA.size,
        mimeType: "application/pdf",
        pageCount: 2,
        status: "ready",
      },
      {
        id: "source-b",
        file: fileB,
        name: "source-b.pdf",
        sizeBytes: fileB.size,
        mimeType: "application/pdf",
        pageCount: 2,
        status: "ready",
      },
    ];

    const pages: WorkspacePage[] = [
      { id: "b2", fileId: "source-b", sourceFileName: "source-b.pdf", sourcePageIndex: 2, outputIndex: 0, rotation: 90 },
      { id: "a1", fileId: "source-a", sourceFileName: "source-a.pdf", sourcePageIndex: 1, outputIndex: 1, rotation: 0 },
      { id: "b1", fileId: "source-b", sourceFileName: "source-b.pdf", sourcePageIndex: 1, outputIndex: 2, rotation: 0 },
    ];

    const result = await mergeWorkspacePages(files, pages);
    expectPageSignatures(await getPageSignatures(result), [
      { width: 240, height: 340, rotation: 90 },
      { width: 210, height: 310, rotation: 0 },
      { width: 230, height: 330, rotation: 0 },
    ]);
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

  it("extracts selected pages in requested order", async () => {
    const sizedPdf = await createSizedFixturePdf([
      [201, 301],
      [202, 302],
      [203, 303],
      [204, 304],
      [205, 305],
      [206, 306],
    ]);
    const sizedFile = blobToFile(sizedPdf, "sized-six-pages.pdf");

    const result = await cutPdfPages(sizedFile, "extract", { selectedPageIndices: [5, 2, 4] }, "sized-six-pages.pdf");

    expect(result.blobs.length).toBe(1);
    expectPageSignatures(await getPageSignatures(result.blobs[0]), [
      { width: 205, height: 305, rotation: 0 },
      { width: 202, height: 302, rotation: 0 },
      { width: 204, height: 304, rotation: 0 },
    ]);
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

  it("applies delete, duplicate, rotation, and output order together", async () => {
    const sizedPdf = await createSizedFixturePdf([[211, 311], [222, 322], [233, 333], [244, 344]]);
    const sizedFile = blobToFile(sizedPdf, "sized-four-pages.pdf");
    const file: WorkspaceFile = {
      id: "file-sized-4",
      file: sizedFile,
      name: "sized-four-pages.pdf",
      sizeBytes: sizedFile.size,
      mimeType: "application/pdf",
      pageCount: 4,
      status: "ready",
    };

    const pages: WorkspacePage[] = [
      { id: "p1", fileId: "file-sized-4", sourceFileName: "sized-four-pages.pdf", sourcePageIndex: 1, outputIndex: 0, rotation: 0, deleted: true },
      { id: "p4", fileId: "file-sized-4", sourceFileName: "sized-four-pages.pdf", sourcePageIndex: 4, outputIndex: 1, rotation: 0 },
      { id: "p2", fileId: "file-sized-4", sourceFileName: "sized-four-pages.pdf", sourcePageIndex: 2, outputIndex: 2, rotation: 180 },
      { id: "p2-copy", fileId: "file-sized-4", sourceFileName: "sized-four-pages.pdf", sourcePageIndex: 2, outputIndex: 3, rotation: 90 },
      { id: "p3", fileId: "file-sized-4", sourceFileName: "sized-four-pages.pdf", sourcePageIndex: 3, outputIndex: 4, rotation: 0, deleted: true },
    ];

    const result = await organizeWorkspacePdf(file, pages);
    expectPageSignatures(await getPageSignatures(result), [
      { width: 244, height: 344, rotation: 0 },
      { width: 222, height: 322, rotation: 180 },
      { width: 222, height: 322, rotation: 90 },
    ]);
  });
});
