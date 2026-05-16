"use client";

import { useCallback, useState } from "react";
import { Dropzone } from "@/components/upload/Dropzone";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { FileRow } from "@/components/pdf/FileRow";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { readPdfDocument } from "@/lib/pdf/read-pdf-document";
import type { WorkspacePage } from "@/lib/workspace/workspace-types";
import {
  LOCAL_BROWSER_FILE_LIMIT_MB,
  LOCAL_PRIVACY_NOTE,
  MIXED_CONVERT_PRIVACY_NOTE,
  SERVER_PRIVACY_NOTE,
  WORKER_FILE_LIMIT_MB,
} from "@/lib/files/limits";
import { ArrowRight, AlertTriangle } from "lucide-react";

type OperationConstraints = {
  accept: string[];
  multiple: boolean;
  minFiles: number;
  maxFiles?: number;
  label: string;
  description: string;
  runLabel: string;
  privacyMode: "local" | "server" | "mixed";
  maxSizeMB: number;
  privacyNote: string;
};

const operationConstraintsMap: Record<string, OperationConstraints> = {
  merge: {
    accept: [".pdf"],
    multiple: true,
    minFiles: 2,
    label: "Merge PDF",
    description: "Combine multiple PDFs into one document",
    runLabel: "Merge PDFs",
    privacyMode: "local",
    maxSizeMB: LOCAL_BROWSER_FILE_LIMIT_MB,
    privacyNote: LOCAL_PRIVACY_NOTE,
  },
  compress: {
    accept: [".pdf"],
    multiple: false,
    minFiles: 1,
    label: "Compress PDF",
    description: "Reduce file size while preserving quality",
    runLabel: "Compress PDF",
    privacyMode: "server",
    maxSizeMB: WORKER_FILE_LIMIT_MB,
    privacyNote: SERVER_PRIVACY_NOTE,
  },
  convert: {
    accept: [".pdf"],
    multiple: false,
    minFiles: 1,
    label: "Convert PDF",
    description: "Convert to images, text, or Office formats",
    runLabel: "Convert PDF",
    privacyMode: "mixed",
    maxSizeMB: WORKER_FILE_LIMIT_MB,
    privacyNote: MIXED_CONVERT_PRIVACY_NOTE,
  },
  cut: {
    accept: [".pdf"],
    multiple: false,
    minFiles: 1,
    label: "Cut PDF",
    description: "Extract or split pages from your PDF",
    runLabel: "Cut PDF",
    privacyMode: "local",
    maxSizeMB: LOCAL_BROWSER_FILE_LIMIT_MB,
    privacyNote: LOCAL_PRIVACY_NOTE,
  },
  organize: {
    accept: [".pdf"],
    multiple: false,
    minFiles: 1,
    label: "Organize Pages",
    description: "Reorder, rotate, delete, or duplicate pages",
    runLabel: "Export PDF",
    privacyMode: "local",
    maxSizeMB: LOCAL_BROWSER_FILE_LIMIT_MB,
    privacyNote: LOCAL_PRIVACY_NOTE,
  },
};

const privacyBadgeCopy: Record<OperationConstraints["privacyMode"], string> = {
  local: "Browser only",
  server: "Server processed",
  mixed: "Local + server",
};

type DocumentIntakeProps = {
  operation: string;
  onReady: () => void;
  onBack?: () => void;
};

export function DocumentIntake({ operation, onReady, onBack }: DocumentIntakeProps) {
  const { state, dispatch } = useWorkspace();
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");

  const constraints = operationConstraintsMap[operation];

  const isReady = (constraints?.minFiles ?? 0) <= state.files.length &&
    state.files.every((f) => f.status === "ready");

  const handleFilesAccepted = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      setIsReading(true);

      for (const file of acceptedFiles) {
        const id = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        dispatch({
          type: "filesAdded",
          files: [
            {
              id,
              file,
              name: file.name,
              sizeBytes: file.size,
              mimeType: file.type,
              pageCount: 0,
              status: "reading",
            },
          ],
        });

        const info = await readPdfDocument(file);

        if (info.error) {
          dispatch({ type: "fileStatusChanged", fileId: id, status: "error", error: info.error });
          setError(info.error);
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
    },
    [dispatch]
  );

  const handleRemoveFile = (id: string) => {
    dispatch({ type: "fileRemoved", fileId: id });
  };

  const handleRetry = () => {
    setError("");
    dispatch({ type: "workspaceReset" });
  };

  if (!constraints) {
    return (
      <div className="space-y-4">
        <GlassPanel className="p-5">
          <p className="text-red-400">Unknown operation: {operation}</p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GlassPanel className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc]">
              {constraints.label}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{constraints.description}</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider"
            style={{
              background: constraints.privacyMode === "local"
                ? "rgba(53, 242, 166, 0.12)"
                : "rgba(53, 213, 255, 0.12)",
              color: constraints.privacyMode === "local" ? "#35f2a6" : "#35d5ff",
            }}
          >
            {privacyBadgeCopy[constraints.privacyMode]}
          </div>
        </div>

        <Dropzone
          onFilesAccepted={handleFilesAccepted}
          title={constraints.multiple ? "Drop PDFs here" : "Drop a PDF here"}
          subtitle={constraints.multiple ? "Upload multiple PDF files to combine" : "Upload a PDF file to get started"}
          ctaLabel="Browse files"
          accept={constraints.accept}
          multiple={constraints.multiple}
          maxSizeMB={constraints.maxSizeMB}
          privacyNote={constraints.privacyNote}
          state={isReading ? "disabled" : undefined}
        />
      </GlassPanel>

      {state.files.length > 0 && (
        <GlassPanel className="p-5">
          <h4 className="text-sm font-semibold text-[#f8fafc] mb-3">
            Uploaded files ({state.files.length})
          </h4>
          <div className="space-y-2">
            {state.files.map((f) => (
              <FileRow
                key={f.id}
                file={{
                  id: f.id,
                  name: f.name,
                  sizeBytes: f.sizeBytes,
                  pageCount: f.pageCount,
                  status: f.status === "error" ? "error" : f.status === "reading" ? "uploading" : "ready",
                  type: f.mimeType,
                }}
                onRemove={() => handleRemoveFile(f.id)}
              />
            ))}
          </div>
        </GlassPanel>
      )}

      {error && (
        <GlassPanel className="p-4 border-[rgba(251,113,133,0.3)]" intensity="soft">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">{error}</div>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 text-xs text-cyan-300 hover:text-cyan-200"
          >
            Try again
          </button>
        </GlassPanel>
      )}

      <div className="flex items-center justify-between">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Back
          </button>
        )}
        <GradientButton
          onClick={onReady}
          disabled={!isReady || isReading}
          size="lg"
          className={onBack ? "" : "w-full"}
        >
          {constraints.runLabel}
          <ArrowRight size={18} />
        </GradientButton>
      </div>
    </div>
  );
}
