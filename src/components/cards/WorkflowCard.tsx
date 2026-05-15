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
    <a href={href}>
      <GlassPanel className="p-6 h-full cursor-pointer group hover:border-[rgba(56,189,248,0.35)] transition-all duration-300">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-[22px] font-bold leading-tight tracking-tight text-[#f8fafc] mb-1">
              {title}
            </h3>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[rgba(53,213,255,0.1)] flex items-center justify-center text-cyan-300">
                    {step.icon}
                  </span>
                  <span className="text-xs text-slate-400">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight size={14} className="text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>
    </a>
  );
}
