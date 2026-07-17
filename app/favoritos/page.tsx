import type { Metadata } from "next";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { createPageMetadata } from "@/app/lib/metadata";
import { FavoritesClient } from "@/components/favorites-client";

export const metadata: Metadata = createPageMetadata({
  title: "Favoritos",
  description: "Tus estaciones, experiencias, productos y recorridos guardados en este dispositivo.",
  path: "/favoritos",
});

export default function FavoritosPage() {
  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-8 sm:pt-8 md:pb-28 md:pt-12 lg:px-10">
        <header className="mb-8">
          <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
            Guardados
          </p>
          <h1 className="brand-font mt-1 text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem] md:text-[3.75rem]">
            {formatBrandFontText("Tus favoritos")}
          </h1>
          <p className="mt-5 max-w-4xl text-base font-medium leading-tight text-white/85 sm:text-lg">
            Guarda estaciones, actores, productos y experiencias para volver a
            encontrarlos cuando quieras.
          </p>
        </header>

        <FavoritesClient />
      </div>
    </main>
  );
}
