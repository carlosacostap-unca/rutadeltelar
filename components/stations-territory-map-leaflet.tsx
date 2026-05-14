"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
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
        src={src}
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
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
      <MapContainer
        center={center}
        zoom={geolocatedStations.length <= 1 ? 10 : 8}
        bounds={bounds}
        boundsOptions={{ padding: [28, 28] }}
        scrollWheelZoom={false}
        zoomControl
        className="h-[360px] w-full sm:h-[460px]"
      >
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
                {station.locality}
              </Tooltip>
              <Popup>
                <div className="space-y-3 min-w-[180px]">
                  <PopupImage src={station.imageUrl} alt={station.name} focus={station.imageFocus} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{station.name}</p>
                    <p className="text-xs text-[#725a49]">{station.locality}</p>
                    <p className="text-xs text-[#725a49]">
                      {station.slogan || "Nodo territorial de la ruta"}
                    </p>
                  </div>
                  <PopupAction
                    label="Ver estacion"
                    onClick={() => router.push(`/estaciones/${station.slug}`)}
                  />
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
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
