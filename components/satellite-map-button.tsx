"use client";

import { getDirectionsMapUrl, getSatelliteMapUrl } from "@/app/lib/map-links";
import type { GeoPoint } from "@/app/lib/geo";
import { useExpoMode } from "@/components/expo-mode-provider";

type SatelliteMapButtonProps = {
  point: GeoPoint;
  label?: string;
  action?: "satellite" | "directions";
  compact?: boolean;
  className?: string;
};

export function SatelliteMapButton({
  point,
  label,
  action = "satellite",
  compact = false,
  className = "",
}: SatelliteMapButtonProps) {
  const { expoOffline } = useExpoMode();
  const href =
    action === "directions"
      ? getDirectionsMapUrl(point)
      : getSatelliteMapUrl(point);
  const visibleLabel =
    label ??
    (action === "directions" ? "Ver indicaciones" : "Ver en mapa satelital");

  if (!href) {
    return null;
  }

  if (expoOffline) {
    return (
      <span className={`inline-flex items-center rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-muted)] ${className}`}>
        Mapa externo requiere conexion
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] ${
        compact ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"
      } ${className}`}
    >
      {visibleLabel}
    </a>
  );
}
