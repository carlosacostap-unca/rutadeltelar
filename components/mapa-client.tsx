"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
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

const LAYERS = [
  { id: "stations", label: "Estaciones" },
  { id: "artisans", label: "Actores" },
  { id: "highlightSpots", label: "Imperdibles" },
] as const;

type LayerId = (typeof LAYERS)[number]["id"];

export function MapaClient({ stations, artisans, highlightSpots }: Props) {
  const [active, setActive] = useState<Set<LayerId>>(
    new Set(["stations", "artisans", "highlightSpots"]),
  );

  const toggle = (id: LayerId) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalWithCoords = useMemo(() => {
    let n = 0;
    if (active.has("stations")) {
      n += stations.filter(hasValidCoordinates).length;
    }
    if (active.has("artisans")) {
      n += artisans.filter(hasValidCoordinates).length;
    }
    if (active.has("highlightSpots")) {
      n += highlightSpots.filter(hasValidCoordinates).length;
    }
    return n;
  }, [active, stations, artisans, highlightSpots]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          role="group"
          aria-label="Capas visibles del mapa"
          className="flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
        >
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              aria-pressed={active.has(layer.id)}
              onClick={() => toggle(layer.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
                active.has(layer.id)
                  ? "border-[#efd4b0] bg-[#efd4b0] text-[#123a55]"
                  : "border-[#efd4b0]/35 text-[#efd4b0] hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
        <span
          className="shrink-0 self-start rounded-full border border-[#efd4b0]/30 bg-[#efd4b0]/15 px-4 py-2 text-sm font-black uppercase leading-none tracking-normal text-[#efd4b0] sm:ml-auto sm:self-center"
          role="status"
          aria-live="polite"
        >
          {totalWithCoords} puntos en mapa
        </span>
      </div>

      <StationsTerritoryMap
        stations={active.has("stations") ? stations : []}
        artisans={active.has("artisans") ? artisans : []}
        highlightSpots={active.has("highlightSpots") ? highlightSpots : []}
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
