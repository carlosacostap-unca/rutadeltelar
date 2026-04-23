import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductContextBySlug, getProducts } from "@/app/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { SurfaceCard } from "@/components/surface-card";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const context = await getProductContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { product, relatedStation, relatedActors } = context;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-6">
        <Link
          href="/productos"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          Volver a productos
        </Link>
      </div>

      {/* Hero de producto */}
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Imagen */}
        {product.imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-[color:var(--border)] soft-shadow">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] text-7xl">
            🧵
          </div>
        )}

        {/* Info principal */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
            {product.subcategory ?? product.category}
          </p>
          <h1 className="display-font mt-3 text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
            {product.name}
          </h1>

          {product.stationName && (
            <p className="mt-3 text-sm uppercase tracking-wider text-[color:var(--text-muted)]">
              {product.stationName}
            </p>
          )}

          <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-muted)]">
            {product.description}
          </p>

          {product.techniques.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                Técnicas
              </p>
              <div className="flex flex-wrap gap-2">
                {product.techniques.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm text-[color:var(--accent-strong)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {relatedStation && (
            <div className="mt-8">
              <SurfaceCard>
                <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Estación de origen
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                  {relatedStation.name}
                </p>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                  {relatedStation.slogan}
                </p>
                <Link
                  href={`/estaciones/${relatedStation.slug}`}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
                >
                  Ver estación
                </Link>
              </SurfaceCard>
            </div>
          )}
        </div>
      </section>

      {/* Actores relacionados */}
      {relatedActors.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            eyebrow="Elaborado por"
            title="Actores que producen esta pieza"
            description="Artesanas, artesanos y productores que trabajan con estas técnicas en la ruta."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedActors.map((actor) => (
              <SurfaceCard key={actor.slug} className="soft-shadow">
                <div className="flex items-center gap-3">
                  {actor.imageUrl ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[color:var(--border)]">
                      <Image
                        src={actor.imageUrl}
                        alt={actor.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="display-font flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-strong)] text-lg text-[color:var(--accent-strong)]">
                      {actor.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[color:var(--foreground)]">
                      {actor.name}
                    </p>
                    <p className="text-sm text-[color:var(--text-muted)]">
                      {actor.place}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)]">
                  {actor.craft}
                </p>
                <Link
                  href={`/artesanas/${actor.slug}`}
                  className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
                >
                  Ver perfil
                </Link>
              </SurfaceCard>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
