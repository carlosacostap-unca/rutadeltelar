"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { type Artisan, type HighlightSpot, type Station } from "@/app/lib/content";
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
        Cargando mapa…
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

export function EstacionesClient({ stations, artisans, highlightSpots, departments }: Props) {
  const [view, setView] = useState<"lista" | "mapa">("lista");
  const [dept, setDept] = useState<string>("todas");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return stations.filter((s) => {
      const matchDept = dept === "todas" || (s.department ?? "") === dept;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.locality.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [stations, dept, search]);

  return (
    <>
      {/* Barra de búsqueda + toggle vista */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="stations-search" className="sr-only">
          Buscar estaciones por nombre o localidad
        </label>
        <input
          id="stations-search"
          type="search"
          placeholder="Buscar por nombre o localidad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2.5 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)] focus:outline-none"
        />
        <div
          role="group"
          aria-label="Vista de estaciones"
          className="flex rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1"
        >
          <button
            type="button"
            aria-pressed={view === "lista"}
            onClick={() => setView("lista")}
            className={`flex-1 rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
              view === "lista"
                ? "bg-[color:var(--accent)] text-white shadow-sm"
                : "text-[color:var(--text-muted)]"
            }`}
          >
            Lista
          </button>
          <button
            type="button"
            aria-pressed={view === "mapa"}
            onClick={() => setView("mapa")}
            className={`flex-1 rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
              view === "mapa"
                ? "bg-[color:var(--accent)] text-white shadow-sm"
                : "text-[color:var(--text-muted)]"
            }`}
          >
            Mapa
          </button>
        </div>
      </div>

      {/* Filtro por departamento */}
      {departments.length > 0 && (
        <div
          role="group"
          aria-label="Filtrar estaciones por departamento"
          className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap"
        >
          <button
            type="button"
            aria-pressed={dept === "todas"}
            onClick={() => setDept("todas")}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
              dept === "todas"
                ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
            }`}
          >
            Todos
          </button>
          {departments.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={dept === d}
              onClick={() => setDept(d)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
                dept === d
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                  : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((station) => (
            <Link
              key={station.slug}
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
                      fallback={<MediaFallback label="Estacion" />}
                    />
                  ) : (
                    <>
                      <MediaFallback label="Estacion" />
                    {/*
                      🗺️
                    */}
                    </>
                  )}
                  {station.hasInauguratedStation && (
                    <span className="absolute left-3 top-3 rounded-full bg-[color:var(--accent)] px-3 py-0.5 text-xs font-semibold text-white shadow">
                      Estación inaugurada
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {station.department && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                      {station.department}
                    </p>
                  )}
                  <h3 className="mt-1 text-base font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                    {station.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-[color:var(--text-muted)]">
                    {station.locality}
                  </p>
                  <p className="mt-2 text-xs italic leading-relaxed text-[color:var(--text-muted)]">
                    &quot;{station.slogan}&quot;
                  </p>
                </div>
              </SurfaceCard>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-[color:var(--text-muted)]">
              No hay estaciones que coincidan con tu búsqueda.
            </div>
          )}
        </div>
        </>
      )}
    </>
  );
}
