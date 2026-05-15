"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { SearchInput } from "@/components/forms/SearchInput";
import { ToolCard } from "@/components/cards/ToolCard";
import { WorkflowCard } from "@/components/cards/WorkflowCard";
import { MergeIcon, CompressIcon, ConvertIcon, CutIcon, OrganizeIcon, RotateIcon } from "@/components/icons/ToolIcons";
import Link from "next/link";
import { Upload, FileImage, FileText, Lock, Shield, Eye, Scan, FileSearch, ImageMinus, FileSignature } from "lucide-react";

const primaryTools = [
  { title: "Merge PDF", description: "Combine multiple PDFs into a single document", href: "/merge-pdf", icon: MergeIcon },
  { title: "Compress PDF", description: "Reduce file size while maintaining quality", href: "/compress-pdf", icon: CompressIcon },
  { title: "Convert PDF", description: "Convert PDF to DOCX, JPG, PNG, and more", href: "/convert-pdf", icon: ConvertIcon },
  { title: "Cut PDF", description: "Extract or split pages from your PDF", href: "/cut-pdf", icon: CutIcon },
  { title: "Organize Pages", description: "Reorder, rotate, delete, or duplicate pages", href: "/organize-pages", icon: OrganizeIcon },
];

const popularWorkflows = [
  {
    title: "Quick Merge",
    description: "Combine 2-3 PDFs in one click",
    steps: [
      { icon: <Upload size={14} />, label: "Upload" },
      { icon: <MergeIcon size={14} />, label: "Merge" },
      { icon: <FileText size={14} />, label: "Download" },
    ],
    href: "/merge-pdf",
  },
  {
    title: "Reduce File Size",
    description: "Compress your PDF for email or web",
    steps: [
      { icon: <Upload size={14} />, label: "Upload" },
      { icon: <CompressIcon size={14} />, label: "Compress" },
      { icon: <FileText size={14} />, label: "Download" },
    ],
    href: "/compress-pdf",
  },
];

const moreTools = [
  { title: "Reorder pages", icon: RotateIcon },
  { title: "Extract images", icon: ImageMinus },
  { title: "Protect PDF", icon: Lock },
  { title: "Add watermark", icon: FileSignature },
  { title: "Rotate PDF", icon: RotateIcon },
  { title: "OCR", icon: Scan },
  { title: "PDF to JPG", icon: FileImage },
  { title: "Extract text", icon: FileSearch },
];

export default function ToolsPage() {
  const [search, setSearch] = useState("");

  const filteredTools = primaryTools.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <section className="page-shell pt-16 pb-16">
        {/* Title + Search */}
        <div className="mb-8">
          <h1 className="page-title text-[#f8fafc] mb-2">All PDF Tools</h1>
          <p className="body-lg text-[#dbeafe] mb-6">
            Everything you need to work with PDFs
          </p>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search tools..."
            className="max-w-lg"
          />
        </div>

        {/* Wide upload banner */}
        <Link href="/upload">
          <GlassPanel className="p-6 mb-8 cursor-pointer group hover:border-[rgba(56,189,248,0.4)] transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(53,213,255,0.2)] to-[rgba(168,85,247,0.2)] flex items-center justify-center border border-[rgba(148,163,184,0.15)] group-hover:scale-110 transition-transform">
                <Upload size={26} className="text-cyan-300" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-[#f8fafc]">Upload a file to get started</h3>
                <p className="text-sm text-slate-400">Drag & drop or click to upload &mdash; no account required</p>
              </div>
              <GradientButton size="lg">Choose PDF Files</GradientButton>
            </div>
          </GlassPanel>
        </Link>

        {/* Search empty state */}
        {search && filteredTools.length === 0 ? (
          <GlassPanel className="p-12 text-center" intensity="soft">
            <p className="text-slate-400 text-lg">No tools found for &ldquo;{search}&rdquo;</p>
            <p className="text-sm text-slate-500 mt-2">Try a different search term</p>
          </GlassPanel>
        ) : (
          <>
            {/* Popular workflows */}
            {!search && (
              <div className="mb-8">
                <h2 className="section-title text-[#f8fafc] mb-4">Popular workflows</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {popularWorkflows.map((wf) => (
                    <WorkflowCard key={wf.title} {...wf} />
                  ))}
                </div>
              </div>
            )}

            {/* Primary tools grid */}
            <div className="mb-8">
              <h2 className="section-title text-[#f8fafc] mb-4">Tools</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.href} {...tool} />
                ))}
              </div>
            </div>

            {/* More tools */}
            {!search && (
              <div className="mb-8">
                <h2 className="section-title text-[#f8fafc] mb-4">More tools</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {moreTools.map((tool) => (
                    <div
                      key={tool.title}
                      className="px-4 py-3 rounded-xl bg-[rgba(7,15,35,0.5)] border border-[rgba(148,163,184,0.12)] flex items-center gap-3 opacity-60"
                    >
                      <tool.icon size={18} className="text-slate-400" />
                      <span className="text-sm text-slate-400">{tool.title}</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(236,76,255,0.15)] text-magenta border border-[rgba(236,76,255,0.2)]">
                        Soon
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy band */}
            <GlassPanel className="p-5" intensity="soft">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                {[
                  { icon: Shield, text: "No data collection" },
                  { icon: Lock, text: "Encrypted in transit" },
                  { icon: Eye, text: "Your files stay private" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-slate-400">
                    <item.icon size={16} className="text-cyan-300" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </>
        )}
      </section>
    </AppShell>
  );
}
