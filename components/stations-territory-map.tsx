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

type NavigationTab = "stations" | "artisans" | "highlightSpots";

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

function normalizeMapText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function belongsToStation(
  item: {
    stationRecordId?: string;
    stationSlug?: string;
    stationName?: string;
    place?: string;
    location?: string;
  },
  station?: Station,
) {
  if (!station) return true;
  if (item.stationRecordId && item.stationRecordId === station.recordId) return true;
  if (item.stationSlug && item.stationSlug === station.slug) return true;

  const stationLabels = [
    station.name,
    formatMapStationName(station.name),
    station.locality,
  ].map(normalizeMapText);

  return [item.stationName, item.place, item.location].some((value) => {
    if (!value) return false;

    const normalizedValue = normalizeMapText(value);
    return stationLabels.some(
      (label) => label && (normalizedValue.includes(label) || label.includes(normalizedValue)),
    );
  });
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
  const [navigationTab, setNavigationTab] = useState<NavigationTab>("stations");
  const [visibleLayers, setVisibleLayers] = useState({
    stations: true,
    artisans: true,
    highlightSpots: true,
  });
  const effectiveSelectedSlug = selectedSlug ?? localSelectedSlug;
  const selectedStation = useMemo(
    () => {
      const explicitStation =
        stations.find((station) => station.slug === effectiveSelectedSlug) ??
        stations.find((station) => station.slug === activeSlug);

      if (explicitStation) return explicitStation;

      return (
        stations.find((station) =>
          (artisans ?? []).some((artisan) => belongsToStation(artisan, station)),
        ) ??
        stations.find((station) =>
          (highlightSpots ?? []).some((spot) => belongsToStation(spot, station)),
        ) ??
        stations[0]
      );
    },
    [activeSlug, artisans, effectiveSelectedSlug, highlightSpots, stations],
  );

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
  const selectedArtisans = useMemo(
    () => (artisans ?? []).filter((artisan) => belongsToStation(artisan, selectedStation)),
    [artisans, selectedStation],
  );
  const selectedHighlightSpots = useMemo(
    () => (highlightSpots ?? []).filter((spot) => belongsToStation(spot, selectedStation)),
    [highlightSpots, selectedStation],
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
  const navigationItems = [
    {
      key: "stations" as const,
      label: "Estaciones",
      count: stations.length,
    },
    {
      key: "artisans" as const,
      label: "Actores",
      count: selectedArtisans.length,
    },
    {
      key: "highlightSpots" as const,
      label: "Imperdibles",
      count: selectedHighlightSpots.length,
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

      <div className="mt-5 rounded-[1.35rem] border border-[#123a55]/15 bg-[#f5dfbd] p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/75">
              Navegacion
            </p>
            <p className="mt-1 text-lg font-black leading-tight tracking-normal text-[#082d49]">
              {selectedStation
                ? `Explorando ${formatMapStationName(selectedStation.name)}`
                : "Explora la ruta"}
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Tipo de contenido para navegar"
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          >
            {navigationItems.map((item) => {
              const active = navigationTab === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setNavigationTab(item.key)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black uppercase leading-none tracking-normal transition ${
                    active
                      ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                      : "border-[#123a55]/25 bg-[#efd4b0] text-[#123a55] hover:border-[#123a55]"
                  }`}
                >
                  {item.label} · {item.count}
                </button>
              );
            })}
          </div>
        </div>

        <div
          aria-label="Estaciones para enfocar en el mapa"
          className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          {stations.map((station) => {
            const isActive =
              station.slug === activeSlug || station.slug === effectiveSelectedSlug;

            return (
              <button
                key={`station-chip-${station.slug}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleSelectStation(station.slug)}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black leading-none tracking-normal transition ${
                  isActive
                    ? "border-[#7c3419] bg-[#7c3419] text-[#efd4b0]"
                    : "border-[#123a55]/25 bg-[#efd4b0] text-[#123a55] hover:border-[#123a55]"
                }`}
              >
                {formatMapStationName(station.name)}
              </button>
            );
          })}
        </div>

        {navigationTab === "stations" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {stations.map((station) => {
              const isActive =
                station.slug === activeSlug || station.slug === effectiveSelectedSlug;

              return (
                <div
                  key={station.slug}
                  className={`rounded-[1.15rem] border p-4 text-sm transition ${
                    isActive
                      ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                      : "border-[#123a55]/15 bg-[#123a55]/90 text-[#efd4b0]"
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
                  {station.slogan ? (
                    <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-[#efd4b0]/75">
                      {station.slogan}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectStation(station.slug)}
                      className="rounded-full border border-[#efd4b0]/35 px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
                    >
                      Enfocar
                    </button>
                    <Link
                      href={`/estaciones/${station.slug}`}
                      className="rounded-full bg-[#efd4b0] px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#123a55] hover:bg-white"
                    >
                      Abrir
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {navigationTab === "artisans" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {selectedArtisans.length > 0 ? (
              selectedArtisans.map((artisan) => (
                <Link
                  key={artisan.slug}
                  href={`/artesanas/${artisan.slug}`}
                  className="rounded-[1.15rem] border border-[#123a55]/15 bg-[#123a55]/90 p-4 text-sm text-[#efd4b0] transition hover:-translate-y-0.5 hover:bg-[#123a55]"
                >
                  <p className="text-[0.7rem] font-medium leading-none tracking-normal text-[#efd4b0]/75">
                    {artisan.actorType ?? "Actor"}
                  </p>
                  <p className="mt-1 font-black leading-tight tracking-normal text-[#efd4b0]">
                    {artisan.name}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-[#efd4b0]/75">
                    {artisan.craft}
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-[#efd4b0] px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
                    Ver perfil
                  </span>
                </Link>
              ))
            ) : (
              <p className="rounded-[1.15rem] border border-[#123a55]/15 bg-[#efd4b0] p-4 text-sm font-semibold text-[#123a55]/75 md:col-span-3">
                No hay actores vinculados a esta estacion. Proba con otra estacion.
              </p>
            )}
          </div>
        ) : null}

        {navigationTab === "highlightSpots" ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {selectedHighlightSpots.length > 0 ? (
              selectedHighlightSpots.map((spot) => (
                <Link
                  key={spot.slug}
                  href={`/imperdibles/${spot.slug}`}
                  className="rounded-[1.15rem] border border-[#123a55]/15 bg-[#123a55]/90 p-4 text-sm text-[#efd4b0] transition hover:-translate-y-0.5 hover:bg-[#123a55]"
                >
                  <p className="text-[0.7rem] font-medium leading-none tracking-normal text-[#efd4b0]/75">
                    {spot.type}
                  </p>
                  <p className="mt-1 font-black leading-tight tracking-normal text-[#efd4b0]">
                    {spot.title}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-[#efd4b0]/75">
                    {spot.subtitle || spot.location}
                  </p>
                  <span className="mt-4 inline-flex rounded-full bg-[#efd4b0] px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
                    Ver imperdible
                  </span>
                </Link>
              ))
            ) : (
              <p className="rounded-[1.15rem] border border-[#123a55]/15 bg-[#efd4b0] p-4 text-sm font-semibold text-[#123a55]/75 md:col-span-3">
                No hay imperdibles vinculados a esta estacion. Proba con otra estacion.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
