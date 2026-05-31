"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
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
import { SatelliteReferenceTileLayers } from "@/components/satellite-reference-tile-layers";
import { SatelliteMapButton } from "@/components/satellite-map-button";

const TERRITORY_MAP_SINGLE_POINT_ZOOM = 13;
const TERRITORY_MAP_MULTI_POINT_ZOOM = 10;
const TERRITORY_MAP_MAX_BOUNDS_ZOOM = 13;

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
      className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)]"
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
    <div className="overflow-hidden rounded-xl border border-[rgba(74,51,35,0.14)]">
      <Image
        src={withPocketBaseImageThumb(src, "thumbnail")}
        alt={alt}
        width={320}
        height={176}
        unoptimized
        className="h-28 w-full object-cover"
        style={getImageFocusStyle(focus)}
      />
    </div>
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
}: StationsTerritoryMapLeafletProps) {
  const router = useRouter();
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
    <div className="overflow-hidden rounded-[1.35rem] border border-[#123a55]/20 shadow-sm">
      <MapContainer
        center={center}
        zoom={
          geolocatedPointCount <= 1
            ? TERRITORY_MAP_SINGLE_POINT_ZOOM
            : TERRITORY_MAP_MULTI_POINT_ZOOM
        }
        bounds={bounds}
        boundsOptions={{ padding: [18, 18], maxZoom: TERRITORY_MAP_MAX_BOUNDS_ZOOM }}
        scrollWheelZoom={false}
        zoomControl
        className="h-[360px] w-full sm:h-[460px]"
      >
        <MapResizer />
        <SelectedStationFlyTo
          selectedSlug={selectedSlug}
          stations={geolocatedStations}
        />
        <SatelliteReferenceTileLayers />
        <ScaleControl position="bottomleft" imperial={false} />

        {geolocatedStations.map((station) => {
          const isActive = station.slug === activeSlug || station.slug === selectedSlug;

          return (
            <CircleMarker
              key={station.slug}
              center={[station.latitude, station.longitude]}
              radius={isActive ? 12 : 9}
              pathOptions={{
                color: isActive ? "#7c3419" : "#9d4d2e",
                fillColor: isActive ? "#7c3419" : "#9d4d2e",
                fillOpacity: isActive ? 0.9 : 0.7,
                weight: 2,
              }}
              eventHandlers={{
                click: () =>
                  onSelectStation
                    ? onSelectStation(station.slug)
                    : router.push(`/estaciones/${station.slug}`),
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                {formatStationMapLabel(station)}
              </Tooltip>
              <Popup>
                <div className="space-y-3 min-w-[180px]">
                  <PopupImage src={station.imageUrl} alt={station.name} focus={station.imageFocus} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
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
            </CircleMarker>
          );
        })}

        {geolocatedArtisans.map((artisan) => (
          <CircleMarker
            key={`artisan-${artisan.slug}`}
            center={[artisan.latitude, artisan.longitude]}
            radius={6}
            pathOptions={{
              color: "#61644a",
              fillColor: "#61644a",
              fillOpacity: 0.8,
              weight: 2,
            }}
            eventHandlers={{
              click: () => router.push(`/artesanas/${artisan.slug}`),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              {artisan.name}
            </Tooltip>
            <Popup>
              <div className="space-y-3 min-w-[180px]">
                <PopupImage src={artisan.imageUrl} alt={artisan.name} focus={artisan.imageFocus} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{artisan.name}</p>
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
          </CircleMarker>
        ))}

        {geolocatedHighlightSpots.map((spot) => (
          <CircleMarker
            key={`spot-${spot.slug}`}
            center={[spot.latitude, spot.longitude]}
            radius={5}
            pathOptions={{
              color: "#3d2414",
              fillColor: "#3d2414",
              fillOpacity: 0.75,
              weight: 2,
            }}
            eventHandlers={{
              click: () => router.push(`/imperdibles/${spot.slug}`),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              {spot.title}
            </Tooltip>
            <Popup>
              <div className="space-y-3 min-w-[180px]">
                <PopupImage src={spot.imageUrl} alt={spot.title} focus={spot.imageFocus} />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{spot.title}</p>
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
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
