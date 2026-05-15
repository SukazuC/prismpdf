export type FileValidationResult =
  | { ok: true; files: File[] }
  | { ok: false; reason: string; rejectedFiles?: string[] };

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".pptx", ".xlsx", ".jpg", ".jpeg", ".png"];

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx === -1) return "";
  return filename.slice(idx).toLowerCase();
}

export function validateFiles(
  fileList: FileList | File[],
  options?: { maxSizeMB?: number; multiple?: boolean }
): FileValidationResult {
  const maxSize = (options?.maxSizeMB ?? 200) * 1024 * 1024;
  const allowMultiple = options?.multiple ?? true;
  const files = Array.from(fileList);

  if (files.length === 0) {
    return { ok: false, reason: "No files selected." };
  }

  if (!allowMultiple && files.length > 1) {
    return {
      ok: false,
      reason: "Only one file is allowed for this operation.",
      rejectedFiles: files.slice(1).map((f) => f.name),
    };
  }

  const rejectedFiles: string[] = [];
  const validFiles: File[] = [];

  for (const file of files) {
    const ext = getExtension(file.name);

    // Accept file if extension is allowed (more reliable than MIME on some browsers)
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      rejectedFiles.push(`${file.name} (unsupported format)`);
      continue;
    }

    if (file.size > maxSize) {
      rejectedFiles.push(
        `${file.name} (exceeds ${options?.maxSizeMB ?? 200} MB limit)`
      );
      continue;
    }

    if (file.size === 0) {
      rejectedFiles.push(`${file.name} (empty file)`);
      continue;
    }

    validFiles.push(file);
  }

  if (validFiles.length === 0) {
    return {
      ok: false,
      reason:
        rejectedFiles.length > 0
          ? `No valid files could be added.`
          : "No valid files selected.",
      rejectedFiles,
    };
  }

  if (rejectedFiles.length > 0) {
    // Partial success
    return { ok: true, files: validFiles };
  }

  return { ok: true, files: validFiles };
}
