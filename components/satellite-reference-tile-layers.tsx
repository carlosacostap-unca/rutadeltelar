"use client";

import { TileLayer } from "react-leaflet";
import { SATELLITE_REFERENCE_TILE_LAYERS } from "@/app/lib/map-tile-layers";

export function SatelliteReferenceTileLayers() {
  return (
    <>
      {SATELLITE_REFERENCE_TILE_LAYERS.map((layer, index) => (
        <TileLayer
          key={layer.key}
          attribution={layer.attribution}
          opacity={layer.opacity}
          url={layer.url}
          zIndex={index + 1}
        />
      ))}
    </>
  );
}
