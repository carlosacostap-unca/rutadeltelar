import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SATELLITE_REFERENCE_TILE_LAYERS } from "../../app/lib/map-tile-layers.ts";

describe("map tile layers", () => {
  it("uses satellite imagery with reference overlays", () => {
    assert.deepEqual(
      SATELLITE_REFERENCE_TILE_LAYERS.map((layer) => layer.key),
      ["world-imagery", "world-transportation", "world-boundaries-and-places"],
    );

    assert.match(SATELLITE_REFERENCE_TILE_LAYERS[0].url, /World_Imagery/);
    assert.match(SATELLITE_REFERENCE_TILE_LAYERS[1].url, /World_Transportation/);
    assert.match(
      SATELLITE_REFERENCE_TILE_LAYERS[2].url,
      /World_Boundaries_and_Places/,
    );
  });
});
