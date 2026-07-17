import {
  getExperiencesResult,
  getStationsResult,
} from "@/app/lib/data";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { ExperienciasClient } from "@/components/experiencias-client";
import { DataSourceBadge } from "@/components/data-source-badge";

export default async function ExplorarPage() {
  const [experiencesResult, stationsResult] = await Promise.all([
    getExperiencesResult(),
    getStationsResult(),
  ]);
  const experiences = experiencesResult.items;
  const stations = stationsResult.items;

  const categories = [
    ...new Set(experiences.map((experience) => experience.tag).filter(Boolean)),
  ].sort();
  const durations = [
    ...new Set(
      experiences.map((experience) => experience.duration).filter(Boolean),
    ),
  ].sort();

  const stationsWithExperiences = stations.filter((station) =>
    experiences.some(
      (experience) =>
        experience.stationSlug === station.slug ||
        experience.stationRecordId === station.recordId,
    ),
  );

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-8 sm:pt-8 md:pb-28 md:pt-12 lg:px-10">
        <header className="mb-8">
          <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
            Experiencias
          </p>
          <h1 className="brand-font mt-1 max-w-4xl text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem] md:text-[3.75rem]">
            {formatBrandFontText("Quiero hacer algo")}
          </h1>
          <p className="mt-5 w-full text-justify text-base font-medium leading-tight text-white/85 sm:text-lg">
            Actividades, talleres y recorridos para conectar con el tejido como
            practica viva. Filtra por categoria, estacion o duracion.
          </p>
          <div className="mt-4">
            <DataSourceBadge
              source={experiencesResult.source}
              error={experiencesResult.error}
            />
          </div>
        </header>

        <ExperienciasClient
          experiences={experiences}
          stations={stationsWithExperiences}
          categories={categories}
          durations={durations}
        />
      </div>
    </main>
  );
}
