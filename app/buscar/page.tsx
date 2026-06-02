import { Suspense } from "react";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import {
  getArtisans,
  getExperiences,
  getHighlightSpots,
  getProducts,
  getStations,
} from "@/app/lib/data";
import { BuscarClient } from "@/components/buscar-client";

export const dynamic = "force-dynamic";

export default async function BuscarPage() {
  const [stations, artisans, products, experiences, spots] = await Promise.all([
    getStations(),
    getArtisans(),
    getProducts(),
    getExperiences(),
    getHighlightSpots(),
  ]);

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-16 lg:px-10">
        <header className="mb-8">
          <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
            Busqueda
          </p>
          <h1 className="brand-font mt-1 max-w-4xl text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem] md:text-[3.75rem]">
            {formatBrandFontText("Que estas buscando")}
          </h1>
          <p className="mt-5 w-full text-left text-base font-medium leading-tight text-white/85 sm:text-justify sm:text-lg">
            Busca en estaciones, actores, productos, experiencias e imperdibles
            de la Ruta del Telar.
          </p>
        </header>

        <Suspense
          fallback={
            <div className="rounded-[1.85rem] bg-[#efd4b0] p-6 text-sm font-medium text-[#123a55]">
              Cargando busqueda...
            </div>
          }
        >
          <BuscarClient
            stations={stations}
            artisans={artisans}
            products={products}
            experiences={experiences}
            spots={spots}
          />
        </Suspense>
      </div>
    </main>
  );
}
