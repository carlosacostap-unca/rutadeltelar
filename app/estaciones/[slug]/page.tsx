import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { getStationContextBySlug, getStations } from "@/app/lib/data";
import { hasValidCoordinates } from "@/app/lib/geo";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { createPageMetadata } from "@/app/lib/metadata";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { HighlightedData } from "@/components/highlighted-data";
import { HomeCarousel } from "@/components/home-carousel";
import { MediaFallback } from "@/components/media-fallback";
import { SatelliteMapButton } from "@/components/satellite-map-button";
import { ShareButton } from "@/components/share-button";
import { StationDetailMap } from "@/components/station-detail-map";

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

function formatStationTitle(value: string) {
  return value.replace(/^Estaci[oó]n\s+/i, "");
}

function DetailActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-[#efd4b0]/35 px-4 py-2 text-sm font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
    >
      {children}
    </Link>
  );
}

function RelatedCard({
  href,
  eyebrow,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  imageFocus,
  fallbackLabel,
  datoDestacado,
}: {
  href: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt: string;
  imageFocus?: Parameters<typeof getImageFocusStyle>[0];
  fallbackLabel: string;
  datoDestacado?: string;
}) {
  return (
    <Link
      href={href}
      className="group w-[230px] shrink-0 [scroll-snap-align:start]"
    >
      <article className="h-full overflow-hidden rounded-[1.35rem] bg-[#efd4b0] text-[#123a55] transition duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[1.12] w-full overflow-hidden bg-[#123a55]/10">
          {imageUrl ? (
            <Image
              src={withPocketBaseImageThumb(imageUrl, "thumbnail")}
              alt={imageAlt}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="230px"
              style={getImageFocusStyle(imageFocus)}
            />
          ) : (
            <MediaFallback label={fallbackLabel} />
          )}
        </div>
        <div className="p-4">
          {eyebrow ? (
            <p className="text-[0.68rem] font-medium uppercase leading-none tracking-normal text-[#123a55]/75">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-black leading-[0.95] tracking-normal text-[#082d49]">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-2 line-clamp-2 text-xs font-medium leading-4 text-[#123a55]/75">
              {subtitle}
            </p>
          ) : null}
          <HighlightedData
            value={datoDestacado}
            compact
            className="mt-3 border-[#123a55]/20 bg-[#123a55]/5"
          />
        </div>
      </article>
    </Link>
  );
}

export default async function StationDetailPage({
  params,
}: StationDetailPageProps) {
  const { slug } = await params;
  const context = await getStationContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { station, artisans, products, experiences, highlightSpots } = context;
  const stationTitle = formatStationTitle(station.locality || station.name);

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-16 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <DetailActionLink href="/estaciones">Volver a estaciones</DetailActionLink>
          <div className="flex flex-wrap items-center gap-2">
            <FavoriteButton
              variant="onDark"
              item={{
                type: "estacion",
                slug: station.slug,
                title: station.name,
                subtitle: station.locality,
                href: `/estaciones/${station.slug}`,
                imageUrl: station.imageUrl,
                imageFocus: station.imageFocus,
                datoDestacado: station.datoDestacado,
              }}
            />
            <ShareButton
              title={station.name}
              text={station.summary}
              variant="onDark"
            />
          </div>
        </div>

        <section className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div className="pt-1">
            <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
              Estaciones
            </p>
            <h1 className="brand-font mt-1 text-[2.65rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3.35rem] md:text-[4.35rem]">
              {formatBrandFontText(stationTitle)}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {station.department ? (
                <span className="rounded-full border border-[#efd4b0]/35 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
                  {station.department}
                </span>
              ) : null}
              {station.hasInauguratedStation ? (
                <span className="rounded-full bg-[#efd4b0] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
                  Inaugurada
                </span>
              ) : null}
            </div>
            {station.slogan ? (
              <p className="mt-5 text-lg font-black leading-tight text-white">
                {station.slogan}
              </p>
            ) : null}
            <p className="mt-4 w-full text-justify text-base font-medium leading-7 text-white/85">
              {station.summary}
            </p>
            <HighlightedData
              value={station.datoDestacado}
              className="mt-5 max-w-xl border-[#efd4b0]/25 bg-[#efd4b0]/10 text-[#efd4b0]"
            />
          </div>

          <DetailMediaGallery
            title={station.name}
            fallbackLabel="Estacion"
            coverUrl={station.imageUrl}
            galleryUrls={station.galleryUrls}
            coverFocus={station.imageFocus}
            galleryImages={station.galleryImages}
            coverClassName="aspect-[1.12] rounded-[1.85rem] border-[#efd4b0]/25"
            coverSizes="(max-width: 1024px) 100vw, 56vw"
            thumbnailClassName="aspect-[4/3] w-[180px] rounded-[1.1rem] border-[#efd4b0]/25"
          />
        </section>

        {hasValidCoordinates(station) ? (
          <section className="mb-12 rounded-[1.85rem] bg-[#efd4b0] p-4 text-[#123a55] shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
                  Ubicacion
                </p>
                <h2 className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
                  Como llegar
                </h2>
              </div>
              <SatelliteMapButton point={station} />
            </div>
            <div className="overflow-hidden rounded-[1.35rem] border border-[#123a55]/20 shadow-sm">
              <StationDetailMap
                lat={station.latitude}
                lng={station.longitude}
                label={station.name}
              />
            </div>
            <div className="mt-4 rounded-[1.15rem] bg-[#123a55] px-4 py-3 text-[#efd4b0]">
              <p className="text-[0.7rem] font-medium leading-none tracking-normal text-[#efd4b0]/75">
                Coordenadas
              </p>
              <p className="mt-1 font-mono text-sm font-semibold">
                {station.latitude.toFixed(5)}, {station.longitude.toFixed(5)}
              </p>
            </div>
          </section>
        ) : (
          <section className="mb-12 rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55]">
            <p className="text-sm font-black uppercase leading-none tracking-normal">
              Ubicacion
            </p>
            <p className="mt-2 text-sm font-medium">
              Coordenadas no disponibles aun.
            </p>
          </section>
        )}

        {artisans.length > 0 ? (
          <HomeCarousel
            eyebrow="Comunidad"
            title="Actores en esta estacion"
            href="/artesanas"
            verTodosLabel="Ver todos"
            variant="onDark"
          >
            {artisans.map((actor) => (
              <RelatedCard
                key={actor.slug}
                href={`/artesanas/${actor.slug}`}
                eyebrow={actor.actorType}
                title={actor.name}
                subtitle={actor.craft}
                imageUrl={actor.imageUrl}
                imageAlt={actor.name}
                imageFocus={actor.imageFocus}
                fallbackLabel="Actor"
                datoDestacado={actor.datoDestacado}
              />
            ))}
          </HomeCarousel>
        ) : null}

        {products.length > 0 ? (
          <HomeCarousel
            eyebrow="Artesania"
            title="Productos de la estacion"
            href="/productos"
            verTodosLabel="Ver todos"
            variant="onDark"
          >
            {products.map((product) => (
              <RelatedCard
                key={product.slug}
                href={`/productos/${product.slug}`}
                eyebrow={product.subcategory ?? product.category}
                title={product.name}
                subtitle={product.description}
                imageUrl={product.imageUrl}
                imageAlt={product.name}
                imageFocus={product.imageFocus}
                fallbackLabel="Producto"
                datoDestacado={product.datoDestacado}
              />
            ))}
          </HomeCarousel>
        ) : null}

        {experiences.length > 0 ? (
          <HomeCarousel
            eyebrow="Vivencias"
            title="Experiencias disponibles"
            href="/explorar"
            verTodosLabel="Ver todas"
            variant="onDark"
          >
            {experiences.map((experience) => (
              <RelatedCard
                key={experience.slug}
                href={`/explorar/${experience.slug}`}
                eyebrow={`${experience.tag} · ${experience.duration}`}
                title={experience.title}
                subtitle={experience.description}
                imageUrl={experience.imageUrl}
                imageAlt={experience.title}
                imageFocus={experience.imageFocus}
                fallbackLabel="Experiencia"
                datoDestacado={experience.datoDestacado}
              />
            ))}
          </HomeCarousel>
        ) : null}

        {highlightSpots.length > 0 ? (
          <HomeCarousel
            eyebrow="Destacados"
            title="Imperdibles de la estacion"
            href="/imperdibles"
            variant="onDark"
          >
            {highlightSpots.map((spot) => (
              <RelatedCard
                key={spot.slug}
                href={`/imperdibles/${spot.slug}`}
                eyebrow={spot.type}
                title={spot.title}
                subtitle={spot.subtitle}
                imageUrl={spot.imageUrl}
                imageAlt={spot.title}
                imageFocus={spot.imageFocus}
                fallbackLabel="Imperdible"
                datoDestacado={spot.datoDestacado}
              />
            ))}
          </HomeCarousel>
        ) : null}
      </div>
    </main>
  );
}
