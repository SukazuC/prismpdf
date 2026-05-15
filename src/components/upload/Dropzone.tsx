"use client";

import { useRef, useState, useCallback, type DragEvent } from "react";
import { Upload } from "lucide-react";

type DropzoneState = "idle" | "drag-over" | "uploading" | "error" | "success" | "disabled";

type DropzoneProps = {
  accept?: string[];
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  privacyNote?: string;
  onFilesAccepted: (files: File[]) => void;
  state?: DropzoneState;
  errorMessage?: string;
  className?: string;
};

const stateStyles: Record<DropzoneState, string> = {
  idle: "border-[rgba(148,163,184,0.22)] hover:border-[rgba(56,189,248,0.4)]",
  "drag-over": "border-cyan-400 scale-[1.01]",
  uploading: "border-cyan-400 opacity-60",
  error: "border-red-400",
  success: "border-green-400",
  disabled: "border-[rgba(148,163,184,0.1)] opacity-40 cursor-not-allowed",
};

export function Dropzone({
  accept = [".pdf", ".docx", ".pptx", ".jpg", ".png"],
  multiple = true,
  maxSizeMB = 200,
  title = "Drop your files here",
  subtitle = "or click to browse",
  ctaLabel = "Choose Files",
  privacyNote = "Your files stay private. Processed locally in your browser.",
  onFilesAccepted,
  state: externalState,
  errorMessage,
  className = "",
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalState, setInternalState] = useState<DropzoneState>("idle");
  const [internalError, setInternalError] = useState<string>("");

  const effectiveState = externalState || internalState;
  const effectiveError = errorMessage || internalError;

  const handleFiles = useCallback(
    (fileList: File[]) => {
      if (fileList.length === 0) return;

      // Basic client validation
      const validExts = accept.map((a) => a.toLowerCase());
      const validFiles: File[] = [];
      const rejected: string[] = [];

      for (const file of fileList) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!validExts.includes(ext)) {
          rejected.push(`${file.name} (unsupported format)`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          rejected.push(`${file.name} (exceeds ${maxSizeMB} MB)`);
          continue;
        }
        if (file.size === 0) {
          rejected.push(`${file.name} (empty file)`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        setInternalState("error");
        setInternalError(rejected.join("; "));
        return;
      }

      if (rejected.length > 0) {
        // Partial success - accept valid files
        setInternalState("success");
      } else {
        setInternalState("success");
      }

      onFilesAccepted(validFiles);

      // Reset after a short delay
      setTimeout(() => {
        setInternalState("idle");
        setInternalError("");
      }, 2000);
    },
    [accept, maxSizeMB, onFilesAccepted]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (effectiveState !== "disabled") {
      setInternalState("drag-over");
    }
  }, [effectiveState]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInternalState("idle");
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (effectiveState === "disabled") return;

      setInternalState("idle");
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [effectiveState, handleFiles]
  );

  const handleClick = () => {
    if (effectiveState === "disabled") return;
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 bg-[rgba(7,15,35,0.5)] backdrop-blur-sm ${stateStyles[effectiveState]} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={title}
      aria-invalid={effectiveState === "error" || undefined}
      aria-describedby={effectiveError ? "dropzone-error" : undefined}
    >
      <div className="flex flex-col items-center justify-center py-12 px-8 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(53,213,255,0.2)] to-[rgba(168,85,247,0.2)] flex items-center justify-center border border-[rgba(148,163,184,0.15)]">
          <Upload size={28} className="text-cyan-300" />
        </div>
        <p className="text-lg font-semibold text-[#f8fafc]">{title}</p>
        <p className="text-sm text-slate-400">{subtitle}</p>
        <span className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#28c7ff] via-[#1668ff] via-[#a855f7] to-[#f04cff] text-white text-sm font-semibold shadow-[0_0_32px_rgba(59,130,246,0.42)] hover:shadow-[0_0_40px_rgba(59,130,246,0.54)] transition-shadow">
          {ctaLabel}
        </span>
        <p className="text-xs text-slate-500 mt-2">
          Supports {accept.join(", ")} &middot; Up to {maxSizeMB} MB
        </p>
        {privacyNote && (
          <p className="text-xs text-slate-500/70">{privacyNote}</p>
        )}
        {effectiveError && (
          <p id="dropzone-error" className="text-xs text-red-400" role="alert">
            {effectiveError}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept.join(",")}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(Array.from(e.target.files));
          }
          // Reset so same file can be re-selected
          e.target.value = "";
        }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
