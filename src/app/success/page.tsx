"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { ResultFileCard } from "@/components/cards/ResultFileCard";
import { TaskSummaryCard } from "@/components/cards/TaskSummaryCard";
import { FeedbackRatingBar } from "@/components/feedback/FeedbackRatingBar";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import { useRouter } from "next/navigation";
import { Check, Download, Sparkles, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

const confettiParticles = Array.from({ length: 30 }).map(() => ({
  left: `${Math.random() * 100}%`,
  duration: `${2 + Math.random() * 3}s`,
  delay: `${Math.random() * 2}s`,
  rotation: `${Math.random() * 360}deg`,
}));

function SuccessContent() {
  const router = useRouter();
  const { state, dispatch } = useWorkspace();
  const result = state.result;
  const confettiActive = true;

  if (!result) {
    return (
      <AppShell backdropVariant="success">
        <section className="page-shell pt-16 text-center">
          <GlassPanel className="p-10 max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[rgba(148,163,184,0.1)] flex items-center justify-center text-slate-400">
                <FileText size={28} />
              </div>
              <h2 className="text-xl font-bold text-[#f8fafc]">No completed file found</h2>
              <p className="text-sm text-slate-400">
                Results are only stored in the current tab and are not persisted. Process a file to create a new download.
              </p>
              <div className="flex gap-3 mt-2">
                <GradientButton onClick={() => router.push("/tools")} size="md">
                  Start a task
                </GradientButton>
              </div>
            </div>
          </GlassPanel>
        </section>
      </AppShell>
    );
  }

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = result.objectUrl;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNewTask = () => {
    dispatch({ type: "workspaceReset" });
    router.push("/upload");
  };

  return (
    <AppShell backdropVariant="success">
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-30" aria-hidden="true">
          {confettiParticles.map((p, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-70"
              style={{
                left: p.left,
                top: "-10px",
                animation: `confetti-fall ${p.duration} ease-in-out ${p.delay} infinite`,
                background: [
                  "linear-gradient(135deg, #28c7ff, #1668ff)",
                  "linear-gradient(135deg, #a855f7, #f04cff)",
                  "linear-gradient(135deg, #35f2a6, #28c7ff)",
                  "#f04cff",
                  "#35d5ff",
                  "#35f2a6",
                ][i % 6],
                transform: `rotate(${p.rotation})`,
              }}
            />
          ))}
        </div>
      )}

      <section className="page-shell pt-16 pb-16 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[rgba(53,242,166,0.2)] to-[rgba(53,213,255,0.2)] border border-[rgba(53,242,166,0.3)] shadow-[0_0_60px_rgba(53,242,166,0.2)]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center animate-scale-in">
                <Check size={40} className="text-white" />
              </div>
            </div>

            <h1 className="page-title text-[#f8fafc] mt-6">
              Your file is{" "}
              <span className="bg-gradient-to-r from-[#35f2a6] via-[#28c7ff] to-[#a855f7] bg-clip-text text-transparent">
                ready
              </span>
            </h1>

            <p className="body-lg text-[#dbeafe] max-w-lg mx-auto">
              We&apos;ve successfully processed your file. Download it now or start another task.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <GradientButton size="lg" onClick={handleDownload}>
              <Download size={20} />
              Download file
            </GradientButton>
            <GradientButton variant="secondary" size="lg" onClick={handleNewTask}>
              <Sparkles size={20} />
              Start another task
            </GradientButton>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <ResultFileCard
              name={result.name}
              sizeBytes={result.sizeBytes}
              format={result.outputFormat || result.mimeType}
            />
            <TaskSummaryCard
              operation={result.operation}
              fileName={result.name}
              pageCount={result.pageCount}
              fileCount={result.fileCount}
              fileSize={result.sizeBytes}
              outputFormat={result.outputFormat}
              sourceSummary={result.sourceSummary}
              compressionStatus={result.compressionStatus}
              duration="Instant"
            />
          </div>

          <FeedbackRatingBar />

          <div className="flex items-center justify-center gap-6 text-sm">
            <Link
              href="/tools"
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              All tools <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="page-shell pt-16 text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </AppShell>
    }>
      <SuccessContent />
    </Suspense>
  );
}
