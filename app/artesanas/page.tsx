import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { getArtisansResult, getStationsResult } from "@/app/lib/data";
import { ActoresClient } from "@/components/actores-client";
import { DataSourceBadge } from "@/components/data-source-badge";

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
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-8 sm:pt-8 md:pb-28 md:pt-12 lg:px-10">
        <header className="mb-8">
          <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
            Actores
          </p>
          <h1 className="brand-font mt-1 max-w-4xl text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem] md:text-[3.75rem]">
            {formatBrandFontText("Actores de la ruta")}
          </h1>
          <p className="mt-5 w-full text-justify text-base font-medium leading-tight text-white/85 sm:text-lg">
            Artesanos, tejedores, productores, hospedajes, emprendimientos
            gastronómicos y guías que integran la Ruta del Telar. Cada actor
            representa una forma de vivir el territorio.
          </p>
          <div className="mt-4">
            <DataSourceBadge
              source={artisansResult.source}
              error={artisansResult.error}
            />
          </div>
        </header>

        <ActoresClient
          artisans={artisans}
          stations={stationsWithActor}
          tipos={tipos}
        />
      </div>
    </main>
  );
}
