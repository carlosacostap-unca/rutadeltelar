import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ruta del Telar",
    short_name: "Ruta del Telar",
    description: "Descubri estaciones, experiencias, talleres y comunidades textiles de Catamarca.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#efd4b0",
    theme_color: "#efd4b0",
    lang: "es-AR",
    icons: [
      {
        src: "/images/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/pwa/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
