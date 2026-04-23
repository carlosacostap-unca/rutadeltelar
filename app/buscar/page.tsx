import { Suspense } from "react";
import {
  getArtisans,
  getExperiences,
  getHighlightSpots,
  getProducts,
  getStations,
} from "@/app/lib/data";
import { SectionHeading } from "@/components/section-heading";
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
    <main className="flex flex-1 flex-col">
      <header className="mb-6">
        <SectionHeading
          eyebrow="Búsqueda"
          title="¿Qué estás buscando?"
          description="Buscá en estaciones, actores, productos, experiencias e imperdibles de la Ruta del Telar."
        />
      </header>

      <Suspense fallback={null}>
        <BuscarClient
          stations={stations}
          artisans={artisans}
          products={products}
          experiences={experiences}
          spots={spots}
        />
      </Suspense>
    </main>
  );
}
