"use client";

import { useMemo, useState, type ReactNode } from "react";
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
  showLayerControls?: boolean;
  compactHeader?: boolean;
  showExplorer?: boolean;
  showLegend?: boolean;
  showIconReferences?: boolean;
  warmTiles?: boolean;
  routeGeometry?: Array<[number, number]>;
  initialVisibleLayers?: Partial<Record<LayerKey, boolean>>;
  scopeRelatedEntitiesToStations?: boolean;
  compactLayerControls?: boolean;
  title?: string;
  initialZoom?: number;
};

type ExplorerView = "stations" | "choices" | "artisans" | "highlightSpots";
type LayerKey = "stations" | "artisans" | "highlightSpots";
type MapFocusPoint = {
  key: string;
  latitude: number;
  longitude: number;
  zoom?: number;
};

const MAP_ENTITY_CARD_FOCUS_ZOOM = 16;

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

function MapReferenceIcon({ kind }: { kind: LayerKey }) {
  const className = {
    stations: "bg-[#00d4ff]",
    artisans: "bg-[#ff4fd8]",
    highlightSpots: "bg-[#ffd400]",
  }[kind];
  const iconClassName =
    "h-3 w-3 fill-none stroke-[#10283b] stroke-[2.1] [stroke-linecap:round] [stroke-linejoin:round] sm:h-4 sm:w-4";

  return (
    <span
      aria-hidden="true"
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-[#10283b] shadow-[0_0_0_2px_rgba(255,255,255,0.78)] sm:h-8 sm:w-8 sm:border-[3px] ${className}`}
    >
      {kind === "stations" ? (
        <svg viewBox="0 0 24 24" className={iconClassName}>
          <path d="M3.5 11.5 12 4l8.5 7.5" />
          <path d="M5.5 10.5V20h13v-9.5" />
          <path d="M9.5 20v-5h5v5" />
        </svg>
      ) : null}
      {kind === "artisans" ? (
        <svg viewBox="0 0 24 24" className={iconClassName}>
          <circle cx="12" cy="6.5" r="3" />
          <path d="M5.5 20c1.1-5 3.2-7.5 6.5-7.5s5.4 2.5 6.5 7.5" />
          <path d="M4.5 14.5h15" />
          <path d="M6.5 17h11" />
        </svg>
      ) : null}
      {kind === "highlightSpots" ? (
        <svg viewBox="0 0 24 24" className={iconClassName}>
          <path d="m12 3 2.6 5.4 6 .8-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.8L12 3Z" />
        </svg>
      ) : null}
    </span>
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
  showExplorer = true,
  showLegend = true,
  showIconReferences = false,
  warmTiles = false,
  routeGeometry,
  initialVisibleLayers,
  scopeRelatedEntitiesToStations = false,
  compactLayerControls = false,
  title = "Estaciones conectadas por territorio",
  initialZoom,
}: StationsTerritoryMapProps) {
  const [focusMode, setFocusMode] = useState<"all" | "active">("all");
  const [localSelectedSlug, setLocalSelectedSlug] = useState<string>();
  const [explorerView, setExplorerView] = useState<ExplorerView>("stations");
  const [selectedFocusPoint, setSelectedFocusPoint] = useState<MapFocusPoint>();
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>(
    () => ({
      stations: initialVisibleLayers?.stations ?? true,
      artisans: initialVisibleLayers?.artisans ?? true,
      highlightSpots: initialVisibleLayers?.highlightSpots ?? true,
    }),
  );
  const scopedArtisans = useMemo(() => {
    const items = artisans ?? [];

    if (!scopeRelatedEntitiesToStations) {
      return items;
    }

    return items.filter((artisan) =>
      stations.some((station) => belongsToStation(artisan, station)),
    );
  }, [artisans, scopeRelatedEntitiesToStations, stations]);
  const scopedHighlightSpots = useMemo(() => {
    const items = highlightSpots ?? [];

    if (!scopeRelatedEntitiesToStations) {
      return items;
    }

    return items.filter((spot) =>
      stations.some((station) => belongsToStation(spot, station)),
    );
  }, [highlightSpots, scopeRelatedEntitiesToStations, stations]);
  const effectiveSelectedSlug = selectedSlug ?? localSelectedSlug;
  const selectedStation = useMemo(() => {
    const explicitStation =
      stations.find((station) => station.slug === effectiveSelectedSlug) ??
      stations.find((station) => station.slug === activeSlug);

    if (explicitStation) return explicitStation;

    return (
      stations.find((station) =>
        scopedArtisans.some((artisan) => belongsToStation(artisan, station)),
      ) ??
      stations.find((station) =>
        scopedHighlightSpots.some((spot) => belongsToStation(spot, station)),
      ) ??
      stations[0]
    );
  }, [
    activeSlug,
    effectiveSelectedSlug,
    scopedArtisans,
    scopedHighlightSpots,
    stations,
  ]);

  function handleSelectStation(station: Station) {
    setLocalSelectedSlug(station.slug);
    setExplorerView("choices");
    if (hasValidCoordinates(station)) {
      setSelectedFocusPoint({
        key: `station-${station.slug}`,
        latitude: station.latitude,
        longitude: station.longitude,
      });
    }
    onSelectStation?.(station.slug);
  }

  function handleFocusEntity(
    kind: "artisan" | "highlight",
    entity: Artisan | HighlightSpot,
  ) {
    if (!hasValidCoordinates(entity)) {
      return;
    }

    setSelectedFocusPoint({
      key: `${kind}-${entity.slug}`,
      latitude: entity.latitude,
      longitude: entity.longitude,
      zoom: MAP_ENTITY_CARD_FOCUS_ZOOM,
    });
  }

  function handleExplorerBack() {
    setExplorerView((current) =>
      current === "artisans" || current === "highlightSpots"
        ? "choices"
        : "stations",
    );
  }

  const filteredStations = useMemo(() => {
    if (focusMode !== "active" || !activeSlug) {
      return stations;
    }

    return stations.filter((station) => station.slug === activeSlug);
  }, [activeSlug, focusMode, stations]);

  const filteredArtisans = useMemo(() => {
    if (focusMode !== "active" || !activeSlug) {
      return scopedArtisans;
    }

    return scopedArtisans.filter(
      (artisan) => artisan.stationSlug === activeSlug,
    );
  }, [activeSlug, focusMode, scopedArtisans]);

  const filteredHighlightSpots = useMemo(() => {
    if (focusMode !== "active" || !activeSlug) {
      return scopedHighlightSpots;
    }

    return scopedHighlightSpots.filter(
      (spot) => spot.stationSlug === activeSlug,
    );
  }, [activeSlug, focusMode, scopedHighlightSpots]);

  const counts = useMemo(
    () => ({
      stations: filteredStations.filter(hasValidCoordinates).length,
      artisans: filteredArtisans.filter(hasValidCoordinates).length,
      highlightSpots: filteredHighlightSpots.filter(hasValidCoordinates).length,
    }),
    [filteredArtisans, filteredHighlightSpots, filteredStations],
  );
  const totalVisiblePoints =
    (visibleLayers.stations ? counts.stations : 0) +
    (visibleLayers.artisans ? counts.artisans : 0) +
    (visibleLayers.highlightSpots ? counts.highlightSpots : 0);
  const selectedArtisans = useMemo(
    () =>
      scopedArtisans.filter((artisan) =>
        belongsToStation(artisan, selectedStation),
      ),
    [scopedArtisans, selectedStation],
  );
  const selectedHighlightSpots = useMemo(
    () =>
      scopedHighlightSpots.filter((spot) =>
        belongsToStation(spot, selectedStation),
      ),
    [scopedHighlightSpots, selectedStation],
  );
  const layerItems = [
    {
      key: "stations" as const,
      label: "Estaciones",
      count: counts.stations,
      colorClass: "bg-[#00d4ff]",
      helper: "Nodos territoriales",
    },
    {
      key: "artisans" as const,
      label: "Actores ubicados",
      count: counts.artisans,
      colorClass: "bg-[#ff4fd8]",
      helper: "Perfiles geolocalizados",
    },
    {
      key: "highlightSpots" as const,
      label: "Imperdibles",
      count: counts.highlightSpots,
      colorClass: "bg-[#ffd400]",
      helper: "Puntos destacados",
    },
  ];
  const explorerTitle =
    explorerView === "stations"
      ? "Estaciones"
      : selectedStation
        ? formatMapStationName(selectedStation.name)
        : "Ruta del Telar";
  const explorerHeightClass = showIconReferences
    ? "h-[446px] sm:h-[596px]"
    : "h-[380px] sm:h-[520px]";

  return (
    <section className="rounded-[1.85rem] bg-[#efd4b0] p-4 text-[#123a55] shadow-sm sm:p-6">
      {!compactHeader ? (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
              Mapa territorial
            </p>
            <p className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
              {title}
            </p>
          </div>
          <span className="rounded-full border border-[#123a55]/20 bg-[#123a55]/10 px-4 py-2 text-xs font-black uppercase leading-none tracking-normal text-[#082d49]">
            {totalVisiblePoints} punto{totalVisiblePoints !== 1 ? "s" : ""} visible
            {totalVisiblePoints !== 1 ? "s" : ""}
          </span>
        </div>
      ) : null}

      {showLayerControls ? (
        <div
          role="group"
          aria-label="Controles del mapa territorial"
          className={
            compactLayerControls && !activeSlug
              ? "mb-5 grid grid-cols-3 gap-2"
              : "mb-5 flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
          }
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
                Solo estación activa
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
                className={`rounded-full border font-black uppercase leading-none tracking-normal ${
                  compactLayerControls && !activeSlug
                    ? "min-w-0 px-2 py-2.5 text-[0.68rem] sm:px-4 sm:text-sm"
                    : "shrink-0 px-4 py-2 text-sm"
                } ${
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

      <div
        className={
          showExplorer
            ? "grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]"
            : "grid gap-4"
        }
      >
        <div className="min-w-0">
          <DeferredRender
            fallback={<MapLoadingPlaceholder label="Mapa listo al acercarte..." />}
          >
            <StationsTerritoryMapLeaflet
              stations={filteredStations}
              activeSlug={activeSlug}
              selectedSlug={effectiveSelectedSlug}
              selectedFocusPoint={selectedFocusPoint}
              onSelectStation={(slug) => {
                const station = stations.find((item) => item.slug === slug);
                if (station) {
                  handleSelectStation(station);
                }
              }}
              artisans={filteredArtisans}
              highlightSpots={filteredHighlightSpots}
              showStations={visibleLayers.stations}
              showArtisans={visibleLayers.artisans}
              showHighlightSpots={visibleLayers.highlightSpots}
              warmTiles={warmTiles}
              routeGeometry={routeGeometry}
              initialZoom={initialZoom}
            />
          </DeferredRender>

          {showIconReferences ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[1.15rem] border border-[#123a55]/20 bg-[#123a55]/5 p-2 text-[#082d49] sm:mt-4 sm:gap-3 sm:p-3">
              <p className="mr-0 text-[0.62rem] font-black uppercase leading-none tracking-normal text-[#123a55]/75 sm:mr-1 sm:text-xs">
                Referencias
              </p>
              {layerItems.map((item) => (
                <div key={`icon-reference-${item.key}`} className="flex items-center gap-1.5 sm:gap-2">
                  <MapReferenceIcon kind={item.key} />
                  <span className="text-[0.68rem] font-black uppercase leading-none tracking-normal sm:text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {showLegend ? (
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
          ) : null}
        </div>

        {showExplorer ? (
          <aside
            className={`flex ${explorerHeightClass} min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-[#123a55]/15 bg-[#f5dfbd]`}
          >
            <div className="shrink-0 border-b border-[#123a55]/15 p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xl font-black leading-tight tracking-normal text-[#082d49]">
                    {explorerTitle}
                  </p>
                </div>
                {explorerView !== "stations" ? (
                  <button
                    type="button"
                    onClick={handleExplorerBack}
                    className="shrink-0 rounded-full border border-[#123a55]/25 px-3 py-1.5 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55] hover:border-[#123a55] hover:bg-[#123a55] hover:text-[#efd4b0]"
                  >
                    Volver
                  </button>
                ) : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 pr-2 sm:p-4 sm:pr-3">
              {explorerView === "stations" ? (
                <div className="flex flex-col gap-3" aria-label="Estaciones para navegar">
                  {stations.length > 0 ? (
                    stations.map((station) => {
                      const isActive =
                        station.slug === activeSlug ||
                        station.slug === effectiveSelectedSlug;

                      return (
                        <button
                          key={station.slug}
                          type="button"
                          onClick={() => handleSelectStation(station)}
                          className={`w-full rounded-[1.15rem] border p-4 text-sm transition ${
                            isActive
                              ? "border-[#123a55] bg-[#123a55] text-[#efd4b0]"
                              : "border-[#123a55]/15 bg-[#123a55]/90 text-[#efd4b0]"
                          } text-left hover:-translate-y-0.5`}
                        >
                          {station.department ? (
                            <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#efd4b0]/75">
                              {station.department}
                            </p>
                          ) : null}
                          <p className="mt-1 font-black leading-tight tracking-normal text-[#efd4b0]">
                            <StationName station={station} />
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <EmptyPanel>No hay estaciones para listar con la capa actual.</EmptyPanel>
                  )}
                </div>
              ) : null}

              {explorerView === "choices" ? (
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => setExplorerView("artisans")}
                    className="rounded-[1.15rem] border border-[#123a55]/15 bg-[#123a55] p-4 text-left text-[#efd4b0] transition hover:-translate-y-0.5"
                  >
                    <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#efd4b0]/75">
                      Contenido vinculado
                    </p>
                    <p className="mt-1 text-lg font-black leading-tight">Actores</p>
                    <p className="mt-2 text-xs font-medium leading-5 text-[#efd4b0]/75">
                      {selectedArtisans.length} perfil{selectedArtisans.length !== 1 ? "es" : ""} en esta estación.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplorerView("highlightSpots")}
                    className="rounded-[1.15rem] border border-[#123a55]/15 bg-[#123a55] p-4 text-left text-[#efd4b0] transition hover:-translate-y-0.5"
                  >
                    <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#efd4b0]/75">
                      Contenido vinculado
                    </p>
                    <p className="mt-1 text-lg font-black leading-tight">Imperdibles</p>
                    <p className="mt-2 text-xs font-medium leading-5 text-[#efd4b0]/75">
                      {selectedHighlightSpots.length} punto{selectedHighlightSpots.length !== 1 ? "s" : ""} destacado{selectedHighlightSpots.length !== 1 ? "s" : ""}.
                    </p>
                  </button>
                </div>
              ) : null}

              {explorerView === "artisans" ? (
                <div className="space-y-3">
                  {selectedArtisans.length > 0 ? (
                    selectedArtisans.map((artisan) => (
                      <button
                        key={artisan.slug}
                        type="button"
                        onClick={() => handleFocusEntity("artisan", artisan)}
                        className="block w-full rounded-[1.15rem] border border-[#123a55]/15 bg-[#123a55]/90 p-4 text-left text-sm text-[#efd4b0] transition hover:-translate-y-0.5 hover:bg-[#123a55]"
                      >
                        <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#efd4b0]/75">
                          {artisan.actorType ?? "Actor"}
                        </p>
                        <p className="mt-1 font-black leading-tight tracking-normal text-[#efd4b0]">
                          {artisan.name}
                        </p>
                      </button>
                    ))
                  ) : (
                    <EmptyPanel>
                      No hay actores vinculados a esta estación. Volvé y probá con otra estación.
                    </EmptyPanel>
                  )}
                </div>
              ) : null}

              {explorerView === "highlightSpots" ? (
                <div className="space-y-3">
                  {selectedHighlightSpots.length > 0 ? (
                    selectedHighlightSpots.map((spot) => (
                      <button
                        key={spot.slug}
                        type="button"
                        onClick={() => handleFocusEntity("highlight", spot)}
                        className="block w-full rounded-[1.15rem] border border-[#123a55]/15 bg-[#123a55]/90 p-4 text-left text-sm text-[#efd4b0] transition hover:-translate-y-0.5 hover:bg-[#123a55]"
                      >
                        <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#efd4b0]/75">
                          {spot.type}
                        </p>
                        <p className="mt-1 font-black leading-tight tracking-normal text-[#efd4b0]">
                          {spot.title}
                        </p>
                      </button>
                    ))
                  ) : (
                    <EmptyPanel>
                      No hay imperdibles vinculados a esta estación. Volvé y probá con otra estación.
                    </EmptyPanel>
                  )}
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
