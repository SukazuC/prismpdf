import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postWorkerFile, WorkerUnavailableError } from "@/lib/worker/worker-client";

const originalWorkerUrl = process.env.NEXT_PUBLIC_PDF_WORKER_URL;

function formData() {
  const data = new FormData();
  data.append("file", new File(["pdf"], "test.pdf", { type: "application/pdf" }));
  return data;
}

describe("postWorkerFile", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_PDF_WORKER_URL = "https://worker.example";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_PDF_WORKER_URL = originalWorkerUrl;
    vi.unstubAllGlobals();
  });

  it("throws a friendly message for 413 worker responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Too large", { status: 413 })));

    await expect(postWorkerFile("/compress", formData())).rejects.toThrow(
      "This file is too large for server-side processing. Please use a PDF up to 50 MB."
    );
  });

  it("throws a generic retry message for 5xx worker responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Exploded", { status: 500 })));

    await expect(postWorkerFile("/convert/docx", formData())).rejects.toThrow(
      "The worker could not finish processing this PDF. Please try another file or try again later."
    );
  });

  it("throws a friendly retry message when fetch fails before a response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("fetch failed");
    }));

    await expect(postWorkerFile("/compress", formData())).rejects.toThrow(
      "The worker service could not be reached. Please try again later."
    );
  });

  it("uses JSON detail for 400 worker responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ detail: "PDF is encrypted or unreadable." }, { status: 400 })
      )
    );

    await expect(postWorkerFile("/compress", formData())).rejects.toThrow("PDF is encrypted or unreadable.");
  });

  it("throws a worker unavailable error when the worker URL is missing", async () => {
    delete process.env.NEXT_PUBLIC_PDF_WORKER_URL;

    await expect(postWorkerFile("/compress", formData())).rejects.toBeInstanceOf(WorkerUnavailableError);
  });
});
