import {
  getArtisansResult,
  getHighlightSpotsResult,
  getStationsResult,
} from "@/app/lib/data";
import { MapaClient } from "@/components/mapa-client";
import { SectionHeading } from "@/components/section-heading";

export default async function MapaPage() {
  const [stationsResult, artisansResult, highlightSpotsResult] =
    await Promise.all([
      getStationsResult(),
      getArtisansResult(),
      getHighlightSpotsResult(),
    ]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-6">
        <SectionHeading
          eyebrow="Mapa"
          title="La ruta en el territorio"
          description="Estaciones, actores e imperdibles geolocalizados. Activá y desactivá capas para explorar."
        />
      </header>

      <MapaClient
        stations={stationsResult.items}
        artisans={artisansResult.items}
        highlightSpots={highlightSpotsResult.items}
      />
    </main>
  );
}
