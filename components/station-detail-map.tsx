"use client";

import dynamic from "next/dynamic";
import { DeferredRender } from "@/components/deferred-render";
import { MapLoadingPlaceholder } from "@/components/map-loading-placeholder";

type Props = {
  lat: number;
  lng: number;
  label: string;
};

const MapInner = dynamic(() => import("@/components/station-detail-map-leaflet"), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder compact label="Cargando mapa..." />,
});

export function StationDetailMap({ lat, lng, label }: Props) {
  return (
    <DeferredRender fallback={<MapLoadingPlaceholder compact label="Mapa listo al acercarte..." />}>
      <MapInner lat={lat} lng={lng} label={label} />
    </DeferredRender>
  );
}
