type FormatBadgeProps = {
  format: string;
  className?: string;
};

const formatColors: Record<string, string> = {
  pdf: "bg-red-500/15 text-red-300 border-red-500/20",
  docx: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  xlsx: "bg-green-500/15 text-green-300 border-green-500/20",
  pptx: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  jpg: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  png: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  txt: "bg-slate-500/15 text-slate-300 border-slate-500/20",
};

export function FormatBadge({ format, className = "" }: FormatBadgeProps) {
  const colors = formatColors[format.toLowerCase()] || formatColors.pdf;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${colors} ${className}`}
    >
      {format.toUpperCase()}
    </span>
  );
}
