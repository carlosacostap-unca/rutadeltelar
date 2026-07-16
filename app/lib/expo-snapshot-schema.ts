import type {
  Artisan,
  Experience,
  HighlightSpot,
  Product,
  Station,
} from "./content.ts";

export const EXPO_SNAPSHOT_SCHEMA_VERSION = 1;

export type ExpoRouteGeometry = {
  source: "osrm" | "straight";
  positions: Array<[number, number]>;
};

export type ExpoMediaEntry = {
  path: string;
  sha256: string;
  bytes: number;
  contentType: string;
  sourceUrl?: string;
};

export type ExpoSnapshotData = {
  stations: Station[];
  artisans: Artisan[];
  products: Product[];
  experiences: Experience[];
  highlightSpots: HighlightSpot[];
};

export type ExpoSnapshotManifest = {
  schemaVersion: typeof EXPO_SNAPSHOT_SCHEMA_VERSION;
  generatedAt: string;
  source: string;
  counts: Record<keyof ExpoSnapshotData, number>;
  dataSha256: string;
  data: ExpoSnapshotData;
  media: ExpoMediaEntry[];
  map: {
    imagePath: string;
    attribution: string;
    bounds: [[number, number], [number, number]];
    maxZoom: number;
    vector?: {
      path: string;
      sourceUrl: string;
      sourceDataTimestamp: string;
      attribution: string;
      license: string;
      bounds: [[number, number], [number, number]];
      maxZoom: number;
      bytes: number;
      sha256: string;
    };
  };
  routes: Record<string, ExpoRouteGeometry>;
};

export type ExpoSnapshotValidation =
  | { ok: true; manifest: ExpoSnapshotManifest; errors: [] }
  | { ok: false; errors: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteCoordinate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function isSha256(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
}

function validateEntityArray(
  value: unknown,
  key: keyof ExpoSnapshotData,
  errors: string[],
) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`data.${key} must be a non-empty array`);
    return;
  }

  const slugs = new Set<string>();
  value.forEach((item, index) => {
    if (!isRecord(item) || typeof item.slug !== "string" || !item.slug.trim()) {
      errors.push(`data.${key}[${index}] must have a non-empty slug`);
      return;
    }
    if (slugs.has(item.slug)) {
      errors.push(`data.${key} contains duplicate slug ${item.slug}`);
    }
    slugs.add(item.slug);
  });
}

export function validateExpoSnapshot(value: unknown): ExpoSnapshotValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { ok: false, errors: ["snapshot must be an object"] };

  if (value.schemaVersion !== EXPO_SNAPSHOT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${EXPO_SNAPSHOT_SCHEMA_VERSION}`);
  }
  if (typeof value.generatedAt !== "string" || Number.isNaN(Date.parse(value.generatedAt))) {
    errors.push("generatedAt must be an ISO date");
  }
  if (typeof value.source !== "string" || !value.source.trim()) {
    errors.push("source must be a non-empty public identifier");
  }
  if (!isSha256(value.dataSha256)) errors.push("dataSha256 must be a SHA-256 hash");

  const data = isRecord(value.data) ? value.data : null;
  if (!data) {
    errors.push("data must be an object");
  } else {
    (["stations", "artisans", "products", "experiences", "highlightSpots"] as const)
      .forEach((key) => validateEntityArray(data[key], key, errors));
  }

  const counts = isRecord(value.counts) ? value.counts : null;
  if (!counts) {
    errors.push("counts must be an object");
  } else if (data) {
    (["stations", "artisans", "products", "experiences", "highlightSpots"] as const)
      .forEach((key) => {
        if (counts[key] !== (data[key] as unknown[])?.length) {
          errors.push(`counts.${key} does not match data.${key}`);
        }
      });
  }

  if (!Array.isArray(value.media)) {
    errors.push("media must be an array");
  } else {
    value.media.forEach((entry, index) => {
      if (!isRecord(entry) || typeof entry.path !== "string" || !entry.path.startsWith("/expo/")) {
        errors.push(`media[${index}].path must stay under /expo/`);
      }
      if (!isRecord(entry) || !isSha256(entry.sha256)) {
        errors.push(`media[${index}].sha256 must be a SHA-256 hash`);
      }
      if (!isRecord(entry) || typeof entry.bytes !== "number" || entry.bytes < 0) {
        errors.push(`media[${index}].bytes must be non-negative`);
      }
    });
  }

  if (!isRecord(value.map) || typeof value.map.imagePath !== "string") {
    errors.push("map configuration is required");
  } else {
    const bounds = value.map.bounds;
    if (
      !Array.isArray(bounds) || bounds.length !== 2 ||
      !Array.isArray(bounds[0]) || !Array.isArray(bounds[1]) ||
      !bounds.flat().every(isFiniteCoordinate)
    ) {
      errors.push("map.bounds must contain two latitude/longitude pairs");
    }
    if (value.map.vector !== undefined) {
      if (!isRecord(value.map.vector)) {
        errors.push("map.vector must be an object");
      } else {
        if (
          typeof value.map.vector.path !== "string" ||
          !value.map.vector.path.startsWith("/expo/map/") ||
          !value.map.vector.path.endsWith(".pmtiles")
        ) {
          errors.push("map.vector.path must reference a packaged PMTiles file");
        }
        if (!isSha256(value.map.vector.sha256)) {
          errors.push("map.vector.sha256 must be a SHA-256 hash");
        }
        if (
          typeof value.map.vector.bytes !== "number" ||
          !Number.isInteger(value.map.vector.bytes) ||
          value.map.vector.bytes <= 0
        ) {
          errors.push("map.vector.bytes must be a positive integer");
        }
        if (
          typeof value.map.vector.maxZoom !== "number" ||
          !Number.isInteger(value.map.vector.maxZoom) ||
          value.map.vector.maxZoom < 1
        ) {
          errors.push("map.vector.maxZoom must be a positive integer");
        }
        const vectorBounds = value.map.vector.bounds;
        if (
          !Array.isArray(vectorBounds) || vectorBounds.length !== 2 ||
          !Array.isArray(vectorBounds[0]) || !Array.isArray(vectorBounds[1]) ||
          !vectorBounds.flat().every(isFiniteCoordinate)
        ) {
          errors.push("map.vector.bounds must contain two latitude/longitude pairs");
        }
        for (const key of ["sourceUrl", "sourceDataTimestamp", "attribution", "license"] as const) {
          if (typeof value.map.vector[key] !== "string" || !value.map.vector[key].trim()) {
            errors.push(`map.vector.${key} must be a non-empty string`);
          }
        }
      }
    }
  }

  if (!isRecord(value.routes)) errors.push("routes must be an object");

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, manifest: value as ExpoSnapshotManifest, errors: [] };
}

export function findForbiddenSnapshotKeys(value: unknown) {
  const forbidden = /^(token|password|passwordConfirm|adminEmail|adminPassword)$/i;
  const found = new Set<string>();
  function visit(node: unknown) {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!isRecord(node)) return;
    Object.entries(node).forEach(([key, child]) => {
      if (forbidden.test(key)) found.add(key);
      visit(child);
    });
  }
  visit(value);
  return [...found].sort();
}

export function deduplicateMediaEntries<T extends { sha256: string }>(entries: T[]) {
  return [...new Map(entries.map((entry) => [entry.sha256, entry])).values()];
}
