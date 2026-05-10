import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductContextBySlug, getProducts } from "@/app/lib/data";
import { createPageMetadata } from "@/app/lib/metadata";
import { FavoriteButton } from "@/components/favorite-button";
import { MediaFallback } from "@/components/media-fallback";
import { ShareButton } from "@/components/share-button";
import { SurfaceCard } from "@/components/surface-card";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = await getProductContextBySlug(slug);

  if (!context) {
    return createPageMetadata({
      title: "Producto no encontrado",
      path: `/productos/${slug}`,
    });
  }

  const { product } = context;

  return createPageMetadata({
    title: product.name,
    description: product.description,
    path: `/productos/${product.slug}`,
    imageUrl: product.imageUrl,
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const context = await getProductContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { product, relatedStation, relatedActors } = context;

  return (
    <main className="flex flex-1 flex-col">
      {/* Back + Compartir */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/productos"
          className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
        >
          ← Productos
        </Link>
        <div className="flex items-center gap-2">
          <FavoriteButton
            item={{
              type: "producto",
              slug: product.slug,
              title: product.name,
              subtitle: product.stationName,
              href: `/productos/${product.slug}`,
              imageUrl: product.imageUrl,
            }}
          />
          <ShareButton title={product.name} text={product.description} />
        </div>
      </div>

      {/* Galería + info */}
      <section className="mb-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Imagen principal */}
        {product.imageUrl ? (
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-[color:var(--border)] soft-shadow">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        ) : (
          <div className="aspect-square overflow-hidden rounded-3xl border border-[color:var(--border)] soft-shadow">
            <MediaFallback label="Producto" />
          </div>
        )}

        {/* Info */}
        <div>
          {/* Tags: categoría / subcategoría / técnicas */}
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
              {product.category}
            </span>
            {product.subcategory && (
              <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[color:var(--accent-strong)]">
                {product.subcategory}
              </span>
            )}
            {product.techniques.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs text-[color:var(--text-muted)]"
              >
                {t}
              </span>
            ))}
          </div>

          <h1 className="display-font text-4xl leading-tight text-[color:var(--foreground)] sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-5 text-sm leading-7 text-[color:var(--text-muted)]">
            {product.description}
          </p>

          {/* Estación de origen */}
          {relatedStation && (
            <div className="mt-6">
              <SurfaceCard>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                  Encontralo en
                </p>
                <Link
                  href={`/estaciones/${relatedStation.slug}`}
                  className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[color:var(--accent)] transition hover:underline"
                >
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                  </svg>
                  {relatedStation.name}
                </Link>
                {relatedStation.slogan && (
                  <p className="mt-1 text-xs italic text-[color:var(--text-muted)]">{relatedStation.slogan}</p>
                )}
              </SurfaceCard>
            </div>
          )}
        </div>
      </section>

      {/* Hecho por — actores relacionados */}
      {relatedActors.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
            Hecho por
          </h2>
          <p className="mb-5 text-2xl font-semibold text-[color:var(--foreground)] display-font">
            {relatedActors.length === 1 ? "El artesano detrás de esta pieza" : "Quiénes hacen esta pieza"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedActors.map((actor) => (
              <Link
                key={actor.slug}
                href={`/artesanas/${actor.slug}`}
                className="group"
              >
                <SurfaceCard className="h-full transition group-hover:border-[color:var(--accent)]">
                  <div className="flex items-center gap-4">
                    {actor.imageUrl ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[color:var(--border)]">
                        <Image src={actor.imageUrl} alt={actor.name} fill className="object-cover" sizes="64px" />
                      </div>
                    ) : (
                      <div className="display-font flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--surface)] text-2xl text-[color:var(--accent-strong)]">
                        {actor.name[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      {actor.actorType && (
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                          {actor.actorType}
                        </p>
                      )}
                      <h3 className="mt-0.5 truncate font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                        {actor.name}
                      </h3>
                      <p className="text-xs text-[color:var(--text-muted)]">{actor.place}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-muted)] line-clamp-2">
                    {actor.craft}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--accent)] group-hover:underline">
                    Ver perfil →
                  </span>
                </SurfaceCard>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
