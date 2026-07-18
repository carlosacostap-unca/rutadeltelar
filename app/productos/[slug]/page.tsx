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
import { BackButton } from "@/components/back-button";
import { ContactButtons } from "@/components/contact-buttons";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { HighlightedData } from "@/components/highlighted-data";
import { MediaFallback } from "@/components/media-fallback";
import { MetricsViewTracker } from "@/components/metrics-view-tracker";
import { PbImage } from "@/components/pb-image";
import { ShareButton } from "@/components/share-button";
import { SiteEndSections } from "@/components/site-end-sections";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
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

function formatLocation(value?: string) {
  return (value ?? "")
    .replace(/^Estaci[oó]n\s+/i, "")
    .replace(/,\s*Catamarca\.?$/i, "")
    .trim();
}

function DetailActionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <BackButton
      fallbackHref={href}
      className="inline-flex min-h-11 items-center rounded-full border border-[#efd4b0]/35 px-4 py-2.5 text-sm font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#efd4b0]/60"
    >
      {children}
    </BackButton>
  );
}

function HeroTag({
  children,
  emphasis = false,
}: {
  children: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal ${
        emphasis
          ? "bg-[#efd4b0] text-[#123a55]"
          : "border border-[#efd4b0]/35 text-[#efd4b0]"
      }`}
    >
      {children}
    </span>
  );
}

function InfoTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#123a55]/20 bg-[#123a55]/5 px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
      {children}
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-[#123a55]/15 py-3 last:border-0">
      <p className="text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/65">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium leading-6 text-[#123a55]">
        {children}
      </div>
    </div>
  );
}

function MakerRow({ actor }: { actor: Artisan }) {
  return (
    <div className="rounded-[1.25rem] border border-[#123a55]/15 bg-[#123a55]/5 p-4">
      <Link
        href={`/actores/${actor.slug}`}
        className="group flex min-w-0 items-center gap-4"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[1rem] border border-[#123a55]/15 bg-[#123a55]/10">
          {actor.imageUrl ? (
            <PbImage
              src={withPocketBaseImageThumb(actor.imageUrl, "thumbnail")}
              alt={actor.name}
              fill
              className="object-cover"
              sizes="64px"
              style={getImageFocusStyle(actor.imageFocus)}
              fallback={<MediaFallback label="Actor" />}
            />
          ) : (
            <MediaFallback label="Actor" />
          )}
        </div>
        <div className="min-w-0">
          {actor.actorType ? (
            <p className="text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
              {actor.actorType}
            </p>
          ) : null}
          <p className="mt-1 text-lg font-black leading-none text-[#082d49] transition group-hover:text-[#123a55]/75">
            {actor.name}
          </p>
          {actor.place ? (
            <p className="mt-1 line-clamp-1 text-sm font-medium text-[#123a55]/70">
              {formatLocation(actor.place)}
            </p>
          ) : null}
        </div>
      </Link>

      <ContactButtons
        phone={actor.contactPhone}
        email={actor.contactEmail}
        address={actor.address}
        mapPoint={actor}
        facebook_url={actor.facebook_url}
        instagram_url={actor.instagram_url}
        pagina_web_url={actor.pagina_web_url}
      />
    </div>
  );
}
function ProductInfoPanel({
  product,
  relatedStation,
  productMakers,
}: {
  product: Product;
  relatedStation?: Station | null;
  productMakers: Artisan[];
}) {
  return (
    <section className="mb-4 rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55] shadow-sm sm:p-7">
      <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
        Información práctica
      </p>
      <h2 className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
        Origen y elaboración
      </h2>

      <div className="mt-5">
        {product.techniques.length > 0 ? (
          <div className="border-b border-[#123a55]/15 pb-5">
            <p className="mb-2 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/65">
              Técnicas
            </p>
            <div className="flex flex-wrap gap-2">
              {product.techniques.map((technique) => (
                <InfoTag key={technique}>{technique}</InfoTag>
              ))}
            </div>
          </div>
        ) : null}

        {relatedStation ? (
          <InfoRow label="Estación">
            <Link
              href={`/estaciones/${relatedStation.slug}`}
              className="font-black text-[#082d49] underline decoration-[#123a55]/25 underline-offset-4 transition hover:text-[#123a55]/70"
            >
              {relatedStation.name}
            </Link>
            {relatedStation.locality ? (
              <span className="ml-2 text-[#123a55]/70">
                · {formatLocation(relatedStation.locality)}
              </span>
            ) : null}
          </InfoRow>
        ) : product.stationName ? (
          <InfoRow label="Estación">
            {formatLocation(product.stationName)}
          </InfoRow>
        ) : null}

        {productMakers.length > 0 ? (
          <div className="pt-5">
            <p className="mb-3 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]/65">
              Hecho por
            </p>
            <div className="grid gap-3">
              {productMakers.map((actor) => (
                <MakerRow key={actor.slug} actor={actor} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
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

  const { product, relatedStation, productMakers } = context;
  const stationLabel = formatLocation(
    relatedStation?.name ?? product.stationName,
  );

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <MetricsViewTracker
        entityType="productos"
        entityId={product.recordId}
        entitySlug={product.slug}
        entityTitle={product.name}
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-2 pt-10 sm:px-8 md:pb-3 md:pt-16 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <DetailActionLink href="/productos">Volver</DetailActionLink>
          <div className="flex flex-wrap items-center gap-2">
            <FavoriteButton
              variant="onDark"
              item={{
                type: "producto",
                slug: product.slug,
                title: product.name,
                subtitle: stationLabel || product.subcategory,
                href: `/productos/${product.slug}`,
                imageUrl: product.imageUrl,
                imageFocus: product.imageFocus,
                datoDestacado: product.datoDestacado,
              }}
            />
            <ShareButton
              title={product.name}
              text={product.description}
              variant="onDark"
            />
          </div>
        </div>

        <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div className="min-w-0 pt-1">
            <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
              Productos
            </p>
            <h1 className="brand-font mt-1 max-w-full break-words text-[2.65rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] [overflow-wrap:anywhere] sm:text-[3.35rem] md:text-[4.35rem]">
              {formatBrandFontText(product.name)}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              <HeroTag emphasis>{product.category}</HeroTag>
              {product.subcategory ? (
                <HeroTag>{product.subcategory}</HeroTag>
              ) : null}
              {stationLabel ? <HeroTag>{stationLabel}</HeroTag> : null}
            </div>

            {product.description ? (
              <p className="mt-5 max-w-xl text-justify text-base font-medium leading-7 text-white/85">
                {product.description}
              </p>
            ) : null}

            <HighlightedData
              label="Para tener en cuenta"
              value={product.datoDestacado}
              variant="onDark"
              className="mt-5 max-w-xl"
            />
          </div>

          <div className="order-first min-w-0 lg:order-none">
            <DetailMediaGallery
              title={product.name}
              fallbackLabel="Producto"
              coverUrl={product.imageUrl}
              galleryUrls={product.galleryUrls}
              coverFocus={product.imageFocus}
              galleryImages={product.galleryImages}
              coverClassName={
                product.imageUrl
                  ? "aspect-[1.12] rounded-[1.85rem] border-[#efd4b0]/25"
                  : "h-48 rounded-[1.85rem] border-[#efd4b0]/25 sm:h-auto sm:aspect-[1.12]"
              }
              coverSizes="(max-width: 1024px) 100vw, 56vw"
              thumbnailClassName="aspect-[4/3] w-[180px] rounded-[1.1rem] border-[#efd4b0]/25"
            />
          </div>
        </section>

        <ProductInfoPanel
          product={product}
          relatedStation={relatedStation}
          productMakers={productMakers}
        />
      </div>

      <SiteEndSections />
    </main>
  );
}
