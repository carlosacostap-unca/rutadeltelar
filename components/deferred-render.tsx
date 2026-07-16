"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __PROMO_CAPTURE_EAGER_RENDER__?: boolean;
  }
}

type DeferredRenderProps = {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
};

export function DeferredRender({
  children,
  fallback,
  rootMargin = "360px",
}: DeferredRenderProps) {
  const [shouldRender, setShouldRender] = useState(
    () => typeof window !== "undefined" && window.__PROMO_CAPTURE_EAGER_RENDER__ === true,
  );
  const markerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || shouldRender) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const id = globalThis.setTimeout(() => setShouldRender(true), 0);
      return () => globalThis.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={markerRef}>
      {shouldRender ? children : fallback}
    </div>
  );
}
