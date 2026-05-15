"use client";

import { useCallback, useState } from "react";
import { Dropzone } from "@/components/upload/Dropzone";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { readPdfDocument } from "@/lib/pdf/read-pdf-document";
import { useRouter } from "next/navigation";
import type { WorkspacePage } from "@/lib/workspace/workspace-types";

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

  const handleFilesAccepted = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsReading(true);

      // Reset workspace for fresh workflow
      dispatch({ type: "workspaceReset" });

      // Read all PDFs and add to workspace
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
          continue;
        }

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

      // Auto-route to correct tool
      if (autoRoute) {
        if (acceptedFiles.length >= 2 && acceptedFiles.every(f => f.name.toLowerCase().endsWith(".pdf"))) {
          // Multiple PDFs → merge
          router.push("/merge-pdf");
        } else if (acceptedFiles.length === 1) {
          // Single PDF → organize (most flexible starting point)
          router.push("/organize-pages");
        }
      }
    },
    [dispatch, router, autoRoute]
  );

  return (
    <Dropzone
      onFilesAccepted={handleFilesAccepted}
      title="Drop your PDF here to start"
      subtitle="or click to browse files"
      ctaLabel="Choose PDF Files"
      accept={[".pdf"]}
      multiple={true}
      state={isReading ? "disabled" : undefined}
      className={className}
    />
  );
}
