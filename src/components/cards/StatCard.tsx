import { GlassPanel } from "@/components/glass/GlassPanel";

type StatCardProps = {
  label: string;
  value: string | number;
  accent?: "cyan" | "violet" | "green" | "magenta";
  icon?: React.ReactNode;
};

const accentStyles = {
  cyan: "text-cyan-300",
  violet: "text-violet-300",
  green: "text-green-300",
  magenta: "text-magenta",
};

export function StatCard({ label, value, accent = "cyan", icon }: StatCardProps) {
  return (
    <GlassPanel className="px-5 py-4 flex items-center gap-4" intensity="soft">
      {icon && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-[rgba(53,213,255,0.1)] flex items-center justify-center ${accentStyles[accent]}`}>
          {icon}
        </div>
      )}
      <div>
        <p className={`text-2xl font-bold tracking-tight ${accentStyles[accent]}`}>{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </GlassPanel>
  );
}
