"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Inicio",
    shortLabel: "Inicio",
    icon: (
      <path
        d="M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    ),
  },
  {
    href: "/estaciones",
    label: "Estaciones",
    shortLabel: "Estaciones",
    icon: (
      <>
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <circle
          cx="12"
          cy="9"
          r="2.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </>
    ),
  },
  {
    href: "/explorar",
    label: "Experiencias",
    shortLabel: "Explorar",
    icon: (
      <>
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </>
    ),
  },
  {
    href: "/imperdibles",
    label: "Imperdibles",
    shortLabel: "Imperdibles",
    icon: (
      <path
        d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.4 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    ),
  },
  {
    href: "/mas",
    label: "Mas opciones",
    shortLabel: "Mas",
    icon: (
      <>
        <circle cx="6.5" cy="12" r="1.4" fill="currentColor" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
        <circle cx="17.5" cy="12" r="1.4" fill="currentColor" />
      </>
    ),
  },
];

const moreItems: NavItem[] = [
  {
    href: "/artesanas",
    label: "Actores",
    shortLabel: "Actores",
    icon: (
      <>
        <circle
          cx="8.5"
          cy="8"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle
          cx="15.5"
          cy="8"
          r="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M4 19c.7-3 2.4-4.5 4.5-4.5S12.3 16 13 19"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
        <path
          d="M11 19c.7-3 2.4-4.5 4.5-4.5S19.3 16 20 19"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </>
    ),
  },
  {
    href: "/productos",
    label: "Productos",
    shortLabel: "Productos",
    icon: (
      <>
        <path
          d="M5 7h14l-1.2 12H6.2L5 7Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <path
          d="M9 7a3 3 0 0 1 6 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </>
    ),
  },
  {
    href: "/mapa",
    label: "Mapa",
    shortLabel: "Mapa",
    icon: (
      <>
        <path
          d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <path
          d="M9 4v14M15 6v14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </>
    ),
  },
  {
    href: "/buscar",
    label: "Buscar",
    shortLabel: "Buscar",
    icon: (
      <>
        <circle
          cx="11"
          cy="11"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="m21 21-4.35-4.35"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </>
    ),
  },
  {
    href: "/agenda",
    label: "Agenda",
    shortLabel: "Agenda",
    icon: (
      <>
        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M8 3v4M16 3v4M4 10h16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </>
    ),
  },
  {
    href: "/favoritos",
    label: "Favoritos",
    shortLabel: "Favoritos",
    icon: (
      <path
        d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.4 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    ),
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreMenu, setMoreMenu] = useState({
    pathname,
    open: false,
  });
  const moreOpen = moreMenu.pathname === pathname && moreMenu.open;
  const moreActive = useMemo(
    () => moreItems.some((item) => isActive(pathname, item.href)),
    [pathname],
  );

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-x-3 bottom-[calc(5.8rem+env(safe-area-inset-bottom))] z-30 rounded-2xl border border-[#efd4b0]/40 bg-[#123a55] p-3 text-[#efd4b0] shadow-[0_-8px_32px_rgba(5,28,43,0.24)] md:hidden">
          <div className="grid grid-cols-3 gap-2">
            {moreItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center rounded-xl px-2 py-2 text-center transition-colors ${
                    active
                      ? "bg-[#efd4b0] text-[#123a55] shadow-sm"
                      : "text-[#efd4b0] hover:bg-[#efd4b0]/12"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="mb-1 h-5 w-5"
                  >
                    {item.icon}
                  </svg>
                  <span className="text-[10px] font-semibold tracking-normal">
                    {item.shortLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Navegacion principal"
        className="fixed inset-x-0 bottom-0 z-30 bg-[rgba(239,212,176,0.92)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 rounded-2xl bg-[#f5dec0] p-2 shadow-[0_-8px_32px_rgba(5,28,43,0.18)]">
          {navItems.map((item) => {
            const isMore = item.href === "/mas";
            const active = isMore
              ? moreOpen || moreActive
              : isActive(pathname, item.href);
            const className = `flex flex-col items-center justify-center rounded-xl px-2 py-2 text-center transition-colors ${
              active
                ? "bg-[#0b3350] text-white shadow-sm"
                : "text-[#0b3350]/75 hover:text-[#0b3350]"
            }`;

            if (isMore) {
              return (
                <button
                  key={item.href}
                  type="button"
                  aria-label={item.label}
                  aria-expanded={moreOpen}
                  onClick={() =>
                    setMoreMenu({
                      pathname,
                      open: !moreOpen,
                    })
                  }
                  className={className}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="mb-1 h-5 w-5"
                  >
                    {item.icon}
                  </svg>
                  <span className="text-[10px] font-semibold tracking-normal">
                    {item.shortLabel}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="mb-1 h-5 w-5"
                >
                  {item.icon}
                </svg>
                <span className="text-[10px] font-semibold tracking-normal">
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
