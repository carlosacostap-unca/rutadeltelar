export type MapTileLayerConfig = {
  key: string;
  url: string;
  attribution: string;
  opacity?: number;
};

const ESRI_IMAGERY_ATTRIBUTION =
  "Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community";

const ESRI_REFERENCE_ATTRIBUTION =
  "Reference tiles &copy; Esri, HERE, Garmin, FAO, NOAA, USGS, and contributors";

export const SATELLITE_REFERENCE_TILE_LAYERS: MapTileLayerConfig[] = [
  {
    key: "world-imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: ESRI_IMAGERY_ATTRIBUTION,
  },
  {
    key: "world-transportation",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
    attribution: ESRI_REFERENCE_ATTRIBUTION,
  },
  {
    key: "world-boundaries-and-places",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: ESRI_REFERENCE_ATTRIBUTION,
  },
];
