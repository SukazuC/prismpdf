"use client";

import { useCallback, useState } from "react";
import { Dropzone } from "@/components/upload/Dropzone";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { readPdfDocument } from "@/lib/pdf/read-pdf-document";
import { useRouter } from "next/navigation";
import type { WorkspacePage } from "@/lib/workspace/workspace-types";
import { LOCAL_BROWSER_FILE_LIMIT_MB, LOCAL_PRIVACY_NOTE } from "@/lib/files/limits";

type SmartPdfIntakeDropzoneProps = {
  source?: string;
  className?: string;
  /** If true, route immediately after upload (default). If false, show action chooser */
  autoRoute?: boolean;
};

/**
 * A dropzone that actually works — accepts files, reads them into workspace,
 * and routes to the correct tool page.
 */
export function SmartPdfIntakeDropzone({
  source = "home",
  className,
  autoRoute = true,
}: SmartPdfIntakeDropzoneProps) {
  const router = useRouter();
  const { state, dispatch } = useWorkspace();
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");
  const [showActionChooser, setShowActionChooser] = useState(false);

  const handleFilesAccepted = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsReading(true);
      setError("");
      setShowActionChooser(false);

      // Reset workspace for fresh workflow
      dispatch({ type: "workspaceReset" });

      // Read all PDFs and add to workspace
      let successfulReads = 0;
      const readErrors: string[] = [];
      for (const file of acceptedFiles) {
        if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
          continue; // Skip non-PDFs for now
        }

        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        dispatch({
          type: "filesAdded",
          files: [{
            id,
            file,
            name: file.name,
            sizeBytes: file.size,
            mimeType: file.type || "application/pdf",
            pageCount: 0,
            status: "reading",
          }],
        });

        const info = await readPdfDocument(file);

        if (info.error) {
          dispatch({ type: "fileStatusChanged", fileId: id, status: "error", error: info.error });
          readErrors.push(`${file.name}: ${info.error}`);
          continue;
        }

        successfulReads++;

        dispatch({ type: "fileStatusChanged", fileId: id, status: "ready", pageCount: info.pageCount });

        const pages: WorkspacePage[] = [];
        for (let i = 0; i < info.pageCount; i++) {
          const thumb = info.thumbnails.find((t) => t.pageIndex === i);
          pages.push({
            id: `${id}-p${i + 1}`,
            fileId: id,
            sourceFileName: file.name,
            sourcePageIndex: i + 1,
            outputIndex: -1,
            thumbnailUrl: thumb?.url,
            width: thumb?.width,
            height: thumb?.height,
            rotation: 0,
          });
        }
        dispatch({ type: "pagesAdded", pages });
        dispatch({ type: "activeFileChanged", fileId: id });
      }

      setIsReading(false);

      if (successfulReads === 0) {
        setError(readErrors[0] ?? "No readable PDF files could be added.");
        return;
      }

      // Auto-route only after successful reads.
      if (autoRoute) {
        if (successfulReads >= 2) {
          // Multiple PDFs → merge
          router.push("/merge-pdf");
        } else {
          setShowActionChooser(true);
        }
      }
    },
    [dispatch, router, autoRoute]
  );

  const readyFile = state.files.find((file) => file.status === "ready");

  if (showActionChooser && readyFile) {
    const actions = [
      { label: "Organize", href: "/organize-pages" },
      { label: "Convert", href: "/convert-pdf" },
      { label: "Compress", href: "/compress-pdf" },
      { label: "Cut", href: "/cut-pdf" },
    ];

    return (
      <div className={`rounded-2xl border border-[rgba(148,163,184,0.16)] bg-[rgba(7,15,35,0.5)] p-6 backdrop-blur-sm ${className ?? ""}`}>
        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold text-[#f8fafc]">Choose what to do next</p>
          <p className="text-sm text-slate-400">
            {readyFile.name} is ready. Add 2 or more PDFs together to start a merge.
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map((action) => (
            <button
              key={action.href}
              type="button"
              onClick={() => router.push(action.href)}
              className="rounded-xl border border-[rgba(148,163,184,0.14)] bg-[rgba(148,163,184,0.06)] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/50 hover:text-cyan-200"
            >
              {action.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "workspaceReset" });
            setShowActionChooser(false);
          }}
          className="mt-4 w-full text-xs text-slate-400 transition-colors hover:text-cyan-300"
        >
          Choose a different file
        </button>
      </div>
    );
  }

  return (
    <Dropzone
      onFilesAccepted={handleFilesAccepted}
      title={source === "upload" ? "Drop your PDF here" : "Drop your PDF here to start"}
      subtitle="or click to browse files"
      ctaLabel="Choose PDF Files"
      accept={[".pdf"]}
      multiple={true}
      maxSizeMB={LOCAL_BROWSER_FILE_LIMIT_MB}
      privacyNote={LOCAL_PRIVACY_NOTE}
      state={isReading ? "disabled" : error ? "error" : undefined}
      errorMessage={error}
      className={className}
    />
  );
}
