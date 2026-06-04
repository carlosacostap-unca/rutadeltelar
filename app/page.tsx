import Image from "next/image";
import Link from "next/link";
import {
  getArtisansResult,
  getProductsResult,
  getStationsResult,
} from "@/app/lib/data";
import { formatBrandFontText } from "@/app/lib/brand-font-text";
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

const sponsorLogos = [
  {
    src: "/images/home/sponsor-1-ministerio.png",
    alt: "Catamarca Gobierno - Ministerio de Educacion y Trabajo",
    width: 942,
    height: 166,
    className: "w-[min(33rem,82vw)] lg:w-[28rem]",
    alignClassName: "-translate-y-px",
  },
  {
    src: "/images/home/sponsor-2.png",
    alt: "Consejo Federal de Inversiones",
    width: 317,
    height: 164,
    className: "w-40 sm:w-48 lg:w-40",
    alignClassName: "-translate-y-0.5",
  },
  {
    src: "/images/home/sponsor-3.png",
    alt: "Alwaleed Philanthropies",
    width: 317,
    height: 177,
    className: "w-40 sm:w-48 lg:w-40",
    alignClassName: "-translate-y-1",
  },
  {
    src: "/images/home/sponsor-4.png",
    alt: "Unesco",
    width: 523,
    height: 140,
    className: "w-52 sm:w-64 lg:w-56",
    alignClassName: "translate-y-0.5",
  },
  {
    src: "/images/home/sponsor-5.png",
    alt: "Ruta del Telar",
    width: 157,
    height: 106,
    className: "w-36 sm:w-44 lg:w-32 xl:w-36",
    alignClassName: "translate-y-px",
  },
];

const socialIcons = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/RutadelTelarCatamarca/",
    path: "M17.5 8.1h-2.8c-1 0-1.4.5-1.4 1.5v2h4l-.6 3.8h-3.4V25h-4.1v-9.6H6v-3.8h3.2V9.3c0-3.3 2-5.1 5-5.1 1.4 0 2.8.1 3.3.2v3.7Z",
    viewBox: "0 0 32 32",
    iconClassName: "translate-x-0.5",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/rutadeltelar/",
    viewBox: "0 0 32 32",
    content: (
      <>
        <rect
          x="8"
          y="8"
          width="16"
          height="16"
          rx="4.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <circle
          cx="16"
          cy="16"
          r="4.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <circle cx="21.2" cy="10.8" r="1.3" fill="currentColor" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/watch?v=DizrE5Wid44",
    viewBox: "0 0 32 32",
    content: (
      <>
        <path
          d="M25.5 11.1c-.2-1.1-1-1.9-2.1-2.1C21.6 8.5 16 8.5 16 8.5s-5.6 0-7.4.5c-1.1.2-1.9 1-2.1 2.1C6 13 6 16 6 16s0 3 .5 4.9c.2 1.1 1 1.9 2.1 2.1 1.8.5 7.4.5 7.4.5s5.6 0 7.4-.5c1.1-.2 1.9-1 2.1-2.1.5-1.9.5-4.9.5-4.9s0-3-.5-4.9Z"
          fill="currentColor"
        />
        <path d="m14 19.3 5.2-3.3L14 12.7v6.6Z" fill="#efd4b0" />
      </>
    ),
  },
];

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

function HomeSponsorsSection() {
  return (
    <section
      aria-label="Aliados institucionales"
      className="bg-[#efd4b0] px-5 py-12 sm:px-8 sm:py-14 lg:px-10"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-12 lg:flex-nowrap lg:justify-between lg:gap-x-8 xl:gap-x-10">
        {sponsorLogos.map((sponsor) => (
          <div
            key={sponsor.src}
            className="flex h-24 shrink-0 items-center justify-center sm:h-28 lg:h-24"
          >
            <Image
              src={sponsor.src}
              alt={sponsor.alt}
              width={sponsor.width}
              height={sponsor.height}
              className={`${sponsor.className} ${sponsor.alignClassName} h-auto max-w-full`}
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 32vw, 33rem"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function SocialIcon({
  icon,
}: {
  icon: (typeof socialIcons)[number];
}) {
  const content = (
    <span
      aria-label={icon.label}
      role="img"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#efd4b0] text-[#123a55] sm:h-11 sm:w-11"
    >
      <svg
        aria-hidden="true"
        className={`h-6 w-6 ${"iconClassName" in icon ? icon.iconClassName : ""}`}
        viewBox={icon.viewBox}
        fill="currentColor"
      >
        {"path" in icon ? <path d={icon.path} /> : icon.content}
      </svg>
    </span>
  );

  if ("href" in icon) {
    return (
      <a
        href={icon.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={icon.label}
        className="inline-flex rounded-full"
      >
        {content}
      </a>
    );
  }

  return content;
}

function HomeFooterSection() {
  return (
    <footer
      aria-label="Informacion institucional"
      className="bg-[#123a55] px-5 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-10 text-[#efd4b0] sm:px-8 md:py-10 lg:px-10"
    >
      <div className="mx-auto grid max-w-6xl items-center justify-center gap-8 md:grid-cols-[9rem_1px_minmax(0,25rem)_1px_9rem_minmax(12rem,15rem)] md:gap-8 lg:gap-10">
        <div className="flex justify-center md:justify-start">
          <Image
            src="/images/home/footer-vicuna.png"
            alt="Vicuna Ruta del Telar"
            width={217}
            height={357}
            className="h-28 w-auto md:h-32"
            sizes="8rem"
          />
        </div>

        <span className="hidden h-28 w-px bg-[#efd4b0]/70 md:block" />

        <address className="not-italic text-center">
          <p className="text-lg font-medium uppercase leading-none tracking-normal">
            Direccion
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm font-light leading-tight text-white/85 sm:text-base">
            Ministerio de Educacion y Trabajo
            <br />
            Pabellon 3, C.A.P.E. Av. Venezuela S/N,
            <br />
            Catamarca, Argentina
          </p>
        </address>

        <span className="hidden h-28 w-px bg-[#efd4b0]/70 md:block" />

        <div className="flex justify-center">
          <Image
            src="/images/home/footer-qr.svg"
            alt="QR para acceder a rutadeltelar.catamarca.gob.ar"
            width={296}
            height={296}
            unoptimized
            className="h-28 w-28 rounded-xl"
            sizes="7rem"
          />
        </div>

        <div className="text-center">
          <p className="text-2xl font-light leading-none tracking-normal sm:text-3xl">
            Ruta del Telar
          </p>
          <div className="mt-7 flex justify-center gap-8">
            {socialIcons.map((icon) => (
              <SocialIcon key={icon.label} icon={icon} />
            ))}
          </div>
        </div>
      </div>
    </footer>
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
      <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-8 md:pb-28 md:pt-20 lg:px-10">
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
          <div className="mt-10 flex justify-center sm:justify-start">
            <SectionLinkButton href="/artesanas">
              Ver toda la comunidad
            </SectionLinkButton>
          </div>
        </section>
      </div>
      <HomeSponsorsSection />
      <HomeFooterSection />
    </main>
  );
}
