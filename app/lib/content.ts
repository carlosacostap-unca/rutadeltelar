export const highlights = [
  { value: "12", label: "paradas textiles" },
  { value: "5", label: "circuitos sugeridos" },
  { value: "18", label: "actores registrados" },
  { value: "100%", label: "disenado para movil" },
];

export type Station = {
  recordId?: string;
  slug: string;
  name: string;
  locality: string;
  slogan: string;
  summary: string;
  status: string;
  imageUrl?: string;
  galleryUrls?: string[];
  latitude?: number;
  longitude?: number;
};

export const stations = [
  {
    slug: "amaicha-del-valle",
    name: "Estacion Amaicha del Valle",
    locality: "Amaicha del Valle",
    slogan: "Territorio de trama viva",
    summary:
      "Una estacion clave para iniciar el recorrido, con talleres, comunidad y paisaje cultural.",
    status: "aprobado",
  },
  {
    slug: "el-paso",
    name: "Estacion El Paso",
    locality: "El Paso",
    slogan: "Oficio, memoria y encuentro",
    summary:
      "Concentra actores locales, experiencias guiadas y puntos de interes para visitantes.",
    status: "aprobado",
  },
  {
    slug: "santa-maria",
    name: "Estacion Santa Maria",
    locality: "Santa Maria",
    slogan: "Paletas del valle",
    summary:
      "Una puerta de entrada a tecnicas, tintes y piezas con fuerte identidad regional.",
    status: "aprobado",
  },
] satisfies Station[];

export type Experience = {
  recordId?: string;
  slug: string;
  title: string;
  description: string;
  tag: string;
  duration: string;
  location: string;
  intensity: string;
  summary: string;
  includes: string[];
  stops: string[];
  imageUrl?: string;
  stationName?: string;
  stationSlug?: string;
  stationRecordId?: string;
  responsibleName?: string;
  responsibleSlug?: string;
  responsibleRecordId?: string;
};

export const experiences = [
  {
    slug: "camino-del-hilado",
    title: "Camino del hilado",
    description:
      "Un recorrido corto para descubrir talleres, tintes naturales y compra directa.",
    tag: "90 min",
    duration: "1 h 30 min",
    location: "Amaicha del Valle",
    intensity: "Suave",
    summary:
      "Ideal para una primera aproximacion al universo textil, con foco en proceso, materiales y charla con artesanas.",
    includes: [
      "Recibimiento en taller",
      "Demostracion de hilado",
      "Compra directa de piezas",
    ],
    stops: ["Taller comunitario", "Patio de cardado", "Tienda de origen"],
  },
  {
    slug: "tarde-de-telar-vivo",
    title: "Tarde de telar vivo",
    description:
      "Agenda experiencias con demostraciones, relatos locales y piezas en proceso.",
    tag: "Guiado",
    duration: "2 h",
    location: "El Paso",
    intensity: "Media",
    summary:
      "Una salida pensada para ver el telar en accion, escuchar relatos y conocer la relacion entre oficio, familia y territorio.",
    includes: [
      "Recorrido con anfitriona",
      "Muestra de tecnicas",
      "Espacio para preguntas",
    ],
    stops: ["Casa taller", "Galeria de piezas", "Puesto de feria"],
  },
  {
    slug: "mapa-sensible",
    title: "Mapa sensible",
    description:
      "Explora la ruta por paisaje, tecnica, comunidad o nivel de accesibilidad.",
    tag: "Interactivo",
    duration: "Flexible",
    location: "Toda la ruta",
    intensity: "Personalizable",
    summary:
      "Una vista transversal para elegir recorridos segun intereses, distancia, tiempo disponible o accesibilidad.",
    includes: [
      "Capas por interes",
      "Sugerencias contextuales",
      "Cruce entre lugares y perfiles",
    ],
    stops: ["Paisaje", "Tecnica", "Comunidad", "Accesibilidad"],
  },
] satisfies Experience[];

export const agenda = [
  {
    day: "Hoy",
    title: "Visita al taller de Juana",
    meta: "17:30 hs • Amaicha",
  },
  {
    day: "Manana",
    title: "Demostracion de tintes",
    meta: "10:00 hs • El Paso",
  },
  {
    day: "Sabado",
    title: "Mercado de piezas unicas",
    meta: "11:00 hs • Plaza central",
  },
];

export type HighlightSpot = {
  recordId?: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  type: string;
  location: string;
  priority: string;
  imageUrl?: string;
  stationName?: string;
  stationSlug?: string;
  stationRecordId?: string;
  relatedExperienceRecordIds?: string[];
  relatedArtisanRecordIds?: string[];
  latitude?: number;
  longitude?: number;
};

export const highlightSpots = [
  {
    slug: "feria-textil-central",
    title: "Feria textil central",
    subtitle: "Piezas, encuentro y compra directa",
    description:
      "Un imperdible para descubrir produccion local, conversar con actores y llevar piezas con origen.",
    type: "actividad",
    location: "Plaza central",
    priority: "alta",
  },
  {
    slug: "demostracion-de-tintes",
    title: "Demostracion de tintes",
    subtitle: "Colores del territorio",
    description:
      "Una actividad donde se muestran procesos de tintes botanicos y su relacion con el entorno.",
    type: "evento",
    location: "El Paso",
    priority: "alta",
  },
  {
    slug: "mirador-del-telar",
    title: "Mirador del telar",
    subtitle: "Paisaje y cultura",
    description:
      "Punto recomendado para conectar recorrido territorial y narrativa de la Ruta del Telar.",
    type: "atractivo",
    location: "Amaicha del Valle",
    priority: "media",
  },
] satisfies HighlightSpot[];

export type Artisan = {
  recordId?: string;
  slug: string;
  name: string;
  place: string;
  craft: string;
  bio: string;
  techniques: string[];
  years: string;
  featuredPiece: string;
  imageUrl?: string;
  stationName?: string;
  stationSlug?: string;
  stationRecordId?: string;
  contactPhone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export const artisans = [
  {
    slug: "juana-mamani",
    name: "Juana Mamaní",
    place: "Amaicha del Valle",
    craft: "Telar criollo y mantas",
    bio: "Trabaja con telar criollo desde hace mas de veinte anos y transmite el oficio en encuentros comunitarios con visitantes y nuevas tejedoras.",
    techniques: ["Trama gruesa", "Guardas tradicionales", "Terminaciones a mano"],
    years: "22 anos de oficio",
    featuredPiece: "Manta de lana con guarda local",
  },
  {
    slug: "rosa-chaile",
    name: "Rosa Chaile",
    place: "El Paso",
    craft: "Hilado a mano y piezas finas",
    bio: "Su trabajo une hilado fino, paciencia y una seleccion precisa de fibras para piezas livianas, textiles de abrigo y encargos especiales.",
    techniques: ["Hilado manual", "Torcion fina", "Piezas de uso cotidiano"],
    years: "16 anos de oficio",
    featuredPiece: "Chal liviano de fibra natural",
  },
  {
    slug: "lucia-tolaba",
    name: "Lucia Tolaba",
    place: "Santa Maria",
    craft: "Tintes botanicos y ruanas",
    bio: "Investiga y practica tintes botanicos con plantas locales, logrando una paleta propia que combina tradicion y experimentacion.",
    techniques: ["Tintes botanicos", "Ruanas", "Paletas estacionales"],
    years: "12 anos de oficio",
    featuredPiece: "Ruana otonal en tonos tierra",
  },
] satisfies Artisan[];

export const artisanTags = [
  "Tejido en telar criollo",
  "Hilado a mano",
  "Tintes botanicos",
  "Piezas con historia",
];

export const quickActions = [
  {
    title: "Ver estaciones",
    description: "Explorar nodos territoriales de la ruta",
    href: "/estaciones",
  },
  {
    title: "Recorrido sugerido",
    description: "Abrir una narrativa guiada del territorio",
    href: "/recorridos",
  },
  {
    title: "Descubrir imperdibles",
    description: "Ver atractivos, actividades y eventos",
    href: "/imperdibles",
  },
];

export function getExperienceBySlug(slug: string): Experience | undefined {
  return experiences.find((experience) => experience.slug === slug);
}

export function getArtisanBySlug(slug: string): Artisan | undefined {
  return artisans.find((artisan) => artisan.slug === slug);
}

export function getStationBySlug(slug: string): Station | undefined {
  return stations.find((station) => station.slug === slug);
}

export function getHighlightSpotBySlug(slug: string): HighlightSpot | undefined {
  return highlightSpots.find((spot) => spot.slug === slug);
}

// ── Productos ────────────────────────────────────────────────────────────────

export type Product = {
  recordId?: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  techniques: string[];
  imageUrl?: string;
  stationName?: string;
  stationSlug?: string;
  stationRecordId?: string;
  relatedActorRecordIds?: string[];
};

export const products = [
  {
    slug: "manta-guarda-amaicha",
    name: "Manta con guarda local",
    description:
      "Tejida en telar criollo con lana natural teñida con añil y nogal. Guarda geométrica transmitida de generación en generación en la zona de Amaicha.",
    category: "Tejido",
    subcategory: "Mantas y ponchos",
    techniques: ["Telar criollo", "Guarda geométrica", "Tinte natural"],
    stationName: "Estacion Amaicha del Valle",
    stationSlug: "amaicha-del-valle",
  },
  {
    slug: "chal-fibra-natural",
    name: "Chal de fibra natural",
    description:
      "Pieza liviana elaborada con hilado fino a mano. Ideal para abrigo suave, con una paleta de colores obtenidos de plantas locales.",
    category: "Tejido",
    subcategory: "Accesorios",
    techniques: ["Hilado manual", "Torsión fina"],
    stationName: "Estacion El Paso",
    stationSlug: "el-paso",
  },
  {
    slug: "ruana-tonos-tierra",
    name: "Ruana otoñal en tonos tierra",
    description:
      "Ruana elaborada con técnica de tintes botánicos estacionales. La paleta varía según la recolección de plantas del año.",
    category: "Tejido",
    subcategory: "Mantas y ponchos",
    techniques: ["Tintes botánicos", "Paleta estacional"],
    stationName: "Estacion Santa Maria",
    stationSlug: "santa-maria",
  },
  {
    slug: "alfombra-lana-cruda",
    name: "Alfombra de lana cruda",
    description:
      "Alfombra tejida en telar horizontal con lana sin teñir, conservando los tonos naturales de la fibra originaria.",
    category: "Tejido",
    subcategory: "Textiles del hogar",
    techniques: ["Telar horizontal", "Lana sin teñir"],
    stationName: "Estacion Amaicha del Valle",
    stationSlug: "amaicha-del-valle",
  },
  {
    slug: "bolso-cuero-tejido",
    name: "Bolso en cuero y tejido combinado",
    description:
      "Pieza que combina tejido artesanal con elementos en cuero trabajado localmente. Producción limitada con encargo previo.",
    category: "Artesanía mixta",
    subcategory: "Accesorios",
    techniques: ["Tejido y cuero", "Producción por encargo"],
    stationName: "Estacion El Paso",
    stationSlug: "el-paso",
  },
  {
    slug: "faja-tradicional",
    name: "Faja tradicional",
    description:
      "Faja tejida con guardas simbólicas propias de la región. Pieza de uso cotidiano y ceremonial con técnica ancestral.",
    category: "Tejido",
    subcategory: "Accesorios",
    techniques: ["Guardas simbólicas", "Técnica ancestral"],
    stationName: "Estacion Santa Maria",
    stationSlug: "santa-maria",
  },
] satisfies Product[];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

