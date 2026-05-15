import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";

type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  comingSoon?: boolean;
};

export function ToolCard({ title, description, href, icon: Icon, comingSoon }: ToolCardProps) {
  const content = (
    <GlassPanel className="p-6 h-full cursor-pointer group hover:border-[rgba(56,189,248,0.35)] transition-all duration-300">
      <div className="flex flex-col gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(53,213,255,0.15)] to-[rgba(168,85,247,0.15)] flex items-center justify-center border border-[rgba(148,163,184,0.12)] group-hover:scale-110 transition-transform duration-200">
          <Icon size={22} className="text-cyan-300" />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-[22px] font-bold leading-tight tracking-tight text-[#f8fafc]">
            {title}
          </h3>
          {comingSoon && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(236,76,255,0.15)] text-magenta border border-[rgba(236,76,255,0.2)]">
              Coming soon
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </GlassPanel>
  );

  if (comingSoon) {
    return <div className="opacity-60 cursor-default">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}
