"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Experience, type Station } from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";
import { SurfaceCard } from "@/components/surface-card";

type Props = {
  experiences: Experience[];
  stations: Station[];
  categories: string[];
  durations: string[];
};

export function ExperienciasClient({ experiences, stations, categories, durations }: Props) {
  const [category, setCategory] = useState("todas");
  const [stationSlug, setStationSlug] = useState("todas");
  const [duration, setDuration] = useState("todas");

  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      const matchCat = category === "todas" || e.tag === category;
      const matchStation =
        stationSlug === "todas" || e.stationSlug === stationSlug;
      const matchDuration = duration === "todas" || e.duration === duration;
      return matchCat && matchStation && matchDuration;
    });
  }, [experiences, category, stationSlug, duration]);

  return (
    <>
      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Por categoría */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
            Categoría
          </p>
          <div
            role="group"
            aria-label="Filtrar experiencias por categoria"
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap"
          >
            <FilterChip
              active={category === "todas"}
              onClick={() => setCategory("todas")}
            >
              Todas
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </FilterChip>
            ))}
          </div>
        </div>

        {/* Por estación */}
        {stations.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Estación
            </p>
            <div
              role="group"
              aria-label="Filtrar experiencias por estacion"
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap"
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
                  {s.locality}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        {/* Por duración */}
        {durations.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Duración
            </p>
            <div
              role="group"
              aria-label="Filtrar experiencias por duracion"
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap"
            >
              <FilterChip
                active={duration === "todas"}
                onClick={() => setDuration("todas")}
              >
                Cualquiera
              </FilterChip>
              {durations.map((d) => (
                <FilterChip
                  key={d}
                  active={duration === d}
                  onClick={() => setDuration(d)}
                >
                  {d}
                </FilterChip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <p className="mb-4 text-sm text-[color:var(--text-muted)]" role="status" aria-live="polite">
        {filtered.length} experiencia{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exp) => (
          <Link key={exp.slug} href={`/explorar/${exp.slug}`} className="group">
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              {exp.imageUrl ? (
                <div className="relative mb-4 aspect-[3/2] overflow-hidden rounded-xl">
                  <PbImage
                    src={exp.imageUrl}
                    alt={exp.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={getImageFocusStyle(exp.imageFocus)}
                    fallback={<MediaFallback label="Experiencia" />}
                  />
                </div>
              ) : (
                <div className="mb-4 aspect-[3/2] overflow-hidden rounded-xl">
                  <MediaFallback label="Experiencia" />
                  {/*
                  🧭
                  */}
                </div>
              )}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[rgba(138,69,43,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent)]">
                  {exp.tag}
                </span>
                <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-[10px] text-[color:var(--text-muted)]">
                  {exp.duration}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                {exp.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-muted)] line-clamp-2">
                {exp.description}
              </p>
              {exp.stationName && (
                <p className="mt-3 text-xs font-medium text-[color:var(--text-muted)]">
                  📍 {exp.stationName}
                </p>
              )}
            </SurfaceCard>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-[color:var(--text-muted)]">
            No hay experiencias con esos filtros.
          </div>
        )}
      </div>
    </>
  );
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
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
        active
          ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
          : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:border-[color:var(--accent-mid)]"
      }`}
    >
      {children}
    </button>
  );
}
