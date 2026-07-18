import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getDirectionsMapUrl,
  getSatelliteMapUrl,
} from "../../app/lib/map-links.ts";

describe("map link helpers", () => {
  it("builds a satellite Google Maps URL for valid coordinates", () => {
    const url = getSatelliteMapUrl({ latitude: -27.64977, longitude: -67.02602 });

    assert.ok(url);
    assert.match(url, /^https:\/\/www\.google\.com\/maps\?/);
    assert.match(url, /q=-27\.64977%2C-67\.02602/);
    assert.match(url, /t=k/);
    assert.match(url, /z=18/);
  });

  it("builds Google Maps directions from the current location", () => {
    const url = getDirectionsMapUrl({
      latitude: -27.64977,
      longitude: -67.02602,
    });

    assert.equal(
      url,
      "https://www.google.com/maps/dir/?api=1&destination=-27.64977%2C-67.02602&dir_action=navigate",
    );
  });

  it("does not build directions URLs for invalid coordinates", () => {
    assert.equal(getDirectionsMapUrl({ latitude: 0, longitude: 0 }), null);
    assert.equal(getDirectionsMapUrl({ latitude: -27 }), null);
  });

  it("does not build satellite URLs for invalid coordinates", () => {
    assert.equal(getSatelliteMapUrl({ latitude: 0, longitude: 0 }), null);
    assert.equal(getSatelliteMapUrl({ latitude: 91, longitude: -67 }), null);
    assert.equal(getSatelliteMapUrl({ latitude: -27 }), null);
  });

  it("clamps zoom to the Google Maps range", () => {
    assert.match(getSatelliteMapUrl({ latitude: -27, longitude: -67 }, 99) ?? "", /z=21/);
    assert.match(getSatelliteMapUrl({ latitude: -27, longitude: -67 }, -1) ?? "", /z=1/);
  });
});
