"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { ProcessingStepper } from "@/components/progress/ProcessingStepper";
import { QueueCard } from "@/components/progress/QueueCard";
import { GradientButton } from "@/components/buttons/GradientButton";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { runTask, TaskError } from "@/lib/tasks/run-task";
import { X, RefreshCw, ArrowLeft } from "lucide-react";

const OPERATION_STEPS: Record<string, string[]> = {
  merge: ["Reading PDFs", "Combining pages", "Creating download", "Complete"],
  cut: ["Reading PDF", "Extracting pages", "Creating download", "Complete"],
  organize: ["Reading PDF", "Organizing pages", "Creating download", "Complete"],
  compress: ["Reading PDF", "Compressing", "Creating download", "Complete"],
  convert: ["Reading PDF", "Converting", "Creating download", "Complete"],
};

function ProcessingContent() {
  const router = useRouter();
  const { state, dispatch } = useWorkspace();
  const task = state.pendingTask;
  const hasRun = useRef(false);

  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState<"processing" | "complete" | "error" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const steps = task ? (OPERATION_STEPS[task.operation] || ["Processing..."]) : [];
  const operationLabel = task?.operation || "operation";

  // Task is optional — no redirect

  // Run the task
  useEffect(() => {
    if (!task || hasRun.current) return;
    hasRun.current = true;

    setStatus("processing");

    const run = async () => {
      try {
        // Simulate progress while working
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            const next = Math.min(prev + 5, 90);
            setCurrentStepIndex(Math.min(Math.floor((next / 100) * steps.length), steps.length - 1));
            return next;
          });
        }, 200);

        const result = await runTask(state, task);

        clearInterval(progressInterval);
        setProgress(100);
        setCurrentStepIndex(steps.length - 1);

        dispatch({ type: "resultReady", result });

        setTimeout(() => {
          setStatus("complete");
          setTimeout(() => {
            router.push("/success");
          }, 600);
        }, 400);
      } catch (err) {
        setStatus("error");
        const msg = err instanceof TaskError ? err.message : "An unexpected error occurred";
        setErrorMessage(msg);
      }
    };

    run();
  }, [task, state, dispatch, router, steps.length]);

  const handleRetry = () => {
    hasRun.current = false;
    setProgress(0);
    setCurrentStepIndex(0);
    setStatus("idle");
    setErrorMessage("");
  };

  const handleCancel = () => {
    dispatch({ type: "workspaceReset" });
    router.push("/");
  };

  const stepStatuses = steps.map((_, i) => {
    if (status === "error" && i === currentStepIndex) return "active" as const;
    if (i < currentStepIndex || status === "complete") return "complete" as const;
    if (i === currentStepIndex) return "active" as const;
    return "pending" as const;
  });

  const stepData = steps.map((label, i) => ({
    id: `step-${i}`,
    label,
    status: stepStatuses[i],
  }));

  if (!task) {
    return (
      <AppShell backdropVariant="editor">
        <section className="page-shell pt-16 pb-16">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <GlassPanel className="p-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[rgba(148,163,184,0.1)] flex items-center justify-center text-slate-400">
                  <X size={28} />
                </div>
                <h2 className="text-xl font-bold text-[#f8fafc]">No active task</h2>
                <p className="text-sm text-slate-400">
                  There is no task currently being processed. Start a new PDF task from the tools page.
                </p>
                <div className="flex gap-3 mt-2">
                  <GradientButton onClick={() => router.push("/tools")} size="md">
                    Go to tools
                  </GradientButton>
                  <GradientButton variant="secondary" onClick={() => router.push("/")} size="md">
                    Back home
                  </GradientButton>
                </div>
              </div>
            </GlassPanel>
          </div>
        </section>
      </AppShell>
    );
  }

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
              <ProgressRing
                value={progress}
                size={140}
                label={status === "complete" ? "Complete!" : status === "error" ? "Failed" : "Processing"}
              />

              <div>
                <h2 className="text-2xl font-bold text-[#f8fafc]">
                  {status === "complete"
                    ? "Processing complete!"
                    : status === "error"
                      ? "Something went wrong"
                      : `Processing your file...`}
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                  {status === "error"
                    ? errorMessage
                    : `${operationLabel} — the result will be ready in a moment.`}
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

              {status === "error" && (
                <div className="flex gap-3">
                  <GradientButton onClick={handleRetry} size="md">
                    <RefreshCw size={16} />
                    Retry
                  </GradientButton>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-all"
                  >
                    <ArrowLeft size={16} />
                    Go back
                  </button>
                </div>
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
                fileName: task.settings?.outputName as string || "document.pdf",
                status: status === "complete" ? "complete" : status === "error" ? "error" : "processing",
                sizeBytes: state.files.reduce((s, f) => s + f.sizeBytes, 0),
              },
            ]}
          />

          {status === "processing" && (
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
                    Your file is being processed in this tab. Keep it open; refreshing cancels the local in-tab state.
                  </p>
                </div>
              </div>
            </GlassPanel>
          )}
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
