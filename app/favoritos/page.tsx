import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/metadata";
import { FavoritesClient } from "@/components/favorites-client";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = createPageMetadata({
  title: "Favoritos",
  description: "Tus estaciones, experiencias, productos y recorridos guardados en este dispositivo.",
  path: "/favoritos",
});

export default function FavoritosPage() {
  return (
    <main className="flex flex-1 flex-col">
      <SectionHeading
        eyebrow="Guardados"
        title="Favoritos"
        description="Una lista privada que queda en este dispositivo para volver rapido a lo que queres visitar."
      />
      <div className="mt-6">
        <FavoritesClient />
      </div>
    </main>
  );
}
