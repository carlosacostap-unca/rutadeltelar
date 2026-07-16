import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { bytesToHeader } from "pmtiles";
import { isExpoOffline } from "../../app/lib/expo-config.ts";
import { resolveOfflineRoutePositions } from "../../app/lib/expo-map.ts";
import { deduplicateMediaEntries, findForbiddenSnapshotKeys, validateExpoSnapshot } from "../../app/lib/expo-snapshot-schema.ts";

const originalMode = process.env.RUTA_EXPO_OFFLINE;
afterEach(() => {
  if (originalMode === undefined) delete process.env.RUTA_EXPO_OFFLINE;
  else process.env.RUTA_EXPO_OFFLINE = originalMode;
});

async function fixture() {
  return JSON.parse(await readFile(path.join(process.cwd(), "tests", "fixtures", "expo", "snapshot.json"), "utf8"));
}

describe("expo offline mode", () => {
  it("is opt-in and preserves connected mode by default", () => {
    delete process.env.RUTA_EXPO_OFFLINE;
    assert.equal(isExpoOffline(), false);
    process.env.RUTA_EXPO_OFFLINE = "true";
    assert.equal(isExpoOffline(), true);
  });

  it("accepts the committed deterministic snapshot fixture", async () => {
    const snapshot = await fixture();
    const result = validateExpoSnapshot(snapshot);
    assert.equal(result.ok, true, result.ok ? "" : result.errors.join("; "));
    assert.equal(createHash("sha256").update(JSON.stringify(snapshot.data)).digest("hex"), snapshot.dataSha256);
  });

  it("rejects incompatible, incomplete, and duplicate-slug snapshots", async () => {
    const snapshot = await fixture();
    assert.equal(validateExpoSnapshot({ ...snapshot, schemaVersion: 99 }).ok, false);
    assert.equal(validateExpoSnapshot({ ...snapshot, data: { ...snapshot.data, products: [] } }).ok, false);
    const duplicate = structuredClone(snapshot);
    duplicate.data.stations.push(structuredClone(duplicate.data.stations[0]));
    duplicate.counts.stations += 1;
    assert.equal(validateExpoSnapshot(duplicate).ok, false);
  });

  it("detects forbidden private keys", async () => {
    const snapshot = await fixture();
    snapshot.data.stations[0].adminPassword = "secret";
    assert.deepEqual(findForbiddenSnapshotKeys(snapshot), ["adminPassword"]);
  });

  it("deduplicates media inventory by content hash", () => {
    const entries = [{ sha256: "a", path: "/one" }, { sha256: "a", path: "/duplicate" }, { sha256: "b", path: "/two" }];
    assert.deepEqual(deduplicateMediaEntries(entries).map((entry) => entry.sha256), ["a", "b"]);
  });

  it("uses packaged route geometry and falls back to local straight points", () => {
    const points: Array<[number, number]> = [[-27.65, -67.03], [-27.64, -67.02]];
    const osrm: Array<[number, number]> = [[-27.65, -67.03], [-27.645, -67.025], [-27.64, -67.02]];
    assert.deepEqual(resolveOfflineRoutePositions(osrm, points), osrm);
    assert.deepEqual(resolveOfflineRoutePositions(undefined, points), points);
  });

  it("verifies the packaged PMTiles header, integrity, and snapshot coverage", async () => {
    const snapshot = JSON.parse(
      await readFile(path.join(process.cwd(), "public", "expo", "snapshot.json"), "utf8"),
    );
    assert.ok(snapshot.map.vector, "public exhibition snapshot should configure PMTiles");
    const mapPath = path.join(
      process.cwd(),
      "public",
      snapshot.map.vector.path.replace(/^\/+/, ""),
    );
    const firstBytes = await readFile(mapPath);
    const headerBytes = firstBytes.buffer.slice(
      firstBytes.byteOffset,
      firstBytes.byteOffset + 127,
    );
    const header = bytesToHeader(headerBytes);
    const metadata = await stat(mapPath);
    assert.equal(header.maxZoom, snapshot.map.vector.maxZoom);
    assert.equal(metadata.size, snapshot.map.vector.bytes);
    assert.equal(
      createHash("sha256").update(firstBytes).digest("hex"),
      snapshot.map.vector.sha256,
    );

    const [[minLat, minLon], [maxLat, maxLon]] = snapshot.map.vector.bounds;
    const points = [
      ...Object.values(snapshot.data).flatMap((items) =>
        (items as Array<{ latitude?: number; longitude?: number }>).flatMap((item) =>
          Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
            ? [[item.latitude as number, item.longitude as number]]
            : [],
        ),
      ),
      ...Object.values(snapshot.routes).flatMap(
        (route) => (route as { positions: Array<[number, number]> }).positions,
      ),
    ];
    assert.ok(points.every(([latitude, longitude]) =>
      latitude >= minLat && latitude <= maxLat && longitude >= minLon && longitude <= maxLon,
    ));
  });
});
