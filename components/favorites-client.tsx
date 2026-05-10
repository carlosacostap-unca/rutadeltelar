"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FAVORITES_KEY,
  type FavoriteItem,
  getFavoriteKey,
  readFavorites,
  writeFavorites,
} from "@/components/favorite-button";
import { SurfaceCard } from "@/components/surface-card";

const TYPE_LABELS: Record<FavoriteItem["type"], string> = {
  estacion: "Estacion",
  producto: "Producto",
  actor: "Actor",
  experiencia: "Experiencia",
  imperdible: "Imperdible",
  recorrido: "Recorrido",
};

export function FavoritesClient() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("ruta-del-telar:favorites-changed", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("ruta-del-telar:favorites-changed", sync);
    };
  }, []);

  function removeFavorite(item: FavoriteItem) {
    const key = getFavoriteKey(item);
    writeFavorites(favorites.filter((favorite) => getFavoriteKey(favorite) !== key));
  }

  function clearFavorites() {
    window.localStorage.removeItem(FAVORITES_KEY);
    window.dispatchEvent(new Event("ruta-del-telar:favorites-changed"));
  }

  if (favorites.length === 0) {
    return (
      <SurfaceCard className="py-14 text-center">
        <p className="display-font text-3xl text-[color:var(--foreground)]">
          Todavia no guardaste favoritos
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[color:var(--text-muted)]">
          Podes guardar estaciones, productos, experiencias y recorridos desde
          sus paginas de detalle.
        </p>
        <Link
          href="/explorar"
          className="mt-6 inline-flex rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Explorar la ruta
        </Link>
      </SurfaceCard>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--text-muted)]">
          {favorites.length} favorito{favorites.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={clearFavorites}
          className="rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        >
          Limpiar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((item) => (
          <SurfaceCard key={getFavoriteKey(item)} className="soft-shadow h-full">
            <Link href={item.href} className="group block">
              {item.imageUrl ? (
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : null}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                {TYPE_LABELS[item.type]}
              </p>
              <h2 className="mt-1 text-base font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                {item.title}
              </h2>
              {item.subtitle ? (
                <p className="mt-1 text-sm leading-6 text-[color:var(--text-muted)] line-clamp-2">
                  {item.subtitle}
                </p>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => removeFavorite(item)}
              className="mt-4 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text-muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              Quitar
            </button>
          </SurfaceCard>
        ))}
      </div>
    </>
  );
}
