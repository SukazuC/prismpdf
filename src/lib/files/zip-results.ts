import JSZip from "jszip";

/**
 * Package multiple blobs into a single ZIP file.
 */
export async function createZipBlob(
  files: { name: string; blob: Blob }[]
): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.blob);
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return zipBlob;
}

/**
 * Download a single blob, naming it appropriately.
 * For multiple files, wraps in ZIP. For single, downloads directly.
 */
export async function packageAndDownload(
  results: { blobs: Blob[]; fileNames: string[] }
) {
  const { downloadBlob } = await import("@/lib/files/download");

  if (results.blobs.length === 1) {
    downloadBlob(results.blobs[0], results.fileNames[0]);
  } else {
    const files = results.blobs.map((blob, i) => ({
      name: results.fileNames[i],
      blob,
    }));
    const zipBlob = await createZipBlob(files);
    downloadBlob(zipBlob, "cut-results.zip");
  }
}
