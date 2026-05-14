import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getHighlightSpotContextBySlug,
  getHighlightSpots,
} from "@/app/lib/data";
import { createPageMetadata } from "@/app/lib/metadata";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { HomeCarousel } from "@/components/home-carousel";
import { IcsDownloadButton } from "@/components/ics-download-button";
import { ShareButton } from "@/components/share-button";
import { SurfaceCard } from "@/components/surface-card";

type HighlightSpotDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const spots = await getHighlightSpots();
  return spots.map((spot) => ({ slug: spot.slug }));
}

export async function generateMetadata({
  params,
}: HighlightSpotDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = await getHighlightSpotContextBySlug(slug);

  if (!context) {
    return createPageMetadata({
      title: "Imperdible no encontrado",
      path: `/imperdibles/${slug}`,
    });
  }

  const { spot } = context;

  return createPageMetadata({
    title: spot.title,
    description: spot.description || spot.subtitle,
    path: `/imperdibles/${spot.slug}`,
    imageUrl: spot.imageUrl,
  });
}

function formatEventDateLocal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default async function HighlightSpotDetailPage({ params }: HighlightSpotDetailPageProps) {
  const { slug } = await params;
  const context = await getHighlightSpotContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { spot, relatedArtisans, relatedExperiences, relatedStation, relatedProducts } = context;
  const isEvent = spot.type.toLowerCase() === "evento";

  return (
    <main className="flex flex-1 flex-col">
      {/* Back + Compartir */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/imperdibles"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          ← Imperdibles
        </Link>
        <div className="flex items-center gap-2">
          <FavoriteButton
            item={{
              type: "imperdible",
              slug: spot.slug,
              title: spot.title,
              subtitle: spot.location,
              href: `/imperdibles/${spot.slug}`,
              imageUrl: spot.imageUrl,
            }}
          />
          <ShareButton title={spot.title} text={spot.subtitle} />
        </div>
      </div>

      {/* Galería */}
      <section className="mb-10">
        <DetailMediaGallery
          title={spot.title}
          fallbackLabel="Imperdible"
          coverUrl={spot.imageUrl}
          galleryUrls={spot.galleryUrls}
        />
      </section>

      {/* Título + subtítulo + tipo */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
            {spot.type}
          </span>
          {spot.priority && spot.priority !== "media" && (
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]">
              Prioridad {spot.priority}
            </span>
          )}
        </div>
        <h1 className="display-font text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
          {spot.title}
        </h1>
        {spot.subtitle && (
          <p className="mt-2 text-base font-medium italic text-[color:var(--accent)]">
            {spot.subtitle}
          </p>
        )}
        {spot.location && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-[color:var(--text-muted)]">
            <svg className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent-mid)]" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
            </svg>
            {spot.location}
          </p>
        )}
      </section>

      {/* Evento: fecha/hora prominente + botón ICS */}
      {isEvent && spot.eventDate && (
        <section className="mb-10">
          <SurfaceCard className="border-[color:var(--accent)] bg-[color:var(--accent)]/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                  Fecha y hora del evento
                </p>
                <p className="mt-1 text-lg font-semibold capitalize text-[color:var(--foreground)]">
                  {formatEventDateLocal(spot.eventDate)}
                </p>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                  (hora de Argentina)
                </p>
              </div>
              <IcsDownloadButton
                title={spot.title}
                description={spot.description}
                location={spot.location}
                startIso={spot.eventDate}
              />
            </div>
          </SurfaceCard>
        </section>
      )}

      {/* Descripción */}
      <section className="mb-10">
        <p className="text-sm leading-7 text-[color:var(--text-muted)]">{spot.description}</p>
      </section>

      {/* Datos prácticos */}
      {(spot.horarios || spot.accesibilidad || spot.estacionalidad || spot.duracionSugerida || (spot.recomendaciones && spot.recomendaciones.length > 0)) && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
            Datos prácticos
          </h2>
          <SurfaceCard className="soft-shadow">
            <div className="divide-y divide-[color:var(--border)]">
              {spot.horarios && (
                <div className="py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Horarios</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{spot.horarios}</p>
                </div>
              )}
              {spot.accesibilidad && (
                <div className="py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Accesibilidad</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{spot.accesibilidad}</p>
                </div>
              )}
              {spot.estacionalidad && (
                <div className="py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Estacionalidad</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{spot.estacionalidad}</p>
                </div>
              )}
              {spot.duracionSugerida && (
                <div className="py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Duración sugerida</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{spot.duracionSugerida}</p>
                </div>
              )}
              {spot.recomendaciones && spot.recomendaciones.length > 0 && (
                <div className="py-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Recomendaciones</p>
                  <ul className="space-y-1">
                    {spot.recomendaciones.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-[color:var(--foreground)]">
                        <span className="mt-0.5 text-[color:var(--accent)]">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SurfaceCard>
        </section>
      )}

      {/* Estación relacionada */}
      {relatedStation && (
        <section className="mb-10">
          <SurfaceCard>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Estación</p>
            <p className="mt-1 font-semibold text-[color:var(--foreground)]">{relatedStation.name}</p>
            {relatedStation.slogan && (
              <p className="mt-0.5 text-xs italic text-[color:var(--text-muted)]">{relatedStation.slogan}</p>
            )}
            <Link
              href={`/estaciones/${relatedStation.slug}`}
              className="mt-3 inline-flex text-xs font-semibold text-[color:var(--accent)] hover:underline"
            >
              Ver estación →
            </Link>
          </SurfaceCard>
        </section>
      )}

      {/* Actores relacionados */}
      {relatedArtisans.length > 0 && (
        <HomeCarousel eyebrow="Comunidad" title="Actores relacionados" href="/artesanas" verTodosLabel="Ver todos">
          {relatedArtisans.map((actor) => (
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
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">{actor.actorType}</p>
                )}
                <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)]">{actor.name}</h3>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-2">{actor.craft}</p>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <HomeCarousel eyebrow="Artesanía" title="Productos relacionados" href="/productos" verTodosLabel="Ver todos">
          {relatedProducts.map((product) => (
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
                  <div className="flex aspect-square items-center justify-center bg-[color:var(--surface)] text-3xl">🧵</div>
                )}
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">{product.subcategory ?? product.category}</p>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)] line-clamp-2">{product.name}</h3>
                </div>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}

      {/* Experiencias relacionadas */}
      {relatedExperiences.length > 0 && (
        <HomeCarousel eyebrow="Vivencias" title="Experiencias relacionadas" href="/explorar" verTodosLabel="Ver todas">
          {relatedExperiences.map((exp) => (
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
    </main>
  );
}


