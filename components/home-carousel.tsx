import Link from "next/link";
import { type ReactNode } from "react";

type HomeCarouselProps = {
  eyebrow: string;
  title: string;
  href: string;
  verTodosLabel?: string;
  children: ReactNode;
};

export function HomeCarousel({
  eyebrow,
  title,
  href,
  verTodosLabel = "Ver todos",
  children,
}: HomeCarouselProps) {
  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
            {eyebrow}
          </p>
          <h2 className="display-font mt-1 text-2xl leading-tight text-[color:var(--foreground)]">
            {title}
          </h2>
        </div>
        <Link
          href={href}
          className="text-sm font-semibold text-[color:var(--accent)] transition hover:underline"
        >
          {verTodosLabel} →
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
