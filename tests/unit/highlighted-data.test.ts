import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeHighlightedData } from "../../app/lib/highlighted-data.ts";

describe("highlighted data helpers", () => {
  it("normalizes a populated highlighted data value", () => {
    assert.equal(normalizeHighlightedData("  Telar de cuatro pedales  "), "Telar de cuatro pedales");
  });

  it("omits empty or non-string highlighted data values", () => {
    assert.equal(normalizeHighlightedData("   "), undefined);
    assert.equal(normalizeHighlightedData(null), undefined);
    assert.equal(normalizeHighlightedData(42), undefined);
  });
});
