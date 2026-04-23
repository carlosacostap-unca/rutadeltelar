"use client";

import dynamic from "next/dynamic";

type Props = {
  lat: number;
  lng: number;
  label: string;
};

const MapInner = dynamic(() => import("@/components/station-detail-map-leaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center bg-[color:var(--surface)] text-sm text-[color:var(--text-muted)]">
      Cargando mapa…
    </div>
  ),
});

export function StationDetailMap({ lat, lng, label }: Props) {
  return <MapInner lat={lat} lng={lng} label={label} />;
}
