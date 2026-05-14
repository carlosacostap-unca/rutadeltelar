"use client";

import { useEffect, useState } from "react";
import type { ImageFocus } from "@/app/lib/image-focus";

export type FavoriteItem = {
  type: "estacion" | "producto" | "actor" | "experiencia" | "imperdible" | "recorrido";
  slug: string;
  title: string;
  subtitle?: string;
  href: string;
  imageUrl?: string;
  imageFocus?: ImageFocus;
};

const FAVORITES_KEY = "ruta-del-telar:favorites:v1";

function readFavorites(): FavoriteItem[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoriteItem[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("ruta-del-telar:favorites-changed"));
}

export function getFavoriteKey(item: Pick<FavoriteItem, "type" | "slug">) {
  return `${item.type}:${item.slug}`;
}

export function FavoriteButton({ item }: { item: FavoriteItem }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => {
      const key = getFavoriteKey(item);
      setSaved(readFavorites().some((favorite) => getFavoriteKey(favorite) === key));
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ruta-del-telar:favorites-changed", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ruta-del-telar:favorites-changed", sync);
    };
  }, [item]);

  function toggleFavorite() {
    const key = getFavoriteKey(item);
    const current = readFavorites();
    const exists = current.some((favorite) => getFavoriteKey(favorite) === key);
    const next = exists
      ? current.filter((favorite) => getFavoriteKey(favorite) !== key)
      : [item, ...current];

    writeFavorites(next);
    setSaved(!exists);
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      aria-pressed={saved}
      aria-label={`${saved ? "Quitar de favoritos" : "Guardar favorito"}: ${item.title}`}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-95 ${
        saved
          ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
          : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:border-[color:var(--accent)]"
      }`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} aria-hidden="true">
        <path
          d="M12 21s-7-4.35-9.2-8.7C1.15 9.03 3.25 5.5 6.82 5.5c2.02 0 3.32 1.08 4.18 2.22.86-1.14 2.16-2.22 4.18-2.22 3.57 0 5.67 3.53 4.02 6.8C19 16.65 12 21 12 21z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
      {saved ? "Guardado" : "Guardar"}
    </button>
  );
}

export { FAVORITES_KEY, readFavorites, writeFavorites };
