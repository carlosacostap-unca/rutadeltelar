import type { Metadata } from "next";

const SITE_NAME = "Ruta del Telar";
const DEFAULT_DESCRIPTION =
  "Descubri estaciones, experiencias, talleres y comunidades textiles de Catamarca.";
export const DEFAULT_SOCIAL_IMAGE_PATH =
  "/images/social/ruta-del-telar-social-whatsapp.jpg";
const SOCIAL_IMAGE_WIDTH = 1200;
const SOCIAL_IMAGE_HEIGHT = 630;

type SocialImageInput = {
  imageUrl?: string;
  alt?: string;
};

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  imageUrl?: string;
};

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://rutadeltelar.catamarca.gob.ar";
}

function isPocketBaseSocialImage(url: URL) {
  const baseUrl =
    process.env.POCKETBASE_URL ?? process.env.NEXT_PUBLIC_POCKETBASE_URL;

  if (!baseUrl) {
    return false;
  }

  const allowed = new URL(baseUrl);

  return (
    url.protocol === allowed.protocol &&
    url.host === allowed.host &&
    url.pathname.startsWith("/api/files/")
  );
}

export function createSocialImageMetadata({
  imageUrl,
  alt = SITE_NAME,
}: SocialImageInput) {
  const explicitImageUrl = imageUrl?.trim();
  const sourceUrl = new URL(
    explicitImageUrl || DEFAULT_SOCIAL_IMAGE_PATH,
    getSiteUrl(),
  );

  if (explicitImageUrl && isPocketBaseSocialImage(sourceUrl)) {
    const url = new URL("/api/media-image", getSiteUrl());
    url.searchParams.set("src", sourceUrl.toString());
    url.searchParams.set("w", String(SOCIAL_IMAGE_WIDTH));
    url.searchParams.set("h", String(SOCIAL_IMAGE_HEIGHT));
    url.searchParams.set("q", "78");

    return {
      url: url.toString(),
      alt,
      width: SOCIAL_IMAGE_WIDTH,
      height: SOCIAL_IMAGE_HEIGHT,
      type: "image/jpeg" as const,
    };
  }

  const image = { url: sourceUrl.toString(), alt };

  return explicitImageUrl
    ? image
    : {
        ...image,
        width: SOCIAL_IMAGE_WIDTH,
        height: SOCIAL_IMAGE_HEIGHT,
        type: "image/jpeg" as const,
      };
}

function clampDescription(value?: string) {
  if (!value) return DEFAULT_DESCRIPTION;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 158
    ? `${normalized.slice(0, 155).trimEnd()}...`
    : normalized;
}

export function createPageMetadata({
  title,
  description,
  path,
  imageUrl,
}: PageMetadataInput): Metadata {
  const cleanDescription = clampDescription(description);
  const url = new URL(path, getSiteUrl()).toString();
  const socialImage = createSocialImageMetadata({ imageUrl, alt: title });

  return {
    title,
    description: cleanDescription,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: cleanDescription,
      url,
      siteName: SITE_NAME,
      locale: "es_AR",
      type: "article",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: [socialImage.url],
    },
  };
}
