import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { type Artisan } from "@/app/lib/content";
import { getArtisanContextBySlug, getArtisans } from "@/app/lib/data";
import { hasValidCoordinates } from "@/app/lib/geo";
import { getImageFocusStyle, type FocusedImage } from "@/app/lib/image-focus";
import { createPageMetadata } from "@/app/lib/metadata";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { ContactButtons } from "@/components/contact-buttons";
import { DetailMediaGallery } from "@/components/detail-media-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { HighlightedData } from "@/components/highlighted-data";
import { HomeCarousel } from "@/components/home-carousel";
import { MediaFallback } from "@/components/media-fallback";
import { MetricsViewTracker } from "@/components/metrics-view-tracker";
import { PbImage } from "@/components/pb-image";
import { SatelliteMapButton } from "@/components/satellite-map-button";
import { ShareButton } from "@/components/share-button";
import { StationDetailMap } from "@/components/station-detail-map";

type ArtisanDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ promoCapture?: string | string[] }>;
};

export async function generateStaticParams() {
  const artisans = await getArtisans();
  return artisans.map((artisan) => ({ slug: artisan.slug }));
}

export async function generateMetadata({
  params,
}: ArtisanDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const context = await getArtisanContextBySlug(slug);

  if (!context) {
    return createPageMetadata({
      title: "Actor no encontrado",
      path: `/artesanas/${slug}`,
    });
  }

  const { artisan } = context;

  return createPageMetadata({
    title: artisan.name,
    description: artisan.bio || artisan.craft,
    path: `/artesanas/${artisan.slug}`,
    imageUrl: artisan.imageUrl,
  });
}

function normalizeLabel(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#123a55]/20 bg-[#123a55]/5 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
      {children}
    </span>
  );
}

function FichaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[#123a55]/15 py-3 last:border-0">
      <p className="text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
        {label}
      </p>
      <p className="text-sm font-medium leading-6 text-[#123a55]">{value}</p>
    </div>
  );
}

function FichaPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55] shadow-sm sm:p-7">
      <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
        Ficha
      </p>
      <h2 className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ActorFicha({ actor }: { actor: Artisan }) {
  const type = normalizeLabel(actor.actorType);

  if (type.includes("artesan")) {
    return (
      <FichaPanel title="Artesano/a">
        {actor.techniques.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
              Tecnicas
            </p>
            <div className="flex flex-wrap gap-2">
              {actor.techniques.map((technique) => (
                <Tag key={technique}>{technique}</Tag>
              ))}
            </div>
          </div>
        ) : null}
        {actor.materials && actor.materials.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
              Materiales
            </p>
            <div className="flex flex-wrap gap-2">
              {actor.materials.map((material) => (
                <Tag key={material}>{material}</Tag>
              ))}
            </div>
          </div>
        ) : null}
        {actor.visitasDisponibles ? (
          <FichaRow label="Visitas / demostraciones" value={actor.visitasDisponibles} />
        ) : null}
        {actor.productosOfrecidos && actor.productosOfrecidos.length > 0 ? (
          <div className="pt-3">
            <p className="mb-2 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
              Productos ofrecidos
            </p>
            <div className="flex flex-wrap gap-2">
              {actor.productosOfrecidos.map((product) => (
                <Tag key={product}>{product}</Tag>
              ))}
            </div>
          </div>
        ) : null}
      </FichaPanel>
    );
  }

  if (type.includes("productor")) {
    return (
      <FichaPanel title="Productor/a">
        {actor.rubroProductivo ? <FichaRow label="Rubro" value={actor.rubroProductivo} /> : null}
        {actor.escalaProduccion ? (
          <FichaRow label="Escala de produccion" value={actor.escalaProduccion} />
        ) : null}
        {actor.modalidadVenta ? (
          <FichaRow label="Modalidad de venta" value={actor.modalidadVenta} />
        ) : null}
        {actor.visitasDisponibles ? (
          <FichaRow label="Visitas / demostraciones" value={actor.visitasDisponibles} />
        ) : null}
        {actor.productosOfrecidos && actor.productosOfrecidos.length > 0 ? (
          <div className="pt-3">
            <p className="mb-2 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
              Productos ofrecidos
            </p>
            <div className="flex flex-wrap gap-2">
              {actor.productosOfrecidos.map((product) => (
                <Tag key={product}>{product}</Tag>
              ))}
            </div>
          </div>
        ) : null}
      </FichaPanel>
    );
  }

  if (type.includes("hospedaje")) {
    return (
      <FichaPanel title="Hospedaje">
        {actor.tipoHospedaje ? <FichaRow label="Tipo" value={actor.tipoHospedaje} /> : null}
        {actor.capacidad ? <FichaRow label="Capacidad" value={actor.capacidad} /> : null}
        {actor.servicios ? <FichaRow label="Servicios" value={actor.servicios} /> : null}
        {actor.horarios ? <FichaRow label="Horarios" value={actor.horarios} /> : null}
      </FichaPanel>
    );
  }

  if (type.includes("gastron")) {
    return (
      <FichaPanel title="Gastronomico">
        {actor.tipoPropuesta ? <FichaRow label="Propuesta" value={actor.tipoPropuesta} /> : null}
        {actor.especialidades ? (
          <FichaRow label="Especialidades" value={actor.especialidades} />
        ) : null}
        {actor.platosDestacados ? (
          <FichaRow label="Platos destacados" value={actor.platosDestacados} />
        ) : null}
        {actor.modalidadVenta ? (
          <FichaRow label="Modalidad de servicio" value={actor.modalidadVenta} />
        ) : null}
        {actor.horarios ? <FichaRow label="Horarios" value={actor.horarios} /> : null}
      </FichaPanel>
    );
  }

  if (type.includes("guia")) {
    return (
      <FichaPanel title="Guia">
        {actor.especialidades ? (
          <FichaRow label="Especialidad" value={actor.especialidades} />
        ) : null}
        {actor.idiomas && actor.idiomas.length > 0 ? (
          <div className="border-b border-[#123a55]/15 py-3">
            <p className="mb-2 text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#123a55]/65">
              Idiomas
            </p>
            <div className="flex flex-wrap gap-2">
              {actor.idiomas.map((language) => (
                <Tag key={language}>{language}</Tag>
              ))}
            </div>
          </div>
        ) : null}
        {actor.recorridosOfrecidos ? (
          <FichaRow label="Recorridos" value={actor.recorridosOfrecidos} />
        ) : null}
        {actor.zonaCobertura ? (
          <FichaRow label="Zona de cobertura" value={actor.zonaCobertura} />
        ) : null}
        {actor.puntoEncuentro ? (
          <FichaRow label="Punto de encuentro" value={actor.puntoEncuentro} />
        ) : null}
        {actor.horarios ? <FichaRow label="Horarios" value={actor.horarios} /> : null}
      </FichaPanel>
    );
  }

  if (actor.techniques.length > 0) {
    return (
      <FichaPanel title="Datos del actor">
        <div className="flex flex-wrap gap-2">
          {actor.techniques.map((technique) => (
            <Tag key={technique}>{technique}</Tag>
          ))}
        </div>
      </FichaPanel>
    );
  }

  return null;
}

function DetailActionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-[#efd4b0]/35 px-4 py-2 text-sm font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
    >
      {children}
    </Link>
  );
}

function RelatedCard({
  href,
  eyebrow,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  imageFocus,
  fallbackLabel,
  datoDestacado,
}: {
  href: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt: string;
  imageFocus?: Parameters<typeof getImageFocusStyle>[0];
  fallbackLabel: string;
  datoDestacado?: string;
}) {
  return (
    <Link
      href={href}
      className="group w-[230px] shrink-0 [scroll-snap-align:start]"
    >
      <article className="h-full overflow-hidden rounded-[1.35rem] bg-[#efd4b0] text-[#123a55] transition duration-200 group-hover:-translate-y-1">
        <div className="relative aspect-[1.12] w-full overflow-hidden bg-[#123a55]/10">
          {imageUrl ? (
            <PbImage
              src={withPocketBaseImageThumb(imageUrl, "thumbnail")}
              alt={imageAlt}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              sizes="230px"
              style={getImageFocusStyle(imageFocus)}
              fallback={<MediaFallback label={fallbackLabel} />}
            />
          ) : (
            <MediaFallback label={fallbackLabel} />
          )}
        </div>
        <div className="p-4">
          {eyebrow ? (
            <p className="text-[0.68rem] font-medium uppercase leading-none tracking-normal text-[#123a55]/75">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-black leading-[0.95] tracking-normal text-[#082d49]">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-2 line-clamp-2 text-xs font-medium leading-4 text-[#123a55]/75">
              {subtitle}
            </p>
          ) : null}
          <HighlightedData
            value={datoDestacado}
            compact
            className="mt-3 border-[#123a55]/20 bg-[#123a55]/5"
          />
        </div>
      </article>
    </Link>
  );
}

export default async function ArtisanDetailPage({ params, searchParams }: ArtisanDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const context = await getArtisanContextBySlug(slug);

  if (!context) {
    notFound();
  }

  const {
    artisan,
    relatedExperiences,
    relatedHighlightSpots,
    relatedStation,
    relatedProducts,
  } = context;
  const galleryImages: FocusedImage[] =
    artisan.galleryImages ?? artisan.galleryUrls?.map((url) => ({ url })) ?? [];
  const hasContact =
    !!artisan.contactPhone ||
    !!artisan.contactEmail ||
    !!artisan.address ||
    !!artisan.facebook_url ||
    !!artisan.instagram_url ||
    !!artisan.pagina_web_url;
  const locationLabel =
    relatedStation?.name ?? artisan.stationName ?? artisan.place;
  const promoCapture = Array.isArray(resolvedSearchParams?.promoCapture)
    ? resolvedSearchParams.promoCapture.includes("1")
    : resolvedSearchParams?.promoCapture === "1";

  return (
    <main className="relative left-1/2 -mb-28 -mt-6 flex w-screen -translate-x-1/2 flex-1 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <MetricsViewTracker
        entityType="actores"
        entityId={artisan.recordId}
        entitySlug={artisan.slug}
        entityTitle={artisan.name}
      />
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-16 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <DetailActionLink href="/artesanas">Volver a actores</DetailActionLink>
          <div className="flex flex-wrap items-center gap-2">
            <FavoriteButton
              variant="onDark"
              item={{
                type: "actor",
                slug: artisan.slug,
                title: artisan.name,
                subtitle: artisan.craft,
                href: `/artesanas/${artisan.slug}`,
                imageUrl: artisan.imageUrl,
                imageFocus: artisan.imageFocus,
                datoDestacado: artisan.datoDestacado,
              }}
            />
            <ShareButton
              title={artisan.name}
              text={artisan.craft}
              variant="onDark"
            />
          </div>
        </div>

        <section className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <div className="min-w-0 pt-1">
            <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
              Actores
            </p>
            <h1 className="brand-font mt-1 max-w-full break-words text-[2.65rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] [overflow-wrap:anywhere] sm:text-[3.35rem] md:text-[4.35rem]">
              {formatBrandFontText(artisan.name)}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {artisan.actorType ? (
                <span className="rounded-full border border-[#efd4b0]/35 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0]">
                  {artisan.actorType}
                </span>
              ) : null}
              {locationLabel ? (
                <span className="rounded-full bg-[#efd4b0] px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#123a55]">
                  {locationLabel}
                </span>
              ) : null}
            </div>
            {artisan.craft ? (
              <p className="mt-5 text-lg font-black leading-tight text-white">
                {artisan.craft}
              </p>
            ) : null}
            {relatedStation ? (
              <Link
                href={`/estaciones/${relatedStation.slug}`}
                className="mt-3 inline-flex rounded-full border border-[#efd4b0]/35 px-3 py-1 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
              >
                Ver estacion
              </Link>
            ) : null}
            {artisan.bio ? (
              <p className="mt-4 w-full text-justify text-base font-medium leading-7 text-white/85">
                {artisan.bio}
              </p>
            ) : null}
            <HighlightedData
              value={artisan.datoDestacado}
              variant="onDark"
              className="mt-5 max-w-xl"
            />
          </div>

          <div className="order-first lg:order-none">
            <DetailMediaGallery
              title={artisan.name}
              fallbackLabel="Actor"
              coverUrl={artisan.imageUrl}
              galleryUrls={artisan.galleryUrls}
              coverFocus={artisan.imageFocus}
              galleryImages={galleryImages}
              coverClassName="aspect-[1.12] rounded-[1.85rem] border-[#efd4b0]/25"
              coverSizes="(max-width: 1024px) 100vw, 56vw"
              thumbnailClassName="aspect-[4/3] w-[180px] rounded-[1.1rem] border-[#efd4b0]/25"
            />
          </div>
        </section>

        {hasContact ? (
          <section className="mb-12 rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55] shadow-sm sm:p-7">
            <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
              Contacto
            </p>
            <h2 className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
              Datos para coordinar
            </h2>
            <div className="mt-4 [&>div]:mt-0">
              <ContactButtons
                phone={artisan.contactPhone}
                email={artisan.contactEmail}
                address={artisan.address}
                mapPoint={artisan}
                facebook_url={artisan.facebook_url}
                instagram_url={artisan.instagram_url}
                pagina_web_url={artisan.pagina_web_url}
              />
            </div>
          </section>
        ) : null}

        {hasValidCoordinates(artisan) ? (
          <section className="mb-12 rounded-[1.85rem] bg-[#efd4b0] p-4 text-[#123a55] shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase leading-none tracking-normal text-[#123a55]">
                  Ubicacion
                </p>
                <h2 className="mt-2 text-[1.75rem] font-black leading-[0.95] tracking-normal text-[#082d49] sm:text-[2.25rem]">
                  Como llegar
                </h2>
              </div>
              <SatelliteMapButton point={artisan} />
            </div>
            <div className="overflow-hidden rounded-[1.35rem] border border-[#123a55]/20 shadow-sm">
              <StationDetailMap
                lat={artisan.latitude}
                lng={artisan.longitude}
                label={artisan.name}
                eager={promoCapture}
                staticMapSrc="/video/actor-map.png"
              />
            </div>
            {artisan.address ? (
              <p className="mt-3 text-sm font-medium leading-6 text-[#123a55]/75">
                {artisan.address}
              </p>
            ) : null}
          </section>
        ) : (
          <section className="mb-12 rounded-[1.85rem] bg-[#efd4b0] p-6 text-[#123a55]">
            <p className="text-sm font-black uppercase leading-none tracking-normal">
              Ubicacion
            </p>
            <p className="mt-2 text-sm font-medium">
              Coordenadas no disponibles aun.
              {artisan.address ? ` Referencia: ${artisan.address}.` : ""}
            </p>
            {artisan.address ? (
              <div className="mt-4 [&>div]:mt-0">
                <ContactButtons
                  address={artisan.address}
                />
              </div>
            ) : null}
          </section>
        )}

        <ActorFicha actor={artisan} />

        {relatedProducts.length > 0 ? (
          <HomeCarousel
            eyebrow="Artesania"
            title="Productos de este actor"
            href="/productos"
            verTodosLabel="Ver todos"
            variant="onDark"
          >
            {relatedProducts.map((product) => (
              <RelatedCard
                key={product.slug}
                href={`/productos/${product.slug}`}
                eyebrow={product.subcategory ?? product.category}
                title={product.name}
                subtitle={product.description}
                imageUrl={product.imageUrl}
                imageAlt={product.name}
                imageFocus={product.imageFocus}
                fallbackLabel="Producto"
                datoDestacado={product.datoDestacado}
              />
            ))}
          </HomeCarousel>
        ) : null}

        {relatedHighlightSpots.length > 0 ? (
          <HomeCarousel
            eyebrow="Destacados"
            title="Imperdibles relacionados"
            href="/imperdibles"
            variant="onDark"
          >
            {relatedHighlightSpots.map((spot) => (
              <RelatedCard
                key={spot.slug}
                href={`/imperdibles/${spot.slug}`}
                eyebrow={spot.type}
                title={spot.title}
                subtitle={spot.subtitle}
                imageUrl={spot.imageUrl}
                imageAlt={spot.title}
                imageFocus={spot.imageFocus}
                fallbackLabel="Imperdible"
                datoDestacado={spot.datoDestacado}
              />
            ))}
          </HomeCarousel>
        ) : null}

        {relatedExperiences.length > 0 ? (
          <HomeCarousel
            eyebrow="Vivencias"
            title="Experiencias relacionadas"
            href="/explorar"
            verTodosLabel="Ver todas"
            variant="onDark"
          >
            {relatedExperiences.map((experience) => (
              <RelatedCard
                key={experience.slug}
                href={`/explorar/${experience.slug}`}
                eyebrow={`${experience.tag} - ${experience.duration}`}
                title={experience.title}
                subtitle={experience.description}
                imageUrl={experience.imageUrl}
                imageAlt={experience.title}
                imageFocus={experience.imageFocus}
                fallbackLabel="Experiencia"
                datoDestacado={experience.datoDestacado}
              />
            ))}
          </HomeCarousel>
        ) : null}
      </div>
    </main>
  );
}
