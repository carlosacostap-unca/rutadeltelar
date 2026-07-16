"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { type Artisan, type Station } from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

type Props = {
  artisans: Artisan[];
  stations: Station[];
  tipos: string[];
};

type SortOrder = "recommended" | "name" | "location";

const PAGE_SIZE = 12;

function formatActorLocation(value?: string) {
  return (value ?? "").replace(/,\s*Catamarca\.?$/i, "");
}

function getActorStation(item: Artisan, stations: Station[]) {
  return stations.find(
    (station) =>
      station.slug === item.stationSlug ||
      (!!station.recordId && station.recordId === item.stationRecordId),
  );
}

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
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

function FilterFields({
  tipos,
  stations,
  department,
  tipo,
  stationSlug,
  onDepartmentChange,
  onTipoChange,
  onStationChange,
  idPrefix,
  light = false,
}: {
  tipos: string[];
  stations: Station[];
  department: string;
  tipo: string;
  stationSlug: string;
  onDepartmentChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onStationChange: (value: string) => void;
  idPrefix: string;
  light?: boolean;
}) {
  const departments = useMemo(
    () =>
      [
        ...new Set(
          stations
            .map((station) => station.department)
            .filter(
              (departmentName): departmentName is string =>
                typeof departmentName === "string" &&
                departmentName.trim() !== "",
            ),
        ),
      ].sort((a, b) => a.localeCompare(b, "es")),
    [stations],
  );
  const availableStations =
    department === "todas"
      ? []
      : stations.filter((station) => station.department === department);
  const labelClass = light ? "text-[#123a55]/70" : "text-[#efd4b0]/80";
  const selectClass = light
    ? "border-[#123a55]/15 bg-white text-[#123a55]"
    : "border-[#efd4b0]/30 bg-[#efd4b0] text-[#123a55]";
  const tipoId = `${idPrefix}-type`;
  const departmentId = `${idPrefix}-department`;
  const stationId = `${idPrefix}-station`;

  return (
    <>
      <div>
        <label
          htmlFor={tipoId}
          className={`mb-2 block text-xs font-black uppercase leading-none tracking-normal ${labelClass}`}
        >
          Tipo de actor
        </label>
        <span className="relative block">
          <select
            id={tipoId}
            value={tipo}
            onChange={(event) => onTipoChange(event.target.value)}
            className={`min-h-12 w-full appearance-none rounded-2xl border px-4 py-3 pr-11 text-sm font-bold focus:outline-none ${selectClass}`}
          >
            <option value="todos">Todos los tipos</option>
            {tipos.map((actorType) => (
              <option key={actorType} value={actorType}>
                {actorType}
              </option>
            ))}
          </select>
          <SelectChevron />
        </span>
      </div>

      <div>
        <label
          htmlFor={departmentId}
          className={`mb-2 block text-xs font-black uppercase leading-none tracking-normal ${labelClass}`}
        >
          Departamento
        </label>
        <span className="relative block">
          <select
            id={departmentId}
            value={department}
            onChange={(event) => onDepartmentChange(event.target.value)}
            className={`min-h-12 w-full appearance-none rounded-2xl border px-4 py-3 pr-11 text-sm font-bold focus:outline-none ${selectClass}`}
          >
            <option value="todas">Todos los departamentos</option>
            {departments.map((departmentName) => (
              <option key={departmentName} value={departmentName}>
                {departmentName}
              </option>
            ))}
          </select>
          <SelectChevron />
        </span>
      </div>

      <div>
        <label
          htmlFor={stationId}
          className={`mb-2 block text-xs font-black uppercase leading-none tracking-normal ${labelClass}`}
        >
          Estación
        </label>
        <span className="relative block">
          <select
            id={stationId}
            value={stationSlug}
            disabled={department === "todas"}
            onChange={(event) => onStationChange(event.target.value)}
            className={`min-h-12 w-full appearance-none rounded-2xl border px-4 py-3 pr-11 text-sm font-bold focus:outline-none disabled:cursor-not-allowed disabled:opacity-55 ${selectClass}`}
          >
            <option value="todas">
              {department === "todas"
                ? "Elegí un departamento primero"
                : "Todas las estaciones"}
            </option>
            {availableStations.map((station) => (
              <option key={station.slug} value={station.slug}>
                {formatActorLocation(station.locality)}
              </option>
            ))}
          </select>
          <SelectChevron />
        </span>
      </div>
    </>
  );
}

function FiltersSheet({
  open,
  tipos,
  stations,
  department,
  tipo,
  stationSlug,
  resultCount,
  onDepartmentChange,
  onTipoChange,
  onStationChange,
  onClear,
  onApply,
  onClose,
}: {
  open: boolean;
  tipos: string[];
  stations: Station[];
  department: string;
  tipo: string;
  stationSlug: string;
  resultCount: number;
  onDepartmentChange: (value: string) => void;
  onTipoChange: (value: string) => void;
  onStationChange: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
  onClose: () => void;
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

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[5000] flex items-end bg-[#061b2a]/70 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="actors-filter-title"
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
              Explorar actores
            </p>
            <h2
              id="actors-filter-title"
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
          <FilterFields
            tipos={tipos}
            stations={stations}
            department={department}
            tipo={tipo}
            stationSlug={stationSlug}
            onDepartmentChange={onDepartmentChange}
            onTipoChange={onTipoChange}
            onStationChange={onStationChange}
            idPrefix="actors-mobile-filter"
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

function ActorCard({
  item,
  eager = false,
}: {
  item: Artisan;
  eager?: boolean;
}) {
  const location = formatActorLocation(item.stationName ?? item.place);
  const highlighted = item.datoDestacado?.trim();
  const specialty = item.craft.trim();
  const showSpecialty =
    specialty !== "" &&
    specialty.toLocaleLowerCase("es") !==
      (item.actorType ?? "").trim().toLocaleLowerCase("es");

  return (
    <Link href={`/artesanas/${item.slug}`} className="group block h-full">
      <article className="grid h-full min-h-[13.5rem] grid-cols-[7.75rem_minmax(0,1fr)] overflow-hidden rounded-[1.65rem] bg-[#efd4b0] text-[#0d314a] shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-xl sm:block sm:min-h-0">
        <div className="relative h-full min-h-[13.5rem] w-full overflow-hidden sm:aspect-[4/3] sm:h-auto sm:min-h-0">
          {item.imageUrl ? (
            <PbImage
              src={item.imageUrl}
              alt={item.name}
              fill
              priority={eager}
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 639px) 8rem, (max-width: 1023px) 50vw, 25vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(item.imageFocus)}
              fallback={<MediaFallback label="Actor" />}
            />
          ) : (
            <MediaFallback label="Actor" />
          )}
        </div>

        <div className="flex min-w-0 flex-col p-4 sm:p-5">
          <h3 className="line-clamp-2 text-[1.35rem] font-black leading-[0.94] tracking-normal text-[#082d49] sm:text-[1.55rem]">
            {item.name}
          </h3>

          {item.actorType ? (
            <p className="mt-2">
              <span className="inline-flex rounded-full border border-[#123a55]/15 bg-[#123a55]/8 px-2.5 py-1 text-[0.62rem] font-black uppercase leading-none text-[#123a55]">
                {item.actorType}
              </span>
            </p>
          ) : null}

          {showSpecialty ? (
            <p className="mt-2 line-clamp-2 text-[0.75rem] font-bold leading-tight text-[#18364d]/85">
              {specialty}
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

          <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-black uppercase text-[#8a452b]">
            Ver perfil
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}

export function ActoresClient({ artisans, stations, tipos }: Props) {
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [department, setDepartment] = useState("todas");
  const [stationSlug, setStationSlug] = useState("todas");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recommended");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftTipo, setDraftTipo] = useState("todos");
  const [draftDepartment, setDraftDepartment] = useState("todas");
  const [draftStationSlug, setDraftStationSlug] = useState("todas");

  const filterActors = useCallback(
    (
      selectedTipo: string,
      selectedDepartment: string,
      selectedStationSlug: string,
    ) => {
      const q = search.toLocaleLowerCase("es").trim();
      const selectedStation = stations.find(
        (station) => station.slug === selectedStationSlug,
      );

      return artisans.filter((item) => {
        const actorStation = getActorStation(item, stations);
        const location = formatActorLocation(
          item.stationName ?? item.place,
        ).toLocaleLowerCase("es");
        const matchSearch =
          !q ||
          item.name.toLocaleLowerCase("es").includes(q) ||
          item.craft.toLocaleLowerCase("es").includes(q) ||
          item.place.toLocaleLowerCase("es").includes(q) ||
          (item.actorType ?? "").toLocaleLowerCase("es").includes(q) ||
          (item.stationName ?? "").toLocaleLowerCase("es").includes(q) ||
          (item.datoDestacado ?? "").toLocaleLowerCase("es").includes(q) ||
          location.includes(q);
        const matchTipo =
          selectedTipo === "todos" ||
          (item.actorType ?? "").toLocaleLowerCase("es") ===
            selectedTipo.toLocaleLowerCase("es");
        const matchDepartment =
          selectedDepartment === "todas" ||
          actorStation?.department === selectedDepartment ||
          item.place.toLocaleLowerCase("es") ===
            selectedDepartment.toLocaleLowerCase("es");
        const matchStation =
          selectedStationSlug === "todas" ||
          item.stationSlug === selectedStationSlug ||
          (!!selectedStation?.recordId &&
            item.stationRecordId === selectedStation.recordId);

        return matchSearch && matchTipo && matchDepartment && matchStation;
      });
    },
    [artisans, search, stations],
  );

  const filtered = useMemo(() => {
    const matches = filterActors(tipo, department, stationSlug);

    if (sortOrder === "name") {
      return [...matches].sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
      );
    }

    if (sortOrder === "location") {
      return [...matches].sort((a, b) => {
        const locationA = formatActorLocation(a.stationName ?? a.place);
        const locationB = formatActorLocation(b.stationName ?? b.place);
        return (
          locationA.localeCompare(locationB, "es", { sensitivity: "base" }) ||
          a.name.localeCompare(b.name, "es", { sensitivity: "base" })
        );
      });
    }

    return matches;
  }, [department, filterActors, sortOrder, stationSlug, tipo]);

  const draftResultCount = useMemo(
    () => filterActors(draftTipo, draftDepartment, draftStationSlug).length,
    [draftDepartment, draftStationSlug, draftTipo, filterActors],
  );

  const selectedStation = stations.find(
    (station) => station.slug === stationSlug,
  );
  const visibleActors = filtered.slice(0, visibleCount);
  const remainingCount = Math.max(filtered.length - visibleActors.length, 0);
  const activeFilters = [
    tipo !== "todos"
      ? { key: "tipo", label: tipo, clear: () => handleTipoChange("todos") }
      : null,
    stationSlug !== "todas"
      ? {
          key: "station",
          label:
            formatActorLocation(selectedStation?.locality) || stationSlug,
          clear: () => handleStationChange("todas"),
        }
      : department !== "todas"
        ? {
            key: "department",
            label: department,
            clear: () => handleDepartmentChange("todas"),
          }
        : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];
  const activeFilterCount = activeFilters.length;
  const hasFilters = search.trim() !== "" || activeFilterCount > 0;
  const locationContext =
    stationSlug !== "todas"
      ? formatActorLocation(selectedStation?.locality)
      : department !== "todas"
        ? department
        : "";
  const resultLabel = `${filtered.length} ${
    filtered.length === 1 ? "actor" : "actores"
  }${locationContext ? ` en ${locationContext}` : ""}`;

  const closeFilterSheet = useCallback(() => setFiltersOpen(false), []);

  function handleSearchChange(value: string) {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleTipoChange(value: string) {
    setTipo(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleDepartmentChange(value: string) {
    setDepartment(value);
    setStationSlug("todas");
    setVisibleCount(PAGE_SIZE);
  }

  function handleStationChange(value: string) {
    setStationSlug(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSortChange(value: SortOrder) {
    setSortOrder(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleDraftDepartmentChange(value: string) {
    setDraftDepartment(value);
    setDraftStationSlug("todas");
  }

  function openFilterSheet() {
    setDraftTipo(tipo);
    setDraftDepartment(department);
    setDraftStationSlug(stationSlug);
    setFiltersOpen(true);
  }

  function applyDraftFilters() {
    setTipo(draftTipo);
    setDepartment(draftDepartment);
    setStationSlug(draftStationSlug);
    setVisibleCount(PAGE_SIZE);
    setFiltersOpen(false);
  }

  function clearDraftFilters() {
    setDraftTipo("todos");
    setDraftDepartment("todas");
    setDraftStationSlug("todas");
  }

  function clearAll() {
    setSearch("");
    setTipo("todos");
    setDepartment("todas");
    setStationSlug("todas");
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <>
      <div className="mb-5 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="actors-search" className="sr-only">
            Buscar actores por nombre, oficio o localidad
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
            id="actors-search"
            type="search"
            placeholder="Buscar por nombre, oficio o localidad..."
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
          {activeFilterCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#efd4b0] px-1 text-[0.65rem] text-[#123a55]">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mb-5 hidden grid-cols-3 gap-3 rounded-[1.5rem] border border-[#efd4b0]/20 bg-[#efd4b0]/8 p-4 md:grid">
        <FilterFields
          tipos={tipos}
          stations={stations}
          department={department}
          tipo={tipo}
          stationSlug={stationSlug}
          onDepartmentChange={handleDepartmentChange}
          onTipoChange={handleTipoChange}
          onStationChange={handleStationChange}
          idPrefix="actors-desktop-filter"
        />
      </div>

      {activeFilters.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="flex min-h-8 items-center gap-1.5 rounded-full bg-[#efd4b0]/15 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]"
            >
              {formatActorLocation(filter.label)}
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

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#efd4b0]/15 pb-4">
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
              onChange={(event) =>
                handleSortChange(event.target.value as SortOrder)
              }
              className="min-h-10 appearance-none rounded-full border border-[#efd4b0]/25 bg-[#efd4b0]/10 py-2 pl-4 pr-9 text-xs font-black text-[#efd4b0] focus:outline-none"
            >
              <option value="recommended" className="text-[#123a55]">
                Recomendados
              </option>
              <option value="name" className="text-[#123a55]">
                Nombre A–Z
              </option>
              <option value="location" className="text-[#123a55]">
                Localidad A–Z
              </option>
            </select>
            <SelectChevron />
          </span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 xl:grid-cols-4">
        {visibleActors.map((item, index) => (
          <ActorCard key={item.slug} item={item} eager={index === 0} />
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-[#efd4b0]">
            <p>No hay actores que coincidan con tu búsqueda.</p>
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
            Quedan {remainingCount} perfil{remainingCount !== 1 ? "es" : ""}
          </p>
        </div>
      ) : null}

      <FiltersSheet
        open={filtersOpen}
        tipos={tipos}
        stations={stations}
        department={draftDepartment}
        tipo={draftTipo}
        stationSlug={draftStationSlug}
        resultCount={draftResultCount}
        onDepartmentChange={handleDraftDepartmentChange}
        onTipoChange={setDraftTipo}
        onStationChange={setDraftStationSlug}
        onClear={clearDraftFilters}
        onApply={applyDraftFilters}
        onClose={closeFilterSheet}
      />
    </>
  );
}
