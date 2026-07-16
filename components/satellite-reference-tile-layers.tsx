"use client";

import { ImageOverlay, TileLayer } from "react-leaflet";
import {
  EXPO_MAP_ATTRIBUTION,
  EXPO_MAP_BOUNDS,
  EXPO_MAP_IMAGE_PATH,
} from "@/app/lib/expo-map";
import {
  SATELLITE_REFERENCE_MAX_ZOOM,
  SATELLITE_REFERENCE_TILE_LAYERS,
} from "@/app/lib/map-tile-layers";
import { useExpoMode } from "@/components/expo-mode-provider";
import { ExpoVectorBasemap } from "@/components/expo-vector-basemap";

type SatelliteReferenceTileLayersProps = {
  mood?: "neutral" | "warm";
};

export function SatelliteReferenceTileLayers({
  mood = "neutral",
}: SatelliteReferenceTileLayersProps) {
  const { expoOffline } = useExpoMode();

  if (expoOffline) {
    return (
      <>
        <ImageOverlay
          url={EXPO_MAP_IMAGE_PATH}
          bounds={EXPO_MAP_BOUNDS}
          attribution={EXPO_MAP_ATTRIBUTION}
          opacity={mood === "warm" ? 0.9 : 1}
          pane="tilePane"
          zIndex={1}
        />
        <ExpoVectorBasemap mood={mood} />
      </>
    );
  }

  return (
    <>
      {SATELLITE_REFERENCE_TILE_LAYERS.map((layer, index) => (
        <TileLayer
          key={layer.key}
          attribution={layer.attribution}
          className={mood === "warm" && index === 0 ? "territory-map-imagery" : undefined}
          opacity={layer.opacity}
          url={layer.url}
          zIndex={index + 1}
          maxNativeZoom={SATELLITE_REFERENCE_MAX_ZOOM}
          maxZoom={SATELLITE_REFERENCE_MAX_ZOOM}
        />
      ))}
    </>
  );
}
