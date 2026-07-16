import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const port = Number(process.env.RUTA_EXPO_PREPARE_PORT || 3212);
const token = randomBytes(24).toString("hex");
const baseUrl = `http://127.0.0.1:${port}`;
const mediaDir = path.join(cwd, "public", "expo", "media");
const snapshotPath = path.join(cwd, "public", "expo", "snapshot.json");
const reportPath = path.join(cwd, "public", "expo", "report.txt");
const vectorMapMetadataPath = path.join(cwd, "public", "expo", "map", "ruta-del-telar.pmtiles.json");
const nextCli = path.join(cwd, "node_modules", "next", "dist", "bin", "next");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadVectorMapMetadata() {
  try {
    const metadata = JSON.parse(await readFile(vectorMapMetadataPath, "utf8"));
    return {
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
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

function extensionFor(contentType, url) {
  const known = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  }[contentType.split(";")[0].toLowerCase()];
  if (known) return known;
  const pathname = new URL(url).pathname;
  const candidate = path.extname(pathname).toLowerCase();
  return /^\.[a-z0-9]{1,5}$/.test(candidate) ? candidate : ".bin";
}

function isPocketBaseMediaUrl(value) {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) && url.pathname.includes("/api/files/");
  } catch {
    return false;
  }
}

async function waitForSource(child) {
  const deadline = Date.now() + 120_000;
  let lastError = "server not ready";
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Preparation server exited with ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/api/expo/source`, {
        headers: { "x-expo-prepare-token": token },
        signal: AbortSignal.timeout(15_000),
      });
      const body = await response.json();
      if (response.ok && body.ok) return body.data;
      lastError = body.error || `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(750);
  }
  throw new Error(`Preparation source did not become ready: ${lastError}`);
}

function validateData(data) {
  const errors = [];
  for (const key of ["stations", "artisans", "products", "experiences", "highlightSpots"]) {
    const items = data[key];
    if (!Array.isArray(items) || items.length === 0) {
      errors.push(`${key} is empty`);
      continue;
    }
    const slugs = new Set();
    for (const item of items) {
      if (!item?.slug) errors.push(`${key} contains an item without slug`);
      if (slugs.has(item?.slug)) errors.push(`${key} contains duplicate slug ${item.slug}`);
      slugs.add(item?.slug);
    }
  }
  const serialized = JSON.stringify(data);
  for (const forbidden of ["password", "passwordConfirm", "adminPassword", "authToken"]) {
    if (serialized.includes(`\"${forbidden}\"`)) errors.push(`forbidden key ${forbidden}`);
  }
  const stationIds = new Set(data.stations.map((item) => item.recordId).filter(Boolean));
  const actorIds = new Set(data.artisans.map((item) => item.recordId).filter(Boolean));
  const experienceIds = new Set(data.experiences.map((item) => item.recordId).filter(Boolean));
  const productIds = new Set(data.products.map((item) => item.recordId).filter(Boolean));
  for (const item of [...data.artisans, ...data.products, ...data.experiences, ...data.highlightSpots]) {
    if (item.stationRecordId && !stationIds.has(item.stationRecordId)) errors.push(`broken station relation on ${item.slug}`);
  }
  for (const item of data.highlightSpots) {
    for (const id of item.relatedArtisanRecordIds || []) if (!actorIds.has(id)) errors.push(`broken actor relation on ${item.slug}`);
    for (const id of item.relatedExperienceRecordIds || []) if (!experienceIds.has(id)) errors.push(`broken experience relation on ${item.slug}`);
    for (const id of item.relatedProductRecordIds || []) if (!productIds.has(id)) errors.push(`broken product relation on ${item.slug}`);
  }
  for (const [latitude, longitude] of geographicPoints(data)) {
    if (latitude < -29 || latitude > -24.5 || longitude < -69 || longitude > -65) {
      errors.push(`coordinate outside packaged map bounds: ${latitude},${longitude}`);
    }
  }
  if (errors.length > 0) throw new Error(`Snapshot validation failed:\n- ${errors.join("\n- ")}`);
}

function sanitizePublicData(sourceData) {
  const data = structuredClone(sourceData);
  const warnings = [];
  const stationIds = new Set(data.stations.map((item) => item.recordId).filter(Boolean));
  const actorIds = new Set(data.artisans.map((item) => item.recordId).filter(Boolean));
  const experienceIds = new Set(data.experiences.map((item) => item.recordId).filter(Boolean));
  const productIds = new Set(data.products.map((item) => item.recordId).filter(Boolean));

  function validCoordinates(item) {
    const latitude = item.latitude;
    const longitude = item.longitude;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
    if (latitude === 0 && longitude === 0) return false;
    return latitude >= -29 && latitude <= -24.5 && longitude >= -69 && longitude <= -65;
  }

  for (const item of [...data.stations, ...data.artisans, ...data.highlightSpots]) {
    if ((item.latitude !== undefined || item.longitude !== undefined) && !validCoordinates(item)) {
      warnings.push(`coordinates omitted for ${item.slug}: ${item.latitude},${item.longitude}`);
      delete item.latitude;
      delete item.longitude;
    }
  }

  for (const item of [...data.artisans, ...data.products, ...data.experiences, ...data.highlightSpots]) {
    if (item.stationRecordId && !stationIds.has(item.stationRecordId)) {
      warnings.push(`station relation omitted for ${item.slug}: ${item.stationRecordId}`);
      delete item.stationRecordId;
      delete item.stationSlug;
      delete item.stationName;
    }
  }

  for (const item of data.products) {
    const original = item.relatedActorRecordIds || [];
    item.relatedActorRecordIds = original.filter((id) => actorIds.has(id));
    for (const id of original.filter((id) => !actorIds.has(id))) warnings.push(`actor relation omitted for ${item.slug}: ${id}`);
  }
  for (const item of data.highlightSpots) {
    for (const [key, validIds, label] of [
      ["relatedArtisanRecordIds", actorIds, "actor"],
      ["relatedExperienceRecordIds", experienceIds, "experience"],
      ["relatedProductRecordIds", productIds, "product"],
    ]) {
      const original = item[key] || [];
      item[key] = original.filter((id) => validIds.has(id));
      for (const id of original.filter((id) => !validIds.has(id))) warnings.push(`${label} relation omitted for ${item.slug}: ${id}`);
    }
  }
  for (const item of data.experiences) {
    if (item.responsibleRecordId && !actorIds.has(item.responsibleRecordId)) {
      warnings.push(`responsible relation omitted for ${item.slug}: ${item.responsibleRecordId}`);
      delete item.responsibleRecordId;
      delete item.responsibleSlug;
      delete item.responsibleName;
    }
  }

  return { data, warnings };
}

async function materializeMedia(data) {
  await mkdir(mediaDir, { recursive: true });
  const downloads = new Map();
  const inventory = new Map();
  let activeDownloads = 0;
  const downloadWaiters = [];

  async function withDownloadSlot(task) {
    if (activeDownloads >= 2) {
      await new Promise((resolve) => downloadWaiters.push(resolve));
    }
    activeDownloads += 1;
    try {
      return await task();
    } finally {
      activeDownloads -= 1;
      downloadWaiters.shift()?.();
    }
  }

  async function fetchMedia(url) {
    let lastError;
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(45_000) });
        if (!response.ok) throw new Error(`Media download failed ${response.status}: ${url}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        return { bytes, contentType };
      } catch (error) {
        lastError = error;
        if (attempt < 4) await delay(attempt * 1_000);
      }
    }
    throw lastError;
  }

  async function localize(url) {
    if (downloads.has(url)) return downloads.get(url);
    const promise = withDownloadSlot(async () => {
      const { bytes, contentType } = await fetchMedia(url);
      const hash = sha256(bytes);
      const fileName = `${hash}${extensionFor(contentType, url)}`;
      const publicPath = `/expo/media/${fileName}`;
      const filePath = path.join(mediaDir, fileName);
      try {
        const existing = await readFile(filePath);
        if (sha256(existing) !== hash) throw new Error(`Existing media hash mismatch: ${fileName}`);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
        await writeFile(filePath, bytes);
      }
      inventory.set(hash, { path: publicPath, sha256: hash, bytes: bytes.length, contentType, sourceUrl: url });
      return publicPath;
    });
    downloads.set(url, promise);
    return promise;
  }

  async function visit(value) {
    if (typeof value === "string") return isPocketBaseMediaUrl(value) ? localize(value) : value;
    if (Array.isArray(value)) return Promise.all(value.map(visit));
    if (!value || typeof value !== "object") return value;
    const entries = await Promise.all(Object.entries(value).map(async ([key, child]) => [key, await visit(child)]));
    return Object.fromEntries(entries);
  }

  return { data: await visit(data), media: [...inventory.values()].sort((a, b) => a.path.localeCompare(b.path)) };
}

function geographicPoints(data) {
  return [...data.stations, ...data.artisans, ...data.highlightSpots]
    .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
    .map((item) => [item.latitude, item.longitude]);
}

function calculateBounds(points) {
  if (points.length === 0) return [[-29, -69], [-24.5, -65]];
  const latitudes = points.map(([lat]) => lat);
  const longitudes = points.map(([, lng]) => lng);
  return [[Math.min(...latitudes) - 0.35, Math.min(...longitudes) - 0.35], [Math.max(...latitudes) + 0.35, Math.max(...longitudes) + 0.35]];
}

async function routeFor(points) {
  if (points.length < 2) return null;
  const coordinates = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`, { signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`OSRM ${response.status}`);
    const payload = await response.json();
    const geometry = payload.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(geometry) || geometry.length < 2) throw new Error("OSRM returned no geometry");
    return { source: "osrm", positions: geometry.map(([lng, lat]) => [lat, lng]) };
  } catch {
    return { source: "straight", positions: points };
  }
}

async function buildRoutes(data) {
  const routes = {};
  for (const station of data.stations) {
    if (!Number.isFinite(station.latitude) || !Number.isFinite(station.longitude)) continue;
    const related = [...data.artisans, ...data.highlightSpots].filter((item) =>
      (item.stationRecordId && item.stationRecordId === station.recordId) || item.stationSlug === station.slug,
    );
    const points = [[station.latitude, station.longitude], ...related
      .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
      .map((item) => [item.latitude, item.longitude])];
    const unique = points.filter((point, index) => points.findIndex((candidate) => candidate[0] === point[0] && candidate[1] === point[1]) === index);
    const route = await routeFor(unique);
    if (route) routes[`recorrido-${station.slug}`] = route;
  }
  return routes;
}

const child = spawn(process.execPath, [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd,
  env: { ...process.env, RUTA_EXPO_OFFLINE: "false", RUTA_EXPO_PREPARE_TOKEN: token },
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});
child.stdout.on("data", (chunk) => process.stdout.write(chunk));
child.stderr.on("data", (chunk) => process.stderr.write(chunk));

try {
  const sourceData = await waitForSource(child);
  const sanitized = sanitizePublicData(sourceData);
  validateData(sanitized.data);
  const localized = await materializeMedia(sanitized.data);
  validateData(localized.data);
  const routes = await buildRoutes(localized.data);
  const vectorMap = await loadVectorMapMetadata();
  const counts = Object.fromEntries(Object.entries(localized.data).map(([key, items]) => [key, items.length]));
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: process.env.NEXT_PUBLIC_POCKETBASE_URL ? new URL(process.env.NEXT_PUBLIC_POCKETBASE_URL).host : "configured-pocketbase",
    counts,
    dataSha256: sha256(JSON.stringify(localized.data)),
    data: localized.data,
    media: localized.media,
    map: {
      imagePath: "/expo/map/ruta-del-telar.svg",
      attribution: "Mapa esquematico local Ruta del Telar",
      bounds: calculateBounds(geographicPoints(localized.data)),
      maxZoom: 13,
      ...(vectorMap ? { vector: vectorMap } : {}),
    },
    routes,
  };
  await mkdir(path.dirname(snapshotPath), { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const snapshotBytes = (await stat(snapshotPath)).size;
  const mediaBytes = localized.media.reduce((sum, entry) => sum + entry.bytes, 0);
  const report = [
    "Ruta del Telar - Expo Offline preparation",
    `Generated: ${manifest.generatedAt}`,
    `Source: ${manifest.source}`,
    ...Object.entries(counts).map(([key, count]) => `${key}: ${count}`),
    `Media files: ${localized.media.length}`,
    `Media bytes: ${mediaBytes}`,
    `Snapshot bytes: ${snapshotBytes}`,
    `Routes: ${Object.keys(routes).length}`,
    `Vector map: ${vectorMap ? `${vectorMap.bytes} bytes, zoom ${vectorMap.maxZoom}` : "schematic fallback only"}`,
    `Data SHA-256: ${manifest.dataSha256}`,
    `Warnings: ${sanitized.warnings.length}`,
    ...sanitized.warnings.map((warning) => `WARNING: ${warning}`),
  ].join("\n");
  await writeFile(reportPath, `${report}\n`, "utf8");
  console.log(`\n${report}`);
} finally {
  child.kill("SIGTERM");
}
