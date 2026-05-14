import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getEntityCoverImage,
  getEntityGalleryImages,
} from "../../app/lib/multimedia.ts";

describe("entity multimedia helpers", () => {
  it("uses foto_portada as listing and detail cover when present", () => {
    const record = {
      foto_portada: "cover.webp",
      galeria_fotos: ["gallery-1.webp", "gallery-2.webp"],
      fotos: ["legacy-1.webp"],
    };

    assert.equal(getEntityCoverImage(record), "cover.webp");
    assert.deepEqual(getEntityGalleryImages(record), [
      "gallery-1.webp",
      "gallery-2.webp",
      "legacy-1.webp",
    ]);
  });

  it("keeps legacy fotos compatibility and excludes the fallback cover", () => {
    const record = {
      fotos: ["legacy-cover.webp", "legacy-gallery.webp"],
    };

    assert.equal(getEntityCoverImage(record), "legacy-cover.webp");
    assert.deepEqual(getEntityGalleryImages(record), ["legacy-gallery.webp"]);
  });

  it("deduplicates the cover and repeated gallery files by file name", () => {
    const record = {
      foto_portada: "cover.webp",
      galeria_fotos: ["gallery.webp", "cover.webp", "nested/repeated.webp"],
      fotos: ["gallery.webp", "other-path/repeated.webp", "legacy.webp"],
    };

    assert.deepEqual(getEntityGalleryImages(record), [
      "gallery.webp",
      "nested/repeated.webp",
      "legacy.webp",
    ]);
  });

  it("returns no cover when records have only galeria_fotos", () => {
    const record = {
      galeria_fotos: ["gallery-1.webp"],
    };

    assert.equal(getEntityCoverImage(record), null);
    assert.deepEqual(getEntityGalleryImages(record), ["gallery-1.webp"]);
  });
});
