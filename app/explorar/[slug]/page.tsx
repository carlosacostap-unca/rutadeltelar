import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getExperienceContextBySlug,
  getExperiences,
} from "@/app/lib/data";
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

export default async function ExperienceDetailPage({ params }: ExperienceDetailPageProps) {
  const { slug } = await params;
  const context = await getExperienceContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { experience, relatedHighlightSpots, relatedStation, responsibleArtisan } = context;

  return (
    <main className="flex flex-1 flex-col">
      {/* Back + Compartir */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/explorar"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          ← Experiencias
        </Link>
        <ShareButton title={experience.title} text={experience.summary} />
      </div>

      {/* Hero: foto + título */}
      <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        {experience.imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[color:var(--border)] soft-shadow">
            <Image
              src={experience.imageUrl}
              alt={experience.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] text-7xl">
            🧭
          </div>
        )}

        <div>
          {/* Categoría + duración */}
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
              {experience.tag}
            </span>
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]">
              {experience.duration}
            </span>
            {experience.intensity && experience.intensity !== "A definir" && (
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs text-[color:var(--text-muted)]">
                {experience.intensity}
              </span>
            )}
          </div>

          <h1 className="display-font text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
            {experience.title}
          </h1>

          {/* Descripción */}
          <p className="mt-5 text-sm leading-7 text-[color:var(--text-muted)]">
            {experience.description}
          </p>

          {/* Ubicación */}
          <p className="mt-4 flex items-center gap-1.5 text-sm text-[color:var(--text-muted)]">
            <svg className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent-mid)]" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
            </svg>
            {experience.location}
          </p>
        </div>
      </section>

      {/* Recomendaciones / includes */}
      {experience.includes.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
            Recomendaciones / qué incluye
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {experience.includes.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3"
              >
                <span className="mt-0.5 text-[color:var(--accent)]">✓</span>
                <p className="text-sm text-[color:var(--foreground)]">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Responsable + Estación */}
      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        {/* Responsable */}
        {(responsibleArtisan || experience.responsibleName) && (
          <SurfaceCard>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Responsable
            </p>
            <div className="flex items-center gap-3">
              {responsibleArtisan?.imageUrl ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[color:var(--border)]">
                  <Image src={responsibleArtisan.imageUrl} alt={responsibleArtisan.name} fill className="object-cover" sizes="48px" />
                </div>
              ) : (
                <div className="display-font flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-xl text-[color:var(--accent-strong)]">
                  {(responsibleArtisan?.name ?? experience.responsibleName ?? "?")[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-[color:var(--foreground)]">
                  {responsibleArtisan?.name ?? experience.responsibleName}
                </p>
                {responsibleArtisan?.craft && (
                  <p className="text-xs text-[color:var(--text-muted)]">{responsibleArtisan.craft}</p>
                )}
              </div>
            </div>
            {responsibleArtisan && (
              <Link
                href={`/artesanas/${responsibleArtisan.slug}`}
                className="mt-4 inline-flex text-xs font-semibold text-[color:var(--accent)] hover:underline"
              >
                Ver perfil →
              </Link>
            )}
          </SurfaceCard>
        )}

        {/* Estación */}
        {(relatedStation || experience.stationName) && (
          <SurfaceCard>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Estación
            </p>
            <p className="font-semibold text-[color:var(--foreground)]">
              {relatedStation?.name ?? experience.stationName}
            </p>
            {relatedStation?.slogan && (
              <p className="mt-1 text-xs italic text-[color:var(--text-muted)]">{relatedStation.slogan}</p>
            )}
            {relatedStation && (
              <Link
                href={`/estaciones/${relatedStation.slug}`}
                className="mt-4 inline-flex text-xs font-semibold text-[color:var(--accent)] hover:underline"
              >
                Ver estación →
              </Link>
            )}
          </SurfaceCard>
        )}
      </section>

      {/* Imperdibles relacionados */}
      {relatedHighlightSpots.length > 0 && (
        <HomeCarousel eyebrow="Destacados" title="Imperdibles para sumar" href="/imperdibles">
          {relatedHighlightSpots.map((spot) => (
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
    </main>
  );
}


