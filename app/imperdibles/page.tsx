import {
  getArtisansResult,
  getHighlightSpotsResult,
  getStationsResult,
} from "@/app/lib/data";
import { DataSourceBadge } from "@/components/data-source-badge";
import { HighlightSpotsBrowser } from "@/components/highlight-spots-browser";
import { SectionHeading } from "@/components/section-heading";

export default async function ImperdiblesPage() {
  const [highlightSpotsResult, stationsResult, artisansResult] = await Promise.all([
    getHighlightSpotsResult(),
    getStationsResult(),
    getArtisansResult(),
  ]);
  const highlightSpots = highlightSpotsResult.items;
  const stations = stationsResult.items;
  const artisans = artisansResult.items;

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Imperdibles"
          title="Atractivos, actividades y eventos"
          description="Este modulo responde directamente a la coleccion `imperdibles` del backend."
        />
        <div className="mt-4">
          <DataSourceBadge
            source={highlightSpotsResult.source}
            error={highlightSpotsResult.error}
          />
        </div>
      </header>

      <HighlightSpotsBrowser
        highlightSpots={highlightSpots}
        stations={stations}
        artisans={artisans}
      />
    </main>
  );
}
