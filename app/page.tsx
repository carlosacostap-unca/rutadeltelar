import Link from "next/link";
import {
  highlights,
  quickActions,
} from "@/app/lib/content";
import {
  getArtisansResult,
  getExperiencesResult,
  getHighlightSpotsResult,
  getSuggestedJourneys,
  getStationsResult,
} from "@/app/lib/data";
import { DataSourceBadge } from "@/components/data-source-badge";
import { HomeTerritorySection } from "@/components/home-territory-section";
import { SectionHeading } from "@/components/section-heading";
import { SurfaceCard } from "@/components/surface-card";

export default async function Home() {
  const [
    experiencesResult,
    artisansResult,
    stationsResult,
    highlightSpotsResult,
    suggestedJourneys,
  ] = await Promise.all([
    getExperiencesResult(),
    getArtisansResult(),
    getStationsResult(),
    getHighlightSpotsResult(),
    getSuggestedJourneys(),
  ]);
  const experiences = experiencesResult.items;
  const artisans = artisansResult.items;
  const stations = stationsResult.items;
  const highlightSpots = highlightSpotsResult.items;
  const featuredExperience = experiences[0];
  const featuredJourney = suggestedJourneys[0];

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
            Ruta del Telar
          </p>
          <h1 className="display-font mt-2 text-4xl text-[color:var(--foreground)] sm:text-5xl">
            Inicio
          </h1>
        </div>
        <div className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm text-[color:var(--text-muted)]">
          Modo visitante
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-3">
        <DataSourceBadge
          source={experiencesResult.source}
          error={experiencesResult.error}
        />
        <DataSourceBadge
          source={artisansResult.source}
          error={artisansResult.error}
        />
        <DataSourceBadge
          source={stationsResult.source}
          error={stationsResult.error}
        />
        <DataSourceBadge
          source={highlightSpotsResult.source}
          error={highlightSpotsResult.error}
        />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="soft-shadow overflow-hidden bg-[linear-gradient(180deg,#a35331_0%,#7b371d_100%)] text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">
            Experiencia recomendada
          </p>
          <h2 className="display-font mt-3 max-w-lg text-4xl leading-tight sm:text-5xl">
            Entre telares, paisaje y memoria viva.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/80">
            Una portada pensada desde la estructura real del backend: estaciones,
            experiencias, imperdibles y actores para que la visita se entienda
            como recorrido territorial.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={
                featuredJourney
                  ? `/recorridos/${featuredJourney.slug}`
                  : featuredExperience
                    ? `/explorar/${featuredExperience.slug}`
                    : "/explorar"
              }
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--accent-strong)] hover:-translate-y-0.5"
            >
              Abrir recorrido sugerido
            </Link>
            <Link
              href="/estaciones"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5"
            >
              Ver estaciones
            </Link>
          </div>
        </SurfaceCard>

        <div className="grid grid-cols-2 gap-3">
          {highlights.map((item) => (
            <SurfaceCard key={item.label} className="soft-shadow p-4">
              <p className="display-font text-3xl text-[color:var(--accent)]">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                {item.label}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading
          eyebrow="Accesos rapidos"
          title="Atajos pensados para uso real"
          description="Cada bloque ya funciona como punto de entrada a un modulo del producto."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {quickActions.map((item) => (
            <Link key={item.href} href={item.href}>
              <SurfaceCard className="h-full">
                <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
                  Ir ahora
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[color:var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {item.description}
                </p>
              </SurfaceCard>
            </Link>
          ))}
        </div>
      </section>

      <HomeTerritorySection
        stations={stations}
        artisans={artisans}
        highlightSpots={highlightSpots}
      />
    </main>
  );
}
