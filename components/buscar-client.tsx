"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  type Artisan,
  type Experience,
  type HighlightSpot,
  type Product,
  type Station,
} from "@/app/lib/content";
import { getImageFocusStyle, type ImageFocus } from "@/app/lib/image-focus";
import { HighlightedData } from "@/components/highlighted-data";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

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
  imageFocus?: ImageFocus;
  datoDestacado?: string;
};

type SearchableValue = string | null | undefined | SearchableValue[];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function flattenSearchValues(values: SearchableValue[]): string[] {
  return values.flatMap((value): string[] => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return flattenSearchValues(value);
    return [];
  });
}

function matches(query: string, ...fields: SearchableValue[]) {
  const q = normalize(query);
  return flattenSearchValues(fields).some((field) => normalize(field).includes(q));
}

function formatResultTag(value?: string) {
  return value?.replace(/,\s*Catamarca\.?$/i, "");
}

function buildGroups(data: SearchData, query: string): ResultGroup[] {
  if (!query.trim()) return [];

  const groups: ResultGroup[] = [];

  const estaciones = data.stations
    .filter((s) =>
      matches(
        query,
        s.name,
        s.locality,
        s.department,
        s.slogan,
        s.summary,
        s.datoDestacado,
        s.dato_destacado,
        s.status,
      ),
    )
    .map((s): ResultItem => ({
      slug: s.slug,
      href: `/estaciones/${s.slug}`,
      title: s.name,
      subtitle: s.slogan,
      tag: s.locality,
      imageUrl: s.imageUrl,
      imageFocus: s.imageFocus,
      datoDestacado: s.datoDestacado,
    }));
  if (estaciones.length) {
    groups.push({
      type: "estacion",
      label: "Estaciones",
      count: estaciones.length,
      items: estaciones,
    });
  }

  const actores = data.artisans
    .filter((a) =>
      matches(
        query,
        a.name,
        a.place,
        a.craft,
        a.actorType,
        a.bio,
        a.techniques,
        a.years,
        a.featuredPiece,
        a.datoDestacado,
        a.dato_destacado,
        a.stationName,
        a.contactPhone,
        a.contactEmail,
        a.address,
        a.materials,
        a.productosOfrecidos,
        a.visitasDisponibles,
        a.rubroProductivo,
        a.escalaProduccion,
        a.modalidadVenta,
        a.tipoHospedaje,
        a.capacidad,
        a.servicios,
        a.horarios,
        a.tipoPropuesta,
        a.especialidades,
        a.platosDestacados,
        a.idiomas,
        a.recorridosOfrecidos,
        a.zonaCobertura,
        a.puntoEncuentro,
      ),
    )
    .map((a): ResultItem => ({
      slug: a.slug,
      href: `/actores/${a.slug}`,
      title: a.name,
      subtitle: a.craft,
      tag: a.actorType,
      imageUrl: a.imageUrl,
      imageFocus: a.imageFocus,
      datoDestacado: a.datoDestacado,
    }));
  if (actores.length) {
    groups.push({
      type: "actor",
      label: "Actores",
      count: actores.length,
      items: actores,
    });
  }

  const prods = data.products
    .filter((p) =>
      matches(
        query,
        p.name,
        p.description,
        p.category,
        p.subcategory,
        p.techniques,
        p.datoDestacado,
        p.dato_destacado,
        p.stationName,
      ),
    )
    .map((p): ResultItem => ({
      slug: p.slug,
      href: `/productos/${p.slug}`,
      title: p.name,
      subtitle: p.stationName,
      tag: p.category,
      imageUrl: p.imageUrl,
      imageFocus: p.imageFocus,
      datoDestacado: p.datoDestacado,
    }));
  if (prods.length) {
    groups.push({
      type: "producto",
      label: "Productos",
      count: prods.length,
      items: prods,
    });
  }

  const exps = data.experiences
    .filter((e) =>
      matches(
        query,
        e.title,
        e.description,
        e.tag,
        e.duration,
        e.location,
        e.intensity,
        e.summary,
        e.datoDestacado,
        e.dato_destacado,
        e.includes,
        e.stops,
        e.stationName,
        e.responsibleName,
      ),
    )
    .map((e): ResultItem => ({
      slug: e.slug,
      href: `/explorar/${e.slug}`,
      title: e.title,
      subtitle: e.location,
      tag: e.tag,
      imageUrl: e.imageUrl,
      imageFocus: e.imageFocus,
      datoDestacado: e.datoDestacado,
    }));
  if (exps.length) {
    groups.push({
      type: "experiencia",
      label: "Experiencias",
      count: exps.length,
      items: exps,
    });
  }

  const spots = data.spots
    .filter((s) =>
      matches(
        query,
        s.title,
        s.subtitle,
        s.description,
        s.datoDestacado,
        s.dato_destacado,
        s.type,
        s.location,
        s.priority,
        s.stationName,
        s.horarios,
        s.accesibilidad,
        s.estacionalidad,
        s.duracionSugerida,
        s.recomendaciones,
      ),
    )
    .map((s): ResultItem => ({
      slug: s.slug,
      href: `/imperdibles/${s.slug}`,
      title: s.title,
      subtitle: s.subtitle,
      tag: s.type,
      imageUrl: s.imageUrl,
      imageFocus: s.imageFocus,
      datoDestacado: s.datoDestacado,
    }));
  if (spots.length) {
    groups.push({
      type: "imperdible",
      label: "Imperdibles",
      count: spots.length,
      items: spots,
    });
  }

  return groups;
}

function getSingularLabel(type: ResultGroup["type"]) {
  switch (type) {
    case "estacion":
      return "Estacion";
    case "actor":
      return "Actor";
    case "producto":
      return "Producto";
    case "experiencia":
      return "Experiencia";
    case "imperdible":
      return "Imperdible";
  }
}

function ResultCard({
  item,
  type,
}: {
  item: ResultItem;
  type: ResultGroup["type"];
}) {
  const label = getSingularLabel(type);
  const tag = formatResultTag(item.tag);

  return (
    <Link href={item.href} className="group block">
      <article className="h-full overflow-hidden rounded-[1.85rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[0.95] w-full overflow-hidden">
          {item.imageUrl ? (
            <PbImage
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, 33vw"
              usage="small"
              quality={90}
              style={getImageFocusStyle(item.imageFocus)}
              fallback={<MediaFallback label={label} />}
            />
          ) : (
            <MediaFallback label={label} />
          )}
          <span className="absolute left-4 top-4 rounded-full bg-[#123a55] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] shadow">
            {label}
          </span>
        </div>
        <div className="p-6">
          {tag ? (
            <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#18364d]/80">
              {tag}
            </p>
          ) : null}
          <h3 className="mt-1 text-[1.75rem] font-black leading-[0.92] tracking-normal text-[#082d49]">
            {item.title}
          </h3>
          {item.subtitle ? (
            <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-normal text-[#18364d]/75">
              {item.subtitle}
            </p>
          ) : null}
          <HighlightedData
            value={item.datoDestacado}
            compact
            className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
          />
        </div>
      </article>
    </Link>
  );
}

function GroupSection({ group }: { group: ResultGroup }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-black uppercase leading-none tracking-normal text-[#f3d7b4]">
          {group.label}
        </h2>
        <span className="rounded-full border border-[#efd4b0]/35 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
          {group.count}
        </span>
      </div>
      <div className="grid gap-10 sm:grid-cols-2 md:gap-14 lg:grid-cols-3">
        {group.items.map((item) => (
          <ResultCard key={item.href} item={item} type={group.type} />
        ))}
      </div>
    </section>
  );
}

export function BuscarClient({
  stations,
  artisans,
  products,
  experiences,
  spots,
}: SearchData) {
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

      const paramString = params.toString();
      router.replace(paramString ? `/buscar?${paramString}` : "/buscar", {
        scroll: false,
      });
    });
  }

  const groups = useMemo(
    () =>
      buildGroups(
        {
          stations,
          artisans,
          products,
          experiences,
          spots,
        },
        query,
      ),
    [artisans, experiences, products, query, spots, stations],
  );
  const totalResults = groups.reduce((sum, g) => sum + g.count, 0);
  const hasQuery = query.trim().length > 0;

  return (
    <>
      <div className="mb-5">
        <label htmlFor="global-search" className="sr-only">
          Buscar en toda la ruta
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#123a55]/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            id="global-search"
            type="search"
            placeholder="Buscar en toda la ruta..."
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full rounded-full border border-[#efd4b0]/30 bg-[#efd4b0] py-3 pl-11 pr-5 text-sm font-medium text-[#123a55] placeholder:text-[#123a55]/65 focus:border-white focus:outline-none"
          />
        </div>
      </div>

      {hasQuery && groups.length > 0 ? (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 pr-8 scrollbar-none scroll-fade-x sm:flex-wrap sm:pr-0">
          {groups.map((group) => (
            <span
              key={group.type}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#efd4b0]/35 px-4 py-2 text-sm font-black uppercase leading-none tracking-normal text-[#efd4b0]"
            >
              <span>{group.label}</span>
              <span>{group.count}</span>
            </span>
          ))}
        </div>
      ) : null}

      {hasQuery ? (
        <p
          className="mb-8 text-sm font-medium text-[#efd4b0]"
          role="status"
          aria-live="polite"
        >
          {totalResults > 0
            ? `${totalResults} resultado${totalResults !== 1 ? "s" : ""} para "${query}"`
            : `Sin resultados para "${query}"`}
        </p>
      ) : null}

      {groups.map((group) => (
        <GroupSection key={group.type} group={group} />
      ))}

      {hasQuery && groups.length === 0 ? (
        <div className="py-16 text-center text-[#efd4b0]">
          <p className="text-xl font-black uppercase leading-none tracking-normal">
            Sin resultados
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium text-white/75">
            Proba con otro termino o explora las secciones desde el menu.
          </p>
        </div>
      ) : null}

      {!hasQuery ? (
        <div className="py-16 text-center text-[#efd4b0]">
          <p className="text-xl font-black uppercase leading-none tracking-normal">
            Empeza con una busqueda
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium text-white/75">
            Escribi una palabra para encontrar estaciones, actores, productos,
            experiencias e imperdibles.
          </p>
        </div>
      ) : null}
    </>
  );
}
