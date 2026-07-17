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
import { type Artisan, type Product, type Station } from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { FavoriteButton } from "@/components/favorite-button";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

type Props = {
  products: Product[];
  stations: Station[];
  categories: string[];
  artisans: Artisan[];
};

type SortOrder = "recommended" | "name" | "station";

const PAGE_SIZE = 12;

const MATERIAL_RULES = [
  { label: "Vicuña", terms: ["vicuña", "vicuna"] },
  { label: "Alpaca", terms: ["alpaca"] },
  { label: "Lana de oveja", terms: ["lana de oveja", "oveja"] },
  { label: "Seda", terms: ["seda"] },
  { label: "Algodón", terms: ["algodón", "algodon"] },
  { label: "Cuero", terms: ["cuero"] },
];

function formatStationLabel(value?: string) {
  return value?.replace(/^Estacion\s+/i, "").trim() ?? "";
}

function getProductMaterials(product: Product) {
  const searchable = [
    product.name,
    product.description,
    product.datoDestacado ?? "",
    ...product.techniques,
  ]
    .join(" ")
    .toLocaleLowerCase("es");

  return MATERIAL_RULES.filter(({ terms }) =>
    terms.some((term) => searchable.includes(term)),
  ).map(({ label }) => label);
}

function getProductStation(product: Product, stations: Station[]) {
  return stations.find(
    (station) =>
      station.slug === product.stationSlug ||
      (!!station.recordId && station.recordId === product.stationRecordId),
  );
}

function getProductMakers(product: Product, artisans: Artisan[]) {
  return artisans.filter(
    (artisan) =>
      !!artisan.recordId &&
      product.relatedActorRecordIds?.includes(artisan.recordId),
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
  categories,
  subcategories,
  materials,
  techniques,
  stations,
  category,
  subcategory,
  material,
  technique,
  stationSlug,
  onCategoryChange,
  onSubcategoryChange,
  onMaterialChange,
  onTechniqueChange,
  onStationChange,
  idPrefix,
  light = false,
}: {
  categories: string[];
  subcategories: string[];
  materials: string[];
  techniques: string[];
  stations: Station[];
  category: string;
  subcategory: string;
  material: string;
  technique: string;
  stationSlug: string;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onMaterialChange: (value: string) => void;
  onTechniqueChange: (value: string) => void;
  onStationChange: (value: string) => void;
  idPrefix: string;
  light?: boolean;
}) {
  const labelClass = light ? "text-[#123a55]/70" : "text-[#efd4b0]/80";
  const selectClass = light
    ? "border-[#123a55]/15 bg-white text-[#123a55]"
    : "border-[#efd4b0]/30 bg-[#efd4b0] text-[#123a55]";
  const fields = [
    {
      id: `${idPrefix}-category`,
      label: "Categoría",
      value: category,
      onChange: onCategoryChange,
      allLabel: "Todas las categorías",
      options: categories,
    },
    {
      id: `${idPrefix}-subcategory`,
      label: "Subcategoría",
      value: subcategory,
      onChange: onSubcategoryChange,
      allLabel:
        category === "todas"
          ? "Elegí una categoría primero"
          : "Todas las subcategorías",
      options: subcategories,
      disabled: category === "todas",
    },
    {
      id: `${idPrefix}-material`,
      label: "Material o fibra",
      value: material,
      onChange: onMaterialChange,
      allLabel: "Todos los materiales",
      options: materials,
    },
    {
      id: `${idPrefix}-technique`,
      label: "Técnica",
      value: technique,
      onChange: onTechniqueChange,
      allLabel: "Todas las técnicas",
      options: techniques,
    },
    {
      id: `${idPrefix}-station`,
      label: "Estación",
      value: stationSlug,
      onChange: onStationChange,
      allLabel: "Todas las estaciones",
      options: stations.map((station) => ({
        value: station.slug,
        label: formatStationLabel(station.locality) || station.name,
      })),
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
              disabled={field.disabled}
              onChange={(event) => field.onChange(event.target.value)}
              className={`min-h-12 w-full appearance-none rounded-2xl border px-4 py-3 pr-11 text-sm font-bold focus:outline-none disabled:cursor-not-allowed disabled:opacity-55 ${selectClass}`}
            >
              <option value="todas">{field.allLabel}</option>
              {field.options.map((option) => {
                const normalized =
                  typeof option === "string"
                    ? { value: option, label: option }
                    : option;
                return (
                  <option key={normalized.value} value={normalized.value}>
                    {normalized.label}
                  </option>
                );
              })}
            </select>
            <SelectChevron />
          </span>
        </div>
      ))}
    </>
  );
}

function FiltersSheet({
  open,
  resultCount,
  onClose,
  onClear,
  onApply,
  ...filterProps
}: Omit<Parameters<typeof FilterFields>[0], "idPrefix" | "light"> & {
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
      aria-labelledby="products-filter-title"
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
              Explorar productos
            </p>
            <h2 id="products-filter-title" className="mt-1 text-2xl font-black leading-none">
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
          <FilterFields {...filterProps} idPrefix="products-mobile-filter" light />
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

function ProductCard({
  product,
  artisans,
  stations,
  eager = false,
}: {
  product: Product;
  artisans: Artisan[];
  stations: Station[];
  eager?: boolean;
}) {
  const station = getProductStation(product, stations);
  const stationLabel = formatStationLabel(station?.locality ?? product.stationName);
  const makers = getProductMakers(product, artisans);
  const materials = getProductMaterials(product);
  const primaryTechnique = product.techniques[0];

  return (
    <article className="group relative h-full overflow-hidden rounded-[1.65rem] bg-[#efd4b0] text-[#0d314a] shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={`/productos/${product.slug}`}
        className="grid h-full min-h-[13.5rem] grid-cols-[7.75rem_minmax(0,1fr)] sm:block sm:min-h-0"
      >
        <div
          data-testid="product-media"
          className="relative h-full min-h-[13.5rem] w-full overflow-hidden sm:aspect-[4/3] sm:h-auto sm:min-h-0"
        >
          {product.imageUrl ? (
            <PbImage
              src={product.imageUrl}
              alt={product.name}
              fill
              priority={eager}
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 639px) 8rem, (max-width: 1023px) 50vw, 25vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(product.imageFocus)}
              fallback={<MediaFallback label="Producto" />}
            />
          ) : (
            <MediaFallback label="Producto" />
          )}
        </div>

        <div className="flex min-w-0 flex-col p-4 sm:p-5">
          <p className="text-[0.62rem] font-black uppercase leading-none tracking-normal text-[#8a452b]">
            {[product.category, product.subcategory].filter(Boolean).join(" · ")}
          </p>
          <h3 className="mt-2 line-clamp-2 pr-8 text-[1.35rem] font-black leading-[0.94] tracking-normal text-[#082d49] sm:text-[1.55rem]">
            {product.name}
          </h3>

          {(materials[0] || primaryTechnique) && (
            <p className="mt-2 line-clamp-1 text-[0.72rem] font-bold uppercase leading-tight text-[#18364d]/80">
              {[materials[0], primaryTechnique].filter(Boolean).join(" · ")}
            </p>
          )}

          {stationLabel || makers[0] ? (
            <p className="mt-2 line-clamp-1 text-[0.7rem] font-medium leading-tight text-[#18364d]/70">
              {stationLabel ? `En ${stationLabel}` : ""}
              {stationLabel && makers[0] ? " · " : ""}
              {makers[0] ? `Por ${makers[0].name}` : ""}
            </p>
          ) : null}

          <p className="mt-2 line-clamp-1 text-[0.73rem] font-medium leading-tight text-[#18364d]/75">
            {product.description}
          </p>

        </div>
      </Link>

      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton
          compact
          variant="onDark"
          item={{
            type: "producto",
            slug: product.slug,
            title: product.name,
            subtitle: stationLabel || product.subcategory,
            href: `/productos/${product.slug}`,
            imageUrl: product.imageUrl,
            imageFocus: product.imageFocus,
            datoDestacado: product.datoDestacado,
          }}
        />
      </div>
    </article>
  );
}

export function ProductosClient({ products, stations, categories, artisans }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [subcategory, setSubcategory] = useState("todas");
  const [material, setMaterial] = useState("todas");
  const [technique, setTechnique] = useState("todas");
  const [stationSlug, setStationSlug] = useState("todas");
  const [sortOrder, setSortOrder] = useState<SortOrder>("recommended");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState("todas");
  const [draftSubcategory, setDraftSubcategory] = useState("todas");
  const [draftMaterial, setDraftMaterial] = useState("todas");
  const [draftTechnique, setDraftTechnique] = useState("todas");
  const [draftStationSlug, setDraftStationSlug] = useState("todas");

  const materials = useMemo(
    () =>
      [...new Set(products.flatMap(getProductMaterials))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [products],
  );
  const techniques = useMemo(
    () =>
      [...new Set(products.flatMap((product) => product.techniques))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [products],
  );

  const getSubcategories = useCallback(
    (selectedCategory: string) =>
      [
        ...new Set(
          products
            .filter(
              (product) =>
                selectedCategory === "todas" ||
                product.category === selectedCategory,
            )
            .map((product) => product.subcategory ?? "")
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b, "es")),
    [products],
  );
  const subcategories = useMemo(() => getSubcategories(category), [category, getSubcategories]);
  const draftSubcategories = useMemo(
    () => getSubcategories(draftCategory),
    [draftCategory, getSubcategories],
  );

  const filterProducts = useCallback(
    (
      selectedCategory: string,
      selectedSubcategory: string,
      selectedMaterial: string,
      selectedTechnique: string,
      selectedStationSlug: string,
    ) => {
      const q = search.toLocaleLowerCase("es").trim();
      const selectedStation = stations.find(
        (station) => station.slug === selectedStationSlug,
      );

      return products.filter((product) => {
        const productStation = getProductStation(product, stations);
        const materialsForProduct = getProductMaterials(product);
        const searchable = [
          product.name,
          product.description,
          product.category,
          product.subcategory ?? "",
          product.datoDestacado ?? "",
          product.stationName ?? "",
          productStation?.locality ?? "",
          ...product.techniques,
          ...materialsForProduct,
        ]
          .join(" ")
          .toLocaleLowerCase("es");
        const matchSearch = !q || searchable.includes(q);
        const matchCategory =
          selectedCategory === "todas" || product.category === selectedCategory;
        const matchSubcategory =
          selectedSubcategory === "todas" ||
          product.subcategory === selectedSubcategory;
        const matchMaterial =
          selectedMaterial === "todas" ||
          materialsForProduct.includes(selectedMaterial);
        const matchTechnique =
          selectedTechnique === "todas" ||
          product.techniques.includes(selectedTechnique);
        const matchStation =
          selectedStationSlug === "todas" ||
          product.stationSlug === selectedStationSlug ||
          (!!selectedStation?.recordId &&
            product.stationRecordId === selectedStation.recordId);

        return (
          matchSearch &&
          matchCategory &&
          matchSubcategory &&
          matchMaterial &&
          matchTechnique &&
          matchStation
        );
      });
    },
    [products, search, stations],
  );

  const filtered = useMemo(() => {
    const matches = filterProducts(category, subcategory, material, technique, stationSlug);
    if (sortOrder === "name") {
      return [...matches].sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
      );
    }
    if (sortOrder === "station") {
      return [...matches].sort((a, b) =>
        formatStationLabel(a.stationName).localeCompare(formatStationLabel(b.stationName), "es", {
          sensitivity: "base",
        }) || a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
      );
    }
    return matches;
  }, [category, filterProducts, material, sortOrder, stationSlug, subcategory, technique]);

  const draftResultCount = useMemo(
    () =>
      filterProducts(
        draftCategory,
        draftSubcategory,
        draftMaterial,
        draftTechnique,
        draftStationSlug,
      ).length,
    [draftCategory, draftMaterial, draftStationSlug, draftSubcategory, draftTechnique, filterProducts],
  );
  const selectedStation = stations.find((station) => station.slug === stationSlug);
  const visibleProducts = filtered.slice(0, visibleCount);
  const remainingCount = Math.max(filtered.length - visibleProducts.length, 0);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setSubcategory("todas");
    setVisibleCount(PAGE_SIZE);
  }
  function handleSubcategoryChange(value: string) {
    setSubcategory(value);
    setVisibleCount(PAGE_SIZE);
  }
  function handleMaterialChange(value: string) {
    setMaterial(value);
    setVisibleCount(PAGE_SIZE);
  }
  function handleTechniqueChange(value: string) {
    setTechnique(value);
    setVisibleCount(PAGE_SIZE);
  }
  function handleStationChange(value: string) {
    setStationSlug(value);
    setVisibleCount(PAGE_SIZE);
  }
  function handleDraftCategoryChange(value: string) {
    setDraftCategory(value);
    setDraftSubcategory("todas");
  }
  function handleSearchChange(value: string) {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }
  function clearAll() {
    setSearch("");
    setCategory("todas");
    setSubcategory("todas");
    setMaterial("todas");
    setTechnique("todas");
    setStationSlug("todas");
    setVisibleCount(PAGE_SIZE);
  }
  function clearDraftFilters() {
    setDraftCategory("todas");
    setDraftSubcategory("todas");
    setDraftMaterial("todas");
    setDraftTechnique("todas");
    setDraftStationSlug("todas");
  }
  function openFilterSheet() {
    setDraftCategory(category);
    setDraftSubcategory(subcategory);
    setDraftMaterial(material);
    setDraftTechnique(technique);
    setDraftStationSlug(stationSlug);
    setFiltersOpen(true);
  }
  function applyDraftFilters() {
    setCategory(draftCategory);
    setSubcategory(draftSubcategory);
    setMaterial(draftMaterial);
    setTechnique(draftTechnique);
    setStationSlug(draftStationSlug);
    setVisibleCount(PAGE_SIZE);
    setFiltersOpen(false);
  }

  const activeFilters = [
    category !== "todas" ? { key: "category", label: category, clear: () => handleCategoryChange("todas") } : null,
    subcategory !== "todas" ? { key: "subcategory", label: subcategory, clear: () => handleSubcategoryChange("todas") } : null,
    material !== "todas" ? { key: "material", label: material, clear: () => handleMaterialChange("todas") } : null,
    technique !== "todas" ? { key: "technique", label: technique, clear: () => handleTechniqueChange("todas") } : null,
    stationSlug !== "todas" ? { key: "station", label: formatStationLabel(selectedStation?.locality) || stationSlug, clear: () => handleStationChange("todas") } : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];
  const hasFilters = search.trim() !== "" || activeFilters.length > 0;
  const context =
    stationSlug !== "todas"
      ? formatStationLabel(selectedStation?.locality)
      : material !== "todas"
        ? material
        : category !== "todas"
          ? category
          : "";
  const resultLabel = `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}${context ? ` · ${context}` : ""}`;

  return (
    <>
      <div className="mb-5 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="products-search" className="sr-only">
            Buscar productos por nombre, técnica, material o localidad
          </label>
          <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#123a55]/55" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="products-search"
            type="search"
            placeholder="Buscar por nombre, técnica, material o localidad..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="min-h-12 w-full rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] py-3 pl-11 pr-11 text-sm font-medium text-[#123a55] placeholder:text-[#123a55]/65 focus:border-white focus:outline-none"
          />
          {search ? (
            <button type="button" onClick={() => handleSearchChange("")} aria-label="Limpiar búsqueda" className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-lg font-bold text-[#123a55]/65 hover:bg-[#123a55]/10 hover:text-[#123a55]">
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>
        <button type="button" onClick={openFilterSheet} className="relative inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-[#efd4b0]/40 bg-[#efd4b0]/10 px-4 text-sm font-black uppercase text-[#efd4b0] md:hidden">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          Filtros
          {activeFilters.length > 0 ? <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#efd4b0] px-1 text-[0.65rem] text-[#123a55]">{activeFilters.length}</span> : null}
        </button>
      </div>

      <div className="mb-5 hidden grid-cols-2 gap-3 xl:grid-cols-5 md:grid">
        <FilterFields
          categories={categories}
          subcategories={subcategories}
          materials={materials}
          techniques={techniques}
          stations={stations}
          category={category}
          subcategory={subcategory}
          material={material}
          technique={technique}
          stationSlug={stationSlug}
          onCategoryChange={handleCategoryChange}
          onSubcategoryChange={handleSubcategoryChange}
          onMaterialChange={handleMaterialChange}
          onTechniqueChange={handleTechniqueChange}
          onStationChange={handleStationChange}
          idPrefix="products-desktop-filter"
        />
      </div>

      {activeFilters.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span key={filter.key} className="flex min-h-8 items-center gap-1.5 rounded-full bg-[#efd4b0]/15 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
              {filter.label}
              <button type="button" onClick={filter.clear} aria-label={`Quitar filtro: ${filter.label}`} className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/10 hover:text-white"><span aria-hidden="true">×</span></button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#efd4b0]/15 pb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-sm font-black text-[#efd4b0]" role="status" aria-live="polite">{resultLabel}</p>
          {hasFilters ? <button type="button" onClick={clearAll} className="text-xs font-black uppercase text-[#efd4b0] underline decoration-[#efd4b0]/50 underline-offset-4 hover:text-white">Limpiar todo</button> : null}
        </div>
        <label className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-[#efd4b0]/75">Ordenar</span>
          <span className="relative">
            <select value={sortOrder} onChange={(event) => { setSortOrder(event.target.value as SortOrder); setVisibleCount(PAGE_SIZE); }} className="min-h-10 appearance-none rounded-full border border-[#efd4b0]/25 bg-[#efd4b0]/10 py-2 pl-4 pr-9 text-xs font-black text-[#efd4b0] focus:outline-none">
              <option value="recommended" className="text-[#123a55]">Recomendados</option>
              <option value="name" className="text-[#123a55]">Nombre A–Z</option>
              <option value="station" className="text-[#123a55]">Estación A–Z</option>
            </select>
            <SelectChevron />
          </span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-8 md:gap-10 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product, index) => <ProductCard key={product.slug} product={product} artisans={artisans} stations={stations} eager={index === 0} />)}
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-[#efd4b0]">
            <p>No hay productos que coincidan con tu búsqueda.</p>
            <button type="button" onClick={clearAll} className="mt-3 font-semibold text-white underline underline-offset-4">Limpiar filtros</button>
          </div>
        ) : null}
      </div>

      {remainingCount > 0 ? (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="min-h-12 rounded-full border border-[#efd4b0] bg-[#efd4b0] px-7 text-sm font-black uppercase text-[#123a55] shadow-sm hover:-translate-y-0.5 hover:bg-white">Mostrar más</button>
          <p className="text-xs font-medium text-[#efd4b0]/65">Quedan {remainingCount} producto{remainingCount !== 1 ? "s" : ""}</p>
        </div>
      ) : null}

      <FiltersSheet
        open={filtersOpen}
        categories={categories}
        subcategories={draftSubcategories}
        materials={materials}
        techniques={techniques}
        stations={stations}
        category={draftCategory}
        subcategory={draftSubcategory}
        material={draftMaterial}
        technique={draftTechnique}
        stationSlug={draftStationSlug}
        onCategoryChange={handleDraftCategoryChange}
        onSubcategoryChange={setDraftSubcategory}
        onMaterialChange={setDraftMaterial}
        onTechniqueChange={setDraftTechnique}
        onStationChange={setDraftStationSlug}
        resultCount={draftResultCount}
        onClear={clearDraftFilters}
        onApply={applyDraftFilters}
        onClose={() => setFiltersOpen(false)}
      />
    </>
  );
}
