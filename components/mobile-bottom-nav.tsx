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
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <circle cx="12" cy="9" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </>
    ),
  },
  {
    href: "/explorar",
    label: "Experiencias",
    shortLabel: "Experiencias",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
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
  {
    href: "/buscar",
    label: "Buscar",
    shortLabel: "Buscar",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--border)] bg-[rgba(252,249,245,0.85)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 rounded-2xl border border-[color:var(--border)] bg-[rgba(255,255,255,0.88)] p-2 soft-shadow">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 text-center transition-colors ${
                active
                  ? "bg-[color:var(--accent)] text-white shadow-sm"
                  : "text-[color:var(--text-muted)] hover:text-[color:var(--foreground)]"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="mb-1 h-5 w-5"
              >
                {item.icon}
              </svg>
              <span className="text-[10px] font-semibold tracking-wider">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
