"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Artisan, type Station } from "@/app/lib/content";
import { PbImage } from "@/components/pb-image";
import { SurfaceCard } from "@/components/surface-card";

type Props = {
  artisans: Artisan[];
  stations: Station[];
  tipos: string[]; // from tipos_actor catalog (derived from live data)
};

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
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
          : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      }`}
    >
      {children}
    </button>
  );
}

export function ActoresClient({ artisans, stations, tipos }: Props) {
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [stationSlug, setStationSlug] = useState("todas");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return artisans.filter((a) => {
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.craft.toLowerCase().includes(q);
      const matchTipo =
        tipo === "todos" ||
        (a.actorType ?? "").toLowerCase() === tipo.toLowerCase();
      const matchStation =
        stationSlug === "todas" || a.stationSlug === stationSlug;
      return matchSearch && matchTipo && matchStation;
    });
  }, [artisans, search, tipo, stationSlug]);

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
      {/* Búsqueda */}
      <div className="mb-5">
        <label htmlFor="actors-search" className="sr-only">
          Buscar actores por nombre u oficio
        </label>
        <input
          id="actors-search"
          type="search"
          placeholder="Buscar por nombre u oficio…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2.5 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)] focus:outline-none"
        />
      </div>

      {/* Filtros cerrados (catálogo) */}
      <div className="mb-4 flex flex-col gap-3">
        {tipos.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Tipo de actor
            </p>
            <div role="group" aria-label="Filtrar actores por tipo" className="flex flex-wrap gap-2">
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
        )}

        {stations.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Estación
            </p>
            <div role="group" aria-label="Filtrar actores por estacion" className="flex flex-wrap gap-2">
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
                  {s.locality}
                </FilterChip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chips de filtros activos + Limpiar */}
      {hasFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="flex items-center gap-1.5 rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--accent)]"
            >
              {f.label}
              <button
                type="button"
                onClick={f.clear}
                aria-label={`Quitar filtro: ${f.label}`}
                className="hover:text-[color:var(--accent-strong)]"
              >
                ✕
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--text-muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Conteo */}
      <p className="mb-4 text-sm text-[color:var(--text-muted)]" role="status" aria-live="polite">
        {filtered.length} actor{filtered.length !== 1 ? "es" : ""}
      </p>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Link key={item.slug} href={`/artesanas/${item.slug}`} className="group">
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              <div className="mb-4 flex items-center gap-3">
                {item.imageUrl ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[color:var(--border)]">
                    <PbImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      fallback={
                        <div className="display-font flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--surface)] text-lg text-[color:var(--accent-strong)]">
                          {item.name[0]}
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="display-font flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-lg text-[color:var(--accent-strong)]">
                    {item.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  {item.actorType && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                      {item.actorType}
                    </p>
                  )}
                  <h2 className="truncate font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                    {item.name}
                  </h2>
                </div>
              </div>
              <p className="text-xs text-[color:var(--text-muted)]">{item.place}</p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--foreground)] line-clamp-2">
                {item.craft}
              </p>
            </SurfaceCard>
          </Link>
        ))}

        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-[color:var(--text-muted)]">
            Sin resultados.{" "}
            <button
              type="button"
              onClick={clearAll}
              className="text-[color:var(--accent)] underline"
            >
              Limpiar filtros
            </button>
          </p>
        )}
      </div>
    </>
  );
}
