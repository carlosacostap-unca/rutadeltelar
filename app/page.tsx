import Link from "next/link";
import {
  getArtisansResult,
  getProductsResult,
  getStationsResult,
} from "@/app/lib/data";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { SiteEndSections } from "@/components/site-end-sections";
import { MediaFallback } from "@/components/media-fallback";
import { PbImage } from "@/components/pb-image";

type ImageLike = {
  imageUrl?: string;
  imageFocus?: { x?: number; y?: number };
};

type FeaturedCardProps = {
  href: string;
  image: ImageLike;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  imageAlt: string;
  size?: "large" | "compact";
  titleCase?: "natural" | "uppercase";
};

type FeaturedDepartment = {
  name: string;
  imageUrl?: string;
  stationCount: number;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function takePreferred<T extends { name?: string; locality?: string }>(
  items: T[],
  preferredNames: string[],
  limit: number,
) {
  const selected: T[] = [];

  preferredNames.forEach((preferredName) => {
    const match = items.find((item) => {
      const candidates = [item.name, item.locality].filter(Boolean).map(String);
      return candidates.some((candidate) =>
        normalize(candidate).includes(normalize(preferredName)),
      );
    });

    if (match && !selected.includes(match)) {
      selected.push(match);
    }
  });

  items.forEach((item) => {
    if (selected.length < limit && !selected.includes(item)) {
      selected.push(item);
    }
  });

  return selected.slice(0, limit);
}

function getFeaturedDepartments(
  stations: Array<{
    department?: string;
    departmentImageUrl?: string;
  }>,
) {
  const departments = new Map<string, FeaturedDepartment>();

  stations.forEach((station) => {
    if (!station.department) {
      return;
    }

    const existing = departments.get(station.department);

    if (existing) {
      existing.stationCount += 1;

      if (!existing.imageUrl && station.departmentImageUrl) {
        existing.imageUrl = station.departmentImageUrl;
      }

      return;
    }

    departments.set(station.department, {
      name: station.department,
      imageUrl: station.departmentImageUrl,
      stationCount: 1,
    });
  });

  return [...departments.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
}

function getDepartmentHref(departmentName: string) {
  return `/estaciones?departamento=${encodeURIComponent(departmentName)}`;
}

function SectionTitle({
  eyebrow,
  title,
  size = "default",
}: {
  eyebrow: string;
  title: string;
  size?: "default" | "compact";
}) {
  const titleSize =
    size === "compact"
      ? "text-[1.55rem] sm:text-[1.85rem] md:text-[2.05rem]"
      : "text-[2rem] sm:text-[2.45rem]";

  return (
    <div className="mb-8">
      <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
        {eyebrow}
      </p>
      <h2 className={`brand-font mt-1 font-normal uppercase leading-none tracking-normal text-[#f3d7b4] ${titleSize}`}>
        {formatBrandFontText(title)}
      </h2>
    </div>
  );
}

function SectionLinkButton({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#efd4b0] px-6 py-3 text-sm font-black uppercase leading-none tracking-normal text-[#123a55] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
    >
      {children}
    </Link>
  );
}

function FeaturedCard({
  href,
  image,
  title,
  eyebrow,
  subtitle,
  imageAlt,
  size = "large",
  titleCase = "uppercase",
}: FeaturedCardProps) {
  const imageHeight = size === "compact" ? "aspect-[1.05]" : "aspect-[0.95]";
  const footerPadding = size === "compact" ? "p-4" : "p-6";
  const titleSize = size === "compact" ? "text-xl" : "text-[1.75rem]";
  const titleTransform = titleCase === "uppercase" ? "uppercase" : "";

  return (
    <Link href={href} className="group block">
      <article className="h-full overflow-hidden rounded-[1.85rem] bg-[#efd4b0] text-[#0d314a] transition duration-200 group-hover:-translate-y-1">
        <div className={`relative w-full overflow-hidden ${imageHeight}`}>
          {image.imageUrl ? (
            <PbImage
              src={image.imageUrl}
              alt={imageAlt}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              usage="small"
              sizes={
                size === "compact"
                  ? "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 260px"
                  : "(max-width: 768px) 100vw, 33vw"
              }
              loading={size === "compact" ? "eager" : undefined}
              quality={90}
              style={getImageFocusStyle(image.imageFocus)}
              fallback={<MediaFallback label={imageAlt} />}
            />
          ) : (
            <MediaFallback label={imageAlt} />
          )}
        </div>
        <div className={footerPadding}>
          {eyebrow ? (
            <p className="text-[0.7rem] font-medium uppercase leading-none tracking-normal text-[#18364d]/80">
              {eyebrow}
            </p>
          ) : null}
          <h3
            className={`${titleSize} ${titleTransform} mt-1 font-black leading-[0.92] tracking-normal text-[#082d49]`}
          >
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-normal text-[#18364d]/75">
              {subtitle}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export default async function Home() {
  const [stationsResult, artisansResult, productsResult] = await Promise.all([
    getStationsResult(),
    getArtisansResult(),
    getProductsResult({ sort: "created" }),
  ]);

  const stations = stationsResult.items;
  const products = productsResult.items;
  const artisans = artisansResult.items.filter((a) =>
    (a.actorType ?? "artesano").toLowerCase().includes("artesan"),
  );

  const featuredDepartments = getFeaturedDepartments(stations);
  const stationDepartmentLinks = featuredDepartments.map((department) => ({
    name: department.name,
    href: getDepartmentHref(department.name),
  }));
  const featuredProducts = products.slice(0, 3);
  const featuredArtisans = takePreferred(
    artisans,
    ["Tapices Ocampo", "Huellas del Exito", "Tinku Kamayu", "Liliana Saracho"],
    4,
  );
  return (
    <main className="relative left-1/2 flex w-screen -translate-x-1/2 -mb-28 -mt-6 flex-col overflow-x-clip bg-[#123a55] text-white md:-mb-12">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-6 sm:px-8 sm:pt-8 md:pb-28 md:pt-12 lg:px-10">
        <HomeHeroCarousel stationDepartmentLinks={stationDepartmentLinks} />

        <section className="mb-20">
          <SectionTitle
            eyebrow="Territorio"
            title="Explora las estaciones dentro de los 3 departamentos que conforman la Ruta del Telar"
            size="compact"
          />
          <div className="grid gap-10 md:grid-cols-3 md:gap-14">
            {featuredDepartments.map((department) => (
              <FeaturedCard
                key={department.name}
                href={getDepartmentHref(department.name)}
                image={department}
                title={department.name}
                eyebrow="Departamento"
                imageAlt={`Departamento ${department.name}`}
                titleCase="natural"
              />
            ))}
          </div>
        </section>

        <section className="mb-20">
          <SectionTitle
            eyebrow="Productos"
            title="Artesanias y productos regionales destacados"
            size="compact"
          />
          <div className="grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-3 md:gap-14">
            {featuredProducts.map((product) => (
              <FeaturedCard
                key={product.slug}
                href={`/productos/${product.slug}`}
                image={product}
                title={product.name}
                eyebrow={product.subcategory ?? product.category}
                subtitle={product.techniques.slice(0, 2).join(" - ")}
                imageAlt={product.name}
                titleCase="natural"
              />
            ))}
          </div>
          <div className="mt-10 flex max-w-5xl justify-center sm:justify-start">
            <SectionLinkButton href="/productos">
              Ver todos los productos
            </SectionLinkButton>
          </div>
        </section>

        <section>
          <SectionTitle
            eyebrow="Comunidad"
            title="Conoce a los actores de la Ruta del Telar"
            size="compact"
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredArtisans.map((artisan) => (
              <FeaturedCard
                key={artisan.slug}
                href={`/actores/${artisan.slug}`}
                image={artisan}
                title={artisan.name}
                subtitle={artisan.place}
                imageAlt={artisan.name}
                size="compact"
                titleCase="natural"
              />
            ))}
          </div>
          <div className="mt-10 flex justify-center sm:justify-start">
            <SectionLinkButton href="/actores">
              Ver toda la comunidad
            </SectionLinkButton>
          </div>
        </section>
      </div>
      <SiteEndSections />
    </main>
  );
}
