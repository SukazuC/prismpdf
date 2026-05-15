import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "PrismPDF - The New Era of PDF Tools",
  description:
    "Powerful. Fast. Beautiful. All the tools you need to work with PDFs, in one seamless experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#020617] text-[#f8fafc] antialiased">
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
