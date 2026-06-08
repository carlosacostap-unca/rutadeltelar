"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";

export type LightboxImage = {
  url: string;
  alt: string;
};

type ImageLightboxProps = {
  images: LightboxImage[];
  activeIndex: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
  );
}

export function ImageLightbox({
  images,
  activeIndex,
  onIndexChange,
  onClose,
}: ImageLightboxProps) {
  const activeImage =
    activeIndex !== null && images[activeIndex] ? images[activeIndex] : null;
  const hasMany = images.length > 1;

  const goToOffset = useCallback((offset: number) => {
    if (activeIndex === null || images.length === 0) return;
    onIndexChange((activeIndex + offset + images.length) % images.length);
  }, [activeIndex, images.length, onIndexChange]);

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft" && hasMany) {
        goToOffset(-1);
      }

      if (event.key === "ArrowRight" && hasMany) {
        goToOffset(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, goToOffset, hasMany, onClose]);

  if (!activeImage) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/85 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Imagen ampliada"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar imagen ampliada"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-full max-h-[90vh] w-full max-w-6xl items-center justify-center">
        <div className="relative h-full w-full">
          <Image
            src={activeImage.url}
            alt={activeImage.alt}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:bg-black/70"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {hasMany ? (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={() => goToOffset(-1)}
              className="absolute left-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:bg-black/70"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={() => goToOffset(1)}
              className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white transition hover:bg-black/70"
            >
              <ArrowIcon direction="right" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
