import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getHighlightSpotContextBySlug,
  getHighlightSpots,
} from "@/app/lib/data";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { hasValidCoordinates } from "@/app/lib/geo";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { createPageMetadata } from "@/app/lib/metadata";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { BackButton } from "@/components/back-button";
import { FavoriteButton } from "@/components/favorite-button";
import { HighlightedData } from "@/components/highlighted-data";
import { HomeCarousel } from "@/components/home-carousel";
import { IcsDownloadButton } from "@/components/ics-download-button";
import { MetricsViewTracker } from "@/components/metrics-view-tracker";
import { SatelliteMapButton } from "@/components/satellite-map-button";
import { ShareButton } from "@/components/share-button";
import { SurfaceCard } from "@/components/surface-card";
import { SiteEndSections } from "@/components/site-end-sections";

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

export default async function HighlightSpotDetailPage({
  params,
}: HighlightSpotDetailPageProps) {
  const { slug } = await params;
  const context = await getHighlightSpotContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const {
    spot,
    relatedArtisans,
    relatedExperiences,
    relatedStation,
    relatedProducts,
  } = context;
  const isEvent = spot.type.toLowerCase() === "evento";

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <MetricsViewTracker
        entityType="imperdibles"
        entityId={spot.recordId}
        entitySlug={spot.slug}
        entityTitle={spot.title}
      />
      <div className="mx-auto w-full max-w-6xl px-5 pb-6 pt-10 sm:px-8 md:pb-8 md:pt-16 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <BackButton
            fallbackHref="/imperdibles"
            className="inline-flex rounded-full border border-[#efd4b0]/35 bg-[#efd4b0] px-4 py-2 text-sm font-black uppercase leading-none tracking-normal text-[#123a55] transition hover:-translate-y-0.5 hover:border-white hover:bg-white"
          >
            Volver
          </BackButton>
          <div className="flex items-center gap-2">
            <FavoriteButton
              item={{
                type: "imperdible",
                slug: spot.slug,
                title: spot.title,
                subtitle: spot.location,
                href: `/imperdibles/${spot.slug}`,
                imageUrl: spot.imageUrl,
                imageFocus: spot.imageFocus,
                datoDestacado: spot.datoDestacado,
              }}
            />
            <ShareButton title={spot.title} text={spot.subtitle} />
          </div>
        </div>

        <section className="mb-10">
          <DetailMediaGallery
            title={spot.title}
            fallbackLabel="Imperdible"
            coverUrl={spot.imageUrl}
            galleryUrls={spot.galleryUrls}
            coverFocus={spot.imageFocus}
            galleryImages={spot.galleryImages}
            coverClassName="aspect-[16/9] w-full"
          />
        </section>

        <section className="mb-10">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#efd4b0] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#123a55] shadow">
              {spot.type}
            </span>
            {spot.priority && spot.priority !== "media" ? (
              <span className="rounded-full border border-[#efd4b0]/35 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
                Prioridad {spot.priority}
              </span>
            ) : null}
          </div>
          <h1 className="brand-font max-w-4xl text-[2.55rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3.35rem] md:text-[4.25rem]">
            {formatBrandFontText(spot.title)}
          </h1>
          {spot.subtitle ? (
            <p className="mt-4 max-w-2xl text-base font-black uppercase leading-tight tracking-normal text-white sm:text-lg">
              {spot.subtitle}
            </p>
          ) : null}
          {spot.location ? (
            <p className="mt-3 text-sm font-medium uppercase leading-tight tracking-normal text-[#efd4b0]">
              {spot.location}
            </p>
          ) : null}
        </section>

        {isEvent && spot.eventDate ? (
          <section className="mb-10">
            <div className="rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/75">
                    Fecha y hora del evento
                  </p>
                  <p className="mt-2 text-lg font-black capitalize leading-tight text-[#082d49]">
                    {formatEventDateLocal(spot.eventDate)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#18364d]/75">
                    Hora de Argentina
                  </p>
                </div>
                <IcsDownloadButton
                  title={spot.title}
                  description={spot.description}
                  location={spot.location}
                  startIso={spot.eventDate}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="mb-10 max-w-3xl">
          <p className="text-justify text-base font-medium leading-tight text-white/85 sm:text-lg">
            {spot.description}
          </p>
          <HighlightedData
            value={spot.datoDestacado}
            className="mt-5 max-w-2xl border-[#efd4b0]/35 bg-[#efd4b0]/10 text-[#f3d7b4]"
          />
        </section>

        {hasValidCoordinates(spot) ? (
          <section className="mb-10">
            <h2 className="mb-4 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
              Ubicacion
            </h2>
            <div className="rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/75">
                    Coordenadas
                  </p>
                  <p className="mt-2 font-mono text-sm font-black text-[#082d49]">
                    {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#18364d]/75">
                    {spot.location}
                  </p>
                </div>
                <SatelliteMapButton
                  point={spot}
                  className="border-[#123a55]/20 bg-[#123a55] text-[#efd4b0] hover:border-[#123a55] hover:text-white"
                />
              </div>
            </div>
          </section>
        ) : null}

        {spot.horarios ||
        spot.accesibilidad ||
        spot.estacionalidad ||
        spot.duracionSugerida ||
        (spot.recomendaciones && spot.recomendaciones.length > 0) ? (
          <section className="mb-10">
            <h2 className="mb-4 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
              Datos practicos
            </h2>
            <div className="rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55]">
              <div className="divide-y divide-[#123a55]/20">
                {spot.horarios ? (
                  <div className="py-3 first:pt-0">
                    <p className="text-[10px] font-black uppercase tracking-normal text-[#123a55]/75">
                      Horarios
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#082d49]">
                      {spot.horarios}
                    </p>
                  </div>
                ) : null}
                {spot.accesibilidad ? (
                  <div className="py-3">
                    <p className="text-[10px] font-black uppercase tracking-normal text-[#123a55]/75">
                      Accesibilidad
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#082d49]">
                      {spot.accesibilidad}
                    </p>
                  </div>
                ) : null}
                {spot.estacionalidad ? (
                  <div className="py-3">
                    <p className="text-[10px] font-black uppercase tracking-normal text-[#123a55]/75">
                      Estacionalidad
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#082d49]">
                      {spot.estacionalidad}
                    </p>
                  </div>
                ) : null}
                {spot.duracionSugerida ? (
                  <div className="py-3">
                    <p className="text-[10px] font-black uppercase tracking-normal text-[#123a55]/75">
                      Duracion sugerida
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#082d49]">
                      {spot.duracionSugerida}
                    </p>
                  </div>
                ) : null}
                {spot.recomendaciones && spot.recomendaciones.length > 0 ? (
                  <div className="py-3 last:pb-0">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-normal text-[#123a55]/75">
                      Recomendaciones
                    </p>
                    <ul className="space-y-1">
                      {spot.recomendaciones.map((recommendation) => (
                        <li
                          key={recommendation}
                          className="text-sm font-medium text-[#082d49]"
                        >
                          - {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {relatedStation ? (
          <section className="mb-10">
            <div className="rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55]">
              <p className="text-[10px] font-black uppercase tracking-normal text-[#123a55]/75">
                Estacion
              </p>
              <p className="mt-1 text-xl font-black leading-tight text-[#082d49]">
                {relatedStation.name}
              </p>
              {relatedStation.slogan ? (
                <p className="mt-1 text-xs font-medium uppercase tracking-normal text-[#18364d]/75">
                  {relatedStation.slogan}
                </p>
              ) : null}
              <Link
                href={`/estaciones/${relatedStation.slug}`}
                className="mt-4 inline-flex rounded-full bg-[#123a55] px-4 py-2 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:-translate-y-0.5 hover:text-white"
              >
                Ver estacion -&gt;
              </Link>
            </div>
          </section>
        ) : null}

        {relatedArtisans.length > 0 ? (
          <HomeCarousel
            eyebrow="Comunidad"
            title="Actores relacionados"
            href="/actores"
            verTodosLabel="Ver todos"
            variant="onDark"
          >
            {relatedArtisans.map((actor) => (
              <Link
                key={actor.slug}
                href={`/actores/${actor.slug}`}
                className="group w-[200px] shrink-0 [scroll-snap-align:start]"
              >
                <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                  {actor.imageUrl ? (
                    <div className="relative mb-3 h-14 w-14 overflow-hidden rounded-full border border-[color:var(--border)]">
                      <Image
                        src={withPocketBaseImageThumb(actor.imageUrl, "thumbnail")}
                        alt={actor.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                        style={getImageFocusStyle(actor.imageFocus)}
                      />
                    </div>
                  ) : (
                    <div className="display-font mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface)] text-xl text-[color:var(--accent-strong)]">
                      {actor.name[0]}
                    </div>
                  )}
                  {actor.actorType ? (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                      {actor.actorType}
                    </p>
                  ) : null}
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)]">
                    {actor.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-2">
                    {actor.craft}
                  </p>
                  <HighlightedData
                    value={actor.datoDestacado}
                    compact
                    className="mt-3"
                  />
                </SurfaceCard>
              </Link>
            ))}
          </HomeCarousel>
        ) : null}

        {relatedProducts.length > 0 ? (
          <HomeCarousel
            eyebrow="Artesania"
            title="Productos relacionados"
            href="/productos"
            verTodosLabel="Ver todos"
            variant="onDark"
          >
            {relatedProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/productos/${product.slug}`}
                className="group w-[200px] shrink-0 [scroll-snap-align:start]"
              >
                <SurfaceCard className="h-full overflow-hidden !p-0 transition group-hover:border-[color:var(--accent)]">
                  {product.imageUrl ? (
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Image
                        src={withPocketBaseImageThumb(
                          product.imageUrl,
                          "thumbnail",
                        )}
                        alt={product.name}
                        fill
                        className="object-cover transition group-hover:scale-[1.03]"
                        sizes="200px"
                        style={getImageFocusStyle(product.imageFocus)}
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-[color:var(--surface)] text-xs font-semibold uppercase text-[color:var(--accent-strong)]">
                      Producto
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                      {product.subcategory ?? product.category}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)] line-clamp-2">
                      {product.name}
                    </h3>
                    <HighlightedData
                      value={product.datoDestacado}
                      compact
                      className="mt-3"
                    />
                  </div>
                </SurfaceCard>
              </Link>
            ))}
          </HomeCarousel>
        ) : null}

        {relatedExperiences.length > 0 ? (
          <HomeCarousel
            eyebrow="Vivencias"
            title="Experiencias relacionadas"
            href="/explorar"
            verTodosLabel="Ver todas"
            variant="onDark"
          >
            {relatedExperiences.map((exp) => (
              <Link
                key={exp.slug}
                href={`/explorar/${exp.slug}`}
                className="group w-[260px] shrink-0 [scroll-snap-align:start]"
              >
                <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                  {exp.imageUrl ? (
                    <div className="relative mb-3 aspect-[3/2] overflow-hidden rounded-xl">
                      <Image
                        src={withPocketBaseImageThumb(exp.imageUrl, "thumbnail")}
                        alt={exp.title}
                        fill
                        className="object-cover transition group-hover:scale-[1.03]"
                        sizes="260px"
                        style={getImageFocusStyle(exp.imageFocus)}
                      />
                    </div>
                  ) : (
                    <div className="mb-3 flex aspect-[3/2] items-center justify-center rounded-xl bg-[color:var(--surface)] text-xs font-semibold uppercase text-[color:var(--accent-strong)]">
                      Experiencia
                    </div>
                  )}
                  <div className="mb-2 flex gap-2">
                    <span className="rounded-full bg-[color:var(--surface)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent-mid)]">
                      {exp.tag}
                    </span>
                    <span className="rounded-full bg-[color:var(--surface)] px-2.5 py-0.5 text-[10px] text-[color:var(--text-muted)]">
                      {exp.duration}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug text-[color:var(--foreground)]">
                    {exp.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-2">
                    {exp.description}
                  </p>
                  <HighlightedData
                    value={exp.datoDestacado}
                    compact
                    className="mt-3"
                  />
                </SurfaceCard>
              </Link>
            ))}
          </HomeCarousel>
        ) : null}
      </div>
      <SiteEndSections />
    </main>
  );
}
