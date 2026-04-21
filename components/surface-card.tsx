import type { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <article
      className={`rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--card)] p-5 ${className}`.trim()}
    >
      {children}
    </article>
  );
}
