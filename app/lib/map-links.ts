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

  const center = `${point.latitude},${point.longitude}`;
  const safeZoom = Number.isFinite(zoom) ? Math.min(Math.max(Math.round(zoom), 1), 21) : 18;

  return `https://www.google.com/maps/@?api=1&map_action=map&center=${encodeURIComponent(center)}&zoom=${safeZoom}&basemap=satellite`;
}
