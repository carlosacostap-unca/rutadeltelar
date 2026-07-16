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
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-8 sm:px-8 lg:px-10">
          <Link
            href="/"
            aria-label="Ir al inicio"
            className="brand-font shrink-0 text-[2.35rem] font-normal uppercase leading-none tracking-normal text-[#0b3350] hover:text-[#0b3350]/80"
          >
            Ruta del Telar
          </Link>

          <nav
            aria-label="Navegacion principal"
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none"
          >
            {primaryLinks.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium uppercase tracking-[0.08em] transition ${
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

          <Link
            href="/buscar"
            aria-label="Buscar en la ruta"
            className="hidden shrink-0 rounded-full bg-[#0b3350] px-3.5 py-1.5 text-sm font-medium uppercase tracking-[0.08em] text-[#efd4b0] hover:bg-[#092b43] sm:inline-flex"
          >
            Buscar
          </Link>
        </div>
      </header>
    </>
  );
}
