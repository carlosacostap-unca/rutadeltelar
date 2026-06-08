"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { type Experience, type Station } from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { HighlightedData } from "@/components/highlighted-data";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

type Props = {
  experiences: Experience[];
  stations: Station[];
  categories: string[];
  durations: string[];
};

function formatLocation(value: string) {
  return value.replace(/,\s*Catamarca\.?$/i, "");
}

function experienceMatchesStation(experience: Experience, station: Station) {
  return (
    experience.stationSlug === station.slug ||
    (Boolean(experience.stationRecordId) &&
      experience.stationRecordId === station.recordId)
  );
}

function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link href={`/explorar/${experience.slug}`} className="group block">
      <article className="h-full overflow-hidden rounded-[1.85rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[0.95] w-full overflow-hidden">
          {experience.imageUrl ? (
            <PbImage
              src={experience.imageUrl}
              alt={experience.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 33vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(experience.imageFocus)}
              fallback={<MediaFallback label="Experiencia" />}
            />
          ) : (
            <MediaFallback label="Experiencia" />
          )}
          {experience.duration ? (
            <span className="absolute left-4 top-4 rounded-full bg-[#123a55] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] shadow">
              {experience.duration}
            </span>
          ) : null}
        </div>
        <div className="p-6">
          {experience.tag ? (
            <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#18364d]/80">
              {experience.tag}
            </p>
          ) : null}
          <h3 className="mt-1 text-[1.75rem] font-black leading-[0.92] tracking-normal text-[#082d49]">
            {experience.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm font-medium leading-tight text-[#18364d]/80">
            {experience.description}
          </p>
          <HighlightedData
            value={experience.datoDestacado}
            compact
            className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
          />
          {experience.stationName || experience.location ? (
            <p className="mt-4 text-[0.72rem] font-black uppercase leading-tight tracking-normal text-[#18364d]/75">
              {formatLocation(experience.stationName || experience.location)}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export function ExperienciasClient({
  experiences,
  stations,
  categories,
  durations,
}: Props) {
  const [category, setCategory] = useState("todas");
  const [stationSlug, setStationSlug] = useState("todas");
  const [duration, setDuration] = useState("todas");
  const [search, setSearch] = useState("");

  const activeStation = useMemo(
    () => stations.find((station) => station.slug === stationSlug),
    [stations, stationSlug],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return experiences.filter((experience) => {
      const matchCategory = category === "todas" || experience.tag === category;
      const matchStation =
        stationSlug === "todas" ||
        (activeStation
          ? experienceMatchesStation(experience, activeStation)
          : experience.stationSlug === stationSlug);
      const matchDuration =
        duration === "todas" || experience.duration === duration;
      const matchSearch =
        !query ||
        experience.title.toLowerCase().includes(query) ||
        experience.description.toLowerCase().includes(query) ||
        experience.summary.toLowerCase().includes(query) ||
        experience.location.toLowerCase().includes(query) ||
        (experience.stationName ?? "").toLowerCase().includes(query) ||
        (experience.datoDestacado ?? "").toLowerCase().includes(query);

      return matchCategory && matchStation && matchDuration && matchSearch;
    });
  }, [experiences, category, stationSlug, activeStation, duration, search]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3">
        <label htmlFor="experiences-search" className="sr-only">
          Buscar experiencias por nombre, estacion o contenido
        </label>
        <input
          id="experiences-search"
          type="search"
          placeholder="Buscar en experiencias..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] px-5 py-3 text-sm font-medium text-[#123a55] placeholder:text-[#123a55]/65 focus:border-white focus:outline-none"
        />
      </div>

      <div className="mb-8 space-y-4">
        {categories.length > 0 ? (
          <FilterGroup label="Categoria" ariaLabel="Filtrar experiencias por categoria">
            <FilterChip
              active={category === "todas"}
              onClick={() => setCategory("todas")}
            >
              Todas
            </FilterChip>
            {categories.map((item) => (
              <FilterChip
                key={item}
                active={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </FilterChip>
            ))}
          </FilterGroup>
        ) : null}

        {stations.length > 0 ? (
          <FilterGroup label="Estacion" ariaLabel="Filtrar experiencias por estacion">
            <FilterChip
              active={stationSlug === "todas"}
              onClick={() => setStationSlug("todas")}
            >
              Todas
            </FilterChip>
            {stations.map((station) => (
              <FilterChip
                key={station.slug}
                active={stationSlug === station.slug}
                onClick={() => setStationSlug(station.slug)}
              >
                {formatLocation(station.locality)}
              </FilterChip>
            ))}
          </FilterGroup>
        ) : null}

        {durations.length > 0 ? (
          <FilterGroup label="Duracion" ariaLabel="Filtrar experiencias por duracion">
            <FilterChip
              active={duration === "todas"}
              onClick={() => setDuration("todas")}
            >
              Cualquiera
            </FilterChip>
            {durations.map((item) => (
              <FilterChip
                key={item}
                active={duration === item}
                onClick={() => setDuration(item)}
              >
                {item}
              </FilterChip>
            ))}
          </FilterGroup>
        ) : null}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {filtered.length} experiencias disponibles.
      </p>

      <div className="grid gap-10 sm:grid-cols-2 md:gap-14 lg:grid-cols-3">
        {filtered.map((experience) => (
          <ExperienceCard key={experience.slug} experience={experience} />
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-[#efd4b0]">
            No hay experiencias que coincidan con tu busqueda.
          </div>
        ) : null}
      </div>
    </>
  );
}

function FilterGroup({
  label,
  ariaLabel,
  children,
}: {
  label: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
        {label}
      </p>
      <div
        role="group"
        aria-label={ariaLabel}
        className="flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
      >
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
        active
          ? "border-[#efd4b0] bg-[#efd4b0] text-[#123a55]"
          : "border-[#efd4b0]/35 text-[#efd4b0] hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
      }`}
    >
      {children}
    </button>
  );
}
