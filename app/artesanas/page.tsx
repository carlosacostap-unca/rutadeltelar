import Image from "next/image";
import Link from "next/link";
import { artisanTags } from "@/app/lib/content";
import { getArtisansResult } from "@/app/lib/data";
import { DataSourceBadge } from "@/components/data-source-badge";
import { SectionHeading } from "@/components/section-heading";
import { SurfaceCard } from "@/components/surface-card";

export default async function ArtesanasPage() {
  const artisansResult = await getArtisansResult();
  const artisans = artisansResult.items;

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Actores"
          title="Actores de la ruta"
          description="Artesanos, tejedores, productores, hospedajes, emprendimientos gastronómicos y guías que integran la Ruta del Telar. Cada actor representa una forma de vivir el territorio."
        />
        <div className="mt-4">
          <DataSourceBadge
            source={artisansResult.source}
            error={artisansResult.error}
          />
        </div>
      </header>

      <section className="flex flex-wrap gap-3">
        {artisanTags.map((item) => (
          <span
            key={item}
            className="rounded-full bg-[color:var(--surface-strong)] px-4 py-2 text-sm text-[color:var(--accent-strong)]"
          >
            {item}
          </span>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {artisans.map((item) => (
          <SurfaceCard key={item.name} className="soft-shadow">
            <div className="mb-4 flex items-center gap-3">
              {item.imageUrl ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[color:var(--border)]">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="display-font flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--surface-strong)] text-lg text-[color:var(--accent-strong)]">
                  {item.name.slice(0, 1)}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
                  {item.name}
                </h2>
                <p className="text-sm text-[color:var(--text-muted)]">
                  {item.place}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[color:var(--text-muted)]">
              {item.craft}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
                {item.years}
              </span>
              <Link
                href={`/artesanas/${item.slug}`}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
              >
                Ver ficha
              </Link>
            </div>
          </SurfaceCard>
        ))}
      </section>
    </main>
  );
}
