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

type HomeTerritorySectionProps = {
  stations: Station[];
  artisans: Artisan[];
  highlightSpots: HighlightSpot[];
};

export function HomeTerritorySection({
  stations,
  artisans,
  highlightSpots,
}: HomeTerritorySectionProps) {
  const [selectedSlug, setSelectedSlug] = useState(stations[0]?.slug);

  const selectedStation = useMemo(
    () => stations.find((station) => station.slug === selectedSlug) ?? stations[0],
    [selectedSlug, stations],
  );

  const selectedArtisans = useMemo(() => {
    if (!selectedStation) return artisans.slice(0, 2);

    return artisans.filter(
      (artisan) => artisan.stationSlug === selectedStation.slug,
    );
  }, [artisans, selectedStation]);

  const selectedHighlightSpots = useMemo(() => {
    if (!selectedStation) return highlightSpots.slice(0, 2);

    return highlightSpots.filter(
      (spot) => spot.stationSlug === selectedStation.slug,
    );
  }, [highlightSpots, selectedStation]);

  return (
    <>
      <section className="mt-14">
        <SectionHeading
          eyebrow="Mapa"
          title="Lectura territorial de la ruta"
          description="Selecciona una estacion en el mapa para sincronizar el contenido destacado del territorio."
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

      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="Territorio"
            title={
              selectedStation
                ? `Estacion seleccionada: ${selectedStation.locality}`
                : "Estaciones de la ruta"
            }
            description="La estructura territorial real del backend pasa a ser eje de navegacion."
          />
          <div className="mt-6 grid gap-4">
            {selectedStation ? (
              <SurfaceCard>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--accent)]">
                  {selectedStation.locality}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[color:var(--foreground)]">
                  {selectedStation.name}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
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
            ) : null}
            <Link
              href="/estaciones"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
            >
              Abrir estaciones
            </Link>
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Imperdibles"
            title={
              selectedStation
                ? `Destacados en ${selectedStation.locality}`
                : "Atractivos, actividades y eventos"
            }
            description="El mapa pasa a gobernar que puntos destacados se priorizan en la vista."
          />
          <div className="mt-6 grid gap-4">
            {selectedHighlightSpots.slice(0, 2).map((item) => (
              <SurfaceCard key={item.slug}>
                <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                  {item.location}
                </p>
                <h3 className="display-font mt-2 text-3xl text-[color:var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {item.subtitle}
                </p>
                <Link
                  href={`/imperdibles/${item.slug}`}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
                >
                  Ver detalle
                </Link>
              </SurfaceCard>
            ))}
            <Link
              href="/imperdibles"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
            >
              Ver imperdibles
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading
          eyebrow="Actores"
          title={
            selectedStation
              ? `Actores en ${selectedStation.locality}`
              : "Actores artesanales destacados"
          }
          description="La seleccion territorial tambien reorganiza los perfiles artesanales sugeridos."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          {selectedArtisans.slice(0, 2).map((item) => (
            <SurfaceCard key={item.slug}>
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                {item.place}
              </p>
              <h3 className="display-font mt-2 text-3xl text-[color:var(--foreground)]">
                {item.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                {item.craft}
              </p>
              <Link
                href={`/artesanas/${item.slug}`}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
              >
                Ver perfil
              </Link>
            </SurfaceCard>
          ))}
          <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--card)] p-5">
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              Selecciona otra estacion en el mapa para actualizar estos actores y
              los imperdibles sugeridos sin salir de la home.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
