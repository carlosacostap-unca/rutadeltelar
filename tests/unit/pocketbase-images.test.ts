import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getPocketBaseImageThumb,
  withPocketBaseImageThumb,
} from "../../app/lib/pocketbase-images.ts";

describe("PocketBase image thumbnail helpers", () => {
  it("maps catalog image usages to configured PocketBase thumbs", () => {
    assert.equal(getPocketBaseImageThumb("thumbnail"), "320x0");
    assert.equal(getPocketBaseImageThumb("small"), "768x0");
    assert.equal(getPocketBaseImageThumb("medium"), "1280x0");
    assert.equal(getPocketBaseImageThumb("large"), "1600x0");
  });

  it("can retarget an existing PocketBase file URL to another thumbnail size", () => {
    const url =
      "https://pb.example.com/api/files/products/abc123/pieza.webp?thumb=1280x0";

    assert.equal(
      withPocketBaseImageThumb(url, "thumbnail"),
      "https://pb.example.com/api/files/products/abc123/pieza.webp?thumb=320x0",
    );
  });

  it("does not alter non-PocketBase file URLs", () => {
    assert.equal(
      withPocketBaseImageThumb("https://cdn.example.com/pieza.webp", "small"),
      "https://cdn.example.com/pieza.webp",
    );
  });
});
