"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type Artisan,
  type Experience,
  type HighlightSpot,
  type Station,
} from "@/app/lib/content";
import { SectionHeading } from "@/components/section-heading";
import { StationsTerritoryMap } from "@/components/stations-territory-map";
import { SurfaceCard } from "@/components/surface-card";

type ExperiencesBrowserProps = {
  experiences: Experience[];
  stations: Station[];
  artisans: Artisan[];
  highlightSpots: HighlightSpot[];
};

const filters = ["Paisaje", "Tecnica", "Tiempo", "Accesibilidad"];

export function ExperiencesBrowser({
  experiences,
  stations,
  artisans,
  highlightSpots,
}: ExperiencesBrowserProps) {
  const [selectedSlug, setSelectedSlug] = useState(stations[0]?.slug);

  const selectedStation = useMemo(
    () => stations.find((station) => station.slug === selectedSlug) ?? stations[0],
    [selectedSlug, stations],
  );

  const selectedExperiences = useMemo(() => {
    if (!selectedStation) return experiences;

    return experiences.filter((experience) => experience.stationSlug === selectedStation.slug);
  }, [experiences, selectedStation]);

  const selectedArtisans = useMemo(() => {
    if (!selectedStation) return artisans;

    return artisans.filter((artisan) => artisan.stationSlug === selectedStation.slug);
  }, [artisans, selectedStation]);

  const selectedHighlightSpots = useMemo(() => {
    if (!selectedStation) return highlightSpots;

    return highlightSpots.filter((spot) => spot.stationSlug === selectedStation.slug);
  }, [highlightSpots, selectedStation]);

  return (
    <>
      <section className="rounded-3xl bg-[linear-gradient(160deg,#2c1810_0%,#1a0e08_100%)] p-6 text-white sm:p-8">
        <p className="text-xs uppercase tracking-wider text-white/60">
          Mapa sensible
        </p>
        <h2 className="display-font mt-3 text-4xl leading-tight">
          Explora experiencias por estacion.
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {filters.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Mapa"
          title="Selecciona una estacion para filtrar experiencias"
          description="La seleccion territorial reorganiza los recorridos visibles y mantiene el contexto de actores e imperdibles."
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
            eyebrow="Circuitos"
            title={
              selectedStation
                ? `Experiencias en ${selectedStation.locality}`
                : "Primeras experiencias"
            }
            description="Cards conectadas a datos reales y filtradas por la estacion seleccionada."
          />
          <div className="mt-6 grid gap-4">
            {selectedExperiences.slice(0, 3).map((item) => (
              <SurfaceCard key={item.slug}>
                <span className="inline-flex rounded-full bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-strong)]">
                  {item.tag}
                </span>
                <h3 className="display-font mt-4 text-3xl leading-tight text-[color:var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                  {item.description}
                </p>
                <div className="mt-5 flex items-center justify-between text-sm text-[color:var(--text-muted)]">
                  <span>{item.location}</span>
                  <span>{item.duration}</span>
                </div>
                <Link
                  href={`/explorar/${item.slug}`}
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
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
            title="Actores e imperdibles cercanos"
            description="La seleccion del mapa tambien reorganiza el entorno narrativo de cada experiencia."
          />
          <div className="mt-6 grid gap-4">
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Actores en la estacion
              </p>
              <p className="display-font mt-2 text-4xl text-[color:var(--accent)]">
                {selectedArtisans.length}
              </p>
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Imperdibles en la estacion
              </p>
              <p className="display-font mt-2 text-4xl text-[color:var(--accent)]">
                {selectedHighlightSpots.length}
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
