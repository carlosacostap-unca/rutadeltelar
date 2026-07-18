"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type HighlightSpot } from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { FavoriteButton } from "@/components/favorite-button";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

type Props = {
  spots: HighlightSpot[];
  types: string[];
  initialView?: "agenda" | "destacados";
};

type SortOrder = "name" | "location";

const PAGE_SIZE = 12;

function formatLocation(value?: string) {
  return (value ?? "").replace(/,\s*Catamarca\.?$/i, "").trim();
}

function formatEventDate(iso: string) {
  const date = new Date(iso);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString("es-AR", { month: "short" }),
    full: date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  };
}

function groupByDate(events: HighlightSpot[]) {
  const groups: Record<string, HighlightSpot[]> = {};
  for (const event of events) {
    if (!event.eventDate) continue;
    const key = formatEventDate(event.eventDate).full;
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }
  return groups;
}

function SelectChevron({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HighlightFilterFields({
  types,
  locations,
  typeFilter,
  locationFilter,
  onTypeChange,
  onLocationChange,
  idPrefix,
  light = false,
}: {
  types: string[];
  locations: string[];
  typeFilter: string;
  locationFilter: string;
  onTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  idPrefix: string;
  light?: boolean;
}) {
  const labelClass = light ? "text-[#123a55]/70" : "text-[#efd4b0]/80";
  const selectClass = light
    ? "border-[#123a55]/15 bg-white text-[#123a55]"
    : "border-[#efd4b0]/30 bg-[#efd4b0] text-[#123a55]";
  const fields = [
    {
      id: `${idPrefix}-type`,
      label: "Tipo",
      value: typeFilter,
      onChange: onTypeChange,
      allLabel: "Todos los tipos",
      options: types,
    },
    {
      id: `${idPrefix}-location`,
      label: "Ubicación",
      value: locationFilter,
      onChange: onLocationChange,
      allLabel: "Todas las ubicaciones",
      options: locations,
    },
  ];

  return (
    <>
      {fields.map((field) => (
        <div key={field.id}>
          <label
            htmlFor={field.id}
            className={`mb-2 block text-xs font-black uppercase leading-none tracking-normal ${labelClass}`}
          >
            {field.label}
          </label>
          <span className="relative block">
            <select
              id={field.id}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              className={`min-h-12 w-full appearance-none rounded-2xl border px-4 py-3 pr-11 text-sm font-bold focus:outline-none ${selectClass}`}
            >
              <option value="todos">{field.allLabel}</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <SelectChevron className="text-[#123a55]" />
          </span>
        </div>
      ))}
    </>
  );
}

function HighlightFiltersSheet({
  open,
  resultCount,
  onClose,
  onClear,
  onApply,
  ...filterProps
}: Omit<Parameters<typeof HighlightFilterFields>[0], "idPrefix" | "light"> & {
  open: boolean;
  resultCount: number;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), select:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[5000] flex items-end bg-[#061b2a]/70 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="highlights-filter-title"
    >
      <button
        type="button"
        aria-label="Cerrar filtros"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-[2rem] bg-[#f3d7b4] px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 text-[#123a55] shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[#123a55]/20" />
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-[#8a452b]">
              Explorar imperdibles
            </p>
            <h2
              id="highlights-filter-title"
              className="mt-1 text-2xl font-black leading-none"
            >
              Filtros
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#123a55]/15 bg-white/60 text-xl font-bold"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="grid gap-5">
          <HighlightFilterFields
            {...filterProps}
            idPrefix="highlights-mobile-filter"
            light
          />
        </div>
        <div className="mt-7 grid grid-cols-[auto_1fr] gap-3">
          <button
            type="button"
            onClick={onClear}
            className="min-h-12 rounded-full border border-[#123a55]/25 px-5 text-sm font-black uppercase"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onApply}
            className="min-h-12 rounded-full bg-[#123a55] px-5 text-sm font-black text-[#f3d7b4]"
          >
            Ver {resultCount} resultado{resultCount !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ImperdibleCard({
  spot,
  eager = false,
}: {
  spot: HighlightSpot;
  eager?: boolean;
}) {
  const location = formatLocation(spot.stationName || spot.location);
  const highlighted = spot.datoDestacado?.trim();

  return (
    <article className="group relative h-full overflow-hidden rounded-[1.65rem] bg-[#efd4b0] text-[#0d314a] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/imperdibles/${spot.slug}`}
        className="grid h-full min-h-[13.5rem] grid-cols-[7.75rem_minmax(0,1fr)] sm:block sm:min-h-0"
      >
        <div className="relative h-full min-h-[13.5rem] w-full overflow-hidden sm:aspect-[4/3] sm:h-auto sm:min-h-0">
          {spot.imageUrl ? (
            <PbImage
              src={spot.imageUrl}
              alt={spot.title}
              fill
              priority={eager}
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 639px) 8rem, (max-width: 1023px) 50vw, 33vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(spot.imageFocus)}
              fallback={<MediaFallback label="Imperdible" />}
            />
          ) : (
            <MediaFallback label="Imperdible" />
          )}
        </div>

        <div className="flex min-w-0 flex-col p-4 sm:p-5">
          <h3 className="line-clamp-2 pr-8 text-[1.35rem] font-black leading-[0.94] tracking-normal text-[#082d49] sm:text-[1.55rem]">
            {spot.title}
          </h3>

          {spot.type ? (
            <p className="mt-2">
              <span className="inline-flex rounded-full border border-[#123a55]/15 bg-[#123a55]/8 px-2.5 py-1 text-[0.62rem] font-black uppercase leading-none text-[#123a55]">
                {spot.type}
              </span>
            </p>
          ) : null}

          {spot.subtitle ? (
            <p className="mt-2 line-clamp-2 text-[0.75rem] font-bold leading-tight text-[#18364d]/85">
              {spot.subtitle}
            </p>
          ) : null}

          {location ? (
            <p className="mt-2 flex items-center gap-1.5 text-[0.68rem] font-medium uppercase leading-tight text-[#18364d]/65">
              <svg
                className="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="10"
                  r="2.25"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="line-clamp-1">{location}</span>
            </p>
          ) : null}

          {highlighted ? (
            <div className="mt-3 border-l-2 border-[#8a452b] pl-2.5">
              <p className="text-[0.58rem] font-black uppercase leading-none text-[#8a452b]">
                Dato destacado
              </p>
              <p className="mt-1 line-clamp-2 text-[0.68rem] font-semibold leading-tight text-[#123a55]/80">
                {highlighted}
              </p>
            </div>
          ) : null}
        </div>
      </Link>

      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton
          compact
          variant="onDark"
          item={{
            type: "imperdible",
            slug: spot.slug,
            title: spot.title,
            subtitle: location || spot.type,
            href: `/imperdibles/${spot.slug}`,
            imageUrl: spot.imageUrl,
            imageFocus: spot.imageFocus,
            datoDestacado: spot.datoDestacado,
          }}
        />
      </div>
    </article>
  );
}

function HighlightsCatalog({
  spots,
  types,
}: {
  spots: HighlightSpot[];
  types: string[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [locationFilter, setLocationFilter] = useState("todos");
  const [sortOrder, setSortOrder] = useState<SortOrder>("name");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftType, setDraftType] = useState("todos");
  const [draftLocation, setDraftLocation] = useState("todos");

  const locations = useMemo(
    () =>
      [
        ...new Set(
          spots
            .map((spot) => formatLocation(spot.stationName || spot.location))
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b, "es")),
    [spots],
  );

  const filterSpots = useCallback(
    (selectedType: string, selectedLocation: string) => {
      const query = search.trim().toLocaleLowerCase("es");

      return spots.filter((spot) => {
        const location = formatLocation(spot.stationName || spot.location);
        const searchable = [
          spot.title,
          spot.subtitle,
          spot.description,
          spot.type,
          location,
          spot.datoDestacado ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase("es");
        const matchType =
          selectedType === "todos" || spot.type === selectedType;
        const matchLocation =
          selectedLocation === "todos" || location === selectedLocation;
        const matchSearch = !query || searchable.includes(query);

        return matchType && matchLocation && matchSearch;
      });
    },
    [search, spots],
  );

  const filtered = useMemo(() => {
    const matches = filterSpots(typeFilter, locationFilter);

    if (sortOrder === "name") {
      return [...matches].sort((a, b) =>
        a.title.localeCompare(b.title, "es", { sensitivity: "base" }),
      );
    }

    return [...matches].sort(
      (a, b) =>
        formatLocation(a.stationName || a.location).localeCompare(
          formatLocation(b.stationName || b.location),
          "es",
          { sensitivity: "base" },
        ) || a.title.localeCompare(b.title, "es", { sensitivity: "base" }),
    );
  }, [filterSpots, locationFilter, sortOrder, typeFilter]);

  const draftResultCount = useMemo(
    () => filterSpots(draftType, draftLocation).length,
    [draftLocation, draftType, filterSpots],
  );
  const visibleSpots = filtered.slice(0, visibleCount);
  const remainingCount = Math.max(filtered.length - visibleSpots.length, 0);

  function resetVisibleCount() {
    setVisibleCount(PAGE_SIZE);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetVisibleCount();
  }

  function handleTypeChange(value: string) {
    setTypeFilter(value);
    resetVisibleCount();
  }

  function handleLocationChange(value: string) {
    setLocationFilter(value);
    resetVisibleCount();
  }

  function clearAll() {
    setSearch("");
    setTypeFilter("todos");
    setLocationFilter("todos");
    resetVisibleCount();
  }

  function clearDraftFilters() {
    setDraftType("todos");
    setDraftLocation("todos");
  }

  function openFilterSheet() {
    setDraftType(typeFilter);
    setDraftLocation(locationFilter);
    setFiltersOpen(true);
  }

  function applyDraftFilters() {
    setTypeFilter(draftType);
    setLocationFilter(draftLocation);
    resetVisibleCount();
    setFiltersOpen(false);
  }

  const closeFilterSheet = useCallback(() => setFiltersOpen(false), []);

  const activeFilters = [
    typeFilter !== "todos"
      ? {
          key: "type",
          label: typeFilter,
          clear: () => handleTypeChange("todos"),
        }
      : null,
    locationFilter !== "todos"
      ? {
          key: "location",
          label: locationFilter,
          clear: () => handleLocationChange("todos"),
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const hasFilters = search.trim() !== "" || activeFilters.length > 0;
  const context =
    locationFilter !== "todos"
      ? locationFilter
      : typeFilter !== "todos"
        ? typeFilter
        : "";
  const resultLabel = `${filtered.length} imperdible${filtered.length !== 1 ? "s" : ""}${context ? ` · ${context}` : ""}`;

  return (
    <>
      <div className="mb-5 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="highlights-search" className="sr-only">
            Buscar imperdibles por nombre, tipo, ubicación o contenido
          </label>
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#123a55]/55"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m16 16 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="highlights-search"
            type="search"
            placeholder="Buscar por nombre, tipo o ubicación..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="min-h-12 w-full rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] py-3 pl-11 pr-11 text-sm font-medium text-[#123a55] placeholder:text-[#123a55]/65 focus:border-white focus:outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-lg font-bold text-[#123a55]/65 hover:bg-[#123a55]/10 hover:text-[#123a55]"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={openFilterSheet}
          className="relative inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-[#efd4b0]/40 bg-[#efd4b0]/10 px-4 text-sm font-black uppercase text-[#efd4b0] md:hidden"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M7 12h10M10 17h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Filtros
          {activeFilters.length > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#efd4b0] px-1 text-[0.65rem] text-[#123a55]">
              {activeFilters.length}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mb-5 hidden grid-cols-2 gap-3 md:grid">
        <HighlightFilterFields
          types={types}
          locations={locations}
          typeFilter={typeFilter}
          locationFilter={locationFilter}
          onTypeChange={handleTypeChange}
          onLocationChange={handleLocationChange}
          idPrefix="highlights-desktop-filter"
        />
      </div>

      {activeFilters.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="flex min-h-8 items-center gap-1.5 rounded-full bg-[#efd4b0]/15 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]"
            >
              {filter.label}
              <button
                type="button"
                onClick={filter.clear}
                aria-label={`Quitar filtro: ${filter.label}`}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/10 hover:text-white"
              >
                <span aria-hidden="true">×</span>
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#efd4b0]/15 pb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p
            className="text-sm font-black text-[#efd4b0]"
            role="status"
            aria-live="polite"
          >
            {resultLabel}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-black uppercase text-[#efd4b0] underline decoration-[#efd4b0]/50 underline-offset-4 hover:text-white"
            >
              Limpiar todo
            </button>
          ) : null}
        </div>
        <label className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-[#efd4b0]/75">
            Ordenar
          </span>
          <span className="relative">
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value as SortOrder);
                resetVisibleCount();
              }}
              className="min-h-10 appearance-none rounded-full border border-[#efd4b0]/25 bg-[#efd4b0]/10 py-2 pl-4 pr-9 text-xs font-black text-[#efd4b0] focus:outline-none"
            >
              <option value="name" className="text-[#123a55]">
                Nombre A–Z
              </option>
              <option value="location" className="text-[#123a55]">
                Ubicación A–Z
              </option>
            </select>
            <SelectChevron />
          </span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-10 md:gap-14 lg:grid-cols-3">
        {visibleSpots.map((spot, index) => (
          <ImperdibleCard key={spot.slug} spot={spot} eager={index === 0} />
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-[#efd4b0]">
            <p>No hay imperdibles que coincidan con tu búsqueda.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 font-semibold text-white underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>

      {remainingCount > 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="min-h-12 rounded-full border border-[#efd4b0] bg-[#efd4b0] px-7 text-sm font-black uppercase text-[#123a55] shadow-sm hover:-translate-y-0.5 hover:bg-white"
          >
            Mostrar más
          </button>
          <p className="text-xs font-medium text-[#efd4b0]/65">
            Quedan {remainingCount} imperdible
            {remainingCount !== 1 ? "s" : ""}
          </p>
        </div>
      ) : null}

      <HighlightFiltersSheet
        open={filtersOpen}
        types={types}
        locations={locations}
        typeFilter={draftType}
        locationFilter={draftLocation}
        onTypeChange={setDraftType}
        onLocationChange={setDraftLocation}
        resultCount={draftResultCount}
        onClear={clearDraftFilters}
        onApply={applyDraftFilters}
        onClose={closeFilterSheet}
      />
    </>
  );
}

function AgendaEventCard({ event }: { event: HighlightSpot }) {
  const date = formatEventDate(event.eventDate!);
  const location = formatLocation(event.stationName || event.location);

  return (
    <article className="group relative overflow-hidden rounded-[1.65rem] bg-[#efd4b0] text-[#0d314a] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/imperdibles/${event.slug}`}
        className="grid sm:grid-cols-[minmax(0,1fr)_13rem]"
      >
        <div className="flex min-w-0 gap-4 p-5 sm:p-6">
          <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-[1.15rem] bg-[#123a55] text-[#efd4b0]">
            <span className="text-[0.7rem] font-black uppercase leading-none tracking-normal">
              {date.month}
            </span>
            <span className="mt-1 text-[2rem] font-black leading-none">
              {date.day}
            </span>
          </div>
          <div className="min-w-0 flex-1 self-center pr-8">
            <h3 className="text-[1.35rem] font-black leading-[0.94] tracking-normal text-[#082d49] sm:text-[1.55rem]">
              {event.title}
            </h3>
            {event.subtitle ? (
              <p className="mt-2 line-clamp-2 text-[0.75rem] font-bold leading-tight text-[#18364d]/85">
                {event.subtitle}
              </p>
            ) : null}
            {location ? (
              <p className="mt-2 text-[0.68rem] font-medium uppercase leading-tight text-[#18364d]/65">
                {location}
              </p>
            ) : null}
            <span className="mt-3 inline-flex text-xs font-black uppercase text-[#8a452b]">
              Ver evento →
            </span>
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
      </Link>

      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton
          compact
          variant="onDark"
          item={{
            type: "imperdible",
            slug: event.slug,
            title: event.title,
            subtitle: location || event.type,
            href: `/imperdibles/${event.slug}`,
            imageUrl: event.imageUrl,
            imageFocus: event.imageFocus,
            datoDestacado: event.datoDestacado,
          }}
        />
      </div>
    </article>
  );
}

export function ImperdiblesClient({ spots, types, initialView }: Props) {
  const [view, setView] = useState<"agenda" | "destacados">(
    initialView ?? "destacados",
  );

  const events = useMemo(
    () =>
      spots
        .filter(
          (spot) => spot.type.toLowerCase() === "evento" && spot.eventDate,
        )
        .sort(
          (a, b) =>
            new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime(),
        ),
    [spots],
  );
  const highlights = useMemo(
    () => spots.filter((spot) => spot.type.toLowerCase() !== "evento"),
    [spots],
  );
  const groupedEvents = useMemo(() => groupByDate(events), [events]);

  return (
    <>
      <div
        role="group"
        aria-label="Vista de imperdibles"
        className="mb-6 flex rounded-full border border-[#efd4b0]/30 bg-[#efd4b0]/15 p-1"
      >
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
          {events.length > 0 ? (
            <span className="ml-2 rounded-full bg-[#123a55]/15 px-1.5 py-0.5 text-[10px]">
              {events.length}
            </span>
          ) : null}
        </button>
      </div>

      {view === "agenda" ? (
        events.length === 0 ? (
          <div className="rounded-[1.65rem] bg-[#efd4b0] px-6 py-16 text-center text-sm font-medium text-[#123a55] shadow-sm">
            No hay eventos próximos registrados.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(groupedEvents).map(([dateLabel, dateEvents]) => (
              <section key={dateLabel}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#efd4b0]/35" />
                  <h2 className="text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
                    {dateLabel}
                  </h2>
                  <div className="h-px flex-1 bg-[#efd4b0]/35" />
                </div>
                <div className="grid gap-4">
                  {dateEvents.map((event) => (
                    <AgendaEventCard key={event.slug} event={event} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <HighlightsCatalog spots={highlights} types={types} />
      )}
    </>
  );
}
