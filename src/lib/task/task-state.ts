import type { OperationType } from "@/lib/pdf/types";

export type TaskState = {
  operation: OperationType;
  fileName: string;
  next: string;
};

/**
 * Parse query parameters from the processing page URL.
 */
export function parseTaskParams(
  searchParams: URLSearchParams
): TaskState | null {
  const operation = searchParams.get("operation") as OperationType | null;
  const fileName = searchParams.get("fileName");
  const next = searchParams.get("next") || "/success";

  if (!operation || !fileName) return null;

  return {
    operation,
    fileName,
    next,
  };
}

/**
 * Get processing steps for a given operation type.
 */
export function getProcessingSteps(operation: OperationType): string[] {
  const steps: Record<OperationType, string[]> = {
    merge: [
      "Preparing files",
      "Validating pages",
      "Reordering pages",
      "Merging pages",
      "Finalizing PDF",
    ],
    compress: [
      "Analyzing file",
      "Optimizing images",
      "Compressing content",
      "Finalizing PDF",
    ],
    convert: [
      "Reading source file",
      "Converting pages",
      "Preserving layout",
      "Generating output",
    ],
    cut: [
      "Reading source file",
      "Extracting pages",
      "Generating output",
    ],
    organize: [
      "Reading source file",
      "Applying changes",
      "Rebuilding PDF",
      "Finalizing output",
    ],
  };

  return steps[operation] || ["Processing..."];
}
