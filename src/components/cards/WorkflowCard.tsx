import { GlassPanel } from "@/components/glass/GlassPanel";
import { ArrowRight } from "lucide-react";

type WorkflowCardProps = {
  title: string;
  description: string;
  steps: { icon: React.ReactNode; label: string }[];
  href: string;
};

export function WorkflowCard({ title, description, steps, href }: WorkflowCardProps) {
  return (
    <a href={href} className="block h-full min-w-0">
      <GlassPanel className="group h-full min-w-0 cursor-pointer p-6 transition-all duration-300 hover:border-[rgba(56,189,248,0.35)]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0">
            <h3 className="text-[22px] font-bold leading-tight tracking-tight text-[#f8fafc] mb-1">
              {title}
            </h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex min-w-0 items-center gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(53,213,255,0.1)] text-cyan-300">
                    {step.icon}
                  </span>
                  <span className="min-w-0 text-xs text-slate-400">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight size={14} className="shrink-0 text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
    </a>
  );
}
