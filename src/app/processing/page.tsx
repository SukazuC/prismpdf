"use client";

import { useState, useEffect, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { ProcessingStepper } from "@/components/progress/ProcessingStepper";
import { QueueCard } from "@/components/progress/QueueCard";
import { useRouter, useSearchParams } from "next/navigation";
import { getProcessingSteps, parseTaskParams } from "@/lib/task/task-state";
import { X } from "lucide-react";

function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const task = parseTaskParams(searchParams);

  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState<"processing" | "complete" | "cancelled">("processing");

  const steps = task ? getProcessingSteps(task.operation) : ["Processing..."];
  const fileName = task?.fileName || "document.pdf";
  const nextRoute = task?.next || "/success";

  useEffect(() => {
    if (status !== "processing") return;

    const totalDuration = 4000;
    const interval = 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + 100 / (totalDuration / interval), 100);
        setCurrentStepIndex(Math.min(Math.floor((next / 100) * steps.length), steps.length - 1));

        if (next >= 100) {
          clearInterval(timer);
          setStatus("complete");
          setTimeout(() => {
            router.push(`${nextRoute}?fileName=${encodeURIComponent(fileName)}&operation=${task?.operation || "merge"}`);
          }, 800);
        }

        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [status, steps.length, router, nextRoute, fileName, task?.operation]);

  const stepStatuses = steps.map((step, i) => {
    if (status === "complete") return "complete" as const;
    if (i < currentStepIndex) return "complete" as const;
    if (i === currentStepIndex) return "active" as const;
    return "pending" as const;
  });

  const stepData = steps.map((label, i) => ({
    id: `step-${i}`,
    label,
    status: stepStatuses[i],
  }));

  const handleCancel = () => {
    setStatus("cancelled");
    router.push("/upload");
  };

  return (
    <AppShell backdropVariant="editor">
      <section className="page-shell pt-16 pb-16">
        <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(ellipse 600px 400px at 50% 40%, rgba(53,213,255,0.08) 0%, transparent 70%), radial-gradient(ellipse 400px 400px at 30% 60%, rgba(124,60,255,0.06) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <GlassPanel className="p-10">
            <div className="flex flex-col items-center text-center gap-6">
              <ProgressRing value={progress} size={140} label={status === "complete" ? "Complete!" : "Processing"} />

              <div>
                <h2 className="text-2xl font-bold text-[#f8fafc]">
                  {status === "complete"
                    ? "Processing complete!"
                    : status === "cancelled"
                      ? "Cancelled"
                      : "Processing your file"}
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                  {status === "complete"
                    ? "Your file is ready for download."
                    : fileName}
                </p>
              </div>

              {status === "processing" && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-[rgba(251,113,133,0.1)] transition-all"
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h3 className="text-sm font-semibold text-[#f8fafc] mb-4">Progress</h3>
            <ProcessingStepper steps={stepData} />
          </GlassPanel>

          <QueueCard
            items={[
              {
                id: "1",
                fileName,
                status: status === "complete" ? "complete" : "processing",
                sizeBytes: 4200000,
              },
            ]}
          />

          <GlassPanel className="p-5" intensity="soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(53,213,255,0.1)] flex items-center justify-center text-cyan-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#f8fafc]">Keep this tab open</p>
                <p className="text-xs text-slate-400">
                  Your file is being processed. Please keep this tab open until complete.
                </p>
              </div>
            </div>
          </GlassPanel>
        </div>
      </section>
    </AppShell>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="page-shell pt-16 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </AppShell>
    }>
      <ProcessingContent />
    </Suspense>
  );
}
