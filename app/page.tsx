import Link from "next/link";
import {
  getArtisansResult,
  getProductsResult,
  getStationsResult,
} from "@/app/lib/data";
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
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
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-xl font-black uppercase leading-none tracking-normal text-white">
        {eyebrow}
      </p>
      <h2 className="brand-font mt-1 text-[2rem] font-normal uppercase leading-none tracking-normal text-[#f3d7b4] sm:text-[2.45rem]">
        {title}
      </h2>
    </div>
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
              usage={size === "compact" ? "thumbnail" : "small"}
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
    getProductsResult(),
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
  const featuredProducts = takePreferred(
    products,
    ["Chal de Vicuna", "Ruana de Vicuna"],
    2,
  );
  const featuredArtisans = takePreferred(
    artisans,
    ["Tapices Ocampo", "Huellas del Exito", "Tinku Kamayu", "Liliana Saracho"],
    4,
  );
  return (
    <main className="relative left-1/2 flex w-screen -translate-x-1/2 -mt-6 flex-col bg-[#123a55] text-white">
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-20 lg:px-10">
        <HomeHeroCarousel stationDepartmentLinks={stationDepartmentLinks} />

        <section className="mb-20">
          <SectionTitle eyebrow="Territorio" title="Explora las estaciones" />
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
          <SectionTitle eyebrow="Artesanias" title="Productos destacados" />
          <div className="grid max-w-3xl gap-10 sm:grid-cols-2 md:gap-14">
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
        </section>

        <section>
          <SectionTitle eyebrow="Comunidad" title="Conoce a los artesanos" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredArtisans.map((artisan) => (
              <FeaturedCard
                key={artisan.slug}
                href={`/artesanas/${artisan.slug}`}
                image={artisan}
                title={artisan.name}
                subtitle={artisan.place}
                imageAlt={artisan.name}
                size="compact"
                titleCase="natural"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
