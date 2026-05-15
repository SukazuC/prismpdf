import { GlassPanel } from "@/components/glass/GlassPanel";
import { formatBytes } from "@/lib/demo-data";

type TaskSummaryCardProps = {
  operation: string;
  fileName: string;
  pageCount: number;
  fileSize: number;
  outputFormat?: string;
  duration?: string;
};

export function TaskSummaryCard({
  operation,
  fileName,
  pageCount,
  fileSize,
  outputFormat,
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
        <div className="flex justify-between">
          <span className="text-slate-400">Pages</span>
          <span className="text-slate-200">{pageCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Size</span>
          <span className="text-slate-200">{formatBytes(fileSize)}</span>
        </div>
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
