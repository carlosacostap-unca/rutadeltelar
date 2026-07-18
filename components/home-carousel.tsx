"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

type HomeCarouselProps = {
  eyebrow: string;
  title: string;
  href?: string;
  verTodosLabel?: string;
  variant?: "default" | "onDark";
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
  variant = "default",
  children,
}: HomeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const scrollEnd = node.scrollLeft + node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 1);
    setCanScrollRight(scrollEnd < node.scrollWidth - 1);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const node = scrollRef.current;
    if (!node) return;

    const distance = Math.round(node.clientWidth * 0.8);
    node.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
    window.setTimeout(updateScrollState, 280);
  };

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    updateScrollState();
    const timeoutId = window.setTimeout(updateScrollState, 250);
    const handleResize = () => updateScrollState();

    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(timeoutId);
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", handleResize);
    };
  }, [children, updateScrollState]);
  const onDark = variant === "onDark";

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              onDark ? "text-[#efd4b0]" : "text-[color:var(--accent-mid)]"
            }`}
          >
            {eyebrow}
          </p>
          <h2
            className={`display-font mt-1 text-2xl leading-tight ${
              onDark ? "text-[#f3d7b4]" : "text-[color:var(--foreground)]"
            }`}
          >
            {title}
          </h2>
        </div>
        {href ? (
          <Link
            href={href}
            className={`shrink-0 text-sm font-semibold transition hover:underline ${
              onDark ? "text-[#efd4b0]" : "text-[color:var(--accent)]"
            }`}
          >
            {verTodosLabel} -&gt;
          </Link>
        ) : null}
      </div>
      <div className="relative">
        {canScrollLeft ? (
          <CarouselArrow direction="left" onClick={() => scroll("left")} />
        ) : null}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 [scroll-snap-type:x_mandatory] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        {canScrollRight ? (
          <CarouselArrow direction="right" onClick={() => scroll("right")} />
        ) : null}
      </div>
    </section>
  );
}
