import {
  getArtisansResult,
  getHighlightSpotsResult,
  getStationsResult,
} from "@/app/lib/data";
import { StationsBrowser } from "@/components/stations-browser";
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

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Estaciones"
          title="Nodos territoriales de la Ruta del Telar"
          description="Cada estacion organiza actores, experiencias e imperdibles dentro del territorio."
        />
        <div className="mt-4">
          <DataSourceBadge
            source={stationsResult.source}
            error={stationsResult.error}
          />
        </div>
      </header>

      <StationsBrowser
        stations={stations}
        artisans={artisans}
        highlightSpots={highlightSpots}
      />
    </main>
  );
}
