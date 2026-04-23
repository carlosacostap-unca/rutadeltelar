"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type Artisan,
  type HighlightSpot,
  type Station,
} from "@/app/lib/content";
import { SectionHeading } from "@/components/section-heading";
import { StationsTerritoryMap } from "@/components/stations-territory-map";
import { SurfaceCard } from "@/components/surface-card";

type StationsBrowserProps = {
  stations: Station[];
  artisans: Artisan[];
  highlightSpots: HighlightSpot[];
};

export function StationsBrowser({
  stations,
  artisans,
  highlightSpots,
}: StationsBrowserProps) {
  const [selectedSlug, setSelectedSlug] = useState(stations[0]?.slug);

  const selectedStation = useMemo(
    () => stations.find((station) => station.slug === selectedSlug) ?? stations[0],
    [selectedSlug, stations],
  );

  const selectedArtisans = useMemo(() => {
    if (!selectedStation) return [];

    return artisans.filter((artisan) => artisan.stationSlug === selectedStation.slug);
  }, [artisans, selectedStation]);

  const selectedHighlightSpots = useMemo(() => {
    if (!selectedStation) return [];

    return highlightSpots.filter(
      (spot) => spot.stationSlug === selectedStation.slug,
    );
  }, [highlightSpots, selectedStation]);

  const orderedStations = useMemo(() => {
    if (!selectedStation) return stations;

    const rest = stations.filter((station) => station.slug !== selectedStation.slug);
    return [selectedStation, ...rest];
  }, [selectedStation, stations]);

  return (
    <>
      <section className="mb-8">
        <StationsTerritoryMap
          stations={stations}
          artisans={artisans}
          highlightSpots={highlightSpots}
          activeSlug={selectedStation?.slug}
          selectedSlug={selectedStation?.slug}
          onSelectStation={setSelectedSlug}
        />
      </section>

      {selectedStation ? (
        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Seleccion"
              title={selectedStation.name}
              description="El mapa y esta ficha quedan sincronizados para explorar una estacion a la vez."
            />
            <SurfaceCard className="mt-6 soft-shadow">
              <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
                {selectedStation.locality}
              </p>
              <p className="display-font mt-3 text-3xl text-[color:var(--foreground)]">
                {selectedStation.slogan}
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                {selectedStation.summary}
              </p>
              <Link
                href={`/estaciones/${selectedStation.slug}`}
                className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
              >
                Ver detalle
              </Link>
            </SurfaceCard>
          </div>

          <div className="grid gap-4">
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Actores cercanos
              </p>
              <p className="display-font mt-2 text-4xl text-[color:var(--accent)]">
                {selectedArtisans.length}
              </p>
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Imperdibles cercanos
              </p>
              <p className="display-font mt-2 text-4xl text-[color:var(--accent)]">
                {selectedHighlightSpots.length}
              </p>
            </SurfaceCard>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orderedStations.map((station) => {
          const isSelected = station.slug === selectedStation?.slug;

          return (
            <SurfaceCard
              key={station.slug}
              className={`soft-shadow ${
                isSelected ? "border-[color:var(--accent)] bg-[rgba(138,69,43,0.06)]" : ""
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
                {station.locality}
              </p>
              <h2 className="display-font mt-3 text-3xl text-[color:var(--foreground)]">
                {station.name}
              </h2>
              <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                {station.slogan}
              </p>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                {station.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlug(station.slug)}
                  className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--accent)]"
                >
                  Seleccionar
                </button>
                <Link
                  href={`/estaciones/${station.slug}`}
                  className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--accent)]"
                >
                  Ver detalle
                </Link>
              </div>
            </SurfaceCard>
          );
        })}
      </section>
    </>
  );
}
