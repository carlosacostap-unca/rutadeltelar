import { formatBrandFontText } from "@/app/lib/brand-font-text";
import {
  getArtisansResult,
  getHighlightSpotsResult,
  getStationsResult,
} from "@/app/lib/data";
import { DataSourceBadge } from "@/components/data-source-badge";
import { MapaClient } from "@/components/mapa-client";

export default async function MapaPage() {
  const [stationsResult, artisansResult, highlightSpotsResult] =
    await Promise.all([
      getStationsResult(),
      getArtisansResult(),
      getHighlightSpotsResult(),
    ]);

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-16 lg:px-10">
        <header className="mb-8">
          <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
            Mapa
          </p>
          <h1 className="brand-font mt-1 max-w-4xl text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem] md:text-[3.75rem]">
            {formatBrandFontText("La ruta en el territorio")}
          </h1>
          <p className="mt-5 w-full text-justify text-base font-medium leading-tight text-white/85 sm:text-lg">
            Estaciones, actores e imperdibles geolocalizados. Activa y
            desactiva capas para explorar la Ruta del Telar desde el territorio.
          </p>
          <div className="mt-4">
            <DataSourceBadge
              source={stationsResult.source}
              error={stationsResult.error}
            />
          </div>
        </header>

        <MapaClient
          stations={stationsResult.items}
          artisans={artisansResult.items}
          highlightSpots={highlightSpotsResult.items}
        />
      </div>
    </main>
  );
}
