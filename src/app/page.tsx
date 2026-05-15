import { AppShell } from "@/components/layout/AppShell";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GradientButton } from "@/components/buttons/GradientButton";
import { MergeIcon, CompressIcon, ConvertIcon, CutIcon } from "@/components/icons/ToolIcons";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";

const tools = [
  { title: "Merge PDF", description: "Combine multiple PDFs into one", href: "/merge-pdf", icon: MergeIcon },
  { title: "Compress PDF", description: "Reduce file size without losing quality", href: "/compress-pdf", icon: CompressIcon },
  { title: "Convert PDF", description: "Convert to and from any format", href: "/convert-pdf", icon: ConvertIcon },
  { title: "Cut PDF", description: "Extract or split pages effortlessly", href: "/cut-pdf", icon: CutIcon },
];

export default function Home() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="page-shell pt-16 md:pt-24 pb-16 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="relative z-10">
            <h1 className="display-title text-[#f8fafc] mb-4">
              The new era
              <br />
              of <span className="bg-gradient-to-r from-[#28c7ff] via-[#a855f7] to-[#f04cff] bg-clip-text text-transparent">PDF</span> tools
            </h1>
            <p className="body-lg text-[#dbeafe] mb-8 max-w-lg">
              Powerful. Fast. Beautiful. All the tools you need to work with PDFs, in one seamless experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/upload">
                <GradientButton size="lg">Choose PDF Files</GradientButton>
              </Link>
              <Link href="/tools">
                <GradientButton variant="secondary" size="lg">View all tools</GradientButton>
              </Link>
            </div>
            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 mt-8">
              {["No ads", "No account", "Secure processing"].map((pill) => (
                <span
                  key={pill}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[rgba(148,163,184,0.1)] border border-[rgba(148,163,184,0.12)] text-slate-400"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Right: dropzone card */}
          <div className="relative z-10">
            <Link href="/upload">
              <GlassPanel className="p-8 cursor-pointer group hover:border-[rgba(56,189,248,0.4)] transition-all duration-300">
                <div className="flex flex-col items-center text-center py-8 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(53,213,255,0.2)] to-[rgba(168,85,247,0.2)] flex items-center justify-center border border-[rgba(148,163,184,0.15)] group-hover:scale-110 transition-transform duration-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-[#f8fafc]">Drop your PDF here to start</p>
                  <p className="text-sm text-slate-400">or click to browse files</p>
                  <p className="text-xs text-slate-500 mt-2">Supports PDF, DOCX, PPTX, JPG, PNG</p>
                </div>
              </GlassPanel>
            </Link>
          </div>
        </div>

        {/* Floating illustrations */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 w-[400px] opacity-30 pointer-events-none hidden lg:block" aria-hidden="true">
          <Image src={assets.illustrations.floatingPdfLeft} alt="" width="400" height="400" />
        </div>
        <div className="absolute right-0 top-1/3 translate-x-1/4 w-[350px] opacity-25 pointer-events-none hidden lg:block" aria-hidden="true">
          <Image src={assets.illustrations.floatingPdfRight} alt="" width="350" height="350" />
        </div>
      </section>

      {/* Tool cards row */}
      <section className="page-shell pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <GlassPanel className="p-6 h-full cursor-pointer group hover:border-[rgba(56,189,248,0.35)] transition-all duration-300">
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(53,213,255,0.15)] to-[rgba(168,85,247,0.15)] flex items-center justify-center border border-[rgba(148,163,184,0.12)] group-hover:scale-110 transition-transform duration-200">
                    <tool.icon size={22} className="text-cyan-300" />
                  </div>
                  <h3 className="section-title text-[#f8fafc]">{tool.title}</h3>
                  <p className="body text-slate-400">{tool.description}</p>
                </div>
              </GlassPanel>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom panels */}
      <section className="page-shell pb-16">
        <div className="grid md:grid-cols-2 gap-4">
          <GlassPanel className="p-8">
            <h2 className="section-title text-[#f8fafc] mb-3">How it works</h2>
            <div className="space-y-4">
              {[
                { step: "1", title: "Upload your file", desc: "Drag & drop or choose a PDF from your device." },
                { step: "2", title: "Choose your tool", desc: "Merge, compress, convert, cut, or organize pages." },
                { step: "3", title: "Download the result", desc: "Get your transformed file instantly." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[rgba(53,213,255,0.2)] to-[rgba(168,85,247,0.2)] border border-[rgba(148,163,184,0.15)] flex items-center justify-center text-sm font-semibold text-cyan-300">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#f8fafc]">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel className="p-8">
            <h2 className="section-title text-[#f8fafc] mb-3">Privacy & Security</h2>
            <div className="space-y-4">
              {[
                { title: "Your files stay in your browser", desc: "For select operations, files never leave your device." },
                { title: "No data collection", desc: "We don't track, store, or share your documents." },
                { title: "Encrypted in transit", desc: "All uploads use TLS encryption." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[rgba(53,242,166,0.2)] to-[rgba(53,213,255,0.2)] border border-[rgba(148,163,184,0.15)] flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f8fafc]">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>
    </AppShell>
  );
}
