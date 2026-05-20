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
    <header className="top-0 z-40 hidden border-b border-[color:var(--border)] bg-[rgba(252,249,245,0.88)] backdrop-blur-xl md:sticky md:block">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Ir al inicio"
          className="display-font shrink-0 text-lg font-semibold leading-none text-[color:var(--foreground)] hover:text-[color:var(--accent)]"
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
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  active
                    ? "bg-[color:var(--accent)] text-white shadow-sm"
                    : "text-[color:var(--text-muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
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
          className="hidden shrink-0 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1.5 text-sm font-semibold text-[color:var(--foreground)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] sm:inline-flex"
        >
          Buscar
        </Link>
      </div>
    </header>
  );
}
