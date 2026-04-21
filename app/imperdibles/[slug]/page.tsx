import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getHighlightSpotContextBySlug,
  getHighlightSpots,
  getStations,
} from "@/app/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { StationsTerritoryMap } from "@/components/stations-territory-map";
import { SurfaceCard } from "@/components/surface-card";

type HighlightSpotDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const spots = await getHighlightSpots();
  return spots.map((spot) => ({ slug: spot.slug }));
}

export default async function HighlightSpotDetailPage({
  params,
}: HighlightSpotDetailPageProps) {
  const { slug } = await params;
  const [context, stations] = await Promise.all([
    getHighlightSpotContextBySlug(slug),
    getStations(),
  ]);

  if (!context) {
    notFound();
  }

  const { spot, relatedArtisans, relatedExperiences, relatedStation } = context;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-6">
        <Link
          href="/imperdibles"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          Volver a imperdibles
        </Link>
      </div>

      <section className="rounded-[2rem] bg-[linear-gradient(180deg,#a35331_0%,#7b371d_100%)] p-6 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em]">
                {spot.type}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em]">
                Prioridad {spot.priority}
              </span>
            </div>
            <h1 className="display-font mt-4 text-4xl leading-tight sm:text-5xl">
              {spot.title}
            </h1>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
              {spot.location}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80">
              {spot.description}
            </p>
          </div>

          {spot.imageUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white/10">
              <Image
                src={spot.imageUrl}
                alt={spot.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6">
              <p className="text-sm leading-7 text-white/70">
                Este imperdible no tiene imagen cargada, pero puede heredar una
                visual del territorio cuando exista en su estacion.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeading
            eyebrow="Lectura"
            title={spot.subtitle}
            description="Una ficha para destacar atractivos, actividades y eventos dentro del recorrido territorial."
          />
          <SurfaceCard className="mt-6 soft-shadow">
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              {spot.description}
            </p>
          </SurfaceCard>
        </div>

        <div>
          <SectionHeading
            eyebrow="Contexto"
            title="Relacion territorial"
            description="Cruzamos este imperdible con estacion, experiencias y actores cercanos."
          />
          <div className="mt-6 grid gap-3">
            <SurfaceCard>
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Estacion relacionada
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {relatedStation?.name ?? "Sin estacion asociada"}
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
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Actores cercanos
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {relatedArtisans.length}
              </p>
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Experiencias cercanas
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {relatedExperiences.length}
              </p>
            </SurfaceCard>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Mapa"
          title="Contexto territorial del imperdible"
          description="Ubicamos este punto dentro de la red de estaciones para reforzar la lectura del recorrido."
        />
        <div className="mt-6">
          <StationsTerritoryMap
            stations={stations}
            activeSlug={relatedStation?.slug ?? spot.stationSlug}
          />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="Experiencias"
            title="Sugeridas cerca de este imperdible"
            description="Una navegacion cruzada para ampliar el recorrido."
          />
          <div className="mt-6 grid gap-4">
            {relatedExperiences.length > 0 ? (
              relatedExperiences.slice(0, 3).map((item) => (
                <SurfaceCard key={item.slug}>
                  <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
                    {item.location}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    {item.description}
                  </p>
                  <Link
                    href={`/explorar/${item.slug}`}
                    className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                  >
                    Ver experiencia
                  </Link>
                </SurfaceCard>
              ))
            ) : (
              <SurfaceCard>
                <p className="text-sm text-[color:var(--text-muted)]">
                  Todavia no encontramos experiencias directamente relacionadas.
                </p>
              </SurfaceCard>
            )}
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Actores"
            title="Perfiles del entorno"
            description="Actores artesanales cercanos para profundizar la visita."
          />
          <div className="mt-6 grid gap-4">
            {relatedArtisans.length > 0 ? (
              relatedArtisans.slice(0, 3).map((item) => (
                <SurfaceCard key={item.slug}>
                  <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    {item.place}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    {item.craft}
                  </p>
                  <Link
                    href={`/artesanas/${item.slug}`}
                    className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                  >
                    Ver perfil
                  </Link>
                </SurfaceCard>
              ))
            ) : (
              <SurfaceCard>
                <p className="text-sm text-[color:var(--text-muted)]">
                  Todavia no encontramos actores relacionados.
                </p>
              </SurfaceCard>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
