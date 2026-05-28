"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { getImageFocusStyle, type FocusedImage, type ImageFocus } from "@/app/lib/image-focus";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { ImageLightbox, type LightboxImage } from "@/components/image-lightbox";
import { MediaFallback } from "@/components/media-fallback";

type DetailMediaGalleryProps = {
  title: string;
  fallbackLabel: string;
  coverUrl?: string;
  galleryUrls?: string[];
  coverFocus?: ImageFocus;
  galleryImages?: FocusedImage[];
  coverClassName?: string;
  coverSizes?: string;
  thumbnailClassName?: string;
};

function ScrollArrow({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Ver imagen anterior" : "Ver imagen siguiente"}
      onClick={onClick}
      className={`absolute top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] shadow transition hover:border-[color:var(--accent)] ${
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

export function DetailMediaGallery({
  title,
  fallbackLabel,
  coverUrl,
  galleryUrls = [],
  coverFocus,
  galleryImages,
  coverClassName = "aspect-[16/9]",
  coverSizes = "(max-width: 1024px) 100vw, 70vw",
  thumbnailClassName = "aspect-[4/3] w-[220px]",
}: DetailMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const images: FocusedImage[] = useMemo(
    () => galleryImages ?? galleryUrls.map((url) => ({ url })),
    [galleryImages, galleryUrls],
  );
  const coverDisplayUrl = coverUrl ? withPocketBaseImageThumb(coverUrl, "medium") : undefined;
  const thumbnailImages = useMemo<FocusedImage[]>(
    () =>
      images.map((image) => ({
        ...image,
        url: withPocketBaseImageThumb(image.url, "thumbnail"),
      })),
    [images],
  );
  const lightboxImages = useMemo<LightboxImage[]>(
    () => [
      ...(coverUrl ? [{ url: withPocketBaseImageThumb(coverUrl, "large"), alt: title }] : []),
      ...images.map((image, index) => ({
        url: withPocketBaseImageThumb(image.url, "large"),
        alt: `${title} galeria ${index + 1}`,
      })),
    ],
    [coverUrl, images, title],
  );
  const galleryIndexOffset = coverUrl ? 1 : 0;
  const scrollThumbnails = (direction: "left" | "right") => {
    thumbnailScrollRef.current?.scrollBy({
      left: direction === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-3">
      {coverDisplayUrl ? (
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className={`group relative block overflow-hidden rounded-3xl border border-[color:var(--border)] text-left soft-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${coverClassName}`}
          aria-label={`Ampliar imagen de ${title}`}
        >
          <Image
            src={coverDisplayUrl}
            alt={title}
            fill
            className="object-cover"
            sizes={coverSizes}
            style={getImageFocusStyle(coverFocus)}
            priority
          />
        </button>
      ) : (
        <div className={`overflow-hidden rounded-3xl border border-[color:var(--border)] soft-shadow ${coverClassName}`}>
          <MediaFallback label={fallbackLabel} />
        </div>
      )}

      {thumbnailImages.length > 0 && (
        <div className="relative">
          {thumbnailImages.length > 1 ? (
            <ScrollArrow direction="left" onClick={() => scrollThumbnails("left")} />
          ) : null}
          <div
            ref={thumbnailScrollRef}
            className="flex gap-3 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {thumbnailImages.map((image, index) => (
              <button
                type="button"
                key={image.url}
                onClick={() => setActiveIndex(galleryIndexOffset + index)}
                className={`relative shrink-0 overflow-hidden rounded-2xl border border-[color:var(--border)] [scroll-snap-align:start] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${thumbnailClassName}`}
                aria-label={`Ampliar imagen ${index + 1} de ${title}`}
              >
                <Image
                  src={image.url}
                  alt={`${title} galeria ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="220px"
                  style={getImageFocusStyle(image.focus)}
                />
              </button>
            ))}
          </div>
          {thumbnailImages.length > 1 ? (
            <ScrollArrow direction="right" onClick={() => scrollThumbnails("right")} />
          ) : null}
        </div>
      )}
      <ImageLightbox
        images={lightboxImages}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        onClose={() => setActiveIndex(null)}
      />
    </div>
  );
}
