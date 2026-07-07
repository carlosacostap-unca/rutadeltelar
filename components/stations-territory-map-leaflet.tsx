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
import { SatelliteReferenceTileLayers } from "@/components/satellite-reference-tile-layers";
import { SatelliteMapButton } from "@/components/satellite-map-button";

const TERRITORY_MAP_SINGLE_POINT_ZOOM = 13;
const TERRITORY_MAP_MULTI_POINT_ZOOM = 10;
const TERRITORY_MAP_MAX_BOUNDS_ZOOM = 13;
const TERRITORY_MAP_DETAIL_MIN_ZOOM = 13;
const OSRM_ROUTE_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";

type StationsTerritoryMapLeafletProps = {
  stations: Station[];
  activeSlug?: string;
  selectedSlug?: string;
  onSelectStation?: (slug: string) => void;
  artisans?: Artisan[];
  highlightSpots?: HighlightSpot[];
  showStations?: boolean;
  showArtisans?: boolean;
  showHighlightSpots?: boolean;
  className?: string;
  mapClassName?: string;
  warmTiles?: boolean;
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
      title: "Estacion",
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

function RoadRouteLayer({
  stations,
}: {
  stations: Array<{ latitude: number; longitude: number }>;
}) {
  const [routePositions, setRoutePositions] = useState<
    Array<[number, number]> | null
  >(null);
  const fallbackPositions = useMemo(
    () =>
      stations.map(
        (station) => [station.latitude, station.longitude] as [number, number],
      ),
    [stations],
  );
  const coordinates = useMemo(
    () =>
      stations
        .map((station) => `${station.longitude},${station.latitude}`)
        .join(";"),
    [stations],
  );

  useEffect(() => {
    if (stations.length < 2) {
      setRoutePositions(null);
      return;
    }

    const controller = new AbortController();

    async function loadRoute() {
      try {
        const response = await fetch(
          `${OSRM_ROUTE_ENDPOINT}/${coordinates}?overview=full&geometries=geojson`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setRoutePositions(null);
          return;
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
          setRoutePositions(null);
          return;
        }

        setRoutePositions(route.map(([longitude, latitude]) => [latitude, longitude]));
      } catch (error) {
        if (!controller.signal.aborted) {
          setRoutePositions(null);
        }
      }
    }

    loadRoute();

    return () => controller.abort();
  }, [coordinates, stations.length]);

  const positions = routePositions ?? fallbackPositions;

  if (positions.length < 2) {
    return null;
  }

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#123a55",
          opacity: 0.72,
          weight: 7,
        }}
      />
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#f3d7b4",
          opacity: 0.96,
          weight: 4,
        }}
      />
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

function PopupAction({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex justify-center rounded-full border border-[#123a55]/20 bg-[#123a55] px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] hover:bg-[#7c3419]"
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
    <div className="overflow-hidden rounded-xl border border-[rgba(74,51,35,0.14)] bg-[#efd4b0]">
      <Image
        src={withPocketBaseImageThumb(src, "thumbnail")}
        alt={alt}
        width={320}
        height={176}
        unoptimized
        className="h-28 w-full object-cover saturate-[0.92]"
        style={getImageFocusStyle(focus)}
      />
    </div>
  );
}

function PopupEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#7c3419]">
      {children}
    </p>
  );
}

export function StationsTerritoryMapLeaflet({
  stations,
  activeSlug,
  selectedSlug,
  onSelectStation,
  artisans = [],
  highlightSpots = [],
  showStations = true,
  showArtisans = true,
  showHighlightSpots = true,
  className = "",
  mapClassName = "h-[380px] w-full sm:h-[520px]",
  warmTiles = false,
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
          geolocatedPointCount <= 1
            ? TERRITORY_MAP_SINGLE_POINT_ZOOM
            : TERRITORY_MAP_MULTI_POINT_ZOOM
        }
        bounds={bounds}
        boundsOptions={{ padding: [18, 18], maxZoom: TERRITORY_MAP_MAX_BOUNDS_ZOOM }}
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
        <DetailScaleObserver onDetailScaleChange={setIsDetailScale} />
        <SatelliteReferenceTileLayers mood={warmTiles ? "warm" : "neutral"} />
        <ScaleControl position="bottomleft" imperial={false} />

        <RoadRouteLayer stations={geolocatedStations} />

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
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                {formatStationMapLabel(station)}
              </Tooltip>
              <Popup>
                <div className="min-w-[210px] space-y-3">
                  <PopupImage src={station.imageUrl} alt={station.name} focus={station.imageFocus} />
                  <div className="space-y-1">
                    <PopupEyebrow>Estacion de la ruta</PopupEyebrow>
                    <p className="text-base font-black leading-tight text-[#082d49]">
                      {formatStationMapLabel(station)}
                    </p>
                    <p className="text-xs text-[#725a49]">
                      {formatStationMapLocation(station.locality)}
                    </p>
                    <p className="text-xs text-[#725a49]">
                      {station.slogan || "Nodo territorial de la ruta"}
                    </p>
                    {station.datoDestacado ? (
                      <p className="rounded-lg bg-[#8a452b12] px-2 py-1 text-xs font-semibold text-[#7c3419]">
                        {station.datoDestacado}
                      </p>
                    ) : null}
                  </div>
                  <PopupAction
                    label="Ver estacion"
                    onClick={() => router.push(`/estaciones/${station.slug}`)}
                  />
                  <SatelliteMapButton point={station} compact className="w-full" />
                </div>
              </Popup>
            </Marker>
          );
        })}

        {visibleArtisans.map((artisan) => (
          <Marker
            key={`artisan-${artisan.slug}`}
            position={[artisan.latitude, artisan.longitude]}
            icon={getMapEntityIcon({ kind: "artisan" })}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              {artisan.name}
            </Tooltip>
            <Popup>
              <div className="min-w-[210px] space-y-3">
                <PopupImage src={artisan.imageUrl} alt={artisan.name} focus={artisan.imageFocus} />
                <div className="space-y-1">
                  <PopupEyebrow>{artisan.actorType ?? "Actor artesanal"}</PopupEyebrow>
                  <p className="text-base font-black leading-tight text-[#082d49]">{artisan.name}</p>
                  <p className="text-xs text-[#725a49]">{artisan.place}</p>
                  <p className="text-xs text-[#725a49]">
                    {artisan.craft || "Actor artesanal"}
                  </p>
                  {artisan.datoDestacado ? (
                    <p className="rounded-lg bg-[#8a452b12] px-2 py-1 text-xs font-semibold text-[#7c3419]">
                      {artisan.datoDestacado}
                    </p>
                  ) : null}
                </div>
                {artisan.stationName ? (
                  <p className="text-xs text-[#725a49]">
                    Estacion: {artisan.stationName}
                  </p>
                ) : null}
                <PopupAction
                  label="Ver actor"
                  onClick={() => router.push(`/artesanas/${artisan.slug}`)}
                />
                <SatelliteMapButton point={artisan} compact className="w-full" />
              </div>
            </Popup>
          </Marker>
        ))}

        {visibleHighlightSpots.map((spot) => (
          <Marker
            key={`spot-${spot.slug}`}
            position={[spot.latitude, spot.longitude]}
            icon={getMapEntityIcon({ kind: "highlight" })}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              {spot.title}
            </Tooltip>
            <Popup>
              <div className="min-w-[210px] space-y-3">
                <PopupImage src={spot.imageUrl} alt={spot.title} focus={spot.imageFocus} />
                <div className="space-y-1">
                  <PopupEyebrow>{spot.type || "Imperdible"}</PopupEyebrow>
                  <p className="text-base font-black leading-tight text-[#082d49]">{spot.title}</p>
                  <p className="text-xs text-[#725a49]">{spot.location}</p>
                  <p className="text-xs text-[#725a49]">
                    {spot.subtitle || spot.type}
                  </p>
                  {spot.datoDestacado ? (
                    <p className="rounded-lg bg-[#8a452b12] px-2 py-1 text-xs font-semibold text-[#7c3419]">
                      {spot.datoDestacado}
                    </p>
                  ) : null}
                </div>
                {spot.stationName ? (
                  <p className="text-xs text-[#725a49]">
                    Estacion: {spot.stationName}
                  </p>
                ) : null}
                <PopupAction
                  label="Ver imperdible"
                  onClick={() => router.push(`/imperdibles/${spot.slug}`)}
                />
                <SatelliteMapButton point={spot} compact className="w-full" />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
