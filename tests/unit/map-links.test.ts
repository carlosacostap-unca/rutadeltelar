import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSatelliteMapUrl } from "../../app/lib/map-links.ts";

describe("map link helpers", () => {
  it("builds a satellite Google Maps URL for valid coordinates", () => {
    const url = getSatelliteMapUrl({ latitude: -27.64977, longitude: -67.02602 });

    assert.ok(url);
    assert.match(url, /^https:\/\/www\.google\.com\/maps\/@\?/);
    assert.match(url, /map_action=map/);
    assert.match(url, /center=-27\.64977%2C-67\.02602/);
    assert.match(url, /zoom=18/);
    assert.match(url, /basemap=satellite/);
  });

  it("does not build satellite URLs for invalid coordinates", () => {
    assert.equal(getSatelliteMapUrl({ latitude: 0, longitude: 0 }), null);
    assert.equal(getSatelliteMapUrl({ latitude: 91, longitude: -67 }), null);
    assert.equal(getSatelliteMapUrl({ latitude: -27 }), null);
  });

  it("clamps zoom to the Google Maps range", () => {
    assert.match(getSatelliteMapUrl({ latitude: -27, longitude: -67 }, 99) ?? "", /zoom=21/);
    assert.match(getSatelliteMapUrl({ latitude: -27, longitude: -67 }, -1) ?? "", /zoom=1/);
  });
});
