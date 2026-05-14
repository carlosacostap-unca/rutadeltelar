import type { CSSProperties } from "react";

export type ImageFocus = {
  x?: number;
  y?: number;
};

export type GalleryFocusMap = Record<string, ImageFocus>;

export type FocusedImage = {
  url: string;
  fileName?: string;
  focus?: ImageFocus;
};

export const DEFAULT_IMAGE_FOCUS = { x: 50, y: 50 } as const;

function readFiniteNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function normalizeImageFocus(focus?: ImageFocus | null) {
  return {
    x: readFiniteNumber(focus?.x) ?? DEFAULT_IMAGE_FOCUS.x,
    y: readFiniteNumber(focus?.y) ?? DEFAULT_IMAGE_FOCUS.y,
  };
}

export function getImageFocusStyle(focus?: ImageFocus | null): CSSProperties {
  const { x, y } = normalizeImageFocus(focus);

  return {
    objectPosition: `${x}% ${y}%`,
  };
}

export function getFileNameKey(fileNameOrUrl: string) {
  const withoutHash = fileNameOrUrl.split("#")[0] ?? fileNameOrUrl;
  const withoutQuery = withoutHash.split("?")[0] ?? withoutHash;
  const normalized = withoutQuery.replace(/\\/g, "/");
  const lastSegment = normalized.split("/").filter(Boolean).at(-1) ?? normalized;

  try {
    return decodeURIComponent(lastSegment).toLowerCase();
  } catch {
    return lastSegment.toLowerCase();
  }
}

export function parseGalleryFocusMap(value: unknown): GalleryFocusMap | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const focusMap: GalleryFocusMap = {};

  for (const [fileName, rawFocus] of Object.entries(value as Record<string, unknown>)) {
    if (!rawFocus || typeof rawFocus !== "object" || Array.isArray(rawFocus)) {
      continue;
    }

    const focus = rawFocus as Record<string, unknown>;
    const x = readFiniteNumber(focus.x);
    const y = readFiniteNumber(focus.y);

    if (x === undefined && y === undefined) {
      continue;
    }

    focusMap[getFileNameKey(fileName)] = {
      ...(x !== undefined ? { x } : {}),
      ...(y !== undefined ? { y } : {}),
    };
  }

  return Object.keys(focusMap).length > 0 ? focusMap : undefined;
}

export function getGalleryImageFocus(
  fileNameOrUrl: string,
  focusMap?: GalleryFocusMap,
): ImageFocus | undefined {
  return focusMap?.[getFileNameKey(fileNameOrUrl)];
}
