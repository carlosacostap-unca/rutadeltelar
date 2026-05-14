import Image from "next/image";
import { getImageFocusStyle, type FocusedImage, type ImageFocus } from "@/app/lib/image-focus";
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
};

export function DetailMediaGallery({
  title,
  fallbackLabel,
  coverUrl,
  galleryUrls = [],
  coverFocus,
  galleryImages,
  coverClassName = "aspect-[16/9]",
  coverSizes = "(max-width: 1024px) 100vw, 70vw",
}: DetailMediaGalleryProps) {
  const images: FocusedImage[] = galleryImages ?? galleryUrls.map((url) => ({ url }));

  return (
    <div className="space-y-3">
      {coverUrl ? (
        <div className={`relative overflow-hidden rounded-3xl border border-[color:var(--border)] soft-shadow ${coverClassName}`}>
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover"
            sizes={coverSizes}
            style={getImageFocusStyle(coverFocus)}
            priority
          />
        </div>
      ) : (
        <div className={`overflow-hidden rounded-3xl border border-[color:var(--border)] soft-shadow ${coverClassName}`}>
          <MediaFallback label={fallbackLabel} />
        </div>
      )}

      {images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, index) => (
            <div
              key={image.url}
              className="relative aspect-[4/3] w-[220px] shrink-0 overflow-hidden rounded-2xl border border-[color:var(--border)] [scroll-snap-align:start]"
            >
              <Image
                src={image.url}
                alt={`${title} galeria ${index + 1}`}
                fill
                className="object-cover"
                sizes="220px"
                style={getImageFocusStyle(image.focus)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
