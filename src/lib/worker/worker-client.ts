export class WorkerUnavailableError extends Error {
  constructor() {
    super("Worker service is not available. Please set NEXT_PUBLIC_PDF_WORKER_URL.");
    this.name = "WorkerUnavailableError";
  }
}

async function getWorkerErrorMessage(response: Response): Promise<string> {
  if (response.status === 413) {
    return "This file is too large for server-side processing. Please use a PDF up to 50 MB.";
  }

  const contentType = response.headers.get("content-type") || "";
  let detail = "";

  if (contentType.includes("application/json")) {
    const body = await response.json().catch(() => null) as { detail?: unknown } | null;
    if (typeof body?.detail === "string") {
      detail = body.detail;
    }
  } else {
    detail = await response.text().catch(() => "");
  }

  if (response.status === 400 && detail) {
    return detail;
  }

  if (response.status === 404) {
    return "The worker endpoint was not found. Please try again later.";
  }

  if (response.status >= 500) {
    return "The worker could not finish processing this PDF. Please try another file or try again later.";
  }

  return detail || "The worker could not process this PDF. Please try again.";
}

export async function postWorkerFile(
  endpoint: string,
  formData: FormData
): Promise<Blob> {
  const base = process.env.NEXT_PUBLIC_PDF_WORKER_URL;
  if (!base) throw new WorkerUnavailableError();

  let response: Response;
  try {
    response = await fetch(`${base}${endpoint}`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("The worker service could not be reached. Please try again later.");
  }

  if (!response.ok) {
    throw new Error(await getWorkerErrorMessage(response));
  }

  return await response.blob();
}
