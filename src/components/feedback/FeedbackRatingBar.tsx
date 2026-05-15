"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { ThumbsUp, ThumbsDown, Meh } from "lucide-react";

type FeedbackRatingBarProps = {
  className?: string;
};

export function FeedbackRatingBar({ className = "" }: FeedbackRatingBarProps) {
  const [rating, setRating] = useState<"like" | "neutral" | "dislike" | null>(null);

  if (rating) {
    return (
      <GlassPanel className={`px-6 py-4 ${className}`} intensity="soft">
        <p className="text-sm text-slate-300 text-center">
          Thanks for your feedback! 🙏
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className={`px-6 py-4 ${className}`} intensity="soft">
      <div className="flex items-center justify-center gap-4">
        <span className="text-sm text-slate-400">Was this helpful?</span>
        <div className="flex items-center gap-2">
          {[
            { value: "like" as const, icon: ThumbsUp, label: "Like" },
            { value: "neutral" as const, icon: Meh, label: "Neutral" },
            { value: "dislike" as const, icon: ThumbsDown, label: "Dislike" },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[rgba(53,213,255,0.1)] transition-all"
              aria-label={label}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
