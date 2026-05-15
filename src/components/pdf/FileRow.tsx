"use client";

import { FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { formatBytes } from "@/lib/demo-data";
import type { UploadedFile } from "@/lib/pdf/types";

type FileRowProps = {
  file: UploadedFile;
  onRemove?: (id: string) => void;
};

export function FileRow({ file, onRemove }: FileRowProps) {
  const statusIcon = {
    queued: <Loader2 size={14} className="text-slate-400 animate-spin" />,
    uploading: <Loader2 size={14} className="text-cyan-300 animate-spin" />,
    ready: <CheckCircle size={14} className="text-green-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(7,15,35,0.5)] border border-[rgba(148,163,184,0.12)]">
      <FileText size={18} className="text-cyan-300 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#f8fafc] truncate">{file.name}</p>
        <p className="text-xs text-slate-500">
          {formatBytes(file.sizeBytes)}
          {file.pageCount ? ` · ${file.pageCount} pages` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {statusIcon[file.status]}
        {onRemove && file.status !== "uploading" && (
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-[rgba(251,113,133,0.1)] transition-all"
            aria-label={`Remove ${file.name}`}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
