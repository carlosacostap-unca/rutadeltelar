"use client";

import { useMemo, useState, type ReactNode } from "react";
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
  showLayerControls?: boolean;
  compactHeader?: boolean;
  warmTiles?: boolean;
};

type NavigationTab = "stations" | "artisans" | "highlightSpots";
type LayerKey = "stations" | "artisans" | "highlightSpots";

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
  return value.replace(/^Estaci[oÃ³]n\s+/i, "");
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
      (label) =>
        label &&
        (normalizedValue.includes(label) || label.includes(normalizedValue)),
    );
  });
}

function StationName({ station }: { station: Station }) {
  return <>{formatMapStationName(station.name)}</>;
}

function EmptyPanel({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[1.15rem] border border-[#123a55]/15 bg-[#efd4b0] p-4 text-sm font-semibold leading-6 text-[#123a55]/75">
      {children}
    </p>
  );
}

export function StationsTerritoryMap({
  stations,
  activeSlug,
  selectedSlug,
  onSelectStation,
  artisans,
  highlightSpots,
  showLayerControls = true,
  compactHeader = false,
  warmTiles = false,
}: StationsTerritoryMapProps) {
  const [focusMode, setFocusMode] = useState<"all" | "active">("all");
  const [localSelectedSlug, setLocalSelectedSlug] = useState<string>();
  const [navigationTab, setNavigationTab] = useState<NavigationTab>("stations");
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    stations: true,
    artisans: true,
    highlightSpots: true,
  });
  const effectiveSelectedSlug = selectedSlug ?? localSelectedSlug;
  const selectedStation = useMemo(() => {
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
  }, [activeSlug, artisans, effectiveSelectedSlug, highlightSpots, stations]);

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
  const totalVisiblePoints =
    counts.stations + counts.artisans + counts.highlightSpots;
  const selectedArtisans = useMemo(
    () =>
      (artisans ?? []).filter((artisan) =>
        belongsToStation(artisan, selectedStation),
      ),
    [artisans, selectedStation],
  );
  const selectedHighlightSpots = useMemo(
    () =>
      (highlightSpots ?? []).filter((spot) =>
        belongsToStation(spot, selectedStation),
      ),
    [highlightSpots, selectedStation],
  );
  const layerItems = [
    {
      key: "stations" as const,
      label: "Estaciones",
      count: counts.stations,
      colorClass: "bg-[#9d4d2e]",
      helper: "Nodos territoriales",
    },
    {
      key: "artisans" as const,
      label: "Actores",
      count: counts.artisans,
      colorClass: "bg-[#61644a]",
      helper: "Perfiles geolocalizados",
    },
    {
      key: "highlightSpots" as const,
      label: "Imperdibles",
      count: counts.highlightSpots,
      colorClass: "bg-[#3d2414]",
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
    <section className="rounded-[1.85rem] bg-[#efd4b0] p-4 text-[#123a55] shadow-sm sm:p-6">
      {!compactHeader ? (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
              Mapa territorial
            </p>
            <p className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
              Estaciones conectadas por territorio
            </p>
          </div>
          <span className="rounded-full border border-[#123a55]/20 bg-[#123a55]/10 px-4 py-2 text-xs font-black uppercase leading-none tracking-normal text-[#082d49]">
            {totalVisiblePoints} puntos visibles
          </span>
        </div>
      ) : null}

      {showLayerControls ? (
        <div
          role="group"
          aria-label="Controles del mapa territorial"
          className="mb-5 flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
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
                {item.label} <span aria-hidden="true">· {item.count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
        <div className="min-w-0">
          <DeferredRender
            fallback={<MapLoadingPlaceholder label="Mapa listo al acercarte..." />}
          >
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
              warmTiles={warmTiles}
            />
          </DeferredRender>

          <div className="mt-4 grid gap-3 rounded-[1.35rem] border border-[#123a55]/20 bg-[#123a55]/5 p-4 md:grid-cols-3">
            {layerItems.map((item) => (
              <div key={`legend-${item.key}`} className="flex items-start gap-3">
                <span
                  className={`mt-1 inline-flex h-3 w-3 shrink-0 rounded-full ring-2 ring-[#efd4b0] ${item.colorClass}`}
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
        </div>

        <aside className="min-w-0 rounded-[1.35rem] border border-[#123a55]/15 bg-[#f5dfbd] p-3 sm:p-4">
          <div>
            <p className="text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/75">
              Explorador
            </p>
            <p className="mt-1 text-xl font-black leading-tight tracking-normal text-[#082d49]">
              {selectedStation ? (
                <>
                  <StationName station={selectedStation} />
                </>
              ) : (
                "Ruta del Telar"
              )}
            </p>
            {selectedStation ? (
              <p className="mt-2 text-sm font-medium leading-6 text-[#123a55]/75">
                {selectedStation.slogan ||
                  selectedStation.summary ||
                  "Selecciona una estacion para ver actores e imperdibles vinculados."}
              </p>
            ) : (
              <p className="mt-2 text-sm font-medium leading-6 text-[#123a55]/75">
                Selecciona una estacion para sincronizar el mapa con su ficha territorial.
              </p>
            )}
          </div>

          <div
            aria-label="Estaciones para enfocar en el mapa"
            className="mt-4 flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:pr-0 lg:flex-col lg:overflow-visible lg:pr-0"
          >
            {stations.length > 0 ? (
              stations.map((station) => {
                const isActive =
                  station.slug === activeSlug ||
                  station.slug === effectiveSelectedSlug;

                return (
                  <button
                    key={`station-chip-${station.slug}`}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSelectStation(station.slug)}
                    className={`flex min-w-[11rem] shrink-0 items-center justify-between gap-3 rounded-[1rem] border px-3 py-2 text-left text-xs font-black leading-tight tracking-normal transition lg:min-w-0 ${
                      isActive
                        ? "border-[#7c3419] bg-[#7c3419] text-[#efd4b0]"
                        : "border-[#123a55]/25 bg-[#efd4b0] text-[#123a55] hover:border-[#123a55]"
                    }`}
                  >
                    <span className="min-w-0">
                      <StationName station={station} />
                    </span>
                    {hasValidCoordinates(station) ? (
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          isActive ? "bg-[#efd4b0]" : "bg-[#7c3419]"
                        }`}
                      />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <EmptyPanel>No hay estaciones visibles con la capa actual.</EmptyPanel>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Tipo de contenido para navegar"
            className="mt-4 grid grid-cols-3 gap-2"
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
                  className={`min-w-0 rounded-[0.85rem] border px-2 py-2 text-center text-[0.68rem] font-black uppercase leading-none tracking-normal transition ${
                    active
                      ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                      : "border-[#123a55]/25 bg-[#efd4b0] text-[#123a55] hover:border-[#123a55]"
                  }`}
                >
                  <span className="block truncate">{item.label}</span>
                  <span className="mt-1 block text-sm">{item.count}</span>
                </button>
              );
            })}
          </div>

          {navigationTab === "stations" ? (
            <div className="mt-4 space-y-3">
              {stations.length > 0 ? (
                stations.map((station) => {
                  const isActive =
                    station.slug === activeSlug ||
                    station.slug === effectiveSelectedSlug;

                  return (
                    <article
                      key={station.slug}
                      className={`rounded-[1.15rem] border p-4 text-sm transition ${
                        isActive
                          ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                          : "border-[#123a55]/15 bg-[#123a55]/90 text-[#efd4b0]"
                      }`}
                    >
                      {station.department ? (
                        <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#efd4b0]/75">
                          {station.department}
                        </p>
                      ) : null}
                      <p className="mt-1 font-black leading-tight tracking-normal text-[#efd4b0]">
                        <StationName station={station} />
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
                    </article>
                  );
                })
              ) : (
                <EmptyPanel>No hay estaciones para listar con la capa actual.</EmptyPanel>
              )}
            </div>
          ) : null}

          {navigationTab === "artisans" ? (
            <div className="mt-4 space-y-3">
              {selectedArtisans.length > 0 ? (
                selectedArtisans.map((artisan) => (
                  <Link
                    key={artisan.slug}
                    href={`/artesanas/${artisan.slug}`}
                    className="block rounded-[1.15rem] border border-[#123a55]/15 bg-[#123a55]/90 p-4 text-sm text-[#efd4b0] transition hover:-translate-y-0.5 hover:bg-[#123a55]"
                  >
                    <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#efd4b0]/75">
                      {artisan.actorType ?? "Actor"}
                    </p>
                    <p className="mt-1 font-black leading-tight tracking-normal text-[#efd4b0]">
                      {artisan.name}
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-[#efd4b0]/75">
                      {artisan.craft || artisan.place}
                    </p>
                    <span className="mt-4 inline-flex rounded-full bg-[#efd4b0] px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
                      Ver perfil
                    </span>
                  </Link>
                ))
              ) : (
                <EmptyPanel>
                  No hay actores vinculados a esta estacion. Proba con otra estacion.
                </EmptyPanel>
              )}
            </div>
          ) : null}

          {navigationTab === "highlightSpots" ? (
            <div className="mt-4 space-y-3">
              {selectedHighlightSpots.length > 0 ? (
                selectedHighlightSpots.map((spot) => (
                  <Link
                    key={spot.slug}
                    href={`/imperdibles/${spot.slug}`}
                    className="block rounded-[1.15rem] border border-[#123a55]/15 bg-[#123a55]/90 p-4 text-sm text-[#efd4b0] transition hover:-translate-y-0.5 hover:bg-[#123a55]"
                  >
                    <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#efd4b0]/75">
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
                <EmptyPanel>
                  No hay imperdibles vinculados a esta estacion. Proba con otra estacion.
                </EmptyPanel>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
