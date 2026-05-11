import type { ReactNode } from "react";
import { MobileBottomNav } from "./mobile-bottom-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only fixed left-4 top-4 z-50 rounded-full bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--card)] focus:not-sr-only"
      >
        Saltar al contenido
      </a>
      <div
        id="contenido"
        tabIndex={-1}
        className="mx-auto flex min-h-full w-full max-w-6xl flex-1 flex-col px-4 pb-28 pt-4 sm:px-6 md:pb-12 lg:px-8"
      >
        {children}
      </div>
      <MobileBottomNav />
    </>
  );
}
