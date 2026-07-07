"use client";

import { TileLayer } from "react-leaflet";
import {
  SATELLITE_REFERENCE_MAX_ZOOM,
  SATELLITE_REFERENCE_TILE_LAYERS,
} from "@/app/lib/map-tile-layers";

type SatelliteReferenceTileLayersProps = {
  mood?: "neutral" | "warm";
};

export function SatelliteReferenceTileLayers({
  mood = "neutral",
}: SatelliteReferenceTileLayersProps) {
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
