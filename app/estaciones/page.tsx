import {
  getArtisansResult,
  getHighlightSpotsResult,
  getStationsResult,
} from "@/app/lib/data";
import { Suspense } from "react";
import { EstacionesClient } from "@/components/estaciones-client";
import { DataSourceBadge } from "@/components/data-source-badge";
import { SectionHeading } from "@/components/section-heading";

export default async function EstacionesPage() {
  const [stationsResult, artisansResult, highlightSpotsResult] =
    await Promise.all([
      getStationsResult(),
      getArtisansResult(),
      getHighlightSpotsResult(),
    ]);
  const stations = stationsResult.items;
  const artisans = artisansResult.items;
  const highlightSpots = highlightSpotsResult.items;

  const departments = [
    ...new Set(stations.map((s) => s.department ?? "").filter(Boolean)),
  ].sort();

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-6">
        <SectionHeading
          eyebrow="Estaciones"
          title="Nodos territoriales de la ruta"
          description="Cada estación organiza actores, experiencias e imperdibles dentro del territorio. Filtrá por departamento o buscá por nombre."
        />
        <div className="mt-4">
          <DataSourceBadge
            source={stationsResult.source}
            error={stationsResult.error}
          />
        </div>
      </header>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--text-muted)]">
            Cargando estaciones...
          </div>
        }
      >
        <EstacionesClient
          stations={stations}
          artisans={artisans}
          highlightSpots={highlightSpots}
          departments={departments}
        />
      </Suspense>
    </main>
  );
}

