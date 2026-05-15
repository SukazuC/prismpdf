export class WorkerUnavailableError extends Error {
  constructor() {
    super("Worker service is not available. Please set NEXT_PUBLIC_PDF_WORKER_URL.");
    this.name = "WorkerUnavailableError";
  }
}

export async function postWorkerFile(
  endpoint: string,
  formData: FormData
): Promise<Blob> {
  const base = process.env.NEXT_PUBLIC_PDF_WORKER_URL;
  if (!base) throw new WorkerUnavailableError();

  const response = await fetch(`${base}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`Worker error (${response.status}): ${errorBody}`);
  }

  return await response.blob();
}
