let pdfjsInstance: typeof import("pdfjs-dist") | null = null;

export async function getPdfJs() {
  if (!pdfjsInstance) {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsInstance = pdfjsLib;
  }
  return pdfjsInstance;
}
