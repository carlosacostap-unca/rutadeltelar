"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  type Artisan,
  type HighlightSpot,
  type Station,
} from "@/app/lib/content";
import { SectionHeading } from "@/components/section-heading";
import { StationsTerritoryMap } from "@/components/stations-territory-map";
import { SurfaceCard } from "@/components/surface-card";

type HighlightSpotsBrowserProps = {
  highlightSpots: HighlightSpot[];
  stations: Station[];
  artisans: Artisan[];
};

export function HighlightSpotsBrowser({
  highlightSpots,
  stations,
  artisans,
}: HighlightSpotsBrowserProps) {
  const [selectedSlug, setSelectedSlug] = useState(stations[0]?.slug);

  const selectedStation = useMemo(
    () => stations.find((station) => station.slug === selectedSlug) ?? stations[0],
    [selectedSlug, stations],
  );

  const selectedHighlightSpots = useMemo(() => {
    if (!selectedStation) return highlightSpots;

    return highlightSpots.filter((spot) => spot.stationSlug === selectedStation.slug);
  }, [highlightSpots, selectedStation]);

  const selectedArtisans = useMemo(() => {
    if (!selectedStation) return artisans;

    return artisans.filter((artisan) => artisan.stationSlug === selectedStation.slug);
  }, [artisans, selectedStation]);

  return (
    <>
      <section className="mt-8">
        <SectionHeading
          eyebrow="Mapa"
          title="Selecciona una estacion para filtrar imperdibles"
          description="La estacion activa reordena los puntos destacados y su contexto artesanal."
        />
        <div className="mt-6">
          <StationsTerritoryMap
            stations={stations}
            artisans={artisans}
            highlightSpots={highlightSpots}
            activeSlug={selectedStation?.slug}
            selectedSlug={selectedStation?.slug}
            onSelectStation={setSelectedSlug}
          />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="Imperdibles"
            title={
              selectedStation
                ? `Destacados en ${selectedStation.locality}`
                : "Atractivos, actividades y eventos"
            }
            description="Cards filtradas por la estacion seleccionada en el mapa."
          />
          <div className="mt-6 grid gap-4">
            {selectedHighlightSpots.slice(0, 3).map((spot) => (
              <SurfaceCard key={spot.slug} className="soft-shadow">
                {spot.imageUrl ? (
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-[color:var(--border)]">
                    <Image
                      src={spot.imageUrl}
                      alt={spot.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
                    {spot.type}
                  </p>
                  <span className="rounded-full bg-[color:var(--surface-strong)] px-3 py-1 text-xs text-[color:var(--accent-strong)]">
                    {spot.priority}
                  </span>
                </div>
                <h2 className="display-font mt-3 text-3xl text-[color:var(--foreground)]">
                  {spot.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                  {spot.subtitle}
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  {spot.location}
                </p>
                <Link
                  href={`/imperdibles/${spot.slug}`}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
                >
                  Ver detalle
                </Link>
              </SurfaceCard>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Contexto"
            title="Territorio y actores cercanos"
            description="La estacion seleccionada tambien cambia el contexto artesanal disponible."
          />
          <div className="mt-6 grid gap-4">
            <SurfaceCard>
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Actores en la estacion
              </p>
              <p className="display-font mt-2 text-4xl text-[color:var(--accent)]">
                {selectedArtisans.length}
              </p>
            </SurfaceCard>
            {selectedStation ? (
              <Link
                href={`/estaciones/${selectedStation.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
              >
                Ver estacion seleccionada
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
