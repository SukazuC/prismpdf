import type { ReactNode } from "react";
import { NeonBackdrop } from "@/components/layout/NeonBackdrop";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

type AppShellProps = {
  children: ReactNode;
  backdropVariant?: "default" | "editor" | "success";
};

export function AppShell({ children, backdropVariant = "default" }: AppShellProps) {
  return (
    <>
      <NeonBackdrop variant={backdropVariant} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <AppFooter />
      </div>
    </>
  );
}
