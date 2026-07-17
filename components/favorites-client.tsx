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
import { getImageFocusStyle } from "@/app/lib/image-focus";
import { withPocketBaseImageThumb } from "@/app/lib/pocketbase-images";
import { HighlightedData } from "@/components/highlighted-data";

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
      <section className="rounded-[1.65rem] border border-[#efd4b0]/25 bg-[#efd4b0] px-5 py-14 text-center text-[#123a55] sm:px-8">
        <h2 className="text-3xl font-black leading-none">
          Todavia no guardaste favoritos
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#123a55]/75">
          Podes guardar estaciones, productos, experiencias y recorridos desde
          sus paginas de detalle.
        </p>
        <Link
          href="/explorar"
          className="mt-6 inline-flex rounded-full bg-[#123a55] px-5 py-2.5 text-sm font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:bg-[#082d49]"
        >
          Explorar la ruta
        </Link>
      </section>
    );
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#efd4b0]/30 pb-3">
        <p className="text-sm font-medium text-[#efd4b0]/85">
          {favorites.length} favorito{favorites.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={clearFavorites}
          className="rounded-full border border-[#efd4b0]/40 px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#efd4b0] transition hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
        >
          Limpiar
        </button>
      </div>

      <div className="grid gap-10 sm:grid-cols-2 md:gap-14 lg:grid-cols-3">
        {favorites.map((item) => (
          <article
            key={getFavoriteKey(item)}
            className="flex h-full flex-col overflow-hidden rounded-[1.65rem] bg-[#efd4b0] text-[#123a55] shadow-sm"
          >
            <Link href={item.href} className="group block">
              {item.imageUrl ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={withPocketBaseImageThumb(item.imageUrl, "small")}
                    alt={item.title}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={getImageFocusStyle(item.imageFocus)}
                  />
                </div>
              ) : null}
              <div className="p-5">
                <p className="text-[0.68rem] font-black uppercase leading-none tracking-normal text-[#8a452b]">
                  {TYPE_LABELS[item.type]}
                </p>
                <h2 className="mt-1 text-[1.55rem] font-black leading-[0.94] tracking-normal text-[#082d49] transition group-hover:text-[#8a452b]">
                  {item.title}
                </h2>
                {item.subtitle ? (
                  <p className="mt-3 line-clamp-2 text-sm font-medium leading-tight text-[#123a55]/75">
                    {item.subtitle}
                  </p>
                ) : null}
                <HighlightedData value={item.datoDestacado} compact className="mt-4" />
              </div>
            </Link>
            <button
              type="button"
              onClick={() => removeFavorite(item)}
              className="mb-5 ml-5 mt-auto w-fit rounded-full border border-[#123a55]/25 px-3 py-1.5 text-xs font-black uppercase leading-none tracking-normal text-[#123a55] transition hover:border-[#123a55] hover:bg-[#123a55] hover:text-[#efd4b0]"
            >
              Quitar
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
