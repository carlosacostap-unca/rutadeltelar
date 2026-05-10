"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Product, type Station } from "@/app/lib/content";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";
import { SurfaceCard } from "@/components/surface-card";

type Props = {
  products: Product[];
  stations: Station[];
  categories: string[]; // from categorias_producto catalog (derived from live data)
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
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
          : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
      }`}
    >
      {children}
    </button>
  );
}

export function ProductosClient({ products, stations, categories }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todas");
  const [subcategory, setSubcategory] = useState("todas");
  const [stationSlug, setStationSlug] = useState("todas");

  // Subcategories contextual to selected category
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
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techniques.some((t) => t.toLowerCase().includes(q));
      const matchCat = category === "todas" || p.category === category;
      const matchSub =
        subcategory === "todas" || p.subcategory === subcategory;
      const matchStation =
        stationSlug === "todas" || p.stationSlug === stationSlug;
      return matchSearch && matchCat && matchSub && matchStation;
    });
  }, [products, search, category, subcategory, stationSlug]);

  // When category changes, reset subcategory
  function handleCategoryChange(c: string) {
    setCategory(c);
    setSubcategory("todas");
  }

  const activeFilters = [
    category !== "todas"
      ? { key: "cat", label: category, clear: () => handleCategoryChange("todas") }
      : null,
    subcategory !== "todas"
      ? { key: "sub", label: subcategory, clear: () => setSubcategory("todas") }
      : null,
    stationSlug !== "todas"
      ? {
          key: "station",
          label:
            stations.find((s) => s.slug === stationSlug)?.locality ?? stationSlug,
          clear: () => setStationSlug("todas"),
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const hasFilters = search.trim() !== "" || activeFilters.length > 0;

  function clearAll() {
    setSearch("");
    setCategory("todas");
    setSubcategory("todas");
    setStationSlug("todas");
  }

  return (
    <>
      {/* Búsqueda */}
      <div className="mb-5">
        <input
          type="search"
          placeholder="Buscar por nombre, técnica o descripción…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2.5 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)] focus:outline-none"
        />
      </div>

      {/* Filtros cerrados (catálogo) */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Categoría */}
        {categories.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Categoría
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
              <FilterChip
                active={category === "todas"}
                onClick={() => handleCategoryChange("todas")}
              >
                Todas
              </FilterChip>
              {categories.map((c) => (
                <FilterChip
                  key={c}
                  active={category === c}
                  onClick={() => handleCategoryChange(c)}
                >
                  {c}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        {/* Subcategoría (contextual) */}
        {subcategories.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Subcategoría
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
              <FilterChip
                active={subcategory === "todas"}
                onClick={() => setSubcategory("todas")}
              >
                Todas
              </FilterChip>
              {subcategories.map((s) => (
                <FilterChip
                  key={s}
                  active={subcategory === s}
                  onClick={() => setSubcategory(s)}
                >
                  {s}
                </FilterChip>
              ))}
            </div>
          </div>
        )}

        {/* Estación */}
        {stations.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Estación
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
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

      {/* Chips activos + Limpiar */}
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
                aria-label="Quitar filtro"
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
      <p className="mb-4 text-sm text-[color:var(--text-muted)]">
        {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <Link key={product.slug} href={`/productos/${product.slug}`} className="group">
            <SurfaceCard className="soft-shadow h-full overflow-hidden !p-0 transition group-hover:border-[color:var(--accent)]">
              {product.imageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <PbImage
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    fallback={
                      <div className="aspect-[4/3] overflow-hidden">
                        <MediaFallback label="Producto" />
                        {/*
                        🧵
                        */}
                      </div>
                    }
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] overflow-hidden">
                  <MediaFallback label="Producto" />
                  {/*
                  🧵
                  */}
                </div>
              )}
              <div className="p-4">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[color:var(--accent)]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent)]">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="rounded-full border border-[color:var(--border)] px-2.5 py-0.5 text-[10px] text-[color:var(--text-muted)]">
                      {product.subcategory}
                    </span>
                  )}
                </div>
                <h2 className="font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] line-clamp-2">
                  {product.name}
                </h2>
                {product.stationName && (
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    {product.stationName}
                  </p>
                )}
              </div>
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
