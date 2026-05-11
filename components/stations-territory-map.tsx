"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  type Artisan,
  type HighlightSpot,
  type Station,
} from "@/app/lib/content";
import { hasValidCoordinates } from "@/app/lib/geo";

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
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-strong)_100%)] text-sm text-[color:var(--text-muted)] sm:h-[460px]">
        Cargando mapa...
      </div>
    ),
  },
);

export function StationsTerritoryMap({
  stations,
  activeSlug,
  selectedSlug,
  onSelectStation,
  artisans,
  highlightSpots,
}: StationsTerritoryMapProps) {
  const [focusMode, setFocusMode] = useState<"all" | "active">("all");
  const [visibleLayers, setVisibleLayers] = useState({
    stations: true,
    artisans: true,
    highlightSpots: true,
  });

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
    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-3 soft-shadow sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
            Mapa territorial
          </p>
          <p className="display-font mt-2 text-3xl text-[color:var(--foreground)]">
            Estaciones conectadas por territorio
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Controles del mapa territorial"
        className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap"
      >
        {activeSlug ? (
          <>
            <button
              type="button"
              aria-pressed={focusMode === "all"}
              onClick={() => setFocusMode("all")}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                focusMode === "all"
                  ? "border-[color:var(--accent)] bg-[rgba(138,69,43,0.08)] text-[color:var(--foreground)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
              }`}
            >
              Toda la ruta
            </button>
            <button
              type="button"
              aria-pressed={focusMode === "active"}
              onClick={() => setFocusMode("active")}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                focusMode === "active"
                  ? "border-[color:var(--accent)] bg-[rgba(138,69,43,0.08)] text-[color:var(--foreground)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
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
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                active
                  ? "border-[color:var(--accent)] bg-[rgba(138,69,43,0.08)] text-[color:var(--foreground)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
              }`}
            >
              {item.label} · {item.count}
            </button>
          );
        })}
      </div>

      <div className="mb-4 grid gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 md:grid-cols-3">
        {layerItems.map((item) => (
          <div key={`legend-${item.key}`} className="flex items-start gap-3">
            <span
              className={`mt-1 inline-flex h-3 w-3 shrink-0 rounded-full ${item.colorClass}`}
            />
            <div>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {item.label}
              </p>
              <p className="text-xs leading-5 text-[color:var(--text-muted)]">
                {item.helper}. Disponibles en mapa: {item.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <StationsTerritoryMapLeaflet
        stations={filteredStations}
        activeSlug={activeSlug}
        selectedSlug={selectedSlug}
        onSelectStation={onSelectStation}
        artisans={filteredArtisans}
        highlightSpots={filteredHighlightSpots}
        showStations={visibleLayers.stations}
        showArtisans={visibleLayers.artisans}
        showHighlightSpots={visibleLayers.highlightSpots}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {stations.map((station) => {
          const isActive = station.slug === activeSlug;

          return (
            <Link
              key={station.slug}
              href={`/estaciones/${station.slug}`}
              className={`rounded-xl border px-4 py-3 text-sm ${
                isActive
                  ? "border-[color:var(--accent)] bg-[rgba(138,69,43,0.08)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)]"
              }`}
            >
              <p className="font-semibold text-[color:var(--foreground)]">
                {station.locality}
              </p>
              <p className="mt-1 text-[color:var(--text-muted)]">
                {typeof station.latitude === "number" &&
                typeof station.longitude === "number"
                  ? `${station.latitude.toFixed(2)}, ${station.longitude.toFixed(2)}`
                  : "Sin coordenadas"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
