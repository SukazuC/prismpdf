import { GlassPanel } from "@/components/glass/GlassPanel";
import { Clock, FileText } from "lucide-react";
import { formatBytes } from "@/lib/files/format-bytes";

type QueueItem = {
  id: string;
  fileName: string;
  status: "queued" | "processing" | "complete" | "error";
  sizeBytes: number;
};

type QueueCardProps = {
  items: QueueItem[];
  className?: string;
};

export function QueueCard({ items, className = "" }: QueueCardProps) {
  if (items.length === 0) return null;

  return (
    <GlassPanel className={`p-4 ${className}`} intensity="soft">
      <h4 className="text-sm font-semibold text-[#f8fafc] mb-3 flex items-center gap-2">
        <Clock size={14} className="text-slate-400" />
        Queue ({items.length})
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(148,163,184,0.04)]"
          >
            <FileText size={14} className="text-slate-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 truncate">{item.fileName}</p>
              <p className="text-[10px] text-slate-500">{formatBytes(item.sizeBytes)}</p>
            </div>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                item.status === "queued"
                  ? "bg-slate-500/20 text-slate-400"
                  : item.status === "processing"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : item.status === "complete"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
