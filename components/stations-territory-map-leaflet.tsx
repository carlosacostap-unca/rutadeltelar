"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { divIcon } from "leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  ScaleControl,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  type Artisan,
  type HighlightSpot,
  type Station,
} from "@/app/lib/content";
import { hasValidCoordinates } from "@/app/lib/geo";
import { getImageFocusStyle, type ImageFocus } from "@/app/lib/image-focus";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { SATELLITE_REFERENCE_MAX_ZOOM } from "@/app/lib/map-tile-layers";
import { resolveOfflineRoutePositions } from "@/app/lib/expo-map";
import { SatelliteReferenceTileLayers } from "@/components/satellite-reference-tile-layers";
import { SatelliteMapButton } from "@/components/satellite-map-button";
import { useExpoMode } from "@/components/expo-mode-provider";

const TERRITORY_MAP_SINGLE_POINT_ZOOM = 13;
const TERRITORY_MAP_MULTI_POINT_ZOOM = 10;
const TERRITORY_MAP_MAX_BOUNDS_ZOOM = 13;
const TERRITORY_MAP_DETAIL_MIN_ZOOM = 13;
const OSRM_ROUTE_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";

type RoadRoutePoint = {
  latitude: number;
  longitude: number;
};

type RoadRouteSegment = {
  key: string;
  positions: Array<[number, number]>;
};

type StationsTerritoryMapLeafletProps = {
  stations: Station[];
  activeSlug?: string;
  selectedSlug?: string;
  selectedFocusPoint?: {
    key: string;
    latitude: number;
    longitude: number;
    zoom?: number;
  };
  onSelectStation?: (slug: string) => void;
  artisans?: Artisan[];
  highlightSpots?: HighlightSpot[];
  showStations?: boolean;
  showArtisans?: boolean;
  showHighlightSpots?: boolean;
  className?: string;
  mapClassName?: string;
  warmTiles?: boolean;
  routeGeometry?: Array<[number, number]>;
  initialZoom?: number;
};

function getGeolocatedStations(stations: Station[]) {
  return stations.filter(hasValidCoordinates);
}

function getGeolocatedArtisans(artisans: Artisan[]) {
  return artisans.filter(hasValidCoordinates);
}

function getGeolocatedHighlightSpots(highlightSpots: HighlightSpot[]) {
  return highlightSpots.filter(hasValidCoordinates);
}

function formatStationMapLabel(station: Station) {
  return station.name.replace(/^Estaci[oó]n\s+/i, "");
}

function formatStationMapLocation(value: string) {
  return value.replace(/,\s*Catamarca\.?$/i, "");
}

function normalizePopupInfoText(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^estacion\s+/i, "")
    .replace(/,\s*catamarca\.?$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function repeatsPopupInfo(value?: string, comparedWith?: string) {
  const normalizedValue = normalizePopupInfoText(value);
  const normalizedComparison = normalizePopupInfoText(comparedWith);

  if (!normalizedValue || !normalizedComparison) {
    return false;
  }

  return (
    normalizedValue === normalizedComparison ||
    normalizedValue.includes(normalizedComparison) ||
    normalizedComparison.includes(normalizedValue)
  );
}

function isGenericArtisanCraft(value?: string) {
  const normalizedValue = normalizePopupInfoText(value);

  return (
    normalizedValue === "artesano" ||
    normalizedValue === "artesana" ||
    normalizedValue === "actor artesanal"
  );
}

function getMapEntityIcon({
  kind,
  active = false,
}: {
  kind: "station" | "artisan" | "highlight";
  active?: boolean;
}) {
  const config = {
    station: {
      className: "station",
      title: "Estación",
      icon:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-5h5v5"/></svg>',
    },
    artisan: {
      className: "artisan",
      title: "Actor",
      icon:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6.5" r="3"/><path d="M5.5 20c1.1-5 3.2-7.5 6.5-7.5s5.4 2.5 6.5 7.5"/><path d="M4.5 14.5h15"/><path d="M6.5 17h11"/></svg>',
    },
    highlight: {
      className: "highlight",
      title: "Imperdible",
      icon:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.4 6 .8-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.8L12 3Z"/></svg>',
    },
  }[kind];

  return divIcon({
    className: "",
    html: `<span class="territory-marker territory-marker-${config.className}${
      active ? " territory-marker-active" : ""
    }" title="${config.title}" aria-hidden="true">${config.icon}</span>`,
    iconAnchor: active ? [18, 18] : [15, 15],
    popupAnchor: [0, active ? -18 : -15],
    tooltipAnchor: [0, active ? -18 : -15],
    iconSize: active ? [36, 36] : [30, 30],
  });
}

async function fetchRoadRouteSegment(
  start: RoadRoutePoint,
  end: RoadRoutePoint,
  signal: AbortSignal,
) {
  const coordinates = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
  const response = await fetch(
    `${OSRM_ROUTE_ENDPOINT}/${coordinates}?overview=full&geometries=geojson&steps=false`,
    { signal },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    routes?: Array<{
      geometry?: {
        coordinates?: Array<[number, number]>;
      };
    }>;
  };
  const route = payload.routes?.[0]?.geometry?.coordinates;

  if (!route || route.length < 2) {
    return null;
  }

  return route.map(
    ([longitude, latitude]) => [latitude, longitude] as [number, number],
  );
}

function RoadRouteLayer({
  stations,
  routeGeometry,
}: {
  stations: Array<{ latitude: number; longitude: number }>;
  routeGeometry?: Array<[number, number]>;
}) {
  const { expoOffline } = useExpoMode();
  const [routeSegments, setRouteSegments] = useState<RoadRouteSegment[]>([]);
  const routePoints = useMemo(
    () =>
      stations.map((station) => ({
        latitude: station.latitude,
        longitude: station.longitude,
      })),
    [stations],
  );
  const routeKey = useMemo(
    () =>
      routePoints
        .map((station) => `${station.latitude},${station.longitude}`)
        .join("|"),
    [routePoints],
  );
  const offlineSegments = useMemo<RoadRouteSegment[]>(() => {
    if (!expoOffline || routePoints.length < 2) return [];
    const positions = resolveOfflineRoutePositions(
      routeGeometry,
      routePoints.map((point) => [point.latitude, point.longitude] as [number, number]),
    );
    return [{ key: "expo-offline-route", positions }];
  }, [expoOffline, routeGeometry, routePoints]);

  useEffect(() => {
    if (routePoints.length < 2 || expoOffline) return;

    const controller = new AbortController();

    async function loadRouteSegments() {
      try {
        const segments = await Promise.all(
          routePoints.slice(0, -1).map(async (start, index) => {
            const end = routePoints[index + 1];

            let positions: Array<[number, number]> | null = null;

            try {
              positions = await fetchRoadRouteSegment(
                start,
                end,
                controller.signal,
              );
            } catch (error) {
              if (controller.signal.aborted) {
                throw error;
              }
            }

            if (!positions) {
              return null;
            }

            return {
              key: `${start.latitude},${start.longitude}-${end.latitude},${end.longitude}`,
              positions,
            };
          }),
        );

        if (!controller.signal.aborted) {
          setRouteSegments(
            segments.filter(
              (segment): segment is RoadRouteSegment => segment !== null,
            ),
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setRouteSegments([]);
        }
      }
    }

    loadRouteSegments();

    return () => controller.abort();
  }, [expoOffline, routeKey, routePoints]);

  const visibleSegments = expoOffline
    ? offlineSegments
    : routePoints.length < 2
      ? []
      : routeSegments;

  if (visibleSegments.length === 0) {
    return null;
  }

  return (
    <>
      {visibleSegments.map((segment) => (
        <Polyline
          key={`${segment.key}-outline`}
          positions={segment.positions}
          pathOptions={{
            color: "#123a55",
            opacity: 0.72,
            weight: 7,
          }}
        />
      ))}
      {visibleSegments.map((segment) => (
        <Polyline
          key={segment.key}
          positions={segment.positions}
          pathOptions={{
            color: "#f3d7b4",
            opacity: 0.96,
            weight: 4,
          }}
        />
      ))}
    </>
  );
}

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const resize = () => map.invalidateSize();

    resize();
    const timeoutId = window.setTimeout(resize, 200);
    window.addEventListener("resize", resize);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", resize);
    };
  }, [map]);

  return null;
}

function DetailScaleObserver({
  onDetailScaleChange,
}: {
  onDetailScaleChange: (visible: boolean) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const updateDetailScale = () => {
      onDetailScaleChange(map.getZoom() >= TERRITORY_MAP_DETAIL_MIN_ZOOM);
    };

    updateDetailScale();
    map.on("zoomend", updateDetailScale);

    return () => {
      map.off("zoomend", updateDetailScale);
    };
  }, [map, onDetailScaleChange]);

  return null;
}

function SelectedStationFlyTo({
  selectedSlug,
  stations,
}: {
  selectedSlug?: string;
  stations: Station[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    const station = stations.find(
      (item) => item.slug === selectedSlug && hasValidCoordinates(item),
    );

    if (
      !station ||
      typeof station.latitude !== "number" ||
      typeof station.longitude !== "number"
    ) {
      return;
    }

    map.flyTo(
      [station.latitude, station.longitude],
      Math.max(map.getZoom(), TERRITORY_MAP_SINGLE_POINT_ZOOM),
      {
        animate: true,
        duration: 1.1,
      },
    );
  }, [map, selectedSlug, stations]);

  return null;
}

function SelectedFocusPointFlyTo({
  point,
}: {
  point?: {
    key: string;
    latitude: number;
    longitude: number;
    zoom?: number;
  };
}) {
  const map = useMap();

  useEffect(() => {
    if (!point) {
      return;
    }

    map.flyTo(
      [point.latitude, point.longitude],
      point.zoom ?? Math.max(map.getZoom(), TERRITORY_MAP_SINGLE_POINT_ZOOM),
      {
        animate: true,
        duration: 1.1,
      },
    );
  }, [map, point]);

  return null;
}

function PopupAction({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex justify-center rounded-full border border-[#123a55]/20 bg-[#123a55] px-2 py-1 text-[0.65rem] font-black uppercase leading-none tracking-normal text-[#efd4b0] hover:bg-[#7c3419] sm:px-3 sm:py-1.5 sm:text-xs ${className}`}
    >
      {label}
    </button>
  );
}

function PopupImage({
  src,
  alt,
  focus,
}: {
  src?: string;
  alt: string;
  focus?: ImageFocus;
}) {
  if (!src) {
    return null;
  }

  return (
    <div className="hidden overflow-hidden rounded-xl border border-[rgba(74,51,35,0.14)] bg-[#efd4b0] sm:block">
      <Image
        src={withPocketBaseImageThumb(src, "thumbnail")}
        alt={alt}
        width={320}
        height={176}
        unoptimized
        className="h-24 w-full object-cover saturate-[0.92] sm:h-28"
        style={getImageFocusStyle(focus)}
      />
    </div>
  );
}

function PopupEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.62rem] font-black uppercase leading-none tracking-normal text-[#7c3419] sm:text-[0.68rem]">
      {children}
    </p>
  );
}

export function StationsTerritoryMapLeaflet({
  stations,
  activeSlug,
  selectedSlug,
  selectedFocusPoint,
  onSelectStation,
  artisans = [],
  highlightSpots = [],
  showStations = true,
  showArtisans = true,
  showHighlightSpots = true,
  className = "",
  mapClassName = "h-[380px] w-full sm:h-[520px]",
  warmTiles = false,
  routeGeometry,
  initialZoom,
}: StationsTerritoryMapLeafletProps) {
  const router = useRouter();
  const [isDetailScale, setIsDetailScale] = useState(false);
  const geolocatedStations = useMemo(() => {
    if (!showStations) return [];
    return getGeolocatedStations(stations);
  }, [showStations, stations]);
  const geolocatedArtisans = useMemo(() => {
    if (!showArtisans) return [];
    return getGeolocatedArtisans(artisans);
  }, [artisans, showArtisans]);
  const geolocatedHighlightSpots = useMemo(() => {
    if (!showHighlightSpots) return [];
    return getGeolocatedHighlightSpots(highlightSpots);
  }, [highlightSpots, showHighlightSpots]);
  const geolocatedPointCount =
    geolocatedStations.length +
    geolocatedArtisans.length +
    geolocatedHighlightSpots.length;
  const visibleArtisans = isDetailScale ? geolocatedArtisans : [];
  const visibleHighlightSpots = isDetailScale ? geolocatedHighlightSpots : [];

  const center = useMemo<LatLngExpression>(() => {
    const allPoints = [
      ...geolocatedStations.map((station) => ({
        latitude: station.latitude,
        longitude: station.longitude,
      })),
      ...geolocatedArtisans.map((artisan) => ({
        latitude: artisan.latitude,
        longitude: artisan.longitude,
      })),
      ...geolocatedHighlightSpots.map((spot) => ({
        latitude: spot.latitude,
        longitude: spot.longitude,
      })),
    ];

    if (allPoints.length === 0) {
      return [-26.9, -66.2];
    }

    if (allPoints.length === 1) {
      return [allPoints[0].latitude, allPoints[0].longitude];
    }

    const avgLat =
      allPoints.reduce((sum, point) => sum + point.latitude, 0) / allPoints.length;
    const avgLon =
      allPoints.reduce((sum, point) => sum + point.longitude, 0) / allPoints.length;

    return [avgLat, avgLon];
  }, [geolocatedArtisans, geolocatedHighlightSpots, geolocatedStations]);

  const bounds = useMemo<LatLngBoundsExpression | undefined>(() => {
    const allBounds = [
      ...geolocatedStations.map(
        (station) => [station.latitude, station.longitude] as [number, number],
      ),
      ...geolocatedArtisans.map(
        (artisan) => [artisan.latitude, artisan.longitude] as [number, number],
      ),
      ...geolocatedHighlightSpots.map(
        (spot) => [spot.latitude, spot.longitude] as [number, number],
      ),
    ];

    if (allBounds.length < 2) {
      return undefined;
    }

    return allBounds;
  }, [geolocatedArtisans, geolocatedHighlightSpots, geolocatedStations]);

  return (
    <div
      className={`overflow-hidden rounded-[1.35rem] border border-[#123a55]/20 bg-[#123a55]/10 shadow-sm ${className}`}
    >
      <MapContainer
        center={center}
        zoom={
          initialZoom ?? (geolocatedPointCount <= 1
            ? TERRITORY_MAP_SINGLE_POINT_ZOOM
            : TERRITORY_MAP_MULTI_POINT_ZOOM)
        }
        bounds={bounds}
        boundsOptions={{
          padding: [18, 18],
          maxZoom: initialZoom ?? TERRITORY_MAP_MAX_BOUNDS_ZOOM,
        }}
        maxZoom={SATELLITE_REFERENCE_MAX_ZOOM}
        scrollWheelZoom={false}
        zoomControl
        className={mapClassName}
      >
        <MapResizer />
        <SelectedStationFlyTo
          selectedSlug={selectedSlug}
          stations={geolocatedStations}
        />
        <SelectedFocusPointFlyTo point={selectedFocusPoint} />
        <DetailScaleObserver onDetailScaleChange={setIsDetailScale} />
        <SatelliteReferenceTileLayers mood={warmTiles ? "warm" : "neutral"} />
        <ScaleControl position="bottomleft" imperial={false} />

        <RoadRouteLayer stations={geolocatedStations} routeGeometry={routeGeometry} />

        {geolocatedStations.map((station) => {
          const isActive = station.slug === activeSlug || station.slug === selectedSlug;

          return (
            <Marker
              key={station.slug}
              position={[station.latitude, station.longitude]}
              icon={getMapEntityIcon({ kind: "station", active: isActive })}
              eventHandlers={{
                click: () => onSelectStation?.(station.slug),
              }}
            >
              <Tooltip
                direction="right"
                offset={[18, 0]}
                opacity={1}
                permanent
                className="territory-marker-label"
              >
                {formatStationMapLabel(station)}
              </Tooltip>
              <Popup className="territory-entity-popup">
                <div className="w-[180px] space-y-2 sm:min-w-[210px] sm:w-auto sm:space-y-3">
                  <PopupImage src={station.imageUrl} alt={station.name} focus={station.imageFocus} />
                  <div className="space-y-1">
                    <PopupEyebrow>Estación de la ruta</PopupEyebrow>
                    <p className="text-sm font-black leading-tight text-[#082d49] sm:text-base">
                      {formatStationMapLabel(station)}
                    </p>
                    <p className="text-[0.7rem] leading-tight text-[#725a49] sm:text-xs">
                      {formatStationMapLocation(station.locality)}
                    </p>
                    <p className="hidden text-xs text-[#725a49] sm:block">
                      {station.slogan || "Nodo territorial de la ruta"}
                    </p>
                    {station.datoDestacado ? (
                      <p className="hidden rounded-lg bg-[#8a452b12] px-2 py-1 text-xs font-semibold text-[#7c3419] sm:block">
                        {station.datoDestacado}
                      </p>
                    ) : null}
                  </div>
                  <PopupAction
                    label="Abrir"
                    onClick={() => router.push(`/estaciones/${station.slug}`)}
                  />
                </div>
              </Popup>
            </Marker>
          );
        })}

        {visibleArtisans.map((artisan) => {
          const artisanCraft = artisan.craft?.trim();
          const shouldShowCraft =
            artisanCraft &&
            !isGenericArtisanCraft(artisanCraft) &&
            !repeatsPopupInfo(artisanCraft, artisan.actorType);
          const shouldShowStation =
            artisan.stationName &&
            !repeatsPopupInfo(artisan.stationName, artisan.place);

          return (
            <Marker
              key={`artisan-${artisan.slug}`}
              position={[artisan.latitude, artisan.longitude]}
              icon={getMapEntityIcon({ kind: "artisan" })}
            >
              <Tooltip
                direction="right"
                offset={[18, 0]}
                opacity={1}
                permanent
                className="territory-marker-label"
              >
                {artisan.name}
              </Tooltip>
              <Popup className="territory-entity-popup">
                <div className="w-[180px] space-y-2 sm:min-w-[210px] sm:w-auto sm:space-y-3">
                  <PopupImage src={artisan.imageUrl} alt={artisan.name} focus={artisan.imageFocus} />
                  <div className="space-y-1">
                    <PopupEyebrow>{artisan.actorType ?? "Actor artesanal"}</PopupEyebrow>
                    <p className="text-sm font-black leading-tight text-[#082d49] sm:text-base">{artisan.name}</p>
                    <p className="text-[0.7rem] leading-tight text-[#725a49] sm:text-xs">{artisan.place}</p>
                    {shouldShowCraft ? (
                      <p className="hidden text-xs text-[#725a49] sm:block">
                        {artisanCraft}
                      </p>
                    ) : null}
                    {artisan.datoDestacado ? (
                      <p className="hidden rounded-lg bg-[#8a452b12] px-2 py-1 text-xs font-semibold text-[#7c3419] sm:block">
                        {artisan.datoDestacado}
                      </p>
                    ) : null}
                  </div>
                  {shouldShowStation ? (
                    <p className="hidden text-xs text-[#725a49] sm:block">
                      Estación: {artisan.stationName}
                    </p>
                  ) : null}
                  <div className="flex gap-1.5 sm:flex-col sm:gap-2">
                    <PopupAction
                      label="Abrir"
                      onClick={() => router.push(`/actores/${artisan.slug}`)}
                      className="flex-1"
                    />
                    <SatelliteMapButton
                      point={artisan}
                      label="Satelital"
                      compact
                      className="flex-1 px-2 py-1 text-[0.65rem] sm:w-full sm:px-3 sm:py-1.5 sm:text-xs"
                    />
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {visibleHighlightSpots.map((spot) => (
          <Marker
            key={`spot-${spot.slug}`}
            position={[spot.latitude, spot.longitude]}
            icon={getMapEntityIcon({ kind: "highlight" })}
          >
            <Tooltip
              direction="right"
              offset={[18, 0]}
              opacity={1}
              permanent
              className="territory-marker-label"
            >
              {spot.title}
            </Tooltip>
            <Popup className="territory-entity-popup">
              <div className="w-[180px] space-y-2 sm:min-w-[210px] sm:w-auto sm:space-y-3">
                <PopupImage src={spot.imageUrl} alt={spot.title} focus={spot.imageFocus} />
                <div className="space-y-1">
                  <PopupEyebrow>{spot.type || "Imperdible"}</PopupEyebrow>
                  <p className="text-sm font-black leading-tight text-[#082d49] sm:text-base">{spot.title}</p>
                  <p className="text-[0.7rem] leading-tight text-[#725a49] sm:text-xs">{spot.location}</p>
                  <p className="hidden text-xs text-[#725a49] sm:block">
                    {spot.subtitle || spot.type}
                  </p>
                  {spot.datoDestacado ? (
                    <p className="hidden rounded-lg bg-[#8a452b12] px-2 py-1 text-xs font-semibold text-[#7c3419] sm:block">
                      {spot.datoDestacado}
                    </p>
                  ) : null}
                </div>
                {spot.stationName ? (
                  <p className="hidden text-xs text-[#725a49] sm:block">
                    Estación: {spot.stationName}
                  </p>
                ) : null}
                <div className="flex gap-1.5 sm:flex-col sm:gap-2">
                  <PopupAction
                    label="Abrir"
                    onClick={() => router.push(`/imperdibles/${spot.slug}`)}
                    className="flex-1"
                  />
                  <SatelliteMapButton
                    point={spot}
                    label="Satelital"
                    compact
                    className="flex-1 px-2 py-1 text-[0.65rem] sm:w-full sm:px-3 sm:py-1.5 sm:text-xs"
                  />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
