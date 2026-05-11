export type GeoPoint = {
  latitude?: number;
  longitude?: number;
};

export function hasValidCoordinates<T extends GeoPoint>(
  item: T,
): item is T & { latitude: number; longitude: number } {
  if (
    typeof item.latitude !== "number" ||
    typeof item.longitude !== "number" ||
    !Number.isFinite(item.latitude) ||
    !Number.isFinite(item.longitude)
  ) {
    return false;
  }

  if (item.latitude === 0 && item.longitude === 0) {
    return false;
  }

  return (
    item.latitude >= -90 &&
    item.latitude <= 90 &&
    item.longitude >= -180 &&
    item.longitude <= 180
  );
}
