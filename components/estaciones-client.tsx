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
import { SurfaceCard } from "@/components/surface-card";

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

function DepartmentStationCard({ station }: { station: Station }) {
  return (
    <Link
      href={`/estaciones/${station.slug}`}
      className="group block"
    >
      <article className="h-full overflow-hidden rounded-[1.85rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[0.95] w-full overflow-hidden">
          {station.imageUrl ? (
            <PbImage
              src={station.imageUrl}
              alt={station.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 33vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(station.imageFocus)}
              fallback={<MediaFallback label="Estacion" />}
            />
          ) : (
            <MediaFallback label="Estacion" />
          )}
          {station.hasInauguratedStation ? (
            <span className="absolute left-4 top-4 rounded-full bg-[#123a55] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] shadow">
              Inaugurada
            </span>
          ) : null}
        </div>
        <div className="p-6">
          {station.locality ? (
            <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#18364d]/80">
              {formatStationLocation(station.locality)}
            </p>
          ) : null}
          <h3 className="mt-1 text-[1.75rem] font-black leading-[0.92] tracking-normal text-[#082d49]">
            {station.name}
          </h3>
          {station.slogan ? (
            <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-normal text-[#18364d]/75">
              {station.slogan}
            </p>
          ) : null}
          <HighlightedData
            value={station.datoDestacado}
            compact
            className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
          />
        </div>
      </article>
    </Link>
  );
}

function DefaultStationCard({ station }: { station: Station }) {
  return (
    <Link
      href={`/estaciones/${station.slug}`}
      className="group"
    >
      <SurfaceCard className="soft-shadow h-full overflow-hidden !p-0 transition group-hover:border-[color:var(--accent)]">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
          {station.imageUrl ? (
            <PbImage
              src={station.imageUrl}
              alt={station.name}
              fill
              className="object-cover transition group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              usage="small"
              style={getImageFocusStyle(station.imageFocus)}
              fallback={<MediaFallback label="Estacion" />}
            />
          ) : (
            <MediaFallback label="Estacion" />
          )}
          {station.hasInauguratedStation ? (
            <span className="absolute left-3 top-3 rounded-full bg-[color:var(--accent)] px-3 py-0.5 text-xs font-semibold text-white shadow">
              Estacion inaugurada
            </span>
          ) : null}
        </div>
        <div className="p-4">
          {station.department ? (
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
              {station.department}
            </p>
          ) : null}
          <h3 className="mt-1 text-base font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
            {station.name}
          </h3>
          <p className="mt-0.5 text-sm text-[color:var(--text-muted)]">
            {formatStationLocation(station.locality)}
          </p>
          <p className="mt-2 text-xs italic leading-relaxed text-[color:var(--text-muted)]">
            &quot;{station.slogan}&quot;
          </p>
          <HighlightedData
            value={station.datoDestacado}
            compact
            className="mt-3"
          />
        </div>
      </SurfaceCard>
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
  const useHomeStyle = true;
  const [view, setView] = useState<"lista" | "mapa">("lista");
  const [search, setSearch] = useState("");

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

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="stations-search" className="sr-only">
          Buscar estaciones por nombre o localidad
        </label>
        <input
          id="stations-search"
          type="search"
          placeholder={
            dept !== "todas"
              ? `Buscar en ${dept}...`
              : "Buscar en todas las estaciones..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={
            useHomeStyle
              ? "flex-1 rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] px-5 py-3 text-sm font-medium text-[#123a55] placeholder:text-[#123a55]/65 focus:border-white focus:outline-none"
              : ""
          }
        />
        <div
          role="group"
          aria-label="Vista de estaciones"
          className={
            useHomeStyle
              ? "flex rounded-full border border-[#efd4b0]/30 bg-[#efd4b0]/15 p-1"
              : ""
          }
        >
          <button
            type="button"
            aria-pressed={view === "lista"}
            onClick={() => setView("lista")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
              view === "lista"
                ? useHomeStyle
                  ? "bg-[#efd4b0] text-[#123a55] shadow-sm"
                  : "bg-[color:var(--accent)] text-white shadow-sm"
                : useHomeStyle
                  ? "text-[#efd4b0]"
                  : "text-[color:var(--text-muted)]"
            }`}
          >
            Lista
          </button>
          <button
            type="button"
            aria-pressed={view === "mapa"}
            onClick={() => setView("mapa")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
              view === "mapa"
                ? useHomeStyle
                  ? "bg-[#efd4b0] text-[#123a55] shadow-sm"
                  : "bg-[color:var(--accent)] text-white shadow-sm"
                : useHomeStyle
                  ? "text-[#efd4b0]"
                  : "text-[color:var(--text-muted)]"
            }`}
          >
            Mapa
          </button>
        </div>
      </div>

      {departments.length > 0 ? (
        <div
          role="group"
          aria-label="Filtrar estaciones por departamento"
          className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap"
        >
          <button
            type="button"
            aria-pressed={dept === "todas"}
            onClick={() => handleDepartmentChange("todas")}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
              dept === "todas"
                ? useHomeStyle
                  ? "border-[#efd4b0] bg-[#efd4b0] text-[#123a55]"
                  : "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                : useHomeStyle
                  ? "border-[#efd4b0]/35 text-[#efd4b0] hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
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
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
                dept === department
                  ? useHomeStyle
                    ? "border-[#efd4b0] bg-[#efd4b0] text-[#123a55]"
                    : "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                  : useHomeStyle
                    ? "border-[#efd4b0]/35 text-[#efd4b0] hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
                    : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
              }`}
            >
              {department}
            </button>
          ))}
        </div>
      ) : null}

      {view === "mapa" ? (
        <StationsTerritoryMap
          stations={filtered}
          artisans={artisans}
          highlightSpots={highlightSpots}
        />
      ) : (
        <>
          <p className="sr-only" aria-live="polite">
            {filtered.length} estaciones disponibles.
          </p>
          <div
            className={
              useHomeStyle
                ? "grid gap-10 sm:grid-cols-2 md:gap-14 lg:grid-cols-3"
                : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {filtered.map((station) =>
              useHomeStyle ? (
                <DepartmentStationCard key={station.slug} station={station} />
              ) : (
                <DefaultStationCard key={station.slug} station={station} />
              ),
            )}

            {filtered.length === 0 ? (
              <div
                className={`col-span-full py-16 text-center text-sm ${
                  useHomeStyle
                    ? "text-[#efd4b0]"
                    : "text-[color:var(--text-muted)]"
                }`}
              >
                No hay estaciones que coincidan con tu busqueda.
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
