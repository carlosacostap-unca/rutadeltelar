"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { type Artisan, type Experience, type HighlightSpot, type Product, type Station } from "@/app/lib/content";
import { SurfaceCard } from "@/components/surface-card";

type SearchData = {
  stations: Station[];
  artisans: Artisan[];
  products: Product[];
  experiences: Experience[];
  spots: HighlightSpot[];
};

type ResultGroup = {
  type: "estacion" | "actor" | "producto" | "experiencia" | "imperdible";
  label: string;
  count: number;
  items: ResultItem[];
};

type ResultItem = {
  slug: string;
  href: string;
  title: string;
  subtitle?: string;
  tag?: string;
  imageUrl?: string;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matches(query: string, ...fields: (string | undefined)[]) {
  const q = normalize(query);
  return fields.some((f) => f && normalize(f).includes(q));
}

function buildGroups(data: SearchData, query: string): ResultGroup[] {
  if (!query.trim()) return [];

  const groups: ResultGroup[] = [];

  const estaciones = data.stations
    .filter((s) => matches(query, s.name, s.locality, s.slogan, s.department))
    .map((s): ResultItem => ({
      slug: s.slug,
      href: `/estaciones/${s.slug}`,
      title: s.name,
      subtitle: s.slogan,
      tag: s.locality,
    }));
  if (estaciones.length)
    groups.push({ type: "estacion", label: "Estaciones", count: estaciones.length, items: estaciones });

  const actores = data.artisans
    .filter((a) => matches(query, a.name, a.craft, a.actorType, a.place))
    .map((a): ResultItem => ({
      slug: a.slug,
      href: `/artesanas/${a.slug}`,
      title: a.name,
      subtitle: a.craft,
      tag: a.actorType,
      imageUrl: a.imageUrl,
    }));
  if (actores.length)
    groups.push({ type: "actor", label: "Actores", count: actores.length, items: actores });

  const prods = data.products
    .filter((p) => matches(query, p.name, p.category, p.subcategory, p.description, ...p.techniques))
    .map((p): ResultItem => ({
      slug: p.slug,
      href: `/productos/${p.slug}`,
      title: p.name,
      subtitle: p.stationName,
      tag: p.category,
      imageUrl: p.imageUrl,
    }));
  if (prods.length)
    groups.push({ type: "producto", label: "Productos", count: prods.length, items: prods });

  const exps = data.experiences
    .filter((e) => matches(query, e.title, e.tag, e.location, e.description))
    .map((e): ResultItem => ({
      slug: e.slug,
      href: `/explorar/${e.slug}`,
      title: e.title,
      subtitle: e.location,
      tag: e.tag,
      imageUrl: e.imageUrl,
    }));
  if (exps.length)
    groups.push({ type: "experiencia", label: "Experiencias", count: exps.length, items: exps });

  const spots = data.spots
    .filter((s) => matches(query, s.title, s.subtitle, s.type, s.location, s.description))
    .map((s): ResultItem => ({
      slug: s.slug,
      href: `/imperdibles/${s.slug}`,
      title: s.title,
      subtitle: s.subtitle,
      tag: s.type,
      imageUrl: s.imageUrl,
    }));
  if (spots.length)
    groups.push({ type: "imperdible", label: "Imperdibles", count: spots.length, items: spots });

  return groups;
}

function GroupSection({ group }: { group: ResultGroup }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
        {group.label}
        <span className="rounded-full bg-[color:var(--surface)] px-2 py-0.5 text-[10px] font-semibold">
          {group.count}
        </span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {group.items.slice(0, 9).map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <SurfaceCard className="flex h-full items-center gap-3 !py-3 transition group-hover:border-[color:var(--accent)]">
              {item.imageUrl ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[color:var(--border)]">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--surface)] text-xl">
                  {group.type === "estacion" && "📍"}
                  {group.type === "actor" && "🧶"}
                  {group.type === "producto" && "🧵"}
                  {group.type === "experiencia" && "🧭"}
                  {group.type === "imperdible" && "⭐"}
                </div>
              )}
              <div className="min-w-0">
                {item.tag && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                    {item.tag}
                  </p>
                )}
                <p className="truncate text-sm font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="truncate text-xs text-[color:var(--text-muted)]">{item.subtitle}</p>
                )}
              </div>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BuscarClient(data: SearchData) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleChange(value: string) {
    setQuery(value);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      router.replace(`/buscar?${params.toString()}`, { scroll: false });
    });
  }

  const groups = useMemo(() => buildGroups(data, query), [data, query]);
  const totalResults = groups.reduce((sum, g) => sum + g.count, 0);

  return (
    <>
      {/* Campo de búsqueda */}
      <div className="relative mb-8">
        <label htmlFor="global-search" className="sr-only">
          Buscar en toda la ruta
        </label>
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          id="global-search"
          type="search"
          autoFocus
          placeholder="Buscar en la ruta..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] py-3 pl-11 pr-4 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => handleChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Resultados */}
      {query.trim() && (
        <p className="mb-6 text-sm text-[color:var(--text-muted)]" role="status" aria-live="polite">
          {totalResults > 0
            ? `${totalResults} resultado${totalResults !== 1 ? "s" : ""} para "${query}"`
            : `Sin resultados para "${query}"`}
        </p>
      )}

      {groups.length > 0 && groups.map((g) => <GroupSection key={g.type} group={g} />)}

      {query.trim() && groups.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-4 text-base font-semibold text-[color:var(--foreground)]">
            Sin resultados
          </p>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">
            Probá con otro término o explorá las secciones desde el menú.
          </p>
        </div>
      )}

      {!query.trim() && (
        <div className="py-12 text-center text-sm text-[color:var(--text-muted)]">
          Escribí algo para buscar en toda la ruta.
        </div>
      )}
    </>
  );
}
