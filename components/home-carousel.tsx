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
      className={`absolute top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] shadow transition hover:border-[color:var(--accent)] ${
        direction === "left" ? "left-1" : "right-1"
      }`}
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
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-[color:var(--accent)] transition hover:underline"
        >
          {verTodosLabel} -&gt;
        </Link>
      </div>
      <div className="relative">
        <CarouselArrow direction="left" onClick={() => scroll("left")} />
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        <CarouselArrow direction="right" onClick={() => scroll("right")} />
      </div>
    </section>
  );
}
