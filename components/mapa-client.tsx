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
  {
    id: "stations",
    label: "Estaciones",
    helper: "Nodos de entrada",
    colorClass: "bg-[#00d4ff]",
  },
  {
    id: "artisans",
    label: "Actores",
    helper: "Oficios y perfiles",
    colorClass: "bg-[#ff4fd8]",
  },
  {
    id: "highlightSpots",
    label: "Imperdibles",
    helper: "Paradas destacadas",
    colorClass: "bg-[#ffd400]",
  },
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
  const layerCounts = useMemo(
    () => ({
      stations: stations.filter(hasValidCoordinates).length,
      artisans: artisans.filter(hasValidCoordinates).length,
      highlightSpots: highlightSpots.filter(hasValidCoordinates).length,
    }),
    [artisans, highlightSpots, stations],
  );

  return (
    <>
      <div className="mb-5 rounded-[1.85rem] border border-[#efd4b0]/20 bg-[#efd4b0]/10 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]/70">
              Capas del mapa
            </p>
            <p className="mt-1 text-base font-black leading-tight tracking-normal text-[#f3d7b4]">
              Elegi que queres ver en el territorio
            </p>
          </div>
          <span
            className="shrink-0 rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] px-4 py-2 text-sm font-black uppercase leading-none tracking-normal text-[#123a55]"
            role="status"
            aria-live="polite"
          >
            {totalWithCoords} puntos en mapa
          </span>
        </div>
        <div
          role="group"
          aria-label="Capas visibles del mapa"
          className="grid gap-2 sm:grid-cols-3"
        >
          {LAYERS.map((layer) => {
            const pressed = active.has(layer.id);

            return (
              <button
                key={layer.id}
                type="button"
                aria-label={layer.label}
                aria-pressed={pressed}
                onClick={() => toggle(layer.id)}
                className={`min-w-0 rounded-[1.15rem] border p-3 text-left transition ${
                  pressed
                    ? "border-[#efd4b0] bg-[#efd4b0] text-[#123a55]"
                    : "border-[#efd4b0]/35 text-[#efd4b0] hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`h-3 w-3 shrink-0 rounded-full ring-2 ${
                      pressed ? "ring-[#123a55]/15" : "ring-[#efd4b0]/25"
                    } ${layer.colorClass}`}
                  />
                  <span className="min-w-0 text-sm font-black uppercase leading-none tracking-normal">
                    {layer.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-auto rounded-full bg-[#123a55]/10 px-2 py-1 text-xs font-black leading-none"
                  >
                    {layerCounts[layer.id]}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`mt-2 block text-xs font-medium leading-5 ${
                    pressed ? "text-[#123a55]/70" : "text-[#efd4b0]/70"
                  }`}
                >
                  {layer.helper}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <StationsTerritoryMap
        stations={active.has("stations") ? stations : []}
        artisans={active.has("artisans") ? artisans : []}
        highlightSpots={active.has("highlightSpots") ? highlightSpots : []}
        showLayerControls={false}
        compactHeader
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
