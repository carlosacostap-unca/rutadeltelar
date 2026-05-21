"use client";

import { MapContainer, Marker, Popup, ScaleControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SatelliteReferenceTileLayers } from "@/components/satellite-reference-tile-layers";

// Fix leaflet default icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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
