export type PocketBaseImageUsage = "thumbnail" | "small" | "medium" | "large";

export const pocketBaseImageThumbs: Record<PocketBaseImageUsage, string> = {
  thumbnail: "320x0",
  small: "768x0",
  medium: "1280x0",
  large: "1600x0",
};

export function getPocketBaseImageThumb(usage: PocketBaseImageUsage) {
  return pocketBaseImageThumbs[usage];
}

export function withPocketBaseImageThumb<TSrc extends string | undefined>(
  src: TSrc,
  usage: PocketBaseImageUsage,
): TSrc {
  if (!src) {
    return src;
  }

  try {
    const url = new URL(src);

    if (!url.pathname.startsWith("/api/files/")) {
      return src;
    }

    url.searchParams.set("thumb", getPocketBaseImageThumb(usage));
    return url.toString() as TSrc;
  } catch {
    return src;
  }
}
