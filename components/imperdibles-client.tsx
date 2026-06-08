"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type HighlightSpot } from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { HighlightedData } from "@/components/highlighted-data";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

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
    const key = formatEventDate(ev.eventDate).full;
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
      <div
        role="group"
        aria-label="Vista de imperdibles"
        className="mb-6 flex rounded-full border border-[#efd4b0]/30 bg-[#efd4b0]/15 p-1"
      >
        <button
          type="button"
          aria-pressed={view === "agenda"}
          onClick={() => setView("agenda")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
            view === "agenda"
              ? "bg-[#efd4b0] text-[#123a55] shadow-sm"
              : "text-[#efd4b0]"
          }`}
        >
          Agenda
          {eventos.length > 0 ? (
            <span className="ml-2 rounded-full bg-[#123a55]/15 px-1.5 py-0.5 text-[10px]">
              {eventos.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          aria-pressed={view === "destacados"}
          onClick={() => setView("destacados")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-black uppercase leading-none tracking-normal transition ${
            view === "destacados"
              ? "bg-[#efd4b0] text-[#123a55] shadow-sm"
              : "text-[#efd4b0]"
          }`}
        >
          Destacados
        </button>
      </div>

      {view === "agenda" ? (
        eventos.length === 0 ? (
          <div className="rounded-[1.85rem] bg-[#efd4b0] px-6 py-16 text-center text-sm font-medium text-[#123a55]">
            No hay eventos proximos registrados.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(groupedEvents).map(([dateLabel, events]) => (
              <section key={dateLabel}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#efd4b0]/35" />
                  <h2 className="text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
                    {dateLabel}
                  </h2>
                  <div className="h-px flex-1 bg-[#efd4b0]/35" />
                </div>
                <div className="grid gap-4">
                  {events.map((event) => (
                    <AgendaEventCard key={event.slug} event={event} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <>
          {types.length > 0 ? (
            <div
              role="group"
              aria-label="Filtrar imperdibles por tipo"
              className="mb-8 flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
            >
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
          ) : null}

          <p className="sr-only" aria-live="polite">
            {destacados.length} imperdibles disponibles.
          </p>
          <div className="grid gap-10 sm:grid-cols-2 md:gap-14 lg:grid-cols-3">
            {destacados.map((spot) => (
              <ImperdibleCard key={spot.slug} spot={spot} />
            ))}

            {destacados.length === 0 ? (
              <div className="col-span-full py-16 text-center text-sm text-[#efd4b0]">
                No hay destacados de ese tipo.
              </div>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

function AgendaEventCard({ event }: { event: HighlightSpot }) {
  const dt = formatEventDate(event.eventDate!);

  return (
    <Link href={`/imperdibles/${event.slug}`} className="group block">
      <article className="grid overflow-hidden rounded-[1.85rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1 sm:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="flex min-w-0 gap-4 p-5 sm:p-6">
          <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-[1.25rem] bg-[#123a55] text-[#efd4b0]">
            <span className="text-[0.7rem] font-black uppercase leading-none tracking-normal">
              {dt.month}
            </span>
            <span className="mt-1 text-[2rem] font-black leading-none">
              {dt.day}
            </span>
          </div>
          <div className="min-w-0 flex-1 self-center">
            {event.location ? (
              <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#18364d]/80">
                {event.location}
              </p>
            ) : null}
            <h3 className="mt-1 text-[1.65rem] font-black leading-[0.95] tracking-normal text-[#082d49]">
              {event.title}
            </h3>
            {event.subtitle ? (
              <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-normal text-[#18364d]/75">
                {event.subtitle}
              </p>
            ) : null}
            <HighlightedData
              value={event.datoDestacado}
              compact
              className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
            />
          </div>
        </div>
        <div className="relative hidden min-h-44 overflow-hidden sm:block">
          {event.imageUrl ? (
            <PbImage
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="13rem"
              usage="small"
              quality={90}
              style={getImageFocusStyle(event.imageFocus)}
              fallback={<MediaFallback label="Imperdible" />}
            />
          ) : (
            <MediaFallback label="Imperdible" />
          )}
        </div>
      </article>
    </Link>
  );
}

function ImperdibleCard({ spot }: { spot: HighlightSpot }) {
  return (
    <Link href={`/imperdibles/${spot.slug}`} className="group block">
      <article className="h-full overflow-hidden rounded-[1.85rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[0.95] w-full overflow-hidden">
          {spot.imageUrl ? (
            <PbImage
              src={spot.imageUrl}
              alt={spot.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 33vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(spot.imageFocus)}
              fallback={<MediaFallback label="Imperdible" />}
            />
          ) : (
            <MediaFallback label="Imperdible" />
          )}
          <span className="absolute left-4 top-4 rounded-full bg-[#123a55] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] shadow">
            {spot.type}
          </span>
        </div>
        <div className="p-6">
          {spot.location ? (
            <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#18364d]/80">
              {spot.location}
            </p>
          ) : null}
          <h3 className="mt-1 text-[1.75rem] font-black leading-[0.92] tracking-normal text-[#082d49]">
            {spot.title}
          </h3>
          {spot.subtitle ? (
            <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-normal text-[#18364d]/75">
              {spot.subtitle}
            </p>
          ) : null}
          {spot.description ? (
            <p className="mt-3 text-sm font-medium leading-tight text-[#18364d]/80 line-clamp-3">
              {spot.description}
            </p>
          ) : null}
          <HighlightedData
            value={spot.datoDestacado}
            compact
            className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
          />
        </div>
      </article>
    </Link>
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
