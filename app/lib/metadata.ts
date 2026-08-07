import type { Metadata } from "next";

const SITE_NAME = "Ruta del Telar";
const DEFAULT_DESCRIPTION =
  "Descubri estaciones, experiencias, talleres y comunidades textiles de Catamarca.";
export const DEFAULT_SOCIAL_IMAGE_PATH =
  "/images/social/ruta-del-telar-social.png";

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

export function createSocialImageMetadata({
  imageUrl,
  alt = SITE_NAME,
}: SocialImageInput) {
  const explicitImageUrl = imageUrl?.trim();
  const url = new URL(
    explicitImageUrl || DEFAULT_SOCIAL_IMAGE_PATH,
    getSiteUrl(),
  ).toString();
  const image = { url, alt };

  return explicitImageUrl
    ? image
    : {
        ...image,
        width: 1200,
        height: 630,
        type: "image/png" as const,
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
