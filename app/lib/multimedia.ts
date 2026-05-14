export type EntityMediaFields = {
  foto_portada?: string | string[];
  galeria_fotos?: string | string[];
  fotos?: string | string[];
};

function normalizeFileList(value: unknown) {
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
  return normalizeFileList(record.foto_portada)[0] ?? normalizeFileList(record.fotos)[0] ?? null;
}

export function getEntityGalleryImages(record: EntityMediaFields) {
  const coverKey = getEntityCoverImage(record);
  const excludedKey = coverKey ? fileNameKey(coverKey) : null;
  const seen = new Set<string>();

  return [
    ...normalizeFileList(record.galeria_fotos),
    ...normalizeFileList(record.fotos),
  ].filter((fileName) => {
    const key = fileNameKey(fileName);

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
