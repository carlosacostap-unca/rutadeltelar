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
  );
}
