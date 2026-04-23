import Image from "next/image";
import Link from "next/link";
import {
  getArtisansResult,
  getExperiencesResult,
  getHighlightSpotsResult,
  getProductsResult,
  getStationsResult,
} from "@/app/lib/data";
import { HomeCarousel } from "@/components/home-carousel";
import { SurfaceCard } from "@/components/surface-card";

export default async function Home() {
  const [
    stationsResult,
    artisansResult,
    productsResult,
    experiencesResult,
    highlightSpotsResult,
  ] = await Promise.all([
    getStationsResult(),
    getArtisansResult(),
    getProductsResult(),
    getExperiencesResult(),
    getHighlightSpotsResult(),
  ]);

  const stations = stationsResult.items;
  const artisans = artisansResult.items;
  const products = productsResult.items;
  const experiences = experiencesResult.items;
  const highlightSpots = highlightSpotsResult.items;

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero — sin botones */}
      <section className="mb-14">
        <div className="overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#a85d41_0%,#8a452b_100%)] px-6 py-8 sm:px-10 sm:py-12">
          <h1 className="display-font text-5xl leading-tight text-white sm:text-6xl">
            La Ruta
            <br />
            del Telar
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/80">
            Un itinerario cultural que une comunidades tejedoras de Catamarca. Cada estación guarda sus artesanos, sus técnicas y sus formas de recibir al visitante — un tejido que une paisaje, memoria
            y comunidad.
          </p>
        </div>
      </section>

      {/* Carrusel: Estaciones */}
      <HomeCarousel eyebrow="Territorio" title="Estaciones" href="/estaciones" verTodosLabel="Ver todas">
        {stations.map((station) => (
          <Link
            key={station.slug}
            href={`/estaciones/${station.slug}`}
            className="group w-[260px] shrink-0 [scroll-snap-align:start]"
          >
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              {station.imageUrl ? (
                <div className="relative mb-4 aspect-[3/2] overflow-hidden rounded-xl">
                  <Image
                    src={station.imageUrl}
                    alt={station.name}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="260px"
                  />
                </div>
              ) : (
                <div className="mb-4 flex aspect-[3/2] items-center justify-center rounded-xl bg-[color:var(--surface)] text-4xl">
                  🗺️
                </div>
              )}
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                {station.locality}
              </p>
              <h3 className="mt-1 text-base font-semibold leading-snug text-[color:var(--foreground)]">
                {station.name}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--text-muted)] line-clamp-2">
                {station.slogan}
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </HomeCarousel>

      {/* Carrusel: Actores */}
      <HomeCarousel eyebrow="Comunidad" title="Actores" href="/artesanas">
        {artisans.map((actor) => (
          <Link
            key={actor.slug}
            href={`/artesanas/${actor.slug}`}
            className="group w-[220px] shrink-0 [scroll-snap-align:start]"
          >
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              {actor.imageUrl ? (
                <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full border border-[color:var(--border)]">
                  <Image
                    src={actor.imageUrl}
                    alt={actor.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="display-font mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--surface)] text-2xl text-[color:var(--accent-strong)]">
                  {actor.name.slice(0, 1)}
                </div>
              )}
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                {actor.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-[color:var(--accent-mid)]">
                {actor.craft}
              </p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                {actor.place}
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </HomeCarousel>

      {/* Carrusel: Productos */}
      <HomeCarousel eyebrow="Artesanía" title="Productos" href="/productos">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/productos/${product.slug}`}
            className="group w-[240px] shrink-0 [scroll-snap-align:start]"
          >
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              {product.imageUrl ? (
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="240px"
                  />
                </div>
              ) : (
                <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-[color:var(--surface)] text-4xl">
                  🧵
                </div>
              )}
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                {product.subcategory ?? product.category}
              </p>
              <h3 className="mt-1 text-base font-semibold leading-snug text-[color:var(--foreground)]">
                {product.name}
              </h3>
              {product.techniques.length > 0 && (
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  {product.techniques.slice(0, 2).join(" · ")}
                </p>
              )}
            </SurfaceCard>
          </Link>
        ))}
      </HomeCarousel>

      {/* Carrusel: Experiencias */}
      <HomeCarousel
        eyebrow="Vivencias"
        title="Experiencias"
        href="/explorar"
        verTodosLabel="Ver todas"
      >
        {experiences.map((exp) => (
          <Link
            key={exp.slug}
            href={`/explorar/${exp.slug}`}
            className="group w-[260px] shrink-0 [scroll-snap-align:start]"
          >
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              {exp.imageUrl ? (
                <div className="relative mb-4 aspect-[3/2] overflow-hidden rounded-xl">
                  <Image
                    src={exp.imageUrl}
                    alt={exp.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="260px"
                  />
                </div>
              ) : (
                <div className="mb-4 flex aspect-[3/2] items-center justify-center rounded-xl bg-[color:var(--surface)] text-4xl">
                  🧭
                </div>
              )}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                  {exp.tag}
                </span>
                <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-[10px] text-[color:var(--text-muted)]">
                  {exp.duration}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                {exp.title}
              </h3>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                {exp.location}
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </HomeCarousel>

      {/* Carrusel: Imperdibles */}
      <HomeCarousel
        eyebrow="Destacados"
        title="Imperdibles"
        href="/imperdibles"
      >
        {highlightSpots.map((spot) => (
          <Link
            key={spot.slug}
            href={`/imperdibles/${spot.slug}`}
            className="group w-[260px] shrink-0 [scroll-snap-align:start]"
          >
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              {spot.imageUrl ? (
                <div className="relative mb-4 aspect-[3/2] overflow-hidden rounded-xl">
                  <Image
                    src={spot.imageUrl}
                    alt={spot.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="260px"
                  />
                </div>
              ) : (
                <div className="mb-4 flex aspect-[3/2] items-center justify-center rounded-xl bg-[color:var(--surface)] text-4xl">
                  ⭐
                </div>
              )}
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                {spot.type}
              </p>
              <h3 className="mt-1 text-base font-semibold leading-snug text-[color:var(--foreground)]">
                {spot.title}
              </h3>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                {spot.location}
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </HomeCarousel>
    </main>
  );
}
