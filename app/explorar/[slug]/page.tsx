import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getExperienceContextBySlug,
  getExperiences,
} from "@/app/lib/data";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { createPageMetadata } from "@/app/lib/metadata";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { HighlightedData } from "@/components/highlighted-data";
import { HomeCarousel } from "@/components/home-carousel";
import { ShareButton } from "@/components/share-button";
import { SurfaceCard } from "@/components/surface-card";

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
  const detailTags = [
    experience.tag,
    experience.duration,
    experience.intensity && experience.intensity !== "A definir"
      ? experience.intensity
      : "",
  ].filter(Boolean);

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/explorar"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          &larr; Experiencias
        </Link>
        <div className="flex items-center gap-2">
          <FavoriteButton
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
          <ShareButton title={experience.title} text={experience.summary} />
        </div>
      </div>

      <section className="mb-10">
        <DetailMediaGallery
          title={experience.title}
          fallbackLabel="Experiencia"
          coverUrl={experience.imageUrl}
          galleryUrls={experience.galleryUrls}
          coverFocus={experience.imageFocus}
          galleryImages={experience.galleryImages}
        />
      </section>

      <section className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
          {experience.location}
        </p>
        <h1 className="display-font mt-2 text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
          {experience.title}
        </h1>
        {detailTags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {detailTags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className={
                  index === 0
                    ? "rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white"
                    : "rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]"
                }
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">
          {experience.description}
        </p>
        <HighlightedData
          value={experience.datoDestacado}
          className="mt-5 max-w-2xl"
        />
      </section>

      {experience.includes.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
            Recomendaciones / que incluye
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {experience.includes.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
              >
                <span className="mt-0.5 text-[color:var(--accent)]">+</span>
                <p className="text-sm text-[color:var(--foreground)]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        {responsibleArtisan || experience.responsibleName ? (
          <SurfaceCard>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Responsable
            </p>
            <div className="flex items-center gap-3">
              {responsibleArtisan?.imageUrl ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[color:var(--border)]">
                  <Image
                    src={withPocketBaseImageThumb(
                      responsibleArtisan.imageUrl,
                      "thumbnail",
                    )}
                    alt={responsibleArtisan.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    style={getImageFocusStyle(responsibleArtisan.imageFocus)}
                  />
                </div>
              ) : (
                <div className="display-font flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-xl text-[color:var(--accent-strong)]">
                  {
                    (responsibleArtisan?.name ??
                      experience.responsibleName ??
                      "?")[0]
                  }
                </div>
              )}
              <div>
                <p className="font-semibold text-[color:var(--foreground)]">
                  {responsibleArtisan?.name ?? experience.responsibleName}
                </p>
                {responsibleArtisan?.craft ? (
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {responsibleArtisan.craft}
                  </p>
                ) : null}
                <HighlightedData
                  value={responsibleArtisan?.datoDestacado}
                  compact
                  className="mt-3"
                />
              </div>
            </div>
            {responsibleArtisan ? (
              <Link
                href={`/artesanas/${responsibleArtisan.slug}`}
                className="mt-4 inline-flex text-xs font-semibold text-[color:var(--accent)] hover:underline"
              >
                Ver perfil &rarr;
              </Link>
            ) : null}
          </SurfaceCard>
        ) : null}

        {relatedStation || experience.stationName ? (
          <SurfaceCard>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Estacion
            </p>
            <p className="font-semibold text-[color:var(--foreground)]">
              {relatedStation?.name ?? experience.stationName}
            </p>
            {relatedStation?.slogan ? (
              <p className="mt-1 text-xs italic text-[color:var(--text-muted)]">
                {relatedStation.slogan}
              </p>
            ) : null}
            {relatedStation ? (
              <Link
                href={`/estaciones/${relatedStation.slug}`}
                className="mt-4 inline-flex text-xs font-semibold text-[color:var(--accent)] hover:underline"
              >
                Ver estacion &rarr;
              </Link>
            ) : null}
          </SurfaceCard>
        ) : null}
      </section>

      {relatedHighlightSpots.length > 0 ? (
        <HomeCarousel
          eyebrow="Destacados"
          title="Imperdibles para sumar"
          href="/imperdibles"
        >
          {relatedHighlightSpots.map((spot) => (
            <Link
              key={spot.slug}
              href={`/imperdibles/${spot.slug}`}
              className="group w-[240px] shrink-0 [scroll-snap-align:start]"
            >
              <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                {spot.imageUrl ? (
                  <div className="relative mb-3 aspect-[3/2] overflow-hidden rounded-xl">
                    <Image
                      src={withPocketBaseImageThumb(
                        spot.imageUrl,
                        "thumbnail",
                      )}
                      alt={spot.title}
                      fill
                      className="object-cover transition group-hover:scale-[1.03]"
                      sizes="240px"
                      style={getImageFocusStyle(spot.imageFocus)}
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex aspect-[3/2] items-center justify-center rounded-xl bg-[color:var(--surface)] text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                    Destacado
                  </div>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                  {spot.type}
                </p>
                <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)]">
                  {spot.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--text-muted)]">
                  {spot.subtitle}
                </p>
                <HighlightedData
                  value={spot.datoDestacado}
                  compact
                  className="mt-3"
                />
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      ) : null}
    </main>
  );
}
