import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStationContextBySlug, getStations } from "@/app/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { StationsTerritoryMap } from "@/components/stations-territory-map";
import { SurfaceCard } from "@/components/surface-card";

type StationDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const stations = await getStations();
  return stations.map((station) => ({ slug: station.slug }));
}

function MetricCard({ label, value }: { label: string; value: string }) {
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

export default async function StationDetailPage({
  params,
}: StationDetailPageProps) {
  const { slug } = await params;
  const [context, stations] = await Promise.all([
    getStationContextBySlug(slug),
    getStations(),
  ]);

  if (!context) {
    notFound();
  }

  const { station, experiences, artisans, highlightSpots } = context;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-6">
        <Link
          href="/estaciones"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          Volver a estaciones
        </Link>
      </div>

      <section className="rounded-3xl bg-[linear-gradient(160deg,#2c1810_0%,#1a0e08_100%)] p-6 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/60">
              Estacion
            </p>
            <h1 className="display-font mt-3 text-4xl leading-tight sm:text-5xl">
              {station.name}
            </h1>
            <p className="mt-3 text-sm uppercase tracking-wider text-white/60">
              {station.locality}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80">
              {station.summary}
            </p>
          </div>

          {station.imageUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={station.imageUrl}
                alt={station.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
              <p className="text-sm leading-7 text-white/70">
                Esta estacion todavia no tiene imagen destacada, pero ya esta
                conectada con su contenido territorial.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-3 md:grid-cols-4">
        <MetricCard label="Localidad" value={station.locality} />
        <MetricCard label="Experiencias" value={String(experiences.length)} />
        <MetricCard label="Actores" value={String(artisans.length)} />
        <MetricCard label="Imperdibles" value={String(highlightSpots.length)} />
      </section>

      <section className="mt-12">
        <StationsTerritoryMap stations={stations} activeSlug={station.slug} />
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="Identidad"
            title={station.slogan}
            description="Una vista territorial que agrupa contenido y relaciones alrededor de la estacion."
          />
          <SurfaceCard className="mt-6 soft-shadow">
            <p className="text-sm leading-7 text-[color:var(--text-muted)]">
              {station.summary}
            </p>
          </SurfaceCard>
        </div>

        <div>
          <SectionHeading
            eyebrow="Territorio"
            title="Senales del lugar"
            description="Indicadores rapidos para ubicar la estacion dentro del recorrido."
          />
          <div className="mt-6 grid gap-3">
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Eslogan
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {station.slogan}
              </p>
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Coordenadas
              </p>
              <p className="mt-2 text-sm text-[color:var(--foreground)]">
                {station.latitude && station.longitude
                  ? `${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}`
                  : "No disponibles"}
              </p>
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Estado editorial
              </p>
              <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
                {station.status}
              </p>
            </SurfaceCard>
          </div>
        </div>
      </section>

      {station.galleryUrls && station.galleryUrls.length > 0 ? (
        <section className="mt-12">
          <SectionHeading
            eyebrow="Galeria"
            title="Imagenes del territorio"
            description="Archivos reales de PocketBase asociados a la estacion."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {station.galleryUrls.map((imageUrl, index) => (
              <div
                key={imageUrl}
                className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] soft-shadow"
              >
                <Image
                  src={imageUrl}
                  alt={`${station.name} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <SectionHeading
          eyebrow="Experiencias"
          title="Propuestas dentro de esta estacion"
          description="Relacion derivada por territorio para que el visitante entienda que puede hacer aqui."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {experiences.length > 0 ? (
            experiences.map((item) => (
              <SurfaceCard key={item.slug} className="soft-shadow">
                <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
                  {item.tag}
                </p>
                <h2 className="display-font mt-3 text-3xl text-[color:var(--foreground)]">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
                  {item.description}
                </p>
                <Link
                  href={`/explorar/${item.slug}`}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                >
                  Ver detalle
                </Link>
              </SurfaceCard>
            ))
          ) : (
            <SurfaceCard className="md:col-span-2 xl:col-span-3">
              <p className="text-sm text-[color:var(--text-muted)]">
                Todavia no encontramos experiencias relacionadas con esta
                estacion.
              </p>
            </SurfaceCard>
          )}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="Actores"
            title="Perfiles vinculados"
            description="Recorte artesanal derivado del territorio de esta estacion."
          />
          <div className="mt-6 grid gap-4">
            {artisans.length > 0 ? (
              artisans.slice(0, 3).map((item) => (
                <SurfaceCard key={item.slug}>
                  <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                    {item.place}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    {item.craft}
                  </p>
                </SurfaceCard>
              ))
            ) : (
              <SurfaceCard>
                <p className="text-sm text-[color:var(--text-muted)]">
                  No encontramos actores artesanales relacionados.
                </p>
              </SurfaceCard>
            )}
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Imperdibles"
            title="Lo que no conviene perderse"
            description="Puntos destacados conectados con esta estacion."
          />
          <div className="mt-6 grid gap-4">
            {highlightSpots.length > 0 ? (
              highlightSpots.slice(0, 3).map((item) => (
                <SurfaceCard key={item.slug}>
                  <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
                    {item.type}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                    {item.subtitle}
                  </p>
                  <Link
                    href={`/imperdibles/${item.slug}`}
                    className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]"
                  >
                    Ver detalle
                  </Link>
                </SurfaceCard>
              ))
            ) : (
              <SurfaceCard>
                <p className="text-sm text-[color:var(--text-muted)]">
                  No encontramos imperdibles relacionados.
                </p>
              </SurfaceCard>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
