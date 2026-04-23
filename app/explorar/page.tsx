import {
  getExperiencesResult,
  getStationsResult,
} from "@/app/lib/data";
import { ExperienciasClient } from "@/components/experiencias-client";
import { DataSourceBadge } from "@/components/data-source-badge";
import { SectionHeading } from "@/components/section-heading";

export default async function ExplorarPage() {
  const [experiencesResult, stationsResult] = await Promise.all([
    getExperiencesResult(),
    getStationsResult(),
  ]);
  const experiences = experiencesResult.items;
  const stations = stationsResult.items;

  // Opciones únicas de filtros
  const categories = [...new Set(experiences.map((e) => e.tag).filter(Boolean))].sort();
  const durations = [...new Set(experiences.map((e) => e.duration).filter(Boolean))].sort();

  // Solo estaciones que tienen al menos una experiencia
  const stationsWithExp = stations.filter((s) =>
    experiences.some((e) => e.stationSlug === s.slug || e.stationRecordId === s.recordId),
  );

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-6">
        <SectionHeading
          eyebrow="Experiencias"
          title="Quiero hacer algo"
          description="Actividades, talleres y recorridos para conectar con el tejido como práctica viva. Filtrá por categoría, estación o duración."
        />
        <div className="mt-4">
          <DataSourceBadge
            source={experiencesResult.source}
            error={experiencesResult.error}
          />
        </div>
      </header>

      <ExperienciasClient
        experiences={experiences}
        stations={stationsWithExp}
        categories={categories}
        durations={durations}
      />
    </main>
  );
}

