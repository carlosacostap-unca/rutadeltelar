"use client";

import { MapContainer, Marker, Popup, ScaleControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SATELLITE_REFERENCE_MAX_ZOOM } from "@/app/lib/map-tile-layers";
import { SatelliteReferenceTileLayers } from "@/components/satellite-reference-tile-layers";

// Fix leaflet default icon
const icon = L.icon({
  iconUrl: "/expo/map/marker-icon.svg",
  iconRetinaUrl: "/expo/map/marker-icon.svg",
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
