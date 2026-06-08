"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Artisan, type Station } from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { HighlightedData } from "@/components/highlighted-data";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

type Props = {
  artisans: Artisan[];
  stations: Station[];
  tipos: string[]; // from tipos_actor catalog (derived from live data)
};

function formatActorLocation(value?: string) {
  return (value ?? "").replace(/,\s*Catamarca\.?$/i, "");
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
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

function ActorCard({ item }: { item: Artisan }) {
  const location = formatActorLocation(item.stationName ?? item.place);

  return (
    <Link href={`/artesanas/${item.slug}`} className="group block">
      <article className="h-full overflow-hidden rounded-[1.85rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[0.95] w-full overflow-hidden">
          {item.imageUrl ? (
            <PbImage
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 33vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(item.imageFocus)}
              fallback={<MediaFallback label="Actor" />}
            />
          ) : (
            <MediaFallback label="Actor" />
          )}
          {item.actorType ? (
            <span className="absolute left-4 top-4 rounded-full bg-[#123a55] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] shadow">
              {item.actorType}
            </span>
          ) : null}
        </div>
        <div className="p-6">
          {location ? (
            <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#18364d]/80">
              {location}
            </p>
          ) : null}
          <h3 className="mt-1 text-[1.75rem] font-black leading-[0.92] tracking-normal text-[#082d49]">
            {item.name}
          </h3>
          <p className="mt-3 line-clamp-3 text-[0.78rem] font-medium uppercase leading-tight tracking-normal text-[#18364d]/75">
            {item.craft}
          </p>
          <HighlightedData
            value={item.datoDestacado}
            compact
            className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
          />
        </div>
      </article>
    </Link>
  );
}

export function ActoresClient({ artisans, stations, tipos }: Props) {
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [stationSlug, setStationSlug] = useState("todas");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return artisans.filter((a) => {
      const selectedStation = stations.find((s) => s.slug === stationSlug);
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.craft.toLowerCase().includes(q) ||
        a.place.toLowerCase().includes(q) ||
        (a.actorType ?? "").toLowerCase().includes(q) ||
        (a.stationName ?? "").toLowerCase().includes(q) ||
        (a.datoDestacado ?? "").toLowerCase().includes(q);
      const matchTipo =
        tipo === "todos" ||
        (a.actorType ?? "").toLowerCase() === tipo.toLowerCase();
      const matchStation =
        stationSlug === "todas" ||
        a.stationSlug === stationSlug ||
        (!!selectedStation?.recordId &&
          a.stationRecordId === selectedStation.recordId);

      return matchSearch && matchTipo && matchStation;
    });
  }, [artisans, search, tipo, stationSlug, stations]);

  const activeFilters = [
    tipo !== "todos"
      ? { key: "tipo", label: tipo, clear: () => setTipo("todos") }
      : null,
    stationSlug !== "todas"
      ? {
          key: "station",
          label:
            stations.find((s) => s.slug === stationSlug)?.locality ??
            stationSlug,
          clear: () => setStationSlug("todas"),
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const hasFilters = search.trim() !== "" || activeFilters.length > 0;

  function clearAll() {
    setSearch("");
    setTipo("todos");
    setStationSlug("todas");
  }

  return (
    <>
      <div className="mb-5">
        <label htmlFor="actors-search" className="sr-only">
          Buscar actores por nombre u oficio
        </label>
        <input
          id="actors-search"
          type="search"
          placeholder="Buscar por nombre u oficio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] px-5 py-3 text-sm font-medium text-[#123a55] placeholder:text-[#123a55]/65 focus:border-white focus:outline-none"
        />
      </div>

      <div className="mb-6 flex flex-col gap-4">
        {tipos.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]/80">
              Tipo de actor
            </p>
            <div
              role="group"
              aria-label="Filtrar actores por tipo"
              className="flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
            >
              <FilterChip
                active={tipo === "todos"}
                onClick={() => setTipo("todos")}
              >
                Todos
              </FilterChip>
              {tipos.map((t) => (
                <FilterChip
                  key={t}
                  active={tipo === t}
                  onClick={() => setTipo(t)}
                >
                  {t}
                </FilterChip>
              ))}
            </div>
          </div>
        ) : null}

        {stations.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]/80">
              Estación
            </p>
            <div
              role="group"
              aria-label="Filtrar actores por estación"
              className="flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
            >
              <FilterChip
                active={stationSlug === "todas"}
                onClick={() => setStationSlug("todas")}
              >
                Todas
              </FilterChip>
              {stations.map((s) => (
                <FilterChip
                  key={s.slug}
                  active={stationSlug === s.slug}
                  onClick={() => setStationSlug(s.slug)}
                >
                  {formatActorLocation(s.locality)}
                </FilterChip>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {hasFilters ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="flex items-center gap-1.5 rounded-full bg-[#efd4b0]/15 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]"
            >
              {formatActorLocation(f.label)}
              <button
                type="button"
                onClick={f.clear}
                aria-label={`Quitar filtro: ${f.label}`}
                className="hover:text-white"
              >
                x
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-[#efd4b0]/35 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
          >
            Limpiar
          </button>
        </div>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        {filtered.length} actor{filtered.length !== 1 ? "es" : ""} disponibles.
      </p>

      <div className="grid gap-10 sm:grid-cols-2 md:gap-14 lg:grid-cols-3">
        {filtered.map((item) => (
          <ActorCard key={item.slug} item={item} />
        ))}

        {filtered.length === 0 ? (
          <p className="col-span-full py-16 text-center text-sm text-[#efd4b0]">
            Sin resultados.{" "}
            <button
              type="button"
              onClick={clearAll}
              className="font-semibold text-white underline"
            >
              Limpiar filtros
            </button>
          </p>
        ) : null}
      </div>
    </>
  );
}
