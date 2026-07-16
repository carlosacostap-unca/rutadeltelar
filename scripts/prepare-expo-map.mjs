import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { access, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const mapDirectory = path.join(cwd, "public", "expo", "map");
const mapPath = path.join(mapDirectory, "ruta-del-telar.pmtiles");
const temporaryMapPath = `${mapPath}.next`;
const metadataPath = `${mapPath}.json`;
const snapshotPath = path.join(cwd, "public", "expo", "snapshot.json");
const useExisting = process.argv.includes("--use-existing");

function option(name, fallback) {
  const prefix = `${name}=`;
  const value = process.argv.find((argument) => argument.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
}

const cli = path.resolve(option("--cli", process.env.RUTA_EXPO_PMTILES_CLI || ""));
const sourceUrl = option(
  "--source",
  process.env.RUTA_EXPO_PMTILES_SOURCE_URL || "https://build.protomaps.com/20260715.pmtiles",
);
const maxZoom = Number(option("--maxzoom", process.env.RUTA_EXPO_PMTILES_MAX_ZOOM || "15"));
const margin = Number(option("--margin", process.env.RUTA_EXPO_PMTILES_MARGIN || "0.2"));

if (!cli || cli === cwd) {
  throw new Error("Indique el ejecutable PMTiles con --cli=RUTA o RUTA_EXPO_PMTILES_CLI.");
}
await access(cli);
if (!Number.isInteger(maxZoom) || maxZoom < 1 || maxZoom > 15) {
  throw new Error("--maxzoom debe ser un entero entre 1 y 15.");
}
if (!Number.isFinite(margin) || margin < 0 || margin > 2) {
  throw new Error("--margin debe estar entre 0 y 2 grados.");
}

function run(args, capture = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(cli, args, {
      cwd,
      windowsHide: true,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (capture) {
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
    }
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`pmtiles ${args[0]} terminó con código ${code}: ${stderr.trim()}`));
    });
  });
}

function snapshotPoints(snapshot) {
  const points = [];
  for (const items of Object.values(snapshot.data || {})) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (Number.isFinite(item.latitude) && Number.isFinite(item.longitude)) {
        points.push([item.latitude, item.longitude]);
      }
    }
  }
  for (const route of Object.values(snapshot.routes || {})) {
    for (const point of route.positions || []) {
      if (Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)) {
        points.push(point);
      }
    }
  }
  if (points.length === 0) throw new Error("La instantánea no contiene coordenadas para calcular la cobertura.");
  return points;
}

function calculateBounds(points) {
  const latitudes = points.map(([latitude]) => latitude);
  const longitudes = points.map(([, longitude]) => longitude);
  return [
    [Math.min(...latitudes) - margin, Math.min(...longitudes) - margin],
    [Math.max(...latitudes) + margin, Math.max(...longitudes) + margin],
  ];
}

const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const requestedBounds = calculateBounds(snapshotPoints(snapshot));
const bbox = [
  requestedBounds[0][1],
  requestedBounds[0][0],
  requestedBounds[1][1],
  requestedBounds[1][0],
].join(",");

if (!useExisting) {
  await rm(temporaryMapPath, { force: true });
  await run([
    "extract",
    sourceUrl,
    temporaryMapPath,
    `--bbox=${bbox}`,
    `--maxzoom=${maxZoom}`,
    "--download-threads=8",
  ]);
  await run(["verify", temporaryMapPath]);
  await rm(mapPath, { force: true });
  await rename(temporaryMapPath, mapPath);
} else {
  await access(mapPath);
  await run(["verify", mapPath]);
}

const header = JSON.parse(await run(["show", mapPath, "--header-json"], true));
const sourceMetadata = JSON.parse(await run(["show", mapPath, "--metadata"], true));
const contents = await readFile(mapPath);
const fileMetadata = await stat(mapPath);
const actualBounds = [
  [header.bounds[1], header.bounds[0]],
  [header.bounds[3], header.bounds[2]],
];
const metadata = {
  format: "ruta-del-telar-pmtiles-v1",
  generatedAt: new Date().toISOString(),
  path: "/expo/map/ruta-del-telar.pmtiles",
  sourceUrl,
  sourceDataTimestamp:
    sourceMetadata["planetiler:osm:osmosisreplicationtime"] || snapshot.generatedAt,
  attribution: "Protomaps Basemap · © OpenStreetMap contributors",
  license: "Open Database License (ODbL) Produced Work",
  bounds: actualBounds,
  maxZoom: header.maxzoom,
  bytes: fileMetadata.size,
  sha256: createHash("sha256").update(contents).digest("hex"),
  vectorLayers: Array.isArray(sourceMetadata.vector_layers)
    ? sourceMetadata.vector_layers.map((layer) => layer.id)
    : [],
};
await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

snapshot.map.vector = {
  path: metadata.path,
  sourceUrl: metadata.sourceUrl,
  sourceDataTimestamp: metadata.sourceDataTimestamp,
  attribution: metadata.attribution,
  license: metadata.license,
  bounds: metadata.bounds,
  maxZoom: metadata.maxZoom,
  bytes: metadata.bytes,
  sha256: metadata.sha256,
};
await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(`PMTiles: ${mapPath}`);
console.log(`Cobertura: ${JSON.stringify(metadata.bounds)}`);
console.log(`Zoom máximo: ${metadata.maxZoom}`);
console.log(`Bytes: ${metadata.bytes}`);
console.log(`SHA-256: ${metadata.sha256}`);
