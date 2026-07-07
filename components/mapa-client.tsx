"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  type Artisan,
  type HighlightSpot,
  type Station,
} from "@/app/lib/content";
import { hasValidCoordinates } from "@/app/lib/geo";

type Props = {
  stations: Station[];
  artisans: Artisan[];
  highlightSpots: HighlightSpot[];
};

const StationsTerritoryMap = dynamic(
  () =>
    import("@/components/stations-territory-map").then(
      (mod) => mod.StationsTerritoryMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center rounded-[1.85rem] bg-[#efd4b0] text-sm font-medium text-[#123a55]">
        Cargando mapa...
      </div>
    ),
  },
);

export function MapaClient({ stations, artisans, highlightSpots }: Props) {
  const totalWithCoords = useMemo(() => {
    return (
      stations.filter(hasValidCoordinates).length +
      artisans.filter(hasValidCoordinates).length +
      highlightSpots.filter(hasValidCoordinates).length
    );
  }, [artisans, highlightSpots, stations]);

  return (
    <>
      <StationsTerritoryMap
        stations={stations}
        artisans={artisans}
        highlightSpots={highlightSpots}
        showLayerControls={false}
        compactHeader
        showExplorer
        showLegend={false}
        showIconReferences
        warmTiles
      />

      {totalWithCoords === 0 ? (
        <div className="mt-4 rounded-[1.85rem] bg-[#efd4b0] px-6 py-10 text-center text-[#123a55]">
          <p className="text-lg font-black uppercase leading-none tracking-normal text-[#082d49]">
            Sin coordenadas visibles
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-[#123a55]/75">
            Ninguno de los registros visibles tiene coordenadas cargadas.
          </p>
        </div>
      ) : null}
    </>
  );
}
