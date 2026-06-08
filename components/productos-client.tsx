"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { type Product, type Station } from "@/app/lib/content";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { HighlightedData } from "@/components/highlighted-data";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

type Props = {
  products: Product[];
  stations: Station[];
  categories: string[];
};

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
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

function formatStationLabel(value?: string) {
  return value?.replace(/^Estacion\s+/i, "").trim() ?? "";
}

function ProductCard({ product }: { product: Product }) {
  const stationLabel = formatStationLabel(product.stationName);

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <article className="h-full overflow-hidden rounded-[1.85rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[0.95] w-full overflow-hidden">
          {product.imageUrl ? (
            <PbImage
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 33vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(product.imageFocus)}
              fallback={<MediaFallback label="Producto" />}
            />
          ) : (
            <MediaFallback label="Producto" />
          )}
          <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
            <span className="rounded-full bg-[#123a55] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] shadow">
              {product.category}
            </span>
            {product.subcategory ? (
              <span className="rounded-full bg-[#efd4b0]/90 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#123a55] shadow">
                {product.subcategory}
              </span>
            ) : null}
          </div>
        </div>
        <div className="p-6">
          {stationLabel ? (
            <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#18364d]/80">
              {stationLabel}
            </p>
          ) : null}
          <h3 className="mt-1 text-[1.75rem] font-black leading-[0.92] tracking-normal text-[#082d49]">
            {product.name}
          </h3>
          <p className="mt-3 text-[0.82rem] font-medium leading-snug text-[#18364d]/75 line-clamp-3">
            {product.description}
          </p>
          {product.techniques.length > 0 ? (
            <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-normal text-[#18364d]/75 line-clamp-2">
              {product.techniques.join(" / ")}
            </p>
          ) : null}
          <HighlightedData
            value={product.datoDestacado}
            compact
            className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
          />
        </div>
      </article>
    </Link>
  );
}

export function ProductosClient({ products, stations, categories }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [subcategory, setSubcategory] = useState("todas");
  const [stationSlug, setStationSlug] = useState("todas");

  const subcategories = useMemo(() => {
    const pool =
      category === "todas"
        ? products
        : products.filter((p) => p.category === category);

    return [
      ...new Set(pool.map((p) => p.subcategory ?? "").filter(Boolean)),
    ].sort();
  }, [products, category]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        (product.datoDestacado ?? "").toLowerCase().includes(q) ||
        product.techniques.some((technique) =>
          technique.toLowerCase().includes(q),
        );
      const matchCat = category === "todas" || product.category === category;
      const matchSub =
        subcategory === "todas" || product.subcategory === subcategory;
      const matchStation =
        stationSlug === "todas" || product.stationSlug === stationSlug;

      return matchSearch && matchCat && matchSub && matchStation;
    });
  }, [products, search, category, subcategory, stationSlug]);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setSubcategory("todas");
  }

  function clearAll() {
    setSearch("");
    setCategory("todas");
    setSubcategory("todas");
    setStationSlug("todas");
  }

  const activeFilters = [
    category !== "todas"
      ? {
          key: "cat",
          label: category,
          clear: () => handleCategoryChange("todas"),
        }
      : null,
    subcategory !== "todas"
      ? {
          key: "sub",
          label: subcategory,
          clear: () => setSubcategory("todas"),
        }
      : null,
    stationSlug !== "todas"
      ? {
          key: "station",
          label:
            formatStationLabel(
              stations.find((station) => station.slug === stationSlug)
                ?.locality,
            ) || stationSlug,
          clear: () => setStationSlug("todas"),
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const hasFilters = search.trim() !== "" || activeFilters.length > 0;

  return (
    <>
      <div className="mb-5">
        <label htmlFor="products-search" className="sr-only">
          Buscar productos por nombre, tecnica o descripcion
        </label>
        <input
          id="products-search"
          type="search"
          placeholder="Buscar por nombre, tecnica o descripcion..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] px-5 py-3 text-sm font-medium text-[#123a55] placeholder:text-[#123a55]/65 focus:border-white focus:outline-none"
        />
      </div>

      <div className="mb-8 flex flex-col gap-4">
        {categories.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
              Categoria
            </p>
            <div
              role="group"
              aria-label="Filtrar productos por categoria"
              className="flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
            >
              <FilterChip
                active={category === "todas"}
                onClick={() => handleCategoryChange("todas")}
              >
                Todas
              </FilterChip>
              {categories.map((item) => (
                <FilterChip
                  key={item}
                  active={category === item}
                  onClick={() => handleCategoryChange(item)}
                >
                  {item}
                </FilterChip>
              ))}
            </div>
          </div>
        ) : null}

        {subcategories.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
              Subcategoria
            </p>
            <div
              role="group"
              aria-label="Filtrar productos por subcategoria"
              className="flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
            >
              <FilterChip
                active={subcategory === "todas"}
                onClick={() => setSubcategory("todas")}
              >
                Todas
              </FilterChip>
              {subcategories.map((item) => (
                <FilterChip
                  key={item}
                  active={subcategory === item}
                  onClick={() => setSubcategory(item)}
                >
                  {item}
                </FilterChip>
              ))}
            </div>
          </div>
        ) : null}

        {stations.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
              Estacion
            </p>
            <div
              role="group"
              aria-label="Filtrar productos por estacion"
              className="flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0"
            >
              <FilterChip
                active={stationSlug === "todas"}
                onClick={() => setStationSlug("todas")}
              >
                Todas
              </FilterChip>
              {stations.map((station) => (
                <FilterChip
                  key={station.slug}
                  active={stationSlug === station.slug}
                  onClick={() => setStationSlug(station.slug)}
                >
                  {formatStationLabel(station.locality)}
                </FilterChip>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {hasFilters ? (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="flex items-center gap-1.5 rounded-full border border-[#efd4b0]/35 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]"
            >
              {filter.label}
              <button
                type="button"
                onClick={filter.clear}
                aria-label={`Quitar filtro: ${filter.label}`}
                className="leading-none text-[#efd4b0] transition hover:text-white"
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
        {filtered.length} productos disponibles.
      </p>
      <p className="mb-5 text-sm font-medium text-[#efd4b0]/85">
        {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="grid gap-10 sm:grid-cols-2 md:gap-14 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-[#efd4b0]">
            <p>No hay productos que coincidan con tu busqueda.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 rounded-full border border-[#efd4b0]/35 px-4 py-2 text-xs font-black uppercase leading-none tracking-normal transition hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
            >
              Limpiar filtros
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
