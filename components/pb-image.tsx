"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type PbImageProps = Omit<ImageProps, "onError"> & {
  /** Contenido a mostrar cuando la imagen no carga (404, error de red, etc.) */
  fallback?: React.ReactNode;
};

/**
 * Envuelve next/image con manejo de error para imágenes de PocketBase.
 * Si la imagen devuelve 404 u otro error, oculta el img y muestra el fallback.
 */
export function PbImage({ fallback, className, alt, ...props }: PbImageProps) {
  const [failed, setFailed] = useState(false);

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
        onError={() => setFailed(true)}
      />
    </>
  );
}
