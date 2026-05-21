export function normalizeHighlightedData(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
