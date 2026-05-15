"use client";

import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { SmartPdfIntakeDropzone } from "@/components/upload/SmartPdfIntakeDropzone";
import { ToolCard } from "@/components/cards/ToolCard";
import { MergeIcon, CompressIcon, ConvertIcon, CutIcon } from "@/components/icons/ToolIcons";
import Image from "next/image";
import { assets } from "@/lib/assets";
import { Shield, Lock, Eye, FileText, FileImage, FileType } from "lucide-react";

const quickTools = [
  { title: "Merge PDF", description: "Combine multiple PDFs into one file", href: "/merge-pdf", icon: MergeIcon },
  { title: "Compress PDF", description: "Reduce file size while preserving quality", href: "/compress-pdf", icon: CompressIcon },
  { title: "Convert PDF", description: "Convert to DOCX, JPG, PNG and more", href: "/convert-pdf", icon: ConvertIcon },
  { title: "Cut PDF", description: "Extract or split pages from any PDF", href: "/cut-pdf", icon: CutIcon },
];

const supportedFormats = [
  { label: "PDF", icon: FileText, color: "text-red-400" },
  { label: "DOCX", icon: FileText, color: "text-blue-400" },
  { label: "PPTX", icon: FileText, color: "text-orange-400" },
  { label: "JPG", icon: FileImage, color: "text-pink-400" },
  { label: "PNG", icon: FileImage, color: "text-cyan-400" },
  { label: "TXT", icon: FileType, color: "text-slate-400" },
];

export default function UploadPage() {
  return (
    <AppShell>
      <section className="page-shell pt-16 pb-16 relative">
        {/* Floating docs */}
        <div className="absolute left-0 top-20 -translate-x-1/3 w-[300px] opacity-25 pointer-events-none hidden xl:block" aria-hidden="true">
          <Image src={assets.illustrations.floatingPdfLeft} alt="" width={300} height={300} />
        </div>
        <div className="absolute left-8 top-60 -translate-x-1/4 w-[250px] opacity-20 pointer-events-none hidden xl:block" aria-hidden="true">
          <Image src={assets.illustrations.floatingGenericDoc} alt="" width={250} height={250} />
        </div>
        <div className="absolute right-0 top-20 translate-x-1/3 w-[300px] opacity-25 pointer-events-none hidden xl:block" aria-hidden="true">
          <Image src={assets.illustrations.floatingDocx} alt="" width={300} height={300} />
        </div>
        <div className="absolute right-8 top-60 translate-x-1/4 w-[250px] opacity-20 pointer-events-none hidden xl:block" aria-hidden="true">
          <Image src={assets.illustrations.floatingPptx} alt="" width={250} height={250} />
        </div>

        {/* Main dropzone */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h1 className="page-title text-[#f8fafc] mb-3">Upload your file</h1>
            <p className="body-lg text-[#dbeafe]">
              Drag & drop or choose a file to get started
            </p>
          </div>
          <GlassPanel className="p-6">
            <SmartPdfIntakeDropzone source="upload" className="min-h-[240px]" />
          </GlassPanel>
        </div>

        {/* Quick-start tool cards */}
        <div className="mb-12">
          <h2 className="section-title text-[#f8fafc] mb-4 text-center">Quick-start tools</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </div>

        {/* Supported formats */}
        <div className="mb-12 max-w-4xl mx-auto">
          <GlassPanel className="p-6" intensity="soft">
            <h3 className="section-title text-[#f8fafc] mb-4 text-center">Supported formats</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {supportedFormats.map((fmt) => (
                <div key={fmt.label} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-xl bg-[rgba(7,15,35,0.5)] border border-[rgba(148,163,184,0.12)] flex items-center justify-center">
                    <fmt.icon size={24} className={fmt.color} />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{fmt.label}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Privacy cards */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            { icon: Shield, title: "No data collection", desc: "We don't track or store your files." },
            { icon: Lock, title: "Encrypted in transit", desc: "All transfers use TLS encryption." },
            { icon: Eye, title: "Your files stay yours", desc: "We never access or share your documents." },
          ].map((item) => (
            <GlassPanel key={item.title} className="p-5 flex items-start gap-4" intensity="soft">
              <div className="w-10 h-10 rounded-xl bg-[rgba(53,213,255,0.1)] flex items-center justify-center text-cyan-300 flex-shrink-0">
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#f8fafc]">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
