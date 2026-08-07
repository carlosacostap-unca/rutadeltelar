import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  createPageMetadata,
  createSocialImageMetadata,
  DEFAULT_SOCIAL_IMAGE_PATH,
} from "../../app/lib/metadata.ts";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl = "https://ruta.example";

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
});

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("social metadata helpers", () => {
  it("keeps an absolute entity image URL", () => {
    const image = createSocialImageMetadata({
      imageUrl: "https://media.example/entity-cover.jpg",
      alt: "Entidad",
    });

    assert.deepEqual(image, {
      url: "https://media.example/entity-cover.jpg",
      alt: "Entidad",
    });
  });

  it("resolves a relative entity image URL against the public site", () => {
    const image = createSocialImageMetadata({
      imageUrl: "/media/entity-cover.jpg",
      alt: "Entidad",
    });

    assert.deepEqual(image, {
      url: `${siteUrl}/media/entity-cover.jpg`,
      alt: "Entidad",
    });
  });

  it("uses the institutional image when no entity image is available", () => {
    const image = createSocialImageMetadata({ alt: "Ruta del Telar" });

    assert.deepEqual(image, {
      url: `${siteUrl}${DEFAULT_SOCIAL_IMAGE_PATH}`,
      alt: "Ruta del Telar",
      width: 1200,
      height: 630,
      type: "image/png",
    });
  });

  it("always emits a large social card from page metadata", () => {
    const metadata = createPageMetadata({
      title: "Estacion Belen",
      description: "Territorio de trama viva",
      path: "/estaciones/belen-catamarca",
    });
    const openGraph = metadata.openGraph as {
      images: Array<{ url: string; alt: string }>;
    };
    const twitter = metadata.twitter as {
      card: string;
      images: string[];
    };

    assert.equal(
      openGraph.images[0]?.url,
      `${siteUrl}${DEFAULT_SOCIAL_IMAGE_PATH}`,
    );
    assert.equal(openGraph.images[0]?.alt, "Estacion Belen");
    assert.equal(twitter.card, "summary_large_image");
    assert.deepEqual(twitter.images, [
      `${siteUrl}${DEFAULT_SOCIAL_IMAGE_PATH}`,
    ]);
  });
});
