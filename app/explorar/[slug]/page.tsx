import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Experience } from "@/app/lib/content";
import {
  getExperienceContextBySlug,
  getExperiences,
  getStations,
} from "@/app/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { StationsTerritoryMap } from "@/components/stations-territory-map";
import { SurfaceCard } from "@/components/surface-card";

type ExperienceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const experiences = await getExperiences();
  return experiences.map((experience) => ({ slug: experience.slug }));
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <SurfaceCard className="p-4">
      <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
        {label}
      </p>
      <p className="display-font mt-2 text-3xl text-[color:var(--accent)]">
        {value}
      </p>
    </SurfaceCard>
  );
}

function IncludesList({ experience }: { experience: Experience }) {
  return (
    <div className="grid gap-3">
      {experience.includes.map((item) => (
        <div
          key={item}
          className="rounded-2xl bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--foreground)]"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export default async function ExperienceDetailPage({
  params,
}: ExperienceDetailPageProps) {
  const { slug } = await params;
  const [context, stations] = await Promise.all([
    getExperienceContextBySlug(slug),
    getStations(),
  ]);

  if (!context) {
    notFound();
  }

  const { experience, relatedHighlightSpots, relatedStation, responsibleArtisan } =
    context;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-6">
        <Link
          href="/explorar"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          Volver a explorar
        </Link>
      </div>

      <section className="rounded-3xl bg-[linear-gradient(160deg,#2c1810_0%,#1a0e08_100%)] p-6 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60">
              Recorrido
            </p>
            <h1 className="display-font mt-3 text-4xl leading-tight sm:text-5xl">
              {experience.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
              {experience.summary}
            </p>
          </div>

          {experience.imageUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={experience.imageUrl}
                alt={experience.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
              <p className="text-sm leading-7 text-white/70">
                Esta experiencia todavia no tiene imagen propia, pero ya esta
                conectada con su contexto territorial y responsable.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-3">
        <DetailMetric label="Duracion" value={experience.duration} />
        <DetailMetric label="Lugar" value={experience.location} />
        <DetailMetric label="Ritmo" value={experience.intensity} />
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeading
            eyebrow="Descripcion"
            title="Una experiencia pensada para recorrer con contexto"
            description={experience.description}
          />
          <SurfaceCard className="mt-6 soft-shadow">
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              {experience.summary}
            </p>
          </SurfaceCard>
        </div>

        <div>
          <SectionHeading
            eyebrow="Contexto"
            title="Estacion y responsable"
            description="Relaciones reales derivadas de la propia experiencia en PocketBase."
          />
          <div className="mt-6 grid gap-3">
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Estacion
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {relatedStation?.name ?? experience.stationName ?? "Sin estacion"}
              </p>
              {relatedStation ? (
                <Link
                  href={`/estaciones/${relatedStation.slug}`}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Ver estacion
                </Link>
              ) : null}
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Responsable
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {responsibleArtisan?.name ??
                  experience.responsibleName ??
                  "Sin responsable visible"}
              </p>
              {responsibleArtisan ? (
                <Link
                  href={`/artesanas/${responsibleArtisan.slug}`}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Ver perfil
                </Link>
              ) : null}
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Incluye
              </p>
              <div className="mt-4">
                <IncludesList experience={experience} />
              </div>
            </SurfaceCard>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Mapa"
          title="Ubicacion dentro de la ruta"
          description="La experiencia se contextualiza dentro de la red territorial de estaciones."
        />
        <div className="mt-6">
          <StationsTerritoryMap
            stations={stations}
            activeSlug={relatedStation?.slug ?? experience.stationSlug}
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Paradas"
          title="Hitos del recorrido"
          description="Un esquema simple para mostrar recorrido, mapa y puntos de interes."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {experience.stops.map((stop, index) => (
            <SurfaceCard key={stop} className="soft-shadow">
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Parada 0{index + 1}
              </p>
              <h2 className="display-font mt-2 text-3xl text-[color:var(--foreground)]">
                {stop}
              </h2>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Imperdibles"
          title="Lugares o actividades para sumar al recorrido"
          description="Relacionamos la experiencia con imperdibles del mismo territorio."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relatedHighlightSpots.length > 0 ? (
            relatedHighlightSpots.slice(0, 3).map((spot) => (
              <SurfaceCard key={spot.slug} className="soft-shadow">
                <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
                  {spot.location}
                </p>
                <h2 className="display-font mt-2 text-3xl text-[color:var(--foreground)]">
                  {spot.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {spot.subtitle}
                </p>
                <Link
                  href={`/imperdibles/${spot.slug}`}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Ver imperdible
                </Link>
              </SurfaceCard>
            ))
          ) : (
            <SurfaceCard className="md:col-span-2 xl:col-span-3">
              <p className="text-sm text-[color:var(--text-muted)]">
                Todavia no encontramos imperdibles relacionados con esta
                experiencia.
              </p>
            </SurfaceCard>
          )}
        </div>
      </section>
    </main>
  );
}
