import "server-only";

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  findForbiddenSnapshotKeys,
  validateExpoSnapshot,
  type ExpoSnapshotManifest,
} from "@/app/lib/expo-snapshot-schema";

const PUBLIC_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "public");
const DEFAULT_SNAPSHOT_PATH = path.join(PUBLIC_ROOT, "expo", "snapshot.json");
let cached: { path: string; modified: number; manifest: ExpoSnapshotManifest } | null = null;

export function getExpoSnapshotPath() {
  return DEFAULT_SNAPSHOT_PATH;
}

export function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function resolvePublicAsset(assetPath: string) {
  const publicRoot = path.resolve(PUBLIC_ROOT);
  const resolved = path.resolve(publicRoot, assetPath.replace(/^\/+/, ""));
  if (!resolved.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error(`Expo asset escapes public directory: ${assetPath}`);
  }
  return resolved;
}

export async function loadExpoSnapshot(options: { verifyFiles?: boolean } = {}) {
  const snapshotPath = getExpoSnapshotPath();
  const metadata = await stat(snapshotPath);
  let manifest: ExpoSnapshotManifest;

  if (cached?.path === snapshotPath && cached.modified === metadata.mtimeMs) {
    manifest = cached.manifest;
  } else {
    const raw = await readFile(snapshotPath, "utf8");
    const result = validateExpoSnapshot(JSON.parse(raw) as unknown);
    if (!result.ok) throw new Error(`Invalid expo snapshot: ${result.errors.join("; ")}`);
    const forbiddenKeys = findForbiddenSnapshotKeys(result.manifest);
    if (forbiddenKeys.length > 0) {
      throw new Error(`Expo snapshot includes forbidden keys: ${forbiddenKeys.join(", ")}`);
    }
    const dataHash = sha256(JSON.stringify(result.manifest.data));
    if (dataHash !== result.manifest.dataSha256) {
      throw new Error("Expo snapshot data hash does not match");
    }
    manifest = result.manifest;
    cached = { path: snapshotPath, modified: metadata.mtimeMs, manifest };
  }

  if (options.verifyFiles) {
    await Promise.all(manifest.media.map(async (entry) => {
      const contents = await readFile(resolvePublicAsset(entry.path));
      if (contents.byteLength !== entry.bytes || sha256(contents) !== entry.sha256) {
        throw new Error(`Expo media integrity failed: ${entry.path}`);
      }
    }));
    await stat(resolvePublicAsset(manifest.map.imagePath));
    if (manifest.map.vector) {
      const contents = await readFile(resolvePublicAsset(manifest.map.vector.path));
      if (
        contents.byteLength !== manifest.map.vector.bytes ||
        sha256(contents) !== manifest.map.vector.sha256
      ) {
        throw new Error(`Expo vector map integrity failed: ${manifest.map.vector.path}`);
      }
    }
  }

  return manifest;
}

export function clearExpoSnapshotCache() {
  cached = null;
}
