export const EXPO_MAP_IMAGE_PATH = "/expo/map/ruta-del-telar.svg";
export const EXPO_MAP_PMTILES_PATH = "/expo/map/ruta-del-telar.pmtiles";
export const EXPO_MAP_BOUNDS: [[number, number], [number, number]] = [
  [-29, -69],
  [-24.5, -65],
];
export const EXPO_MAP_ATTRIBUTION = "Mapa esquematico local Ruta del Telar";
export const EXPO_MAP_VECTOR_ATTRIBUTION =
  '<a href="https://protomaps.com">Protomaps</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a>';
export const EXPO_MAP_VECTOR_BOUNDS: [[number, number], [number, number]] = [
  [-28.2, -67.95],
  [-25.5, -65.5],
];
export const EXPO_MAP_VECTOR_MAX_ZOOM = 15;

export function resolveOfflineRoutePositions(
  routeGeometry: Array<[number, number]> | undefined,
  points: Array<[number, number]>,
) {
  return routeGeometry && routeGeometry.length >= 2 ? routeGeometry : points;
}
