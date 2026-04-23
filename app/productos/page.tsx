import Image from "next/image";
import Link from "next/link";
import { getProductsResult, getStationsResult } from "@/app/lib/data";
import { DataSourceBadge } from "@/components/data-source-badge";
import { SectionHeading } from "@/components/section-heading";
import { SurfaceCard } from "@/components/surface-card";

export default async function ProductosPage() {
  const [productsResult, stationsResult] = await Promise.all([
    getProductsResult(),
    getStationsResult(),
  ]);
  const products = productsResult.items;
  const stations = stationsResult.items;

  // Agrupar por categoría
  const byCategory = products.reduce<Record<string, typeof products>>(
    (acc, product) => {
      const key = product.category || "Sin categoría";
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    },
    {},
  );

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Productos"
          title="Piezas y productos de la ruta"
          description="Artesanías, textiles y producciones locales elaboradas por los actores que integran la Ruta del Telar."
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <DataSourceBadge
            source={productsResult.source}
            error={productsResult.error}
          />
        </div>
      </header>

      {/* Filtro por estación */}
      {stations.length > 0 && (
        <section className="mb-8 flex flex-wrap gap-2">
          <span className="rounded-full border border-[color:var(--accent)] bg-[rgba(138,69,43,0.07)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
            Todos
          </span>
          {stations.map((s) => (
            <span
              key={s.slug}
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm text-[color:var(--text-muted)]"
            >
              {s.locality}
            </span>
          ))}
        </section>
      )}

      {Object.entries(byCategory).map(([category, items]) => (
        <section key={category} className="mb-12">
          <h2 className="display-font mb-5 text-2xl text-[color:var(--foreground)]">
            {category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <Link
                key={product.slug}
                href={`/productos/${product.slug}`}
                className="group"
              >
                <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
                  {product.imageUrl ? (
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-[color:var(--border)]">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-[color:var(--surface)] text-4xl">
                      🧵
                    </div>
                  )}

                  {product.subcategory && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                      {product.subcategory}
                    </p>
                  )}
                  <h3 className="mt-2 text-lg font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-muted)] line-clamp-3">
                    {product.description}
                  </p>

                  {product.techniques.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.techniques.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs text-[color:var(--text-muted)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    {product.stationName && (
                      <p className="text-xs text-[color:var(--text-muted)]">
                        {product.stationName}
                      </p>
                    )}
                    <p className="ml-auto text-sm font-semibold text-[color:var(--accent)] transition group-hover:translate-x-0.5">
                      Ver pieza →
                    </p>
                  </div>
                </SurfaceCard>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {products.length === 0 && (
        <SurfaceCard className="soft-shadow py-16 text-center">
          <p className="text-2xl">🧵</p>
          <p className="mt-4 text-sm text-[color:var(--text-muted)]">
            Próximamente los productos de la ruta aparecerán aquí.
          </p>
        </SurfaceCard>
      )}
    </main>
  );
}
