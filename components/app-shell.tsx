import type { ReactNode } from "react";
import { MobileBottomNav } from "./mobile-bottom-nav";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-1 flex-col px-4 pb-28 pt-4 sm:px-6 md:pb-12 lg:px-8">
        {children}
      </div>
      <MobileBottomNav />
    </>
  );
}
