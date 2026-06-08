import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import {
  getExperienceContextBySlug,
  getExperiences,
} from "@/app/lib/data";
import { getImageFocusStyle, type FocusedImage } from "@/app/lib/image-focus";
import { createPageMetadata } from "@/app/lib/metadata";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { HighlightedData } from "@/components/highlighted-data";
import { HomeCarousel } from "@/components/home-carousel";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";
import { ShareButton } from "@/components/share-button";

type ExperienceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const experiences = await getExperiences();
  return experiences.map((experience) => ({ slug: experience.slug }));
}

export async function generateMetadata({
  params,
}: ExperienceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = await getExperienceContextBySlug(slug);

  if (!context) {
    return createPageMetadata({
      title: "Experiencia no encontrada",
      path: `/explorar/${slug}`,
    });
  }

  const { experience } = context;

  return createPageMetadata({
    title: experience.title,
    description: experience.summary || experience.description,
    path: `/explorar/${experience.slug}`,
    imageUrl: experience.imageUrl,
  });
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#123a55]/20 bg-[#123a55]/5 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
      {children}
    </span>
  );
}

function FichaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#123a55]/15 py-3 last:border-0">
      <p className="text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
        {label}
      </p>
      <p className="text-sm font-medium leading-6 text-[#123a55]">{value}</p>
    </div>
  );
}

function FichaPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55] shadow-sm sm:p-7">
      <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
        Ficha
      </p>
      <h2 className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
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
            <PbImage
              src={withPocketBaseImageThumb(imageUrl, "thumbnail")}
              alt={imageAlt}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="230px"
              style={getImageFocusStyle(imageFocus)}
              fallback={<MediaFallback label={fallbackLabel} />}
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

export default async function ExperienceDetailPage({
  params,
}: ExperienceDetailPageProps) {
  const { slug } = await params;
  const context = await getExperienceContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const {
    experience,
    relatedHighlightSpots,
    relatedStation,
    responsibleArtisan,
  } = context;
  const galleryImages: FocusedImage[] =
    experience.galleryImages ?? experience.galleryUrls?.map((url) => ({ url })) ?? [];
  const detailTags = [
    experience.tag,
    experience.duration,
    experience.intensity && experience.intensity !== "A definir"
      ? experience.intensity
      : "",
  ].filter(Boolean);
  const stationName = relatedStation?.name ?? experience.stationName;
  const responsibleName = responsibleArtisan?.name ?? experience.responsibleName;

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-16 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <DetailActionLink href="/explorar">Volver a experiencias</DetailActionLink>
          <div className="flex flex-wrap items-center gap-2">
            <FavoriteButton
              variant="onDark"
              item={{
                type: "experiencia",
                slug: experience.slug,
                title: experience.title,
                subtitle: experience.location,
                href: `/explorar/${experience.slug}`,
                imageUrl: experience.imageUrl,
                imageFocus: experience.imageFocus,
                datoDestacado: experience.datoDestacado,
              }}
            />
            <ShareButton
              title={experience.title}
              text={experience.summary}
              variant="onDark"
            />
          </div>
        </div>

        <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div className="min-w-0 pt-1">
            <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
              Experiencias
            </p>
            <h1 className="brand-font mt-1 max-w-full break-words text-[2.65rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] [overflow-wrap:anywhere] sm:text-[3.35rem] md:text-[4.35rem]">
              {formatBrandFontText(experience.title)}
            </h1>
            {detailTags.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {detailTags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className={
                      index === 0
                        ? "rounded-full bg-[#efd4b0] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]"
                        : "rounded-full border border-[#efd4b0]/35 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]"
                    }
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {experience.location ? (
              <p className="mt-5 text-lg font-black leading-tight text-white">
                {experience.location}
              </p>
            ) : null}
            {experience.description ? (
              <p className="mt-4 w-full text-justify text-base font-medium leading-7 text-white/85">
                {experience.description}
              </p>
            ) : null}
            {experience.summary && experience.summary !== experience.description ? (
              <p className="mt-4 w-full text-justify text-sm font-medium leading-6 text-white/70">
                {experience.summary}
              </p>
            ) : null}
            <HighlightedData
              value={experience.datoDestacado}
              variant="onDark"
              className="mt-5 max-w-xl"
            />
          </div>

          <div className="order-first lg:order-none">
            <DetailMediaGallery
              title={experience.title}
              fallbackLabel="Experiencia"
              coverUrl={experience.imageUrl}
              galleryUrls={experience.galleryUrls}
              coverFocus={experience.imageFocus}
              galleryImages={galleryImages}
              coverClassName="aspect-[1.12] rounded-[1.85rem] border-[#efd4b0]/25"
              coverSizes="(max-width: 1024px) 100vw, 56vw"
              thumbnailClassName="aspect-[4/3] w-[180px] rounded-[1.1rem] border-[#efd4b0]/25"
            />
          </div>
        </section>

        <FichaPanel title="Datos de la experiencia">
          {experience.duration ? <FichaRow label="Duracion" value={experience.duration} /> : null}
          {experience.intensity && experience.intensity !== "A definir" ? (
            <FichaRow label="Intensidad" value={experience.intensity} />
          ) : null}
          {stationName ? <FichaRow label="Estacion" value={stationName} /> : null}
          {responsibleName ? <FichaRow label="Responsable" value={responsibleName} /> : null}
          {experience.includes.length > 0 ? (
            <div className="border-b border-[#123a55]/15 py-3">
              <p className="mb-2 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
                Recomendaciones / que incluye
              </p>
              <div className="flex flex-wrap gap-2">
                {experience.includes.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </div>
          ) : null}
          {experience.stops.length > 0 ? (
            <div className="py-3">
              <p className="mb-2 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
                Paradas
              </p>
              <div className="flex flex-wrap gap-2">
                {experience.stops.map((stop) => (
                  <Tag key={stop}>{stop}</Tag>
                ))}
              </div>
            </div>
          ) : null}
        </FichaPanel>

        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {responsibleArtisan || experience.responsibleName ? (
            <section className="rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55] shadow-sm sm:p-7">
              <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
                Responsable
              </p>
              <div className="mt-4 flex items-center gap-4">
                {responsibleArtisan?.imageUrl ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#123a55]/20">
                    <PbImage
                      src={withPocketBaseImageThumb(responsibleArtisan.imageUrl, "thumbnail")}
                      alt={responsibleArtisan.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      style={getImageFocusStyle(responsibleArtisan.imageFocus)}
                      fallback={<MediaFallback label="Actor" />}
                    />
                  </div>
                ) : (
                  <div className="brand-font flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#123a55]/10 text-2xl text-[#123a55]">
                    {(responsibleName ?? "?")[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-xl font-black leading-tight text-[#082d49]">
                    {responsibleName}
                  </h2>
                  {responsibleArtisan?.craft ? (
                    <p className="mt-1 text-sm font-medium leading-5 text-[#123a55]/75">
                      {responsibleArtisan.craft}
                    </p>
                  ) : null}
                </div>
              </div>
              <HighlightedData
                value={responsibleArtisan?.datoDestacado}
                compact
                className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
              />
              {responsibleArtisan ? (
                <Link
                  href={`/artesanas/${responsibleArtisan.slug}`}
                  className="mt-5 inline-flex rounded-full border border-[#123a55]/20 px-4 py-2 text-xs font-black uppercase leading-none tracking-normal text-[#123a55] transition hover:bg-[#123a55] hover:text-[#efd4b0]"
                >
                  Ver perfil
                </Link>
              ) : null}
            </section>
          ) : null}

          {relatedStation || experience.stationName ? (
            <section className="rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55] shadow-sm sm:p-7">
              <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
                Estacion
              </p>
              <h2 className="mt-4 text-xl font-black leading-tight text-[#082d49]">
                {stationName}
              </h2>
              {relatedStation?.slogan ? (
                <p className="mt-2 text-sm font-medium leading-6 text-[#123a55]/75">
                  {relatedStation.slogan}
                </p>
              ) : null}
              {relatedStation ? (
                <Link
                  href={`/estaciones/${relatedStation.slug}`}
                  className="mt-5 inline-flex rounded-full border border-[#123a55]/20 px-4 py-2 text-xs font-black uppercase leading-none tracking-normal text-[#123a55] transition hover:bg-[#123a55] hover:text-[#efd4b0]"
                >
                  Ver estacion
                </Link>
              ) : null}
            </section>
          ) : null}
        </div>

        {relatedHighlightSpots.length > 0 ? (
          <HomeCarousel
            eyebrow="Destacados"
            title="Imperdibles para sumar"
            href="/imperdibles"
            variant="onDark"
          >
            {relatedHighlightSpots.map((spot) => (
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
