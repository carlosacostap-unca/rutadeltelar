import Image from "next/image";
import { isExpoOffline } from "@/app/lib/expo-config";

const sponsorLogos = [
  {
    src: "/images/home/sponsor-1-ministerio.png?v=20260706",
    alt: "Catamarca Gobierno - Ministerio de Educacion y Trabajo",
    width: 1718,
    height: 282,
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

function HomeFooterSection({ expoOffline }: { expoOffline: boolean }) {
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
          {expoOffline ? (
            <p className="mt-5 text-sm text-white/75">Enlaces externos disponibles con conexion</p>
          ) : (
            <div className="mt-7 flex justify-center gap-8">
              {socialIcons.map((icon) => (
                <SocialIcon key={icon.label} icon={icon} />
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export function SiteEndSections() {
  const expoOffline = isExpoOffline();

  return (
    <>
      <HomeSponsorsSection />
      <HomeFooterSection expoOffline={expoOffline} />
    </>
  );
}
