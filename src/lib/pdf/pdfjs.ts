/**
 * Dynamically import pdfjs-dist only on the client.
 * Configure the worker source for Next.js compatibility.
 */
export async function getPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker source - use a CDN worker for browser compatibility
  // In Next.js, we must set the worker source to a CDN URL
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

  return pdfjsLib;
}
