import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStations,
  getSuggestedJourneyBySlug,
  getSuggestedJourneys,
} from "@/app/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { StationsTerritoryMap } from "@/components/stations-territory-map";
import { SurfaceCard } from "@/components/surface-card";

type SuggestedJourneyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const journeys = await getSuggestedJourneys();
  return journeys.map((journey) => ({ slug: journey.slug }));
}

export default async function SuggestedJourneyPage({
  params,
}: SuggestedJourneyPageProps) {
  const { slug } = await params;
  const [journey, stations] = await Promise.all([
    getSuggestedJourneyBySlug(slug),
    getStations(),
  ]);

  if (!journey) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-6">
        <Link
          href="/recorridos"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          Volver a recorridos
        </Link>
      </div>

      <section className="rounded-[2rem] bg-[linear-gradient(180deg,#4b2b1c_0%,#2f241c_100%)] p-6 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">
              Recorrido sugerido
            </p>
            <h1 className="display-font mt-3 text-4xl leading-tight sm:text-5xl">
              {journey.title}
            </h1>
            <p className="mt-3 text-sm uppercase tracking-[0.24em] text-white/60">
              {journey.station.locality} · {journey.duration}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80">
              {journey.description}
            </p>
          </div>

          {journey.station.imageUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10">
              <Image
                src={journey.station.imageUrl}
                alt={journey.station.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6">
              <p className="text-sm leading-7 text-white/70">
                Este recorrido se construye desde la estacion, sus experiencias
                y los puntos destacados del territorio.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-4">
        <SurfaceCard className="p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            Estacion
          </p>
          <p className="display-font mt-2 text-3xl text-[color:var(--accent)]">
            {journey.station.locality}
          </p>
        </SurfaceCard>
        <SurfaceCard className="p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            Experiencias
          </p>
          <p className="display-font mt-2 text-3xl text-[color:var(--accent)]">
            {journey.experiences.length}
          </p>
        </SurfaceCard>
        <SurfaceCard className="p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            Actores
          </p>
          <p className="display-font mt-2 text-3xl text-[color:var(--accent)]">
            {journey.artisans.length}
          </p>
        </SurfaceCard>
        <SurfaceCard className="p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            Imperdibles
          </p>
          <p className="display-font mt-2 text-3xl text-[color:var(--accent)]">
            {journey.highlightSpots.length}
          </p>
        </SurfaceCard>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Mapa"
          title="El recorrido dentro de la red territorial"
          description="La estacion del itinerario queda destacada dentro del mapa general de la ruta."
        />
        <div className="mt-6">
          <StationsTerritoryMap
            stations={stations}
            artisans={journey.artisans}
            highlightSpots={journey.highlightSpots}
            activeSlug={journey.station.slug}
            selectedSlug={journey.station.slug}
          />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Secuencia"
          title="Momentos del recorrido"
          description="Una narrativa simple para convertir datos territoriales en un itinerario legible."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journey.steps.map((step, index) => (
            <SurfaceCard key={`${step.title}-${index}`} className="soft-shadow">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
                Momento 0{index + 1}
              </p>
              <h2 className="display-font mt-3 text-3xl text-[color:var(--foreground)]">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                {step.description}
              </p>
              {step.href ? (
                <Link
                  href={step.href}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Abrir punto
                </Link>
              ) : null}
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="Experiencia"
            title={journey.leadExperience?.title ?? "Experiencia sugerida"}
            description="Punto principal del itinerario."
          />
          <SurfaceCard className="mt-6">
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">
              {journey.leadExperience?.description ?? "Sin experiencia principal"}
            </p>
            {journey.leadExperience ? (
              <Link
                href={`/explorar/${journey.leadExperience.slug}`}
                className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Ver experiencia
              </Link>
            ) : null}
          </SurfaceCard>
        </div>

        <div>
          <SectionHeading
            eyebrow="Actor"
            title={journey.leadArtisan?.name ?? "Actor sugerido"}
            description="Anfitrion o perfil destacado del recorrido."
          />
          <SurfaceCard className="mt-6">
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">
              {journey.leadArtisan?.craft ?? "Sin actor principal"}
            </p>
            {journey.leadArtisan ? (
              <Link
                href={`/artesanas/${journey.leadArtisan.slug}`}
                className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Ver actor
              </Link>
            ) : null}
          </SurfaceCard>
        </div>

        <div>
          <SectionHeading
            eyebrow="Imperdible"
            title={journey.leadHighlightSpot?.title ?? "Punto sugerido"}
            description="Cierre o complemento recomendado del trayecto."
          />
          <SurfaceCard className="mt-6">
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">
              {journey.leadHighlightSpot?.subtitle ?? "Sin imperdible principal"}
            </p>
            {journey.leadHighlightSpot ? (
              <Link
                href={`/imperdibles/${journey.leadHighlightSpot.slug}`}
                className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
              >
                Ver imperdible
              </Link>
            ) : null}
          </SurfaceCard>
        </div>
      </section>
    </main>
  );
}
