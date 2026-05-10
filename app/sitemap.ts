import type { MetadataRoute } from "next";
import {
  getArtisans,
  getExperiences,
  getHighlightSpots,
  getProducts,
  getStations,
  getSuggestedJourneys,
} from "@/app/lib/data";
import { getSiteUrl } from "@/app/lib/metadata";

type SitemapEntry = MetadataRoute.Sitemap[number];

function absoluteUrl(path: string) {
  return new URL(path, getSiteUrl()).toString();
}

function entry(
  path: string,
  priority: number,
  changeFrequency: SitemapEntry["changeFrequency"] = "weekly",
): SitemapEntry {
  return {
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stations, artisans, products, experiences, spots, journeys] =
    await Promise.all([
      getStations(),
      getArtisans(),
      getProducts(),
      getExperiences(),
      getHighlightSpots(),
      getSuggestedJourneys(),
    ]);

  return [
    entry("/", 1),
    entry("/estaciones", 0.9),
    entry("/mapa", 0.8),
    entry("/explorar", 0.8),
    entry("/productos", 0.8),
    entry("/artesanas", 0.8),
    entry("/imperdibles", 0.8),
    entry("/recorridos", 0.7),
    entry("/agenda", 0.5, "monthly"),
    ...stations.map((station) => entry(`/estaciones/${station.slug}`, 0.8)),
    ...artisans.map((artisan) => entry(`/artesanas/${artisan.slug}`, 0.7)),
    ...products.map((product) => entry(`/productos/${product.slug}`, 0.7)),
    ...experiences.map((experience) => entry(`/explorar/${experience.slug}`, 0.7)),
    ...spots.map((spot) => entry(`/imperdibles/${spot.slug}`, 0.7)),
    ...journeys.map((journey) => entry(`/recorridos/${journey.slug}`, 0.6)),
  ];
}
