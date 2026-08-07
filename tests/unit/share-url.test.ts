import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createShareUrl,
  SOCIAL_PREVIEW_REVISION,
} from "../../app/lib/share-url.ts";

describe("share URL", () => {
  it("adds the social preview revision to force a fresh WhatsApp crawl", () => {
    assert.equal(
      createShareUrl(
        "https://ruta.example/actores/mi-princesita",
        "https://ruta.example",
      ),
      `https://ruta.example/actores/mi-princesita?compartir=${SOCIAL_PREVIEW_REVISION}`,
    );
  });

  it("preserves existing query parameters and replaces an old revision", () => {
    assert.equal(
      createShareUrl(
        "/actores/mi-princesita?promo=1&compartir=anterior",
        "https://ruta.example",
      ),
      `https://ruta.example/actores/mi-princesita?promo=1&compartir=${SOCIAL_PREVIEW_REVISION}`,
    );
  });
});
