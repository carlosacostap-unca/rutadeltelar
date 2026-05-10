"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type HighlightSpot } from "@/app/lib/content";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";
import { SurfaceCard } from "@/components/surface-card";

type Props = {
  spots: HighlightSpot[];
  types: string[];
  hasUpcoming: boolean;
};

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("es-AR", { month: "short" }),
    dayName: d.toLocaleDateString("es-AR", { weekday: "long" }),
    full: d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  };
}

function groupByDate(events: HighlightSpot[]) {
  const groups: Record<string, HighlightSpot[]> = {};
  for (const ev of events) {
    if (!ev.eventDate) continue;
    const d = new Date(ev.eventDate);
    const key = d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  }
  return groups;
}

const PRIORITY_ORDER: Record<string, number> = { alta: 0, media: 1, baja: 2 };

export function ImperdiblesClient({ spots, types, hasUpcoming }: Props) {
  const [view, setView] = useState<"agenda" | "destacados">(
    hasUpcoming ? "agenda" : "destacados",
  );
  const [typeFilter, setTypeFilter] = useState("todos");

  const eventos = useMemo(
    () =>
      spots
        .filter((s) => s.type.toLowerCase() === "evento" && s.eventDate)
        .sort(
          (a, b) =>
            new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime(),
        ),
    [spots],
  );

  const destacados = useMemo(() => {
    const atemporales = spots.filter(
      (s) => s.type.toLowerCase() !== "evento",
    );
    const filtered =
      typeFilter === "todos"
        ? atemporales
        : atemporales.filter((s) => s.type.toLowerCase() === typeFilter);
    return [...filtered].sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority.toLowerCase()] ?? 99) -
        (PRIORITY_ORDER[b.priority.toLowerCase()] ?? 99),
    );
  }, [spots, typeFilter]);

  const groupedEvents = useMemo(() => groupByDate(eventos), [eventos]);

  return (
    <>
      {/* Toggle Agenda / Destacados */}
      <div className="mb-6 flex rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1">
        <button
          type="button"
          onClick={() => setView("agenda")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            view === "agenda"
              ? "bg-[color:var(--accent)] text-white shadow-sm"
              : "text-[color:var(--text-muted)]"
          }`}
        >
          Agenda
          {eventos.length > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
              {eventos.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setView("destacados")}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            view === "destacados"
              ? "bg-[color:var(--accent)] text-white shadow-sm"
              : "text-[color:var(--text-muted)]"
          }`}
        >
          Destacados
        </button>
      </div>

      {/* ── Vista Agenda ──────────────────────────────────────── */}
      {view === "agenda" && (
        <>
          {eventos.length === 0 ? (
            <SurfaceCard className="py-16 text-center">
              <p className="text-3xl">📅</p>
              <p className="mt-4 text-sm text-[color:var(--text-muted)]">
                No hay eventos próximos registrados.
              </p>
            </SurfaceCard>
          ) : (
            <div className="flex flex-col gap-8">
              {Object.entries(groupedEvents).map(([dateLabel, events]) => (
                <div key={dateLabel}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-[color:var(--border)]" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
                      {dateLabel}
                    </span>
                    <div className="h-px flex-1 bg-[color:var(--border)]" />
                  </div>
                  <div className="flex flex-col gap-3">
                    {events.map((event) => {
                      const dt = formatEventDate(event.eventDate!);
                      return (
                        <Link
                          key={event.slug}
                          href={`/imperdibles/${event.slug}`}
                          className="group"
                        >
                          <SurfaceCard className="soft-shadow flex items-center gap-4 transition group-hover:border-[color:var(--accent)]">
                            <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[color:var(--accent)] py-3 text-white">
                              <span className="text-[10px] font-semibold uppercase leading-none">
                                {dt.month}
                              </span>
                              <span className="display-font mt-0.5 text-2xl font-bold leading-none">
                                {dt.day}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                                {event.location}
                              </p>
                              <h3 className="mt-0.5 truncate text-base font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                                {event.title}
                              </h3>
                              <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-1">
                                {event.subtitle}
                              </p>
                            </div>
                            {event.imageUrl && (
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                                <PbImage
                                  src={event.imageUrl}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            )}
                          </SurfaceCard>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Vista Destacados ──────────────────────────────────── */}
      {view === "destacados" && (
        <>
          {/* Filtro por tipo */}
          {types.length > 0 && (
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
              <FilterChip
                active={typeFilter === "todos"}
                onClick={() => setTypeFilter("todos")}
              >
                Todos
              </FilterChip>
              {types.map((t) => (
                <FilterChip
                  key={t}
                  active={typeFilter === t.toLowerCase()}
                  onClick={() => setTypeFilter(t.toLowerCase())}
                >
                  {t}
                </FilterChip>
              ))}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((spot) => (
              <Link
                key={spot.slug}
                href={`/imperdibles/${spot.slug}`}
                className="group"
              >
                <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
                  {spot.imageUrl ? (
                    <div className="relative mb-4 aspect-[3/2] overflow-hidden rounded-xl">
                      <PbImage
                        src={spot.imageUrl}
                        alt={spot.title}
                        fill
                        className="object-cover transition group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        fallback={
                          <div className="mb-4 aspect-[3/2] overflow-hidden rounded-xl">
                            <MediaFallback label="Imperdible" />
                            {/*
                            ⭐
                            */}
                          </div>
                        }
                      />
                    </div>
                  ) : (
                    <div className="mb-4 aspect-[3/2] overflow-hidden rounded-xl">
                      <MediaFallback label="Imperdible" />
                      {/*
                      ⭐
                      */}
                    </div>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                    {spot.type}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                    {spot.title}
                  </h3>
                  <p className="mt-1 text-xs italic text-[color:var(--text-muted)]">
                    {spot.subtitle}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--text-muted)] line-clamp-2">
                    {spot.description}
                  </p>
                  {spot.location && (
                    <p className="mt-3 text-xs font-medium text-[color:var(--text-muted)]">
                      📍 {spot.location}
                    </p>
                  )}
                </SurfaceCard>
              </Link>
            ))}

            {destacados.length === 0 && (
              <div className="col-span-full py-16 text-center text-sm text-[color:var(--text-muted)]">
                No hay destacados de ese tipo.
              </div>
            )}
          </div>
        </>
      )}
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
