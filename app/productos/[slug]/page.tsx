import Image from "next/image";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type Artisan, type Product, type Station } from "@/app/lib/content";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { getProductContextBySlug, getProducts } from "@/app/lib/data";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { createPageMetadata } from "@/app/lib/metadata";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { BackButton } from "@/components/back-button";
import { FavoriteButton } from "@/components/favorite-button";
import { HighlightedData } from "@/components/highlighted-data";
import { MetricsViewTracker } from "@/components/metrics-view-tracker";
import { ShareButton } from "@/components/share-button";
import { SiteEndSections } from "@/components/site-end-sections";

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

function ProductTag({
  children,
  variant = "light",
}: {
  children: ReactNode;
  variant?: "dark" | "light";
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black uppercase leading-none tracking-normal ${
        variant === "dark"
          ? "bg-[#123a55] text-[#efd4b0]"
          : "bg-[#123a55]/10 text-[#123a55]"
      }`}
    >
      {children}
    </span>
  );
}

function RelatedStationCard({ station }: { station: Station }) {
  return (
    <div className="mt-6 rounded-[1.4rem] border border-[#123a55]/15 bg-[#123a55]/5 p-5">
      <p className="text-[0.7rem] font-black uppercase leading-none tracking-normal text-[#18364d]/80">
        Encontralo en
      </p>
      <Link
        href={`/estaciones/${station.slug}`}
        className="mt-2 inline-flex text-lg font-black leading-tight text-[#082d49] transition hover:text-[#123a55]/75"
      >
        {station.name}
      </Link>
      {station.locality ? (
        <p className="mt-1 text-sm font-medium text-[#18364d]/75">
          {station.locality}
        </p>
      ) : null}
      {station.slogan ? (
        <p className="mt-3 text-[0.78rem] font-medium uppercase leading-snug tracking-normal text-[#18364d]/70">
          {station.slogan}
        </p>
      ) : null}
    </div>
  );
}

function ProductHeroInfo({
  product,
  relatedStation,
  productMakers,
}: {
  product: Product;
  relatedStation?: Station | null;
  productMakers: Artisan[];
}) {
  return (
    <article className="h-full rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#0d314a] sm:p-8">
      <div className="flex flex-wrap gap-2">
        <ProductTag variant="dark">{product.category}</ProductTag>
        {product.subcategory ? (
          <ProductTag>{product.subcategory}</ProductTag>
        ) : null}
      </div>

      <h1 className="brand-font mt-5 text-[2.45rem] font-normal uppercase leading-none tracking-normal text-[#082d49] sm:text-[3.15rem]">
        {formatBrandFontText(product.name)}
      </h1>

      {productMakers.length > 0 ? (
        <div className="mt-5 border-y border-[#123a55]/15 py-4">
          <p className="text-[0.7rem] font-black uppercase leading-none tracking-normal text-[#18364d]/75">
            Hecho por
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {productMakers.map((actor) => (
              <Link
                key={actor.slug}
                href={`/actores/${actor.slug}`}
                className="group flex items-center gap-4"
              >
                {actor.imageUrl ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] border border-[#123a55]/15">
                    <Image
                      src={withPocketBaseImageThumb(actor.imageUrl, "thumbnail")}
                      alt={actor.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      style={getImageFocusStyle(actor.imageFocus)}
                    />
                  </div>
                ) : (
                  <div className="brand-font flex h-16 w-16 shrink-0 items-center justify-center rounded-[1rem] bg-[#123a55]/10 text-3xl font-normal uppercase leading-none text-[#082d49]">
                    {actor.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  {actor.actorType ? (
                    <p className="text-[0.7rem] font-black uppercase leading-none tracking-normal text-[#18364d]/70">
                      {actor.actorType}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xl font-black leading-none text-[#082d49] transition group-hover:text-[#123a55]/75">
                    {actor.name}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#18364d]/75">
                    {actor.place}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-5 text-base font-medium leading-tight text-[#18364d]/85">
        {product.description}
      </p>

      {product.techniques.length > 0 ? (
        <div className="mt-6">
          <p className="text-[0.7rem] font-black uppercase leading-none tracking-normal text-[#18364d]/80">
            Tecnicas
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.techniques.map((technique) => (
              <ProductTag key={technique}>{technique}</ProductTag>
            ))}
          </div>
        </div>
      ) : null}

      <HighlightedData
        value={product.datoDestacado}
        className="mt-6 border-[#123a55]/20 bg-[#123a55]/5"
      />

      {relatedStation ? <RelatedStationCard station={relatedStation} /> : null}
    </article>
  );
}

function RelatedActorCard({ actor }: { actor: Artisan }) {
  return (
    <Link href={`/actores/${actor.slug}`} className="group block">
      <article className="h-full rounded-[1.85rem] bg-[#efd4b0] p-5 text-[#0d314a] transition duration-200 group-hover:-translate-y-1 sm:p-6">
        <div className="flex items-center gap-4">
          {actor.imageUrl ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border border-[#123a55]/15">
              <Image
                src={withPocketBaseImageThumb(actor.imageUrl, "thumbnail")}
                alt={actor.name}
                fill
                className="object-cover"
                sizes="80px"
                style={getImageFocusStyle(actor.imageFocus)}
              />
            </div>
          ) : (
            <div className="brand-font flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#123a55]/10 text-4xl font-normal uppercase leading-none text-[#082d49]">
              {actor.name[0]}
            </div>
          )}
          <div className="min-w-0">
            {actor.actorType ? (
              <p className="text-[0.7rem] font-black uppercase leading-none tracking-normal text-[#18364d]/75">
                {actor.actorType}
              </p>
            ) : null}
            <h3 className="mt-1 text-xl font-black leading-none text-[#082d49]">
              {actor.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-[#18364d]/75">
              {actor.place}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium leading-snug text-[#18364d]/80 line-clamp-3">
          {actor.craft}
        </p>
        <HighlightedData
          value={actor.datoDestacado}
          compact
          className="mt-4 border-[#123a55]/20 bg-[#123a55]/5"
        />
        <span className="mt-4 inline-flex text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
          Ver perfil
        </span>
      </article>
    </Link>
  );
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const context = await getProductContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const { product, relatedStation, productMakers, localActors } = context;

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <MetricsViewTracker
        entityType="productos"
        entityId={product.recordId}
        entitySlug={product.slug}
        entityTitle={product.name}
      />
      <div className="mx-auto w-full max-w-6xl px-5 pb-6 pt-10 sm:px-8 md:pb-8 md:pt-16 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <BackButton
            fallbackHref="/productos"
            className="inline-flex rounded-full border border-[#efd4b0]/35 px-4 py-2 text-sm font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:-translate-y-0.5 hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
          >
            Volver
          </BackButton>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <FavoriteButton
              item={{
                type: "producto",
                slug: product.slug,
                title: product.name,
                subtitle: product.stationName,
                href: `/productos/${product.slug}`,
                imageUrl: product.imageUrl,
                imageFocus: product.imageFocus,
                datoDestacado: product.datoDestacado,
              }}
            />
            <ShareButton title={product.name} text={product.description} />
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
          <div className="min-w-0">
            <p className="mb-4 text-xl font-black uppercase leading-none tracking-normal text-white">
              Producto
            </p>
            <DetailMediaGallery
              title={product.name}
              fallbackLabel="Producto"
              coverUrl={product.imageUrl}
              galleryUrls={product.galleryUrls}
              coverFocus={product.imageFocus}
              galleryImages={product.galleryImages}
              coverClassName="aspect-[4/3] w-full sm:aspect-square"
              coverSizes="(max-width: 1024px) 100vw, 52vw"
              thumbnailClassName="aspect-square w-[150px]"
            />
          </div>

          <div className="min-w-0">
            <ProductHeroInfo
              product={product}
              relatedStation={relatedStation}
              productMakers={productMakers}
            />
          </div>
        </section>

        {localActors.length > 0 ? (
          <section className="mt-14">
            <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
              Comunidad local
            </p>
            <h2 className="brand-font mt-1 max-w-4xl text-[2.25rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[3rem]">
              {formatBrandFontText(
                productMakers.length > 0
                  ? "Otros actores de la localidad"
                  : "Actores de la localidad",
              )}
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {localActors.map((actor) => (
                <RelatedActorCard key={actor.slug} actor={actor} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <SiteEndSections />
    </main>
  );
}
