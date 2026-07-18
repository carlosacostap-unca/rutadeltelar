export type MapPoint = {
  latitude?: number;
  longitude?: number;
};

function hasValidMapCoordinates(point: MapPoint) {
  if (
    typeof point.latitude !== "number" ||
    typeof point.longitude !== "number" ||
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude)
  ) {
    return false;
  }

  if (point.latitude === 0 && point.longitude === 0) {
    return false;
  }

  return (
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

export function getSatelliteMapUrl(point: MapPoint, zoom = 18) {
  if (!hasValidMapCoordinates(point)) {
    return null;
  }

  const query = `${point.latitude},${point.longitude}`;
  const safeZoom = Number.isFinite(zoom) ? Math.min(Math.max(Math.round(zoom), 1), 21) : 18;

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&t=k&z=${safeZoom}`;
}

export function getDirectionsMapUrl(point: MapPoint) {
  if (!hasValidMapCoordinates(point)) {
    return null;
  }

  const destination = `${point.latitude},${point.longitude}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&dir_action=navigate`;
}