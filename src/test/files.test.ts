import { describe, it, expect } from "vitest";
import { validateFiles } from "@/lib/files/validate-files";

function createMockFile(name: string, size: number, type: string): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("validateFiles", () => {
  it("accepts a valid PDF file", () => {
    const file = createMockFile("test.pdf", 1000, "application/pdf");
    const result = validateFiles([file]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.files).toHaveLength(1);
    }
  });

  it("rejects empty file list", () => {
    const result = validateFiles([]);
    expect(result.ok).toBe(false);
  });

  it("rejects unsupported file format", () => {
    const file = createMockFile("test.exe", 1000, "application/x-msdownload");
    const result = validateFiles([file]);
    expect(result.ok).toBe(false);
  });

  it("rejects files exceeding size limit", () => {
    const file = createMockFile("large.pdf", 300 * 1024 * 1024, "application/pdf");
    const result = validateFiles([file], { maxSizeMB: 200 });
    expect(result.ok).toBe(false);
  });

  it("rejects empty files", () => {
    const file = createMockFile("empty.pdf", 0, "application/pdf");
    const result = validateFiles([file]);
    expect(result.ok).toBe(false);
  });

  it("rejects multiple files when single mode", () => {
    const file1 = createMockFile("test1.pdf", 1000, "application/pdf");
    const file2 = createMockFile("test2.pdf", 1000, "application/pdf");
    const result = validateFiles([file1, file2], { multiple: false });
    expect(result.ok).toBe(false);
  });

  it("accepts multiple files in multi mode", () => {
    const file1 = createMockFile("test1.pdf", 1000, "application/pdf");
    const file2 = createMockFile("test2.pdf", 1000, "application/pdf");
    const result = validateFiles([file1, file2], { multiple: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.files).toHaveLength(2);
    }
  });

  it("accepts DOCX files", () => {
    const file = createMockFile("test.docx", 1000, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    const result = validateFiles([file]);
    expect(result.ok).toBe(true);
  });

  it("accepts JPG files", () => {
    const file = createMockFile("test.jpg", 1000, "image/jpeg");
    const result = validateFiles([file]);
    expect(result.ok).toBe(true);
  });

  it("accepts PNG files", () => {
    const file = createMockFile("test.png", 1000, "image/png");
    const result = validateFiles([file]);
    expect(result.ok).toBe(true);
  });
});
