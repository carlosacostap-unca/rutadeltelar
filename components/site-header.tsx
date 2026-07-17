"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/", label: "Inicio" },
  { href: "/estaciones", label: "Estaciones" },
  { href: "/artesanas", label: "Actores" },
  { href: "/productos", label: "Productos" },
  { href: "/explorar", label: "Experiencias" },
  { href: "/imperdibles", label: "Imperdibles" },
  { href: "/mapa", label: "Mapa" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#0b3350]/10 bg-[rgba(239,212,176,0.94)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex min-h-16 max-w-lg items-center justify-between gap-4 px-5 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          <Link
            href="/"
            aria-label="Ir al inicio"
            className="brand-font min-w-0 truncate text-[1.8rem] font-normal uppercase leading-none tracking-normal text-[#0b3350]"
          >
            Ruta del Telar
          </Link>

          <Link
            href="/buscar"
            aria-label="Buscar en la ruta"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b3350] text-[#efd4b0] shadow-sm transition hover:bg-[#092b43] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3350] focus-visible:ring-offset-2 focus-visible:ring-offset-[#efd4b0]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="m16 16 4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </Link>
        </div>
      </header>

      <header className="top-0 z-40 hidden bg-[#efd4b0] md:sticky md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-8 sm:px-8 lg:px-10 2xl:gap-6">
          <Link
            href="/"
            aria-label="Ir al inicio"
            className="brand-font shrink-0 text-[2rem] font-normal uppercase leading-none tracking-normal text-[#0b3350] hover:text-[#0b3350]/80 2xl:text-[2.35rem]"
          >
            Ruta del Telar
          </Link>

          <nav
            aria-label="Navegacion principal"
            className="flex min-w-0 flex-1 items-center gap-0 overflow-x-auto scrollbar-none 2xl:gap-1"
          >
            {primaryLinks.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-2 py-1.5 text-[0.78rem] font-medium uppercase tracking-[0.08em] transition 2xl:px-3 2xl:text-sm ${
                    active
                      ? "bg-[#0b3350] text-[#efd4b0] shadow-sm"
                      : "text-[#0b3350] hover:bg-[#0b3350]/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Link
              href="/favoritos"
              aria-label="Favoritos"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0b3350] text-[#efd4b0] hover:bg-[#092b43]"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
              >
                <path
                  d="M20.8 8.4c0 5.4-8.8 10.3-8.8 10.3S3.2 13.8 3.2 8.4A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.2Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="sr-only">Favoritos</span>
            </Link>

            <Link
              href="/buscar"
              aria-label="Buscar en la ruta"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0b3350] text-[#efd4b0] hover:bg-[#092b43]"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m16 16 4 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="sr-only">Buscar</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
