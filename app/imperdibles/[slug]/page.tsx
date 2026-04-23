import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getHighlightSpotContextBySlug,
  getHighlightSpots,
} from "@/app/lib/data";
import { HomeCarousel } from "@/components/home-carousel";
import { IcsDownloadButton } from "@/components/ics-download-button";
import { ShareButton } from "@/components/share-button";
import { SurfaceCard } from "@/components/surface-card";

type HighlightSpotDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const spots = await getHighlightSpots();
  return spots.map((spot) => ({ slug: spot.slug }));
}

function formatEventDateLocal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export default async function HighlightSpotDetailPage({ params }: HighlightSpotDetailPageProps) {
  const { slug } = await params;
  const context = await getHighlightSpotContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { spot, relatedArtisans, relatedExperiences, relatedStation, relatedProducts } = context;
  const isEvent = spot.type.toLowerCase() === "evento";
  const allGallery = [
    ...(spot.imageUrl ? [spot.imageUrl] : []),
    ...(spot.galleryUrls ?? []).filter((u) => u !== spot.imageUrl),
  ];

  return (
    <main className="flex flex-1 flex-col">
      {/* Back + Compartir */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/imperdibles"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          ← Imperdibles
        </Link>
        <ShareButton title={spot.title} text={spot.subtitle} />
      </div>

      {/* Galería */}
      <section className="mb-10">
        {allGallery.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {allGallery.map((url, i) => (
              <div
                key={url}
                className={`relative shrink-0 overflow-hidden rounded-3xl [scroll-snap-align:start] ${i === 0 ? "aspect-[16/9] w-full" : "aspect-[4/3] w-[260px]"}`}
              >
                <Image
                  src={url}
                  alt={`${spot.title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center rounded-3xl bg-[color:var(--surface)] text-5xl">
            ⭐
          </div>
        )}
      </section>

      {/* Título + subtítulo + tipo */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
            {spot.type}
          </span>
          {spot.priority && spot.priority !== "media" && (
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--text-muted)]">
              Prioridad {spot.priority}
            </span>
          )}
        </div>
        <h1 className="display-font text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
          {spot.title}
        </h1>
        {spot.subtitle && (
          <p className="mt-2 text-base font-medium italic text-[color:var(--accent)]">
            {spot.subtitle}
          </p>
        )}
        {spot.location && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-[color:var(--text-muted)]">
            <svg className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent-mid)]" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
            </svg>
            {spot.location}
          </p>
        )}
      </section>

      {/* Evento: fecha/hora prominente + botón ICS */}
      {isEvent && spot.eventDate && (
        <section className="mb-10">
          <SurfaceCard className="border-[color:var(--accent)] bg-[color:var(--accent)]/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                  Fecha y hora del evento
                </p>
                <p className="mt-1 text-lg font-semibold capitalize text-[color:var(--foreground)]">
                  {formatEventDateLocal(spot.eventDate)}
                </p>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                  (hora de Argentina)
                </p>
              </div>
              <IcsDownloadButton
                title={spot.title}
                description={spot.description}
                location={spot.location}
                startIso={spot.eventDate}
              />
            </div>
          </SurfaceCard>
        </section>
      )}

      {/* Descripción */}
      <section className="mb-10">
        <p className="text-sm leading-7 text-[color:var(--text-muted)]">{spot.description}</p>
      </section>

      {/* Datos prácticos */}
      {(spot.horarios || spot.accesibilidad || spot.estacionalidad || spot.duracionSugerida || (spot.recomendaciones && spot.recomendaciones.length > 0)) && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
            Datos prácticos
          </h2>
          <SurfaceCard className="soft-shadow">
            <div className="divide-y divide-[color:var(--border)]">
              {spot.horarios && (
                <div className="py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Horarios</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{spot.horarios}</p>
                </div>
              )}
              {spot.accesibilidad && (
                <div className="py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Accesibilidad</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{spot.accesibilidad}</p>
                </div>
              )}
              {spot.estacionalidad && (
                <div className="py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Estacionalidad</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{spot.estacionalidad}</p>
                </div>
              )}
              {spot.duracionSugerida && (
                <div className="py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Duración sugerida</p>
                  <p className="mt-1 text-sm text-[color:var(--foreground)]">{spot.duracionSugerida}</p>
                </div>
              )}
              {spot.recomendaciones && spot.recomendaciones.length > 0 && (
                <div className="py-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Recomendaciones</p>
                  <ul className="space-y-1">
                    {spot.recomendaciones.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-[color:var(--foreground)]">
                        <span className="mt-0.5 text-[color:var(--accent)]">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SurfaceCard>
        </section>
      )}

      {/* Estación relacionada */}
      {relatedStation && (
        <section className="mb-10">
          <SurfaceCard>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Estación</p>
            <p className="mt-1 font-semibold text-[color:var(--foreground)]">{relatedStation.name}</p>
            {relatedStation.slogan && (
              <p className="mt-0.5 text-xs italic text-[color:var(--text-muted)]">{relatedStation.slogan}</p>
            )}
            <Link
              href={`/estaciones/${relatedStation.slug}`}
              className="mt-3 inline-flex text-xs font-semibold text-[color:var(--accent)] hover:underline"
            >
              Ver estación →
            </Link>
          </SurfaceCard>
        </section>
      )}

      {/* Actores relacionados */}
      {relatedArtisans.length > 0 && (
        <HomeCarousel eyebrow="Comunidad" title="Actores relacionados" href="/artesanas" verTodosLabel="Ver todos">
          {relatedArtisans.map((actor) => (
            <Link
              key={actor.slug}
              href={`/artesanas/${actor.slug}`}
              className="group w-[200px] shrink-0 [scroll-snap-align:start]"
            >
              <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                {actor.imageUrl ? (
                  <div className="relative mb-3 h-14 w-14 overflow-hidden rounded-full border border-[color:var(--border)]">
                    <Image src={actor.imageUrl} alt={actor.name} fill className="object-cover" sizes="56px" />
                  </div>
                ) : (
                  <div className="display-font mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface)] text-xl text-[color:var(--accent-strong)]">
                    {actor.name[0]}
                  </div>
                )}
                {actor.actorType && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">{actor.actorType}</p>
                )}
                <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)]">{actor.name}</h3>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-2">{actor.craft}</p>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <HomeCarousel eyebrow="Artesanía" title="Productos relacionados" href="/productos" verTodosLabel="Ver todos">
          {relatedProducts.map((product) => (
            <Link
              key={product.slug}
              href={`/productos/${product.slug}`}
              className="group w-[200px] shrink-0 [scroll-snap-align:start]"
            >
              <SurfaceCard className="!p-0 h-full overflow-hidden transition group-hover:border-[color:var(--accent)]">
                {product.imageUrl ? (
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover transition group-hover:scale-[1.03]" sizes="200px" />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-[color:var(--surface)] text-3xl">🧵</div>
                )}
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">{product.subcategory ?? product.category}</p>
                  <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)] line-clamp-2">{product.name}</h3>
                </div>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}

      {/* Experiencias relacionadas */}
      {relatedExperiences.length > 0 && (
        <HomeCarousel eyebrow="Vivencias" title="Experiencias relacionadas" href="/explorar" verTodosLabel="Ver todas">
          {relatedExperiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/explorar/${exp.slug}`}
              className="group w-[260px] shrink-0 [scroll-snap-align:start]"
            >
              <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                {exp.imageUrl ? (
                  <div className="relative mb-3 aspect-[3/2] overflow-hidden rounded-xl">
                    <Image src={exp.imageUrl} alt={exp.title} fill className="object-cover transition group-hover:scale-[1.03]" sizes="260px" />
                  </div>
                ) : (
                  <div className="mb-3 flex aspect-[3/2] items-center justify-center rounded-xl bg-[color:var(--surface)] text-3xl">🧭</div>
                )}
                <div className="mb-2 flex gap-2">
                  <span className="rounded-full bg-[color:var(--surface)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--accent-mid)]">{exp.tag}</span>
                  <span className="rounded-full bg-[color:var(--surface)] px-2.5 py-0.5 text-[10px] text-[color:var(--text-muted)]">{exp.duration}</span>
                </div>
                <h3 className="text-sm font-semibold leading-snug text-[color:var(--foreground)]">{exp.title}</h3>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)] line-clamp-2">{exp.description}</p>
              </SurfaceCard>
            </Link>
          ))}
        </HomeCarousel>
      )}
    </main>
  );
}


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

      <section className="rounded-3xl bg-[linear-gradient(160deg,#a85d41_0%,#8a452b_100%)] p-6 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider">
                {spot.type}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider">
                Prioridad {spot.priority}
              </span>
            </div>
            <h1 className="display-font mt-4 text-4xl leading-tight sm:text-5xl">
              {spot.title}
            </h1>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-white/70">
              {spot.location}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/80">
              {spot.description}
            </p>
          </div>

          {spot.imageUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={spot.imageUrl}
                alt={spot.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/8 p-6">
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
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
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
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
                Actores cercanos
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {relatedArtisans.length}
              </p>
            </SurfaceCard>
            <SurfaceCard>
              <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
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
                  <p className="text-xs uppercase tracking-wider text-[color:var(--text-muted)]">
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
