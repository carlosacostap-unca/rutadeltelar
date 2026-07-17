import {
  getArtisansResult,
  getHighlightSpotsResult,
  getStationsResult,
} from "@/app/lib/data";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { Suspense } from "react";
import { EstacionesClient } from "@/components/estaciones-client";
import { DataSourceBadge } from "@/components/data-source-badge";

type EstacionesPageProps = {
  searchParams?: Promise<{
    departamento?: string | string[];
  }>;
};

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EstacionesPage({
  searchParams,
}: EstacionesPageProps) {
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
  const query = searchParams ? await searchParams : {};
  const requestedDepartment = getSingleParam(query.departamento);
  const selectedDepartment =
    requestedDepartment && departments.includes(requestedDepartment)
      ? requestedDepartment
      : undefined;
  const pageTitle = selectedDepartment ?? "Todas las estaciones";
  const pageDescription = selectedDepartment
    ? "Recorre las estaciones del departamento y descubre sus actores, experiencias e imperdibles dentro de la Ruta del Telar."
    : "Recorre todas las estaciones y descubre sus actores, experiencias e imperdibles dentro de la Ruta del Telar.";

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-8 sm:pt-8 md:pb-28 md:pt-12 lg:px-10">
        <header className="mb-4">
          <p className="text-lg font-black uppercase leading-none tracking-normal text-white sm:text-xl">
            Estaciones
          </p>
          <h1 className="brand-font mt-1 max-w-4xl uppercase leading-none tracking-normal text-[#f3d7b4] text-[2.35rem] font-normal sm:text-[3rem] md:text-[3.75rem]">
            {formatBrandFontText(pageTitle)}
          </h1>
          <p className="mt-3 max-w-5xl text-left text-sm font-medium leading-snug text-white/85 sm:mt-4 sm:text-lg">
            {pageDescription}
          </p>
          {stationsResult.source !== "pocketbase" || stationsResult.error ? (
            <div className="mt-4">
              <DataSourceBadge
                source={stationsResult.source}
                error={stationsResult.error}
              />
            </div>
          ) : null}
        </header>

        <Suspense
          fallback={
            <div className="rounded-[1.85rem] bg-[#efd4b0] p-6 text-sm font-medium text-[#123a55]">
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
      </div>
    </main>
  );
}
