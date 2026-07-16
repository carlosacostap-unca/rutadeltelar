import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const data = {
  stations: [
    { recordId: "expo-station-belen", slug: "belen-catamarca", name: "Estacion Belen", locality: "Belen", department: "Belen", slogan: "Territorio de trama viva", summary: "Talleres, comunidad y paisaje cultural.", status: "aprobado", hasInauguratedStation: true, latitude: -27.65, longitude: -67.03 },
    { recordId: "expo-station-laguna", slug: "laguna-blanca", name: "Estacion Laguna Blanca", locality: "Laguna Blanca", department: "Belen", slogan: "Oficio, memoria y encuentro", summary: "Actores locales y experiencias guiadas.", status: "aprobado", latitude: -26.60, longitude: -66.92 },
    { recordId: "expo-station-antofagasta", slug: "antofagasta-de-la-sierra", name: "Estacion Antofagasta de la Sierra", locality: "Antofagasta de la Sierra", department: "Antofagasta de la Sierra", slogan: "Paletas del valle", summary: "Tecnicas, tintes y piezas con identidad regional.", status: "aprobado", hasInauguratedStation: true, latitude: -26.06, longitude: -67.41 },
  ],
  artisans: [
    { recordId: "expo-artisan-juana", slug: "juana-mamani", name: "Juana Mamani", place: "Belen", craft: "Telar criollo y mantas", actorType: "Artesana", bio: "Trabaja con telar criollo y transmite el oficio.", techniques: ["Trama gruesa", "Guardas tradicionales"], years: "22 anos de oficio", featuredPiece: "Manta de lana con guarda local", stationName: "Estacion Belen", stationSlug: "belen-catamarca", stationRecordId: "expo-station-belen", latitude: -27.65, longitude: -67.03 },
  ],
  products: [
    { recordId: "expo-product-manta", slug: "manta-guarda-belen", name: "Manta con guarda local", description: "Tejida en telar criollo con lana natural.", category: "Tejido", subcategory: "Mantas y ponchos", techniques: ["Telar criollo", "Tinte natural"], stationName: "Estacion Belen", stationSlug: "belen-catamarca", stationRecordId: "expo-station-belen", relatedActorRecordIds: ["expo-artisan-juana"] },
  ],
  experiences: [
    { recordId: "expo-experience-hilado", slug: "camino-del-hilado", title: "Camino del hilado", description: "Recorrido por talleres, tintes naturales y compra directa.", tag: "90 min", duration: "1 h 30 min", location: "Belen", intensity: "Suave", summary: "Una aproximacion al universo textil.", includes: ["Recibimiento en taller", "Demostracion de hilado"], stops: ["Taller comunitario", "Patio de cardado"], stationName: "Estacion Belen", stationSlug: "belen-catamarca", stationRecordId: "expo-station-belen", responsibleName: "Juana Mamani", responsibleSlug: "juana-mamani", responsibleRecordId: "expo-artisan-juana" },
  ],
  highlightSpots: [
    { recordId: "expo-spot-feria", slug: "feria-textil-central", title: "Feria textil central", subtitle: "Piezas, encuentro y compra directa", description: "Produccion local y piezas con origen.", type: "actividad", location: "Belen", priority: "alta", stationName: "Estacion Belen", stationSlug: "belen-catamarca", stationRecordId: "expo-station-belen", relatedExperienceRecordIds: ["expo-experience-hilado"], relatedArtisanRecordIds: ["expo-artisan-juana"], relatedProductRecordIds: ["expo-product-manta"], latitude: -27.64, longitude: -67.02 },
  ],
};

const manifest = {
  schemaVersion: 1,
  generatedAt: "2026-07-14T00:00:00.000Z",
  source: "local-expo-fixture",
  counts: Object.fromEntries(Object.entries(data).map(([key, items]) => [key, items.length])),
  dataSha256: createHash("sha256").update(JSON.stringify(data)).digest("hex"),
  data,
  media: [],
  map: {
    imagePath: "/expo/map/ruta-del-telar.svg",
    attribution: "Mapa esquematico local Ruta del Telar",
    bounds: [[-29, -69], [-24.5, -65]],
    maxZoom: 13,
  },
  routes: {
    "recorrido-belen-catamarca": {
      source: "straight",
      positions: [[-27.65, -67.03], [-27.64, -67.02]],
    },
  },
};

const targets = [path.join(process.cwd(), "tests", "fixtures", "expo", "snapshot.json")];
if (process.argv.includes("--public")) {
  targets.push(path.join(process.cwd(), "public", "expo", "snapshot.json"));
}
for (const target of targets) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Expo fixture written to ${target}`);
}
