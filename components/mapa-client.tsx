"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { type Artisan, type HighlightSpot, type Station } from "@/app/lib/content";
import { hasValidCoordinates } from "@/app/lib/geo";
import { SurfaceCard } from "@/components/surface-card";

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
      <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-sm text-[color:var(--text-muted)]">
        Cargando mapa…
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
    if (active.has("stations"))
      n += stations.filter(hasValidCoordinates).length;
    if (active.has("artisans"))
      n += artisans.filter(hasValidCoordinates).length;
    if (active.has("highlightSpots"))
      n += highlightSpots.filter(hasValidCoordinates).length;
    return n;
  }, [active, stations, artisans, highlightSpots]);

  return (
    <>
      {/* Filtros de capa */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => toggle(layer.id)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              active.has(layer.id)
                ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
            }`}
          >
            {layer.label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-[color:var(--text-muted)]">
          {totalWithCoords} puntos en mapa
        </span>
      </div>

      {/* Mapa */}
      <div>
        <StationsTerritoryMap
          stations={active.has("stations") ? stations : []}
          artisans={active.has("artisans") ? artisans : []}
          highlightSpots={active.has("highlightSpots") ? highlightSpots : []}
        />
      </div>

      {totalWithCoords === 0 && (
        <SurfaceCard className="mt-4 py-10 text-center">
          <p className="text-2xl">🗺️</p>
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            Ninguno de los registros visibles tiene coordenadas cargadas.
          </p>
        </SurfaceCard>
      )}
    </>
  );
}
