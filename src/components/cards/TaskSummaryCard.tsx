import { GlassPanel } from "@/components/glass/GlassPanel";
import { formatBytes } from "@/lib/files/format-bytes";

type TaskSummaryCardProps = {
  operation: string;
  fileName: string;
  pageCount?: number;
  fileCount?: number;
  fileSize: number;
  outputFormat?: string;
  sourceSummary?: string;
  compressionStatus?: "smaller" | "not-smaller";
  duration?: string;
};

export function TaskSummaryCard({
  operation,
  fileName,
  pageCount,
  fileCount,
  fileSize,
  outputFormat,
  sourceSummary,
  compressionStatus,
  duration = "Instant",
}: TaskSummaryCardProps) {
  return (
    <GlassPanel className="p-5" intensity="soft">
      <h4 className="text-sm font-semibold text-[#f8fafc] mb-3">Task Summary</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Operation</span>
          <span className="text-slate-200 capitalize">{operation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">File</span>
          <span className="text-slate-200 truncate max-w-[180px]">{fileName}</span>
        </div>
        {sourceSummary && (
          <div className="flex justify-between gap-3">
            <span className="text-slate-400">Source</span>
            <span className="text-slate-200 text-right">{sourceSummary}</span>
          </div>
        )}
        {pageCount !== undefined && (
          <div className="flex justify-between">
            <span className="text-slate-400">Output pages</span>
            <span className="text-slate-200">{pageCount}</span>
          </div>
        )}
        {fileCount !== undefined && (
          <div className="flex justify-between">
            <span className="text-slate-400">Output files</span>
            <span className="text-slate-200">{fileCount}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Output size</span>
          <span className="text-slate-200">{formatBytes(fileSize)}</span>
        </div>
        {compressionStatus === "not-smaller" && (
          <div className="rounded-xl border border-[rgba(148,163,184,0.18)] bg-[rgba(148,163,184,0.08)] px-3 py-2 text-xs text-slate-300">
            No smaller version was produced.
          </div>
        )}
        {outputFormat && (
          <div className="flex justify-between">
            <span className="text-slate-400">Output format</span>
            <span className="text-slate-200 uppercase">{outputFormat}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-400">Duration</span>
          <span className="text-slate-200">{duration}</span>
        </div>
      </div>
    </GlassPanel>
  );
}
