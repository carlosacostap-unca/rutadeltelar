import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Artisan } from "@/app/lib/content";
import { getArtisanContextBySlug, getArtisans } from "@/app/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { SurfaceCard } from "@/components/surface-card";

type ArtisanDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const artisans = await getArtisans();
  return artisans.map((artisan) => ({ slug: artisan.slug }));
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <SurfaceCard className="p-4">
      <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
        {value}
      </p>
    </SurfaceCard>
  );
}

function TechniqueList({ artisan }: { artisan: Artisan }) {
  return (
    <div className="flex flex-wrap gap-3">
      {artisan.techniques.map((technique) => (
        <span
          key={technique}
          className="rounded-full bg-[color:var(--surface-strong)] px-4 py-2 text-sm text-[color:var(--accent-strong)]"
        >
          {technique}
        </span>
      ))}
    </div>
  );
}

export default async function ArtisanDetailPage({
  params,
}: ArtisanDetailPageProps) {
  const { slug } = await params;
  const context = await getArtisanContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { artisan, relatedExperiences, relatedHighlightSpots, relatedStation } =
    context;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-6">
        <Link
          href="/artesanas"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          Volver a artesanas
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <SurfaceCard className="soft-shadow overflow-hidden bg-[linear-gradient(160deg,#a85d41_0%,#8a452b_100%)] text-white">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/65">
                Perfil
              </p>
              <h1 className="display-font mt-3 text-4xl leading-tight sm:text-5xl">
                {artisan.name}
              </h1>
              <p className="mt-3 text-sm uppercase tracking-wider text-white/65">
                {artisan.place}
              </p>
              <p className="mt-5 text-sm leading-7 text-white/80">{artisan.bio}</p>
            </div>

            {artisan.imageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={artisan.imageUrl}
                  alt={artisan.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 32vw"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
                <p className="text-sm leading-7 text-white/70">
                  Este perfil todavia no tiene imagen destacada, pero ya esta
                  conectado con su territorio y experiencias cercanas.
                </p>
              </div>
            )}
          </div>
        </SurfaceCard>

        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileMetric label="Oficio" value={artisan.craft} />
          <ProfileMetric label="Trayectoria" value={artisan.years} />
          <ProfileMetric label="Pieza destacada" value={artisan.featuredPiece} />
          <ProfileMetric label="Territorio" value={artisan.place} />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeading
            eyebrow="Historia"
            title="Un perfil para poner en primer plano a la artesana"
            description="Esta estructura sirve para incorporar despues galeria, contacto, mapa y agenda relacionada."
          />
          <SurfaceCard className="mt-6 soft-shadow">
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              {artisan.bio}
            </p>
          </SurfaceCard>
        </div>

        <div>
          <SectionHeading
            eyebrow="Contexto"
            title="Territorio y contacto"
            description="Vinculos reales del actor con su estacion y datos utiles para orientar la visita."
          />
          <div className="mt-6 grid gap-3">
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Estacion
              </p>
              <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                {relatedStation?.name ?? artisan.stationName ?? "Sin estacion asociada"}
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
                Contacto
              </p>
              <p className="mt-2 text-sm text-[color:var(--foreground)]">
                {artisan.contactPhone || "No disponible"}
              </p>
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Ubicacion
              </p>
              <p className="mt-2 text-sm text-[color:var(--foreground)]">
                {artisan.address || artisan.place}
              </p>
            </SurfaceCard>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Tecnicas"
          title="Saberes y materiales"
          description="Chips reutilizables para mostrar tecnica, tipo de fibra y estilo de pieza."
        />
        <div className="mt-6">
          <TechniqueList artisan={artisan} />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="Experiencias"
            title="Recorridos vinculados"
            description="Cruce entre el actor y experiencias del mismo territorio o donde figura como responsable."
          />
          <div className="mt-6 grid gap-4">
            {relatedExperiences.length > 0 ? (
              relatedExperiences.slice(0, 3).map((item) => (
                <SurfaceCard key={item.slug}>
                  <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
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
                  Todavia no encontramos experiencias relacionadas con este
                  actor.
                </p>
              </SurfaceCard>
            )}
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Imperdibles"
            title="Puntos destacados cercanos"
            description="Imperdibles del mismo territorio para completar la visita."
          />
          <div className="mt-6 grid gap-4">
            {relatedHighlightSpots.length > 0 ? (
              relatedHighlightSpots.slice(0, 3).map((spot) => (
                <SurfaceCard key={spot.slug}>
                  <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
                    {spot.location}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                    {spot.title}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
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
              <SurfaceCard>
                <p className="text-sm text-[color:var(--text-muted)]">
                  Todavia no encontramos imperdibles relacionados con este
                  actor.
                </p>
              </SurfaceCard>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
