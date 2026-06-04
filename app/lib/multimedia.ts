export type EntityMediaFields = {
  foto_portada?: string | string[];
  galeria_fotos?: string | string[];
  fotos?: string | string[];
  media_optimizados?: string | string[];
  media_optimizados_map?: Record<string, unknown>;
};

export type EntityMediaImageRef = {
  fileName: string;
  displayFileName: string;
  sourceField: "foto_portada" | "galeria_fotos" | "fotos";
};

function normalizeFileList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function fileNameKey(fileName: string) {
  const withoutQuery = fileName.split("?")[0] ?? fileName;
  const normalized = withoutQuery.replace(/\\/g, "/");
  const lastSegment = normalized.split("/").filter(Boolean).at(-1) ?? normalized;

  try {
    return decodeURIComponent(lastSegment).toLowerCase();
  } catch {
    return lastSegment.toLowerCase();
  }
}

export function getEntityCoverImage(record: EntityMediaFields) {
  return getEntityCoverImageRef(record)?.fileName ?? null;
}

export function getEntityCoverImageRef(record: EntityMediaFields): EntityMediaImageRef | null {
  const explicitCover = normalizeFileList(record.foto_portada)[0];

  if (explicitCover) {
    return buildImageRef(record, "foto_portada", explicitCover);
  }

  const legacyCover = normalizeFileList(record.fotos)[0];

  return legacyCover ? buildImageRef(record, "fotos", legacyCover) : null;
}

export function getEntityGalleryImages(record: EntityMediaFields) {
  return getEntityGalleryImageRefs(record).map((image) => image.fileName);
}

export function getEntityGalleryImageRefs(record: EntityMediaFields): EntityMediaImageRef[] {
  const cover = getEntityCoverImageRef(record);
  const excludedKey = cover ? fileNameKey(cover.fileName) : null;
  const seen = new Set<string>();

  return [
    ...normalizeFileList(record.galeria_fotos).map((fileName) =>
      buildImageRef(record, "galeria_fotos", fileName),
    ),
    ...normalizeFileList(record.fotos).map((fileName) =>
      buildImageRef(record, "fotos", fileName),
    ),
  ].filter((image) => {
    const key = fileNameKey(image.fileName);

    if (excludedKey && key === excludedKey) {
      return false;
    }

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildImageRef(
  record: EntityMediaFields,
  sourceField: EntityMediaImageRef["sourceField"],
  fileName: string,
): EntityMediaImageRef {
  return {
    fileName,
    sourceField,
    displayFileName: getOptimizedFileName(record, sourceField, fileName) ?? fileName,
  };
}

function getOptimizedFileName(
  record: EntityMediaFields,
  sourceField: EntityMediaImageRef["sourceField"],
  fileName: string,
) {
  if (
    !record.media_optimizados_map ||
    typeof record.media_optimizados_map !== "object" ||
    Array.isArray(record.media_optimizados_map)
  ) {
    return null;
  }

  const mapped = record.media_optimizados_map[`${sourceField}:${fileName}`];

  if (typeof mapped !== "string" || !mapped.trim()) {
    return null;
  }

  return normalizeFileList(record.media_optimizados).includes(mapped) ? mapped : null;
}
