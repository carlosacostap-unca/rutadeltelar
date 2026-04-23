import { getArtisansResult, getStationsResult } from "@/app/lib/data";
import { ActoresClient } from "@/components/actores-client";
import { DataSourceBadge } from "@/components/data-source-badge";
import { SectionHeading } from "@/components/section-heading";

export default async function ArtesanasPage() {
  const [artisansResult, stationsResult] = await Promise.all([
    getArtisansResult(),
    getStationsResult(),
  ]);
  const artisans = artisansResult.items;
  const stations = stationsResult.items;

  const tipos = [
    ...new Set(artisans.map((a) => a.actorType ?? "").filter(Boolean)),
  ].sort();

  const stationsWithActor = stations.filter((s) =>
    artisans.some(
      (a) => a.stationSlug === s.slug || a.stationRecordId === s.recordId,
    ),
  );

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Actores"
          title="Actores de la ruta"
          description="Artesanos, tejedores, productores, hospedajes, emprendimientos gastronómicos y guías que integran la Ruta del Telar. Cada actor representa una forma de vivir el territorio."
        />
        <div className="mt-4">
          <DataSourceBadge
            source={artisansResult.source}
            error={artisansResult.error}
          />
        </div>
      </header>

      <ActoresClient artisans={artisans} stations={stationsWithActor} tipos={tipos} />
    </main>
  );
}