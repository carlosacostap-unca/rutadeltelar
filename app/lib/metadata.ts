import type { Metadata } from "next";

const SITE_NAME = "Ruta del Telar";
const DEFAULT_DESCRIPTION =
  "Descubri estaciones, experiencias, talleres y comunidades textiles de Catamarca.";

type PageMetadataInput = {
  title: string;
  description?: string;
  path: string;
  imageUrl?: string;
};

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://rutadeltelar.catamarca.gob.ar";
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
  const images = imageUrl ? [{ url: imageUrl, alt: title }] : undefined;

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
      images,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description: cleanDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
