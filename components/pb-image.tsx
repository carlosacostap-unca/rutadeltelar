"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const pocketBaseFilePath = "/api/files/";

type PbImageProps = Omit<ImageProps, "onError"> & {
  /** Contenido a mostrar cuando la imagen no carga (404, error de red, etc.) */
  fallback?: React.ReactNode;
};

function isPocketBaseFileUrl(src: ImageProps["src"]) {
  if (typeof src !== "string") {
    return false;
  }

  try {
    return new URL(src).pathname.startsWith(pocketBaseFilePath);
  } catch {
    return false;
  }
}

function pocketBaseImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const params = new URLSearchParams({
    src,
    w: String(width),
    q: String(quality ?? 82),
  });

  return `/api/media-image?${params.toString()}`;
}

/**
 * Envuelve next/image con manejo de error para imágenes de PocketBase.
 * Si la imagen devuelve 404 u otro error, oculta el img y muestra el fallback.
 */
export function PbImage({ fallback, className, alt, ...props }: PbImageProps) {
  const [failed, setFailed] = useState(false);
  const usePocketBaseLoader = isPocketBaseFileUrl(props.src);

  if (failed) {
    return <>{fallback ?? null}</>;
  }

  return (
    <>
      {props.fill && fallback ? (
        <div aria-hidden="true" className="absolute inset-0">
          {fallback}
        </div>
      ) : null}
      <Image
        {...props}
        alt={alt}
        className={className}
        decoding={props.decoding ?? "async"}
        loader={usePocketBaseLoader ? pocketBaseImageLoader : props.loader}
        unoptimized={usePocketBaseLoader ? false : props.unoptimized}
        onError={() => setFailed(true)}
      />
    </>
  );
}
