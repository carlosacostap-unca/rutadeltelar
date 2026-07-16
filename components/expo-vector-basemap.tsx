"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { PMTiles } from "pmtiles";
import { leafletLayer } from "protomaps-leaflet";
import {
  EXPO_MAP_PMTILES_PATH,
  EXPO_MAP_VECTOR_ATTRIBUTION,
  EXPO_MAP_VECTOR_BOUNDS,
  EXPO_MAP_VECTOR_MAX_ZOOM,
} from "@/app/lib/expo-map";

type ExpoVectorBasemapProps = {
  mood?: "neutral" | "warm";
};

export function ExpoVectorBasemap({
  mood = "neutral",
}: ExpoVectorBasemapProps) {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    let layer: ReturnType<typeof leafletLayer> | undefined;
    const mapContainer = map.getContainer();
    mapContainer.dataset.expoMapSource = "schematic";

    async function addVectorLayer() {
      try {
        const archive = new PMTiles(EXPO_MAP_PMTILES_PATH);
        const header = await archive.getHeader();
        if (cancelled || header.maxZoom < 1) return;

        const leafletGlobal = globalThis as typeof globalThis & { L?: typeof L };
        leafletGlobal.L = L;
        layer = leafletLayer({
          url: EXPO_MAP_PMTILES_PATH,
          flavor: "light",
          lang: "es",
          attribution: EXPO_MAP_VECTOR_ATTRIBUTION,
          bounds: EXPO_MAP_VECTOR_BOUNDS,
          maxDataZoom: EXPO_MAP_VECTOR_MAX_ZOOM,
          maxNativeZoom: EXPO_MAP_VECTOR_MAX_ZOOM,
          maxZoom: EXPO_MAP_VECTOR_MAX_ZOOM,
          noWrap: true,
          opacity: mood === "warm" ? 0.94 : 1,
          zIndex: 2,
          className: "expo-vector-basemap",
        });
        layer.on("tileload", () => {
          mapContainer.dataset.expoMapSource = "pmtiles";
        });
        layer.addTo(map);
      } catch (error) {
        console.warn("No se pudo cargar el mapa vectorial local; se usa el mapa esquemático.", error);
      }
    }

    void addVectorLayer();

    return () => {
      cancelled = true;
      if (layer) layer.removeFrom(map);
      delete mapContainer.dataset.expoMapSource;
    };
  }, [map, mood]);

  return null;
}
