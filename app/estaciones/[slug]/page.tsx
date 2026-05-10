import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStationContextBySlug, getStations } from "@/app/lib/data";
import { createPageMetadata } from "@/app/lib/metadata";
import { FavoriteButton } from "@/components/favorite-button";
import { HomeCarousel } from "@/components/home-carousel";
import { MediaFallback } from "@/components/media-fallback";
import { ShareButton } from "@/components/share-button";
import { StationDetailMap } from "@/components/station-detail-map";
import { SurfaceCard } from "@/components/surface-card";

type StationDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const stations = await getStations();
  return stations.map((station) => ({ slug: station.slug }));
}

export async function generateMetadata({
  params,
}: StationDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = await getStationContextBySlug(slug);

  if (!context) {
    return createPageMetadata({
      title: "Estacion no encontrada",
      path: `/estaciones/${slug}`,
    });
  }

  const { station } = context;

  return createPageMetadata({
    title: station.name,
    description: station.summary,
    path: `/estaciones/${station.slug}`,
    imageUrl: station.imageUrl,
  });
}


export default async function StationDetailPage({ params }: StationDetailPageProps) {
  const { slug } = await params;
  const context = await getStationContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { station, artisans, products, experiences, highlightSpots } = context;
  const allGallery = [
    ...(station.imageUrl ? [station.imageUrl] : []),
    ...(station.galleryUrls ?? []).filter((u) => u !== station.imageUrl),
  ];

  return (
    <main className="flex flex-1 flex-col">
      {/* Back + Compartir */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/estaciones"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          ← Estaciones
        </Link>
        <div className="flex items-center gap-2">
          <FavoriteButton
            item={{
              type: "estacion",
              slug: station.slug,
              title: station.name,
              subtitle: station.locality,
              href: `/estaciones/${station.slug}`,
              imageUrl: station.imageUrl,
            }}
          />
          <ShareButton title={station.name} text={station.summary} />
        </div>
      </div>

      {/* Hero gallery */}
      <section className="mb-10">
        {allGallery.length > 0 ? (
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {allGallery.map((url, i) => (
                <div
                  key={url}
                  className={`relative shrink-0 overflow-hidden rounded-3xl [scroll-snap-align:start] ${i === 0 ? "aspect-[16/9] w-full" : "aspect-[4/3] w-[280px]"}`}
                >
                  <Image
                    src={url}
                    alt={`${station.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
            {station.hasInauguratedStation && (
              <span className="absolute left-4 top-4 rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white shadow">
                Inaugurada
              </span>
            )}
          </div>
        ) : (
          <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-[color:var(--border)]">
            <MediaFallback label="Estacion" />
          </div>
        )}
      </section>

      {/* Título y descripción */}
      <section className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
          {station.department ? `${station.department} · ` : ""}{station.locality}
        </p>
        <h1 className="display-font mt-2 text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
          {station.name}
        </h1>
        {station.slogan && (
          <p className="mt-2 text-base font-medium italic text-[color:var(--accent)]">
            {station.slogan}
          </p>
        )}
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">
          {station.summary}
        </p>
      </section>

      {/* Mapa embebido */}
      {station.latitude && station.longitude ? (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
            Ubicación
          </h2>
          <div className="overflow-hidden rounded-3xl border border-[color:var(--border)]">
            <StationDetailMap lat={station.latitude} lng={station.longitude} label={station.name} />
          </div>
        </section>
      ) : null}

      {/* Actores */}
      {artisans.length > 0 && (
        <HomeCarousel eyebrow="Comunidad" title="Actores en esta estación" href="/artesanas" verTodosLabel="Ver todos">
          {artisans.map((actor) => (
            <Link
              key={actor.slug}
              href={`/artesanas/${actor.slug}`}
              className="group w-[200px] shrink-0 [scroll-snap-align:start]"
            >
              <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                {actor.imageUrl ? (
                  <div className="relative mb-3 h-14 w-14 overflow-hidden rounded-full border border-[color:var(--border)]">
                    <Image src={actor.imageUrl} alt={actor.name} fill className="object-cover" sizes="56px" />
                  </div>
                ) : (
                  <div className="display-font mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface)] text-xl text-[color:var(--accent-strong)]">
                    {actor.name[0]}
                  </div>
                )}
                {actor.actorType && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                    {actor.actorType}
                  </p>
                )}
                <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)]">
                  {actor.name}
                </h3>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-2">
                  {actor.craft}
                </p>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}

      {/* Productos */}
      {products.length > 0 && (
        <HomeCarousel eyebrow="Artesanía" title="Productos de la estación" href="/productos" verTodosLabel="Ver todos">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/productos/${product.slug}`}
              className="group w-[200px] shrink-0 [scroll-snap-align:start]"
            >
              <SurfaceCard className="!p-0 h-full overflow-hidden transition group-hover:border-[color:var(--accent)]">
                {product.imageUrl ? (
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition group-hover:scale-[1.03]" sizes="200px" />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-[color:var(--surface)] text-3xl">
                    🧵
                  </div>
                )}
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                    {product.subcategory ?? product.category}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)] line-clamp-2">
                    {product.name}
                  </h3>
                </div>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}

      {/* Experiencias */}
      {experiences.length > 0 && (
        <HomeCarousel eyebrow="Vivencias" title="Experiencias disponibles" href="/explorar" verTodosLabel="Ver todas">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/explorar/${exp.slug}`}
              className="group w-[260px] shrink-0 [scroll-snap-align:start]"
            >
              <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                {exp.imageUrl ? (
                  <div className="relative mb-3 aspect-[3/2] overflow-hidden rounded-xl">
                    <Image src={exp.imageUrl} alt={exp.title} fill className="object-cover transition group-hover:scale-[1.03]" sizes="260px" />
                  </div>
                ) : (
                  <div className="mb-3 flex aspect-[3/2] items-center justify-center rounded-xl bg-[color:var(--surface)] text-3xl">🧭</div>
                )}
                <div className="mb-2 flex gap-2">
                  <span className="rounded-full bg-[color:var(--surface)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent-mid)]">{exp.tag}</span>
                  <span className="rounded-full bg-[color:var(--surface)] px-2.5 py-0.5 text-[10px] text-[color:var(--text-muted)]">{exp.duration}</span>
                </div>
                <h3 className="text-sm font-semibold leading-snug text-[color:var(--foreground)]">{exp.title}</h3>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-2">{exp.description}</p>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}

      {/* Imperdibles */}
      {highlightSpots.length > 0 && (
        <HomeCarousel eyebrow="Destacados" title="Imperdibles de la estación" href="/imperdibles">
          {highlightSpots.map((spot) => (
            <Link
              key={spot.slug}
              href={`/imperdibles/${spot.slug}`}
              className="group w-[240px] shrink-0 [scroll-snap-align:start]"
            >
              <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                {spot.imageUrl ? (
                  <div className="relative mb-3 aspect-[3/2] overflow-hidden rounded-xl">
                    <Image src={spot.imageUrl} alt={spot.title} fill className="object-cover transition group-hover:scale-[1.03]" sizes="240px" />
                  </div>
                ) : (
                  <div className="mb-3 flex aspect-[3/2] items-center justify-center rounded-xl bg-[color:var(--surface)] text-3xl">⭐</div>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">{spot.type}</p>
                <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)]">{spot.title}</h3>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-2">{spot.subtitle}</p>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}

      {/* Cómo llegar */}
      <section className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
          Cómo llegar
        </h2>
        <SurfaceCard>
          {station.latitude && station.longitude ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-[color:var(--text-muted)]">Coordenadas</p>
                <p className="mt-1 font-mono text-sm font-semibold text-[color:var(--foreground)]">
                  {station.latitude.toFixed(5)}, {station.longitude.toFixed(5)}
                </p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  {station.locality}{station.department ? `, ${station.department}` : ""}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
              >
                Abrir en Maps
              </a>
            </div>
          ) : (
            <p className="text-sm text-[color:var(--text-muted)]">
              Coordenadas no disponibles aún. Buscá{" "}
              <span className="font-semibold">{station.name}</span> en{" "}
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(station.name + " " + station.locality)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--accent)] underline"
              >
                Google Maps
              </a>
              .
            </p>
          )}
        </SurfaceCard>
      </section>
    </main>
  );
}
