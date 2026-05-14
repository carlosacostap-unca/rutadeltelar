import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getGalleryImageFocus,
  getImageFocusStyle,
  normalizeImageFocus,
  parseGalleryFocusMap,
} from "../../app/lib/image-focus.ts";

describe("image focus helpers", () => {
  it("returns object-position values for complete cover focus", () => {
    assert.deepEqual(getImageFocusStyle({ x: 25, y: 70 }), {
      objectPosition: "25% 70%",
    });
  });

  it("defaults missing or invalid focus coordinates to center", () => {
    assert.deepEqual(normalizeImageFocus({ x: 10 }), { x: 10, y: 50 });
    assert.deepEqual(normalizeImageFocus({ x: Number.NaN, y: 30 }), { x: 50, y: 30 });
    assert.deepEqual(getImageFocusStyle(), { objectPosition: "50% 50%" });
  });

  it("normalizes gallery focus keys by filename", () => {
    const focusMap = parseGalleryFocusMap({
      "Subida/Foto%20Detalle.webp": { x: 15, y: 80 },
    });

    assert.deepEqual(
      getGalleryImageFocus("https://pb.example/api/files/actores/123/Foto%20Detalle.webp", focusMap),
      { x: 15, y: 80 },
    );
  });

  it("ignores empty gallery focus entries and falls back through style helper", () => {
    const focusMap = parseGalleryFocusMap({
      "sin-foco.webp": {},
    });

    assert.equal(focusMap, undefined);
    assert.deepEqual(getImageFocusStyle(getGalleryImageFocus("sin-foco.webp", focusMap)), {
      objectPosition: "50% 50%",
    });
  });
});
