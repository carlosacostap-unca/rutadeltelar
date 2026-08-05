"use client";

import { MapContainer, Marker, Popup, ScaleControl } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SATELLITE_REFERENCE_MAX_ZOOM } from "@/app/lib/map-tile-layers";
import { SatelliteReferenceTileLayers } from "@/components/satellite-reference-tile-layers";

const icon = divIcon({
  className: "detail-map-marker-icon",
  html: `
    <svg viewBox="0 0 30 42" aria-hidden="true" focusable="false">
      <path d="M15 1C7.3 1 1 7.3 1 15c0 10.4 14 26 14 26s14-15.6 14-26C29 7.3 22.7 1 15 1Z" />
      <circle cx="15" cy="15" r="5" />
    </svg>
  `,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [1, -34],
});

type Props = {
  lat: number;
  lng: number;
  label: string;
};

export default function StationDetailMapLeaflet({ lat, lng, label }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      maxZoom={SATELLITE_REFERENCE_MAX_ZOOM}
      className="relative z-0"
      style={{ height: "280px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <SatelliteReferenceTileLayers />
      <ScaleControl position="bottomleft" imperial={false} />
      <Marker position={[lat, lng]} icon={icon}>
        <Popup>{label}</Popup>
      </Marker>
    </MapContainer>
  );
}
