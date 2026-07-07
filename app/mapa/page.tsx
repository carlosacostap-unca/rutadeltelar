import { formatBrandFontText } from "@/app/lib/brand-font-text";
import {
  getArtisansResult,
  getHighlightSpotsResult,
  getStationsResult,
} from "@/app/lib/data";
import { hasValidCoordinates } from "@/app/lib/geo";
import { DataSourceBadge } from "@/components/data-source-badge";
import { MapaClient } from "@/components/mapa-client";

export default async function MapaPage() {
  const [stationsResult, artisansResult, highlightSpotsResult] =
    await Promise.all([
      getStationsResult(),
      getArtisansResult(),
      getHighlightSpotsResult(),
    ]);
  const geolocatedStations =
    stationsResult.items.filter(hasValidCoordinates).length;
  const geolocatedArtisans =
    artisansResult.items.filter(hasValidCoordinates).length;
  const geolocatedHighlightSpots =
    highlightSpotsResult.items.filter(hasValidCoordinates).length;
  const geolocatedTotal =
    geolocatedStations + geolocatedArtisans + geolocatedHighlightSpots;

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-16 lg:px-10">
        <header className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
              Mapa
            </p>
            <h1 className="brand-font mt-1 max-w-4xl text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem] md:text-[3.75rem]">
              {formatBrandFontText("La ruta en el territorio")}
            </h1>
            <p className="mt-5 w-full max-w-3xl text-pretty text-base font-medium leading-tight text-white/85 sm:text-lg">
              Explora estaciones, actores e imperdibles como una trama territorial:
              activa capas, enfoca una estacion y salta del punto del mapa a su
              historia.
            </p>
            <div className="mt-4">
              <DataSourceBadge
                source={stationsResult.source}
                error={stationsResult.error}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-[1.85rem] border border-[#efd4b0]/20 bg-[#efd4b0]/10 p-3 text-[#efd4b0] lg:grid-cols-1">
            <div>
              <p className="text-2xl font-black leading-none text-white">
                {geolocatedTotal}
              </p>
              <p className="mt-1 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#efd4b0]/70">
                puntos geolocalizados
              </p>
            </div>
            <div>
              <p className="text-2xl font-black leading-none text-white">
                {geolocatedStations}
              </p>
              <p className="mt-1 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#efd4b0]/70">
                estaciones
              </p>
            </div>
            <div>
              <p className="text-2xl font-black leading-none text-white">
                {geolocatedArtisans + geolocatedHighlightSpots}
              </p>
              <p className="mt-1 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#efd4b0]/70">
                actores e imperdibles
              </p>
            </div>
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
