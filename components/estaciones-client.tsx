"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type Artisan,
  type HighlightSpot,
  type Station,
} from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { HighlightedData } from "@/components/highlighted-data";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

const StationsTerritoryMap = dynamic(
  () =>
    import("@/components/stations-territory-map").then(
      (mod) => mod.StationsTerritoryMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-sm text-[color:var(--text-muted)]">
        Cargando mapa...
      </div>
    ),
  },
);

type Props = {
  stations: Station[];
  artisans: Artisan[];
  highlightSpots: HighlightSpot[];
  departments: string[];
};

function formatStationLocation(value: string) {
  return value.replace(/,\s*Catamarca\.?$/i, "");
}

function normalizeLabel(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getStationEyebrow(station: Station) {
  if (station.department?.trim()) {
    return station.department;
  }

  const stationName = normalizeLabel(station.name.replace(/^Estaci[oó]n\s+/i, ""));
  const candidates = [station.department, formatStationLocation(station.locality)];
  const distinctLabel = candidates.find(
    (candidate) => candidate && normalizeLabel(candidate) !== stationName,
  );

  if (distinctLabel) {
    return distinctLabel;
  }

  return "Estación de la ruta";
}

function DepartmentStationCard({
  station,
  eager = false,
}: {
  station: Station;
  eager?: boolean;
}) {
  return (
    <Link href={`/estaciones/${station.slug}`} className="group block">
      <article className="grid min-h-36 grid-cols-[7.5rem_minmax(0,1fr)] overflow-hidden rounded-[1.5rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1 sm:block sm:h-full sm:rounded-[1.85rem]">
        <div className="relative min-h-full w-full overflow-hidden sm:aspect-[0.95] sm:min-h-0">
          {station.imageUrl ? (
            <PbImage
              src={station.imageUrl}
              alt={station.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 639px) 120px, (max-width: 1023px) 50vw, 33vw"
              usage="small"
              quality={90}
              loading={eager ? "eager" : undefined}
              style={getImageFocusStyle(station.imageFocus)}
              fallback={<MediaFallback label="Estación" />}
            />
          ) : (
            <MediaFallback label="Estación" />
          )}
          {station.hasInauguratedStation ? (
            <span className="absolute left-4 top-4 rounded-full bg-[#123a55] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] shadow">
              Inaugurada
            </span>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col justify-center p-4 sm:block sm:p-6">
          <p className="text-[0.65rem] font-black uppercase leading-tight tracking-normal text-[#18364d]/75 sm:text-[0.7rem] sm:font-medium sm:leading-none">
            {getStationEyebrow(station)}
          </p>
          <h3 className="mt-1 text-[1.3rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[1.75rem] sm:leading-[0.92]">
            {station.name}
          </h3>
          {station.slogan ? (
            <p className="mt-2 line-clamp-2 text-[0.68rem] font-medium uppercase leading-snug tracking-normal text-[#18364d]/75 sm:mt-3 sm:text-[0.72rem]">
              {station.slogan}
            </p>
          ) : null}
          <HighlightedData
            value={station.datoDestacado}
            compact
            className="mt-4 hidden border-[#123a55]/20 bg-[#123a55]/5 sm:block"
          />
        </div>
      </article>
    </Link>
  );
}

export function EstacionesClient({
  stations,
  artisans,
  highlightSpots,
  departments,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const urlDepartment = searchParams.get("departamento");
  const dept =
    urlDepartment && departments.includes(urlDepartment) ? urlDepartment : "todas";
  const [view, setView] = useState<"lista" | "mapa">("lista");
  const [search, setSearch] = useState("");
  const hasFilters = search.trim() !== "" || dept !== "todas";

  function handleDepartmentChange(value: string) {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "todas") {
        params.delete("departamento");
      } else {
        params.set("departamento", value);
      }

      const query = params.toString();
      router.replace(query ? `/estaciones?${query}` : "/estaciones", {
        scroll: false,
      });
    });
  }

  function clearFilters() {
    setSearch("");
    handleDepartmentChange("todas");
  }

  const filtered = useMemo(() => {
    return stations.filter((station) => {
      const matchDept = dept === "todas" || (station.department ?? "") === dept;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        station.name.toLowerCase().includes(q) ||
        station.locality.toLowerCase().includes(q) ||
        (station.datoDestacado ?? "").toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [stations, dept, search]);
  const resultLabel = `${filtered.length} ${
    filtered.length === 1 ? "estación" : "estaciones"
  }${dept !== "todas" ? ` en ${dept}` : ""}${
    search.trim() ? ` para “${search.trim()}”` : ""
  }`;
  const clearLabel =
    search.trim() !== "" ? "Limpiar filtros" : "Quitar filtro";
  const mapTitle =
    dept === "todas"
      ? "Estaciones de la Ruta del Telar"
      : `Estaciones de ${dept}`;

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <label
            htmlFor="stations-search"
            className="sr-only"
          >
            Buscar una estación
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#123a55]/65"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="m16 16 4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
            <input
              id="stations-search"
              type="search"
              placeholder={
                dept !== "todas"
                  ? `Buscar en ${dept}...`
                  : "Nombre, localidad o dato destacado..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-12 w-full rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] py-3 pl-12 pr-5 text-sm font-medium text-[#123a55] placeholder:text-[#123a55]/60 focus:border-white focus:outline-none"
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
            Vista
          </p>
          <div
            role="group"
            aria-label="Vista de estaciones"
            className="flex rounded-full border border-[#efd4b0]/30 bg-[#efd4b0]/15 p-1 sm:w-48"
          >
            <button
              type="button"
              aria-pressed={view === "lista"}
              onClick={() => setView("lista")}
              className={`min-h-10 flex-1 rounded-full px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
                view === "lista"
                  ? "bg-[#efd4b0] text-[#123a55] shadow-sm"
                  : "text-[#efd4b0]"
              }`}
            >
              Lista
            </button>
            <button
              type="button"
              aria-pressed={view === "mapa"}
              onClick={() => setView("mapa")}
              className={`min-h-10 flex-1 rounded-full px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
                view === "mapa"
                  ? "bg-[#efd4b0] text-[#123a55] shadow-sm"
                  : "text-[#efd4b0]"
              }`}
            >
              Mapa
            </button>
          </div>
        </div>
      </div>

      {departments.length > 0 ? (
        <div className="mb-5">
          <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
            Departamento
          </p>
          <div
            role="group"
            aria-label="Filtrar estaciones por departamento"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
          >
            <button
              type="button"
              aria-pressed={dept === "todas"}
              onClick={() => handleDepartmentChange("todas")}
              className={`min-h-11 rounded-full border px-3 py-2 text-xs font-black uppercase leading-tight tracking-normal transition sm:min-h-0 sm:shrink-0 sm:px-4 sm:text-sm ${
                dept === "todas"
                  ? "border-[#efd4b0] bg-[#efd4b0] text-[#123a55]"
                  : "border-[#efd4b0]/35 text-[#efd4b0] hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
              }`}
            >
              Todas
            </button>
            {departments.map((department) => (
              <button
                key={department}
                type="button"
                aria-pressed={dept === department}
                onClick={() => handleDepartmentChange(department)}
                className={`min-h-11 rounded-full border px-3 py-2 text-xs font-black uppercase leading-tight tracking-normal transition sm:min-h-0 sm:shrink-0 sm:px-4 sm:text-sm ${
                  dept === department
                    ? "border-[#efd4b0] bg-[#efd4b0] text-[#123a55]"
                    : "border-[#efd4b0]/35 text-[#efd4b0] hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
                }`}
              >
                {department}{" "}
                {dept === department ? <span aria-hidden="true">×</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {view === "mapa" ? (
        <StationsTerritoryMap
          stations={filtered}
          artisans={artisans}
          highlightSpots={highlightSpots}
          initialVisibleLayers={{
            stations: true,
            artisans: false,
            highlightSpots: false,
          }}
          scopeRelatedEntitiesToStations
          showExplorer={false}
          showLegend={false}
          showLayerControls={false}
          title={mapTitle}
          initialZoom={8}
        />
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            {filtered.length} estaciones disponibles.
          </p>
          <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#efd4b0]/15 pb-3">
            <p className="text-sm font-black text-[#efd4b0]">
              {resultLabel}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={
                  search.trim() !== ""
                    ? clearFilters
                    : () => handleDepartmentChange("todas")
                }
                className="text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] underline decoration-[#efd4b0]/55 underline-offset-4 transition hover:text-white"
              >
                {clearLabel}
              </button>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-10 md:gap-14 lg:grid-cols-3">
            {filtered.map((station, index) => (
              <DepartmentStationCard
                key={station.slug}
                station={station}
                eager={index === 0}
              />
            ))}

            {filtered.length === 0 ? (
              <div className="col-span-full py-16 text-center text-sm text-[#efd4b0]">
                No hay estaciones que coincidan con tu busqueda.
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
