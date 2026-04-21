import { highlights } from "@/app/lib/content";
import {
  getArtisansResult,
  getExperiencesResult,
  getHighlightSpotsResult,
  getStationsResult,
} from "@/app/lib/data";
import { ExperiencesBrowser } from "@/components/experiences-browser";
import { DataSourceBadge } from "@/components/data-source-badge";
import { SectionHeading } from "@/components/section-heading";
import { SurfaceCard } from "@/components/surface-card";

export default async function ExplorarPage() {
  const [experiencesResult, stationsResult, artisansResult, highlightSpotsResult] =
    await Promise.all([
      getExperiencesResult(),
      getStationsResult(),
      getArtisansResult(),
      getHighlightSpotsResult(),
    ]);
  const experiences = experiencesResult.items;
  const stations = stationsResult.items;
  const artisans = artisansResult.items;
  const highlightSpots = highlightSpotsResult.items;

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Experiencias"
          title="Recorridos y propuestas culturales"
          description="Pantalla alineada con la coleccion `experiencias`, pensada para descubrir actividades dentro de cada estacion."
        />
        <div className="mt-4">
          <DataSourceBadge
            source={experiencesResult.source}
            error={experiencesResult.error}
          />
        </div>
      </header>

      <ExperiencesBrowser
        experiences={experiences}
        stations={stations}
        artisans={artisans}
        highlightSpots={highlightSpots}
      />

      <section className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        {highlights.map((item) => (
          <SurfaceCard key={item.label} className="p-4">
            <p className="display-font text-3xl text-[color:var(--accent)]">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              {item.label}
            </p>
          </SurfaceCard>
        ))}
      </section>
    </main>
  );
}
