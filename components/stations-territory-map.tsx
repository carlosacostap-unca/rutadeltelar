"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  type Artisan,
  type HighlightSpot,
  type Station,
} from "@/app/lib/content";
import { hasValidCoordinates } from "@/app/lib/geo";
import { DeferredRender } from "@/components/deferred-render";
import { MapLoadingPlaceholder } from "@/components/map-loading-placeholder";

type StationsTerritoryMapProps = {
  stations: Station[];
  activeSlug?: string;
  selectedSlug?: string;
  onSelectStation?: (slug: string) => void;
  artisans?: Artisan[];
  highlightSpots?: HighlightSpot[];
};

const StationsTerritoryMapLeaflet = dynamic(
  () =>
    import("./stations-territory-map-leaflet").then(
      (mod) => mod.StationsTerritoryMapLeaflet,
    ),
  {
    ssr: false,
    loading: () => <MapLoadingPlaceholder label="Cargando mapa..." />,
  },
);

function formatMapStationName(value: string) {
  return value.replace(/^Estaci[oó]n\s+/i, "");
}

export function StationsTerritoryMap({
  stations,
  activeSlug,
  selectedSlug,
  onSelectStation,
  artisans,
  highlightSpots,
}: StationsTerritoryMapProps) {
  const [focusMode, setFocusMode] = useState<"all" | "active">("all");
  const [localSelectedSlug, setLocalSelectedSlug] = useState<string>();
  const [visibleLayers, setVisibleLayers] = useState({
    stations: true,
    artisans: true,
    highlightSpots: true,
  });
  const effectiveSelectedSlug = selectedSlug ?? localSelectedSlug;

  function handleSelectStation(slug: string) {
    setLocalSelectedSlug(slug);
    onSelectStation?.(slug);
  }

  const filteredStations = useMemo(() => {
    if (focusMode !== "active" || !activeSlug) {
      return stations;
    }

    return stations.filter((station) => station.slug === activeSlug);
  }, [activeSlug, focusMode, stations]);

  const filteredArtisans = useMemo(() => {
    if (focusMode !== "active" || !activeSlug) {
      return artisans ?? [];
    }

    return (artisans ?? []).filter((artisan) => artisan.stationSlug === activeSlug);
  }, [activeSlug, artisans, focusMode]);

  const filteredHighlightSpots = useMemo(() => {
    if (focusMode !== "active" || !activeSlug) {
      return highlightSpots ?? [];
    }

    return (highlightSpots ?? []).filter((spot) => spot.stationSlug === activeSlug);
  }, [activeSlug, focusMode, highlightSpots]);

  const counts = useMemo(
    () => ({
      stations: filteredStations.filter(hasValidCoordinates).length,
      artisans: filteredArtisans.filter(hasValidCoordinates).length,
      highlightSpots: filteredHighlightSpots.filter(hasValidCoordinates).length,
    }),
    [filteredArtisans, filteredHighlightSpots, filteredStations],
  );
  const layerItems = [
    {
      key: "stations" as const,
      label: "Estaciones",
      count: counts.stations,
      colorClass: "bg-[color:var(--accent)]",
      helper: "Nodos territoriales",
    },
    {
      key: "artisans" as const,
      label: "Actores",
      count: counts.artisans,
      colorClass: "bg-[color:var(--secondary)]",
      helper: "Perfiles geolocalizados",
    },
    {
      key: "highlightSpots" as const,
      label: "Imperdibles",
      count: counts.highlightSpots,
      colorClass: "bg-[color:var(--foreground)]",
      helper: "Puntos destacados",
    },
  ];

  return (
    <div className="rounded-[1.85rem] bg-[#efd4b0] p-4 text-[#123a55] shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
            Mapa territorial
          </p>
          <p className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
            Estaciones conectadas por territorio
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Controles del mapa territorial"
        className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap"
      >
        {activeSlug ? (
          <>
            <button
              type="button"
              aria-pressed={focusMode === "all"}
              onClick={() => setFocusMode("all")}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black uppercase leading-none tracking-normal ${
                focusMode === "all"
                  ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                  : "border-[#123a55]/35 text-[#123a55] hover:border-[#123a55] hover:bg-[#123a55] hover:text-[#efd4b0]"
              }`}
            >
              Toda la ruta
            </button>
            <button
              type="button"
              aria-pressed={focusMode === "active"}
              onClick={() => setFocusMode("active")}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black uppercase leading-none tracking-normal ${
                focusMode === "active"
                  ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                  : "border-[#123a55]/35 text-[#123a55] hover:border-[#123a55] hover:bg-[#123a55] hover:text-[#efd4b0]"
              }`}
            >
              Solo estacion activa
            </button>
          </>
        ) : null}
        {layerItems.map((item) => {
          const active = visibleLayers[item.key];

          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={active}
              onClick={() =>
                setVisibleLayers((current) => ({
                  ...current,
                  [item.key]: !current[item.key],
                }))
              }
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black uppercase leading-none tracking-normal ${
                active
                  ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                  : "border-[#123a55]/35 text-[#123a55] hover:border-[#123a55] hover:bg-[#123a55] hover:text-[#efd4b0]"
              }`}
            >
              {item.label} · {item.count}
            </button>
          );
        })}
      </div>

      <div className="mb-5 grid gap-4 rounded-[1.35rem] border border-[#123a55]/20 bg-[#123a55]/5 p-4 md:grid-cols-3">
        {layerItems.map((item) => (
          <div key={`legend-${item.key}`} className="flex items-start gap-3">
            <span
              className={`mt-1 inline-flex h-3 w-3 shrink-0 rounded-full ${item.colorClass}`}
            />
            <div>
              <p className="text-sm font-black uppercase leading-none tracking-normal text-[#082d49]">
                {item.label}
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-[#123a55]/75">
                {item.helper}. Disponibles en mapa: {item.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <DeferredRender fallback={<MapLoadingPlaceholder label="Mapa listo al acercarte..." />}>
        <StationsTerritoryMapLeaflet
          stations={filteredStations}
          activeSlug={activeSlug}
          selectedSlug={effectiveSelectedSlug}
          onSelectStation={handleSelectStation}
          artisans={filteredArtisans}
          highlightSpots={filteredHighlightSpots}
          showStations={visibleLayers.stations}
          showArtisans={visibleLayers.artisans}
          showHighlightSpots={visibleLayers.highlightSpots}
        />
      </DeferredRender>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {stations.map((station) => {
          const isActive =
            station.slug === activeSlug || station.slug === effectiveSelectedSlug;

          return (
            <button
              key={station.slug}
              type="button"
              onClick={() => handleSelectStation(station.slug)}
              className={`rounded-[1.15rem] border px-4 py-4 text-left text-sm transition hover:-translate-y-0.5 ${
                isActive
                  ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                  : "border-[#123a55]/15 bg-[#123a55]/90 text-[#efd4b0] hover:bg-[#123a55]"
              }`}
            >
              {station.department ? (
                <p className="text-[0.7rem] font-medium leading-none tracking-normal text-[#efd4b0]/75">
                  {station.department}
                </p>
              ) : null}
              <p className="mt-1 font-black leading-tight tracking-normal text-[#efd4b0]">
                {formatMapStationName(station.name)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
