import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getEntityCoverImage,
  getEntityCoverImageRef,
  getEntityGalleryImages,
  getEntityGalleryImageRefs,
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

  it("prefers mapped optimized files for display without changing original file names", () => {
    const record = {
      foto_portada: "cover.jpg",
      galeria_fotos: ["gallery.jpg"],
      media_optimizados: ["cover-optimized.webp", "gallery-optimized.webp"],
      media_optimizados_map: {
        "foto_portada:cover.jpg": "cover-optimized.webp",
        "galeria_fotos:gallery.jpg": "gallery-optimized.webp",
      },
    };

    assert.deepEqual(getEntityCoverImageRef(record), {
      fileName: "cover.jpg",
      displayFileName: "cover-optimized.webp",
      sourceField: "foto_portada",
    });
    assert.deepEqual(getEntityGalleryImageRefs(record), [
      {
        fileName: "gallery.jpg",
        displayFileName: "gallery-optimized.webp",
        sourceField: "galeria_fotos",
      },
    ]);
  });

  it("ignores optimized map entries when the mapped file is not attached", () => {
    const record = {
      foto_portada: "cover.jpg",
      media_optimizados: [],
      media_optimizados_map: {
        "foto_portada:cover.jpg": "missing-optimized.webp",
      },
    };

    assert.deepEqual(getEntityCoverImageRef(record), {
      fileName: "cover.jpg",
      displayFileName: "cover.jpg",
      sourceField: "foto_portada",
    });
  });
});
