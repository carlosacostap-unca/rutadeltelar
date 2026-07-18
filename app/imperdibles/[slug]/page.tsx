import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import {
  getHighlightSpotContextBySlug,
  getHighlightSpots,
} from "@/app/lib/data";
import { hasValidCoordinates } from "@/app/lib/geo";
import { createPageMetadata } from "@/app/lib/metadata";
import { BackButton } from "@/components/back-button";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { HighlightedData } from "@/components/highlighted-data";
import { IcsDownloadButton } from "@/components/ics-download-button";
import { MetricsViewTracker } from "@/components/metrics-view-tracker";
import { SatelliteMapButton } from "@/components/satellite-map-button";
import { ShareButton } from "@/components/share-button";
import { SiteEndSections } from "@/components/site-end-sections";
import { StationDetailMap } from "@/components/station-detail-map";

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

function formatLocation(value?: string) {
  return (value ?? "")
    .replace(/^Estaci[oó]n\s+/i, "")
    .replace(/,\s*Catamarca\.?$/i, "")
    .trim();
}

function formatEventDateLocal(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function DetailActionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <BackButton
      fallbackHref={href}
      className="inline-flex min-h-11 items-center rounded-full border border-[#efd4b0]/35 px-4 py-2.5 text-sm font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#efd4b0]/60"
    >
      {children}
    </BackButton>
  );
}

function HeroTag({
  children,
  emphasis = false,
}: {
  children: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal ${
        emphasis
          ? "bg-[#efd4b0] text-[#123a55]"
          : "border border-[#efd4b0]/35 text-[#efd4b0]"
      }`}
    >
      {children}
    </span>
  );
}

function InfoTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#123a55]/20 bg-[#123a55]/5 px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
      {children}
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-[#123a55]/15 py-3 last:border-0">
      <p className="text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/65">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium leading-6 text-[#123a55]">
        {children}
      </div>
    </div>
  );
}

export default async function HighlightSpotDetailPage({
  params,
}: HighlightSpotDetailPageProps) {
  const { slug } = await params;
  const context = await getHighlightSpotContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { spot, relatedStation } = context;
  const isEvent = spot.type.toLowerCase() === "evento";
  const locationLabel = formatLocation(
    relatedStation?.name ?? spot.stationName ?? spot.location,
  );
  const hasPracticalInfo =
    isEvent ||
    hasValidCoordinates(spot) ||
    Boolean(relatedStation) ||
    Boolean(spot.horarios) ||
    Boolean(spot.accesibilidad) ||
    Boolean(spot.estacionalidad) ||
    Boolean(spot.duracionSugerida) ||
    Boolean(spot.recomendaciones?.length);

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <MetricsViewTracker
        entityType="imperdibles"
        entityId={spot.recordId}
        entitySlug={spot.slug}
        entityTitle={spot.title}
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-2 pt-10 sm:px-8 md:pb-3 md:pt-16 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <DetailActionLink href="/imperdibles">Volver</DetailActionLink>
          <div className="flex flex-wrap items-center gap-2">
            <FavoriteButton
              variant="onDark"
              item={{
                type: "imperdible",
                slug: spot.slug,
                title: spot.title,
                subtitle: locationLabel || spot.type,
                href: `/imperdibles/${spot.slug}`,
                imageUrl: spot.imageUrl,
                imageFocus: spot.imageFocus,
                datoDestacado: spot.datoDestacado,
              }}
            />
            <ShareButton
              title={spot.title}
              text={spot.description || spot.subtitle}
              variant="onDark"
            />
          </div>
        </div>

        <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div className="min-w-0 pt-1">
            <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
              Imperdibles
            </p>
            <h1 className="brand-font mt-1 max-w-full break-words text-[2.65rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] [overflow-wrap:anywhere] sm:text-[3.35rem] md:text-[4.35rem]">
              {formatBrandFontText(spot.title)}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              <HeroTag emphasis>{spot.type}</HeroTag>
              {locationLabel ? <HeroTag>{locationLabel}</HeroTag> : null}
              {spot.priority && spot.priority !== "media" ? (
                <HeroTag>Prioridad {spot.priority}</HeroTag>
              ) : null}
            </div>

            {spot.subtitle ? (
              <p className="mt-5 text-lg font-black leading-tight text-white">
                {spot.subtitle}
              </p>
            ) : null}

            {spot.description ? (
              <p className="mt-4 max-w-xl text-justify text-base font-medium leading-7 text-white/85">
                {spot.description}
              </p>
            ) : null}

            <HighlightedData
              label="Para tener en cuenta"
              value={spot.datoDestacado}
              variant="onDark"
              className="mt-5 max-w-xl"
            />
          </div>

          <div className="order-first min-w-0 lg:order-none">
            <DetailMediaGallery
              title={spot.title}
              fallbackLabel="Imperdible"
              coverUrl={spot.imageUrl}
              galleryUrls={spot.galleryUrls}
              coverFocus={spot.imageFocus}
              galleryImages={spot.galleryImages}
              coverClassName={
                spot.imageUrl
                  ? "aspect-[1.12] rounded-[1.85rem] border-[#efd4b0]/25"
                  : "h-48 rounded-[1.85rem] border-[#efd4b0]/25 sm:h-auto sm:aspect-[1.12]"
              }
              coverSizes="(max-width: 1024px) 100vw, 56vw"
              thumbnailClassName="aspect-[4/3] w-[180px] rounded-[1.1rem] border-[#efd4b0]/25"
            />
          </div>
        </section>

        {hasPracticalInfo ? (
          <section className="mb-4 rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55] shadow-sm sm:p-7">
            <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
              Información práctica
            </p>
            <h2 className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
              Datos del imperdible
            </h2>

            <div className="mt-5">
              {isEvent && spot.eventDate ? (
                <div className="flex flex-col gap-4 border-b border-[#123a55]/15 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/65">
                      Fecha y hora
                    </p>
                    <p className="mt-2 text-sm font-black capitalize leading-6 text-[#082d49]">
                      {formatEventDateLocal(spot.eventDate)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#123a55]/65">
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
              ) : null}

              {relatedStation ? (
                <InfoRow label="Estación">
                  <Link
                    href={`/estaciones/${relatedStation.slug}`}
                    className="font-black text-[#082d49] underline decoration-[#123a55]/25 underline-offset-4 transition hover:text-[#123a55]/70"
                  >
                    {formatLocation(relatedStation.name)}
                  </Link>
                  {relatedStation.slogan ? (
                    <span className="ml-2 text-[#123a55]/70">
                      · {relatedStation.slogan}
                    </span>
                  ) : null}
                </InfoRow>
              ) : locationLabel ? (
                <InfoRow label="Ubicación">{locationLabel}</InfoRow>
              ) : null}

              {spot.horarios ? (
                <InfoRow label="Horarios">{spot.horarios}</InfoRow>
              ) : null}

              {spot.accesibilidad ? (
                <InfoRow label="Accesibilidad">{spot.accesibilidad}</InfoRow>
              ) : null}

              {spot.estacionalidad ? (
                <InfoRow label="Estacionalidad">{spot.estacionalidad}</InfoRow>
              ) : null}

              {spot.duracionSugerida ? (
                <InfoRow label="Duración sugerida">
                  {spot.duracionSugerida}
                </InfoRow>
              ) : null}

              {spot.recomendaciones && spot.recomendaciones.length > 0 ? (
                <div className="border-b border-[#123a55]/15 py-4">
                  <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/65">
                    Recomendaciones
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {spot.recomendaciones.map((recommendation) => (
                      <InfoTag key={recommendation}>{recommendation}</InfoTag>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasValidCoordinates(spot) ? (
                <div className="pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/65">
                      Ubicación en el mapa
                    </p>
                    <SatelliteMapButton
                      point={spot}
                      action="directions"
                      label="Ver indicaciones"
                    />
                  </div>
                  <div className="mt-3 overflow-hidden rounded-[1.35rem] border border-[#123a55]/20 bg-[#d8c6aa]">
                    <StationDetailMap
                      lat={spot.latitude}
                      lng={spot.longitude}
                      label={spot.title}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      <SiteEndSections />
    </main>
  );
}
