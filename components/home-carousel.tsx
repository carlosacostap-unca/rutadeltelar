"use client";

import Link from "next/link";
import { type ReactNode, useRef } from "react";

type HomeCarouselProps = {
  eyebrow: string;
  title: string;
  href: string;
  verTodosLabel?: string;
  children: ReactNode;
};

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Mover carrusel a la izquierda" : "Mover carrusel a la derecha"}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {direction === "left" ? (
          <path
            d="M15 18 9 12l6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="m9 18 6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

export function HomeCarousel({
  eyebrow,
  title,
  href,
  verTodosLabel = "Ver todos",
  children,
}: HomeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const node = scrollRef.current;
    if (!node) return;

    const distance = Math.round(node.clientWidth * 0.8);
    node.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
            {eyebrow}
          </p>
          <h2 className="display-font mt-1 text-2xl leading-tight text-[color:var(--foreground)]">
            {title}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CarouselArrow direction="left" onClick={() => scroll("left")} />
          <CarouselArrow direction="right" onClick={() => scroll("right")} />
          <Link
            href={href}
            className="text-sm font-semibold text-[color:var(--accent)] transition hover:underline"
          >
            {verTodosLabel} -&gt;
          </Link>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}
