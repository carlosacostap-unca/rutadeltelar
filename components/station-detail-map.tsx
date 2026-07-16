"use client";

import dynamic from "next/dynamic";
import { DeferredRender } from "@/components/deferred-render";
import { MapLoadingPlaceholder } from "@/components/map-loading-placeholder";

type Props = {
  lat: number;
  lng: number;
  label: string;
  eager?: boolean;
  staticMapSrc?: string;
};

const MapInner = dynamic(() => import("@/components/station-detail-map-leaflet"), {
  ssr: false,
  loading: () => <MapLoadingPlaceholder compact label="Cargando mapa..." />,
});

function PromoStaticStationMap({ label, staticMapSrc = "/video/santa-maria-map.png" }: Props) {
  return (
    <div
      data-promo-static-map
      style={{
        position: "relative",
        height: 280,
        width: "100%",
        overflow: "hidden",
        background: "#d8c6aa",
      }}
    >
      <img
        src={staticMapSrc}
        alt={`Mapa satelital de ${label}`}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export function StationDetailMap({ lat, lng, label, eager = false, staticMapSrc }: Props) {
  if (eager) {
    return <PromoStaticStationMap lat={lat} lng={lng} label={label} staticMapSrc={staticMapSrc} />;
  }

  return (
    <DeferredRender fallback={<MapLoadingPlaceholder compact label="Mapa listo al acercarte..." />}>
      <MapInner lat={lat} lng={lng} label={label} />
    </DeferredRender>
  );
}
