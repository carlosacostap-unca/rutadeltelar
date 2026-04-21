"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

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
          d="M5 5h6l2 4h6v10h-6l-2-4H5z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <circle cx="9" cy="9" r="1.3" fill="currentColor" />
      </>
    ),
  },
  {
    href: "/explorar",
    label: "Experiencias",
    shortLabel: "Experiencias",
    icon: (
      <>
        <rect
          x="4"
          y="5"
          width="16"
          height="15"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M8 3v4M16 3v4M4 9h16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </>
    ),
  },
  {
    href: "/artesanas",
    label: "Actores",
    shortLabel: "Actores",
    icon: (
      <>
        <circle
          cx="12"
          cy="8"
          r="3.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M5.5 20a6.5 6.5 0 0 1 13 0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
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
      <>
        <path
          d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.4 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </>
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--border)] bg-[rgba(251,246,239,0.92)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-2 rounded-[1.75rem] border border-[color:var(--border)] bg-[rgba(255,250,243,0.95)] p-2 soft-shadow">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center ${
                active
                  ? "bg-[color:var(--accent)] text-white"
                  : "text-[color:var(--text-muted)]"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="mb-1 h-5 w-5"
              >
                {item.icon}
              </svg>
              <span className="text-[11px] font-semibold tracking-[0.06em]">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
