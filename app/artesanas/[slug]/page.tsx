import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Artisan } from "@/app/lib/content";
import { getArtisanContextBySlug, getArtisans } from "@/app/lib/data";
import { ContactButtons } from "@/components/contact-buttons";
import { HomeCarousel } from "@/components/home-carousel";
import { ShareButton } from "@/components/share-button";
import { SurfaceCard } from "@/components/surface-card";

type ArtisanDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const artisans = await getArtisans();
  return artisans.map((artisan) => ({ slug: artisan.slug }));
}

// Helpers
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--accent-strong)]">
      {children}
    </span>
  );
}

function FichaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[color:var(--border)] py-3 last:border-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">{label}</p>
      <p className="text-sm text-[color:var(--foreground)]">{value}</p>
    </div>
  );
}

function ActorFicha({ actor }: { actor: Artisan }) {
  const type = (actor.actorType ?? "").toLowerCase();

  if (type.includes("artesan")) {
    return (
      <SurfaceCard className="soft-shadow">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">Ficha · Artesano/a</p>
        {actor.techniques.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Técnicas</p>
            <div className="flex flex-wrap gap-2">{actor.techniques.map((t) => <Tag key={t}>{t}</Tag>)}</div>
          </div>
        )}
        {actor.materials && actor.materials.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Materiales</p>
            <div className="flex flex-wrap gap-2">{actor.materials.map((m) => <Tag key={m}>{m}</Tag>)}</div>
          </div>
        )}
        {actor.visitasDisponibles && <FichaRow label="Visitas / demostraciones" value={actor.visitasDisponibles} />}
        {actor.productosOfrecidos && actor.productosOfrecidos.length > 0 && (
          <div className="pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Productos ofrecidos</p>
            <div className="flex flex-wrap gap-2">{actor.productosOfrecidos.map((p) => <Tag key={p}>{p}</Tag>)}</div>
          </div>
        )}
      </SurfaceCard>
    );
  }

  if (type.includes("productor")) {
    return (
      <SurfaceCard className="soft-shadow">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">Ficha · Productor/a</p>
        {actor.rubroProductivo && <FichaRow label="Rubro" value={actor.rubroProductivo} />}
        {actor.escalaProduccion && <FichaRow label="Escala de producción" value={actor.escalaProduccion} />}
        {actor.modalidadVenta && <FichaRow label="Modalidad de venta" value={actor.modalidadVenta} />}
        {actor.visitasDisponibles && <FichaRow label="Visitas / demostraciones" value={actor.visitasDisponibles} />}
        {actor.productosOfrecidos && actor.productosOfrecidos.length > 0 && (
          <div className="pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Productos ofrecidos</p>
            <div className="flex flex-wrap gap-2">{actor.productosOfrecidos.map((p) => <Tag key={p}>{p}</Tag>)}</div>
          </div>
        )}
      </SurfaceCard>
    );
  }

  if (type.includes("hospedaje")) {
    return (
      <SurfaceCard className="soft-shadow">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">Ficha · Hospedaje</p>
        {actor.tipoHospedaje && <FichaRow label="Tipo" value={actor.tipoHospedaje} />}
        {actor.capacidad && <FichaRow label="Capacidad" value={actor.capacidad} />}
        {actor.servicios && <FichaRow label="Servicios" value={actor.servicios} />}
        {actor.horarios && <FichaRow label="Horarios" value={actor.horarios} />}
      </SurfaceCard>
    );
  }

  if (type.includes("gastron")) {
    return (
      <SurfaceCard className="soft-shadow">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">Ficha · Gastronómico</p>
        {actor.tipoPropuesta && <FichaRow label="Propuesta" value={actor.tipoPropuesta} />}
        {actor.especialidades && <FichaRow label="Especialidades" value={actor.especialidades} />}
        {actor.platosDestacados && <FichaRow label="Platos destacados" value={actor.platosDestacados} />}
        {actor.modalidadVenta && <FichaRow label="Modalidad de servicio" value={actor.modalidadVenta} />}
        {actor.horarios && <FichaRow label="Horarios" value={actor.horarios} />}
      </SurfaceCard>
    );
  }

  if (type.includes("guía") || type.includes("guia")) {
    return (
      <SurfaceCard className="soft-shadow">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">Ficha · Guía</p>
        {actor.especialidades && <FichaRow label="Especialidad" value={actor.especialidades} />}
        {actor.idiomas && actor.idiomas.length > 0 && (
          <div className="border-b border-[color:var(--border)] py-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">Idiomas</p>
            <div className="flex flex-wrap gap-2">{actor.idiomas.map((l) => <Tag key={l}>{l}</Tag>)}</div>
          </div>
        )}
        {actor.recorridosOfrecidos && <FichaRow label="Recorridos" value={actor.recorridosOfrecidos} />}
        {actor.zonaCobertura && <FichaRow label="Zona de cobertura" value={actor.zonaCobertura} />}
        {actor.puntoEncuentro && <FichaRow label="Punto de encuentro" value={actor.puntoEncuentro} />}
        {actor.horarios && <FichaRow label="Horarios" value={actor.horarios} />}
      </SurfaceCard>
    );
  }

  // Fallback: show techniques if any
  if (actor.techniques.length > 0) {
    return (
      <SurfaceCard className="soft-shadow">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">Ficha</p>
        <div className="flex flex-wrap gap-2">{actor.techniques.map((t) => <Tag key={t}>{t}</Tag>)}</div>
      </SurfaceCard>
    );
  }

  return null;
}

export default async function ArtisanDetailPage({ params }: ArtisanDetailPageProps) {
  const { slug } = await params;
  const context = await getArtisanContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { artisan, relatedExperiences, relatedHighlightSpots, relatedStation, relatedProducts } = context;

  return (
    <main className="flex flex-1 flex-col">
      {/* Back + Compartir */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/artesanas"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          ← Actores
        </Link>
        <ShareButton title={artisan.name} text={artisan.craft} />
      </div>

      {/* Cabecera */}
      <section className="mb-10 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
        {/* Foto */}
        {artisan.imageUrl ? (
          <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-3xl border border-[color:var(--border)] soft-shadow sm:h-44 sm:w-44">
            <Image src={artisan.imageUrl} alt={artisan.name} fill className="object-cover" sizes="176px" priority />
          </div>
        ) : (
          <div className="display-font flex h-36 w-36 shrink-0 items-center justify-center rounded-3xl bg-[color:var(--surface)] text-5xl text-[color:var(--accent-strong)] soft-shadow sm:h-44 sm:w-44">
            {artisan.name[0]}
          </div>
        )}

        {/* Info */}
        <div>
          {artisan.actorType && (
            <span className="inline-block rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
              {artisan.actorType}
            </span>
          )}
          <h1 className="display-font mt-3 text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
            {artisan.name}
          </h1>
          {relatedStation ? (
            <Link
              href={`/estaciones/${relatedStation.slug}`}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--accent)] transition hover:underline"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
              </svg>
              {relatedStation.name}
            </Link>
          ) : artisan.stationName ? (
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">{artisan.stationName}</p>
          ) : null}
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)]">{artisan.bio}</p>

          {/* Contacto */}
          <ContactButtons phone={artisan.contactPhone} email={artisan.contactEmail} address={artisan.address} />
        </div>
      </section>

      {/* Ficha por subtipo */}
      <section className="mb-10">
        <ActorFicha actor={artisan} />
      </section>

      {/* Productos de este actor */}
      {relatedProducts.length > 0 && (
        <HomeCarousel eyebrow="Artesanía" title="Productos de este actor" href="/productos" verTodosLabel="Ver todos">
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

      {/* Imperdibles relacionados */}
      {relatedHighlightSpots.length > 0 && (
        <HomeCarousel eyebrow="Destacados" title="Imperdibles relacionados" href="/imperdibles">
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
