import {
  artisans as artisanMocks,
  experiences as experienceMocks,
  highlightSpots as highlightSpotMocks,
  products as productMocks,
  getArtisanBySlug as getMockArtisanBySlug,
  getExperienceBySlug as getMockExperienceBySlug,
  getHighlightSpotBySlug as getMockHighlightSpotBySlug,
  getProductBySlug as getMockProductBySlug,
  getStationBySlug as getMockStationBySlug,
  stations as stationMocks,
  type Artisan,
  type Experience,
  type HighlightSpot,
  type Product,
  type Station,
} from "@/app/lib/content";
import {
  getPocketBaseList,
  getPocketBaseFileUrl,
  type PocketBaseRecord,
} from "@/app/lib/pocketbase";

export type DataSource = "pocketbase" | "mock";

export type DataResult<TItem> = {
  items: TItem[];
  source: DataSource;
  error?: string;
};

export type SuggestedJourneyStep = {
  title: string;
  description: string;
  href?: string;
};

export type SuggestedJourney = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  theme: string;
  station: Station;
  experiences: Experience[];
  artisans: Artisan[];
  highlightSpots: HighlightSpot[];
  leadExperience?: Experience;
  leadArtisan?: Artisan;
  leadHighlightSpot?: HighlightSpot;
  steps: SuggestedJourneyStep[];
};

function getPathValue(source: unknown, path: string) {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined,
      source,
    );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function looksMojibake(value: string) {
  return /Ã.|Â.|â€|â€™|â€œ|â€|â€“|â€”/.test(value);
}

function repairMojibake(value: string) {
  let result = value;

  for (let i = 0; i < 2; i += 1) {
    if (!looksMojibake(result)) {
      break;
    }

    const repaired = Buffer.from(result, "latin1").toString("utf8");

    if (!repaired || repaired === result) {
      break;
    }

    result = repaired;
  }

  return result;
}

function decodeHtmlEntities(value: string) {
  return repairMojibake(
    value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&aacute;/gi, "a")
    .replace(/&eacute;/gi, "e")
    .replace(/&iacute;/gi, "i")
    .replace(/&oacute;/gi, "o")
    .replace(/&uacute;/gi, "u")
    .replace(/&Aacute;/g, "A")
    .replace(/&Eacute;/g, "E")
    .replace(/&Iacute;/g, "I")
    .replace(/&Oacute;/g, "O")
    .replace(/&Uacute;/g, "U")
    .replace(/&ntilde;/gi, "n")
    .replace(/&Ntilde;/g, "N")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code))),
  );
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function cleanText(value: string) {
  return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

function readExpandedRelationNames(record: PocketBaseRecord, expandKey: string): string[] {
  const expandData = record.expand as Record<string, unknown> | undefined;
  const expanded = expandData?.[expandKey];
  if (!Array.isArray(expanded)) return [];
  return (expanded as Array<unknown>)
    .map((item) => {
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const raw = obj.nombre ?? obj.name ?? obj.title;
        return typeof raw === "string" ? cleanText(raw.trim()) : "";
      }
      return "";
    })
    .filter(Boolean);
}

function readString(
  record: PocketBaseRecord,
  keys: string[],
  fallback = "",
) {
  for (const key of keys) {
    const value = getPathValue(record, key);

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function readNumber(record: PocketBaseRecord, keys: string[]) {
  for (const key of keys) {
    const value = getPathValue(record, key);

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function readDisplayString(
  record: PocketBaseRecord,
  keys: string[],
  fallback = "",
) {
  return cleanText(readString(record, keys, fallback));
}

function readStringArray(record: PocketBaseRecord, keys: string[]) {
  for (const key of keys) {
    const value = getPathValue(record, key);

    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function readDisplayStringArray(record: PocketBaseRecord, keys: string[]) {
  return uniqueStrings(readStringArray(record, keys).map(cleanText));
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function getFileNames(record: PocketBaseRecord, keys: string[]) {
  const values = uniqueStrings(readStringArray(record, keys));
  return values.filter((value) => !value.startsWith("http"));
}

function readIdArray(record: PocketBaseRecord, keys: string[]) {
  return uniqueStrings(readStringArray(record, keys));
}

function getFileUrlList(record: PocketBaseRecord, keys: string[]) {
  return getFileNames(record, keys)
    .map((fileName) => getPocketBaseFileUrl(record, fileName))
    .filter((value): value is string => Boolean(value));
}

function getPrimaryImageUrl(record: PocketBaseRecord, keys: string[]) {
  return getFileUrlList(record, keys)[0];
}

function resolveExperienceIncludes(record: PocketBaseRecord) {
  const values = uniqueStrings([
    ...readDisplayStringArray(record, ["recomendaciones", "includes", "highlights"]),
  ]);

  if (values.length > 0) {
    return values;
  }

  const fallback = uniqueStrings([
    readDisplayString(record, ["expand.categoria.nombre"], ""),
    readDisplayString(record, ["expand.responsable.nombre"], ""),
    readDisplayString(record, ["expand.estacion_id.nombre"], ""),
  ]);

  return fallback.length > 0 ? fallback : ["Experiencia disponible"];
}

function resolveExperienceStops(record: PocketBaseRecord) {
  const values = uniqueStrings([
    ...readDisplayStringArray(record, ["stops", "waypoints", "points"]),
    readDisplayString(record, ["ubicacion"], ""),
    readDisplayString(record, ["expand.estacion_id.nombre"], ""),
    readDisplayString(record, ["expand.estacion_id.localidad"], ""),
  ]);

  return values.length > 0 ? values : ["Ruta del Telar"];
}

function normalizeExperience(record: PocketBaseRecord): Experience | null {
  const title = readDisplayString(record, ["titulo", "title", "name"]);
  const slug = readString(record, ["slug", "handle"], slugify(title));

  if (!slug || !title) {
    return null;
  }

  return {
    recordId: record.id,
    slug,
    title,
    description: stripHtml(
      readString(
        record,
        ["descripcion", "description", "excerpt", "shortDescription"],
        "Experiencia disponible en la Ruta del Telar.",
      ),
    ),
    tag: readDisplayString(
      record,
      ["expand.categoria.nombre", "tag", "badge", "category"],
      "Experiencia",
    ),
    duration: readDisplayString(
      record,
      ["duracion", "duration", "estimatedTime"],
      "A confirmar",
    ),
    location: readDisplayString(
      record,
      [
        "ubicacion",
        "expand.estacion_id.localidad",
        "expand.estacion_id.nombre",
        "location",
        "place",
      ],
      "Ruta del Telar",
    ),
    intensity: readDisplayString(record, ["intensity", "pace"], "A definir"),
    summary: stripHtml(
      readString(
        record,
        ["descripcion", "recomendaciones", "summary", "body", "content"],
        "Experiencia cargada desde PocketBase.",
      ),
    ),
    includes: resolveExperienceIncludes(record),
    stops: resolveExperienceStops(record),
    imageUrl:
      getPrimaryImageUrl(record, ["fotos"]) ||
      getPrimaryImageUrl(record, ["expand.estacion_id.foto_portada", "expand.estacion_id.galeria_fotos"]),
    stationName: readDisplayString(record, ["expand.estacion_id.nombre"], ""),
    stationRecordId: readString(record, ["estacion_id", "expand.estacion_id.id"], ""),
    stationSlug: readString(
      record,
      ["expand.estacion_id.slug"],
      slugify(readString(record, ["expand.estacion_id.localidad", "expand.estacion_id.nombre"], "")),
    ),
    responsibleName: readDisplayString(record, ["expand.responsable.nombre"], ""),
    responsibleRecordId: readString(
      record,
      ["responsable", "expand.responsable.id"],
      "",
    ),
    responsibleSlug: readString(
      record,
      ["expand.responsable.slug"],
      slugify(readString(record, ["expand.responsable.nombre"], "")),
    ),
  };
}

function isArtisanRecord(record: PocketBaseRecord) {
  const typeName = readDisplayString(record, ["expand.tipo.nombre"], "").toLowerCase();
  const name = readDisplayString(record, ["nombre", "name", "title"], "").toLowerCase();
  const description = readDisplayString(record, ["descripcion", "summary", "description"], "").toLowerCase();

  if (typeName) {
    return typeName.includes("artesan");
  }

  if (
    /artesan|textil|telar|hiland|tejedor|tejido|lana|poncho|manta|alfombra|ruana|tinte|faja/.test(
      `${name} ${description}`,
    )
  ) {
    return true;
  }

  return (
    readStringArray(record, ["tecnicas", "materiales", "productos_ofrecidos"])
      .length > 0 ||
    Boolean(getPathValue(record, "visitas_demostraciones")) ||
    Boolean(name)
  );
}

function inferActorCraft(record: PocketBaseRecord) {
  const fromType = readDisplayString(record, ["expand.tipo.nombre"], "");

  if (fromType) {
    return fromType;
  }

  const description = readDisplayString(
    record,
    ["descripcion", "summary", "description"],
    "",
  ).toLowerCase();

  if (description.includes("tinte")) return "Tintes naturales y tejido";
  if (description.includes("alfombra")) return "Alfombras y piezas textiles";
  if (description.includes("poncho")) return "Ponchos y tejidos regionales";
  if (description.includes("hil")) return "Hilado y tejido artesanal";
  if (description.includes("telar")) return "Tejido en telar";

  return "Actor artesanal";
}

function normalizeArtisan(record: PocketBaseRecord): Artisan | null {
  const name = readDisplayString(record, ["nombre", "name", "title"]);
  const slug = readString(record, ["slug", "handle"], slugify(name));

  if (!isArtisanRecord(record)) {
    return null;
  }

  if (!slug || !name) {
    return null;
  }

  const techniques = uniqueStrings([
    ...readDisplayStringArray(record, ["tecnicas", "materiales"]),
  ]);
  const offeredProducts = uniqueStrings([
    ...readDisplayStringArray(record, ["productos_ofrecidos"]),
  ]);
  const craft =
    techniques.slice(0, 2).join(" • ") ||
    offeredProducts[0] ||
    inferActorCraft(record);

  return {
    recordId: record.id,
    slug,
    name,
    place: readDisplayString(
      record,
      [
        "expand.estacion_id.nombre",
        "expand.estacion_id.localidad",
        "ubicacion",
        "place",
        "location",
      ],
      "Ruta del Telar",
    ),
    craft,
    actorType: readDisplayString(record, ["expand.tipo.nombre", "tipo"], "artesano"),
    bio: stripHtml(
      readString(
        record,
        ["descripcion", "bio", "summary", "description"],
        "Perfil cargado desde PocketBase.",
      ),
    ),
    techniques: techniques.length > 0 ? techniques : ["Tecnica artesanal"],
    years: readDisplayString(
      record,
      ["disponibilidad", "years", "experienceLabel"],
      "Perfil artesanal",
    ),
    featuredPiece:
      offeredProducts[0] ||
      readDisplayString(
        record,
        ["featuredPiece", "featured_piece", "piece"],
        "Pieza destacada",
      ),
    imageUrl: getPrimaryImageUrl(record, ["fotos"]),
    stationName: readDisplayString(record, ["expand.estacion_id.nombre"], ""),
    stationRecordId: readString(
      record,
      ["estacion_id", "expand.estacion_id.id"],
      "",
    ),
    stationSlug: readString(
      record,
      ["expand.estacion_id.slug"],
      slugify(
        readString(record, ["expand.estacion_id.localidad", "expand.estacion_id.nombre"], ""),
      ),
    ),
    contactPhone: readDisplayString(record, ["contacto_telefono"], ""),
    contactEmail: readDisplayString(record, ["contacto_email"], "") || undefined,
    address: readDisplayString(record, ["ubicacion"], ""),
    latitude: readNumber(record, ["latitud"]),
    longitude: readNumber(record, ["longitud"]),
    // Artesano / Productor
    materials: readDisplayStringArray(record, ["materiales"]).length > 0
      ? readDisplayStringArray(record, ["materiales"])
      : undefined,
    productosOfrecidos: readDisplayStringArray(record, ["productos_ofrecidos"]).length > 0
      ? readDisplayStringArray(record, ["productos_ofrecidos"])
      : undefined,
    visitasDisponibles: readDisplayString(record, ["visitas_demostraciones", "disponibilidad"], "") || undefined,
    // Productor
    rubroProductivo: readDisplayString(record, ["rubro_productivo"], "") || undefined,
    escalaProduccion: readDisplayString(record, ["escala_produccion"], "") || undefined,
    modalidadVenta: readDisplayString(record, ["modalidad_venta", "modalidad_servicio"], "") || undefined,
    // Hospedaje
    tipoHospedaje: readDisplayString(record, ["tipo_hospedaje"], "") || undefined,
    capacidad: readDisplayString(record, ["capacidad"], "") || undefined,
    servicios: readDisplayString(record, ["servicios", "servicios_adicionales"], "") || undefined,
    horarios: readDisplayString(record, ["horarios"], "") || undefined,
    // Gastronómico
    tipoPropuesta: readDisplayString(record, ["tipo_propuesta"], "") || undefined,
    especialidades: readDisplayString(record, ["especialidades"], "") || undefined,
    platosDestacados: readDisplayString(record, ["platos_destacados"], "") || undefined,
    // Guía
    idiomas: readDisplayStringArray(record, ["idiomas"]).length > 0
      ? readDisplayStringArray(record, ["idiomas"])
      : undefined,
    recorridosOfrecidos: readDisplayString(record, ["recorridos_ofrecidos", "duracion_recorridos"], "") || undefined,
    zonaCobertura: readDisplayString(record, ["zona_cobertura"], "") || undefined,
    puntoEncuentro: readDisplayString(record, ["punto_encuentro"], "") || undefined,
  };
}

function normalizeStation(record: PocketBaseRecord): Station | null {
  const locality = readDisplayString(record, ["localidad", "nombre"]);
  const name = readDisplayString(
    record,
    ["nombre", "title", "name"],
    locality ? `Estacion ${locality}` : "",
  );
  const slug = readString(record, ["slug", "handle"], slugify(locality || name));

  if (!slug || !name) {
    return null;
  }

  return {
    recordId: record.id,
    slug,
    name,
    locality: readDisplayString(record, ["localidad", "nombre"], "Ruta del Telar"),
    department: readDisplayString(record, ["expand.departamento.nombre", "departamento"], "") || undefined,
    slogan: readDisplayString(record, ["eslogan"], "Nodo territorial de la ruta"),
    summary: stripHtml(
      readString(
        record,
        ["descripcion_general", "summary", "description"],
        "Estacion cargada desde PocketBase.",
      ),
    ),
    status: readString(record, ["estado"], "aprobado"),
    hasInauguratedStation: Boolean(getPathValue(record, "posee_estacion_inaugurada")),
    imageUrl:
      getPrimaryImageUrl(record, ["foto_portada", "galeria_fotos", "fotos"]),
    galleryUrls: getFileUrlList(record, ["galeria_fotos", "fotos"]),
    latitude: readNumber(record, ["latitud"]),
    longitude: readNumber(record, ["longitud"]),
  };
}

function normalizeHighlightSpot(record: PocketBaseRecord): HighlightSpot | null {
  const title = readDisplayString(record, ["titulo", "title", "name"]);
  const slug = readString(record, ["slug", "handle"], slugify(title));

  if (!slug || !title) {
    return null;
  }

  return {
    recordId: record.id,
    slug,
    title,
    subtitle: readDisplayString(record, ["subtitulo"], "Experiencia destacada"),
    description: stripHtml(
      readString(
        record,
        ["descripcion", "summary", "description"],
        "Imperdible cargado desde PocketBase.",
      ),
    ),
    type: readDisplayString(record, ["expand.tipo.nombre", "tipo"], "imperdible"),
    eventDate: readString(record, ["fecha_hora_evento"], "") || undefined,
    location: readDisplayString(
      record,
      [
        "ubicacion",
        "expand.estacion_id.localidad",
        "expand.estacion_id.nombre",
      ],
      "Ruta del Telar",
    ),
    priority: readDisplayString(
      record,
      ["expand.prioridad.nombre", "prioridad"],
      "media",
    ),
    imageUrl:
      getPrimaryImageUrl(record, ["fotos"]) ||
      getPrimaryImageUrl(record, ["expand.estacion_id.foto_portada", "expand.estacion_id.galeria_fotos"]),
    stationName: readDisplayString(record, ["expand.estacion_id.nombre"], ""),
    stationRecordId: readString(
      record,
      ["estacion_id", "expand.estacion_id.id"],
      "",
    ),
    stationSlug: readString(
      record,
      ["expand.estacion_id.slug"],
      slugify(readString(record, ["expand.estacion_id.localidad", "expand.estacion_id.nombre"], "")),
    ),
    relatedExperienceRecordIds: readIdArray(record, ["experiencias_relacionadas"]),
    relatedArtisanRecordIds: readIdArray(record, ["actores_relacionados"]),
    relatedProductRecordIds: readIdArray(record, ["productos_relacionados"]),
    galleryUrls: getFileUrlList(record, ["fotos"]),
    horarios: readDisplayString(record, ["horarios"], "") || undefined,
    accesibilidad: readDisplayString(record, ["accesibilidad"], "") || undefined,
    estacionalidad: readDisplayString(record, ["estacionalidad"], "") || undefined,
    duracionSugerida: readDisplayString(record, ["duracion_sugerida"], "") || undefined,
    recomendaciones: readDisplayStringArray(record, ["recomendaciones"]).length > 0
      ? readDisplayStringArray(record, ["recomendaciones"])
      : undefined,
    latitude: readNumber(record, ["latitud"]),
    longitude: readNumber(record, ["longitud"]),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Error desconocido";
}

function createMockResult<TItem>(
  items: TItem[],
  error?: string,
): DataResult<TItem> {
  return {
    items,
    source: "mock",
    error,
  };
}

export async function getExperiencesResult(): Promise<DataResult<Experience>> {
  try {
    const response = await getPocketBaseList("experiences", {
      filter: 'estado = "aprobado"',
      expand: "categoria,responsable,estacion_id",
      perPage: 100,
      sort: "-created",
    });

    if (!response) {
      return createMockResult(
        experienceMocks,
        "PocketBase no esta configurado para experiencias",
      );
    }

    const experiences = response.items
      .map(normalizeExperience)
      .filter((item): item is Experience => item !== null);

    if (experiences.length === 0) {
      return createMockResult(
        experienceMocks,
        "No se pudieron mapear experiencias reales",
      );
    }

    return {
      items: experiences,
      source: "pocketbase",
    };
  } catch (error) {
    return createMockResult(experienceMocks, getErrorMessage(error));
  }
}

export async function getExperiences() {
  const result = await getExperiencesResult();
  return result.items;
}

export async function getExperienceBySlug(slug: string) {
  const experiences = await getExperiences();
  return (
    experiences.find((experience) => experience.slug === slug) ??
    getMockExperienceBySlug(slug)
  );
}

export async function getArtisansResult(): Promise<DataResult<Artisan>> {
  try {
    const response = await getPocketBaseList("artisans", {
      filter: 'estado = "aprobado"',
      expand: "tipo,estacion_id",
      perPage: 100,
      sort: "-created",
    });

    if (!response) {
      return createMockResult(
        artisanMocks,
        "PocketBase no esta configurado para actores",
      );
    }

    const artisans = response.items
      .map(normalizeArtisan)
      .filter((item): item is Artisan => item !== null);

    if (artisans.length === 0) {
      return createMockResult(
        artisanMocks,
        "No se pudieron mapear artesanas reales",
      );
    }

    return {
      items: artisans,
      source: "pocketbase",
    };
  } catch (error) {
    return createMockResult(artisanMocks, getErrorMessage(error));
  }
}

export async function getStationsResult(): Promise<DataResult<Station>> {
  try {
    const response = await getPocketBaseList("stations", {
      filter: 'estado = "aprobado"',
      expand: "departamento",
      perPage: 100,
      sort: "nombre",
    });

    if (!response) {
      return createMockResult(
        stationMocks,
        "PocketBase no esta configurado para estaciones",
      );
    }

    const stations = response.items
      .map(normalizeStation)
      .filter((item): item is Station => item !== null);

    if (stations.length === 0) {
      return createMockResult(
        stationMocks,
        "No se pudieron mapear estaciones reales",
      );
    }

    return {
      items: stations,
      source: "pocketbase",
    };
  } catch (error) {
    return createMockResult(stationMocks, getErrorMessage(error));
  }
}

export async function getStations() {
  const result = await getStationsResult();
  return result.items;
}

export async function getStationBySlug(slug: string) {
  const stations = await getStations();
  return stations.find((station) => station.slug === slug) ?? getMockStationBySlug(slug);
}

export async function getHighlightSpotsResult(): Promise<DataResult<HighlightSpot>> {
  try {
    const response = await getPocketBaseList("highlightSpots", {
      filter: 'estado = "aprobado"',
      expand:
        "tipo,prioridad,estacion_id,actores_relacionados,experiencias_relacionadas,productos_relacionados",
      perPage: 100,
      sort: "-created",
    });

    if (!response) {
      return createMockResult(
        highlightSpotMocks,
        "PocketBase no esta configurado para imperdibles",
      );
    }

    const spots = response.items
      .map(normalizeHighlightSpot)
      .filter((item): item is HighlightSpot => item !== null);

    if (spots.length === 0) {
      return createMockResult(
        highlightSpotMocks,
        "No se pudieron mapear imperdibles reales",
      );
    }

    return {
      items: spots,
      source: "pocketbase",
    };
  } catch (error) {
    return createMockResult(highlightSpotMocks, getErrorMessage(error));
  }
}

export async function getHighlightSpots() {
  const result = await getHighlightSpotsResult();
  return result.items;
}

export async function getHighlightSpotBySlug(slug: string) {
  const spots = await getHighlightSpots();
  return spots.find((spot) => spot.slug === slug) ?? getMockHighlightSpotBySlug(slug);
}

export async function getArtisans() {
  const result = await getArtisansResult();
  return result.items;
}

export async function getArtisanBySlug(slug: string) {
  const artisans = await getArtisans();
  return (
    artisans.find((artisan) => artisan.slug === slug) ?? getMockArtisanBySlug(slug)
  );
}

function matchesStationTerritory(station: Station, value: string) {
  const normalizedValue = normalizeText(value);

  return [station.name, station.locality].some((candidate) =>
    normalizedValue.includes(normalizeText(candidate)),
  );
}

function sameRecordId(a?: string, b?: string) {
  return Boolean(a && b && a === b);
}

export async function getStationContextBySlug(slug: string) {
  const [station, experiences, artisans, spots, products] = await Promise.all([
    getStationBySlug(slug),
    getExperiences(),
    getArtisans(),
    getHighlightSpots(),
    getProducts(),
  ]);

  if (!station) {
    return null;
  }

  return {
    station,
    experiences: experiences.filter((item) =>
      sameRecordId(item.stationRecordId, station.recordId) ||
      matchesStationTerritory(station, item.location),
    ),
    artisans: artisans.filter((item) =>
      sameRecordId(item.stationRecordId, station.recordId) ||
      matchesStationTerritory(station, item.place),
    ),
    highlightSpots: spots.filter((item) =>
      sameRecordId(item.stationRecordId, station.recordId) ||
      matchesStationTerritory(station, item.location),
    ),
    products: products.filter((item) =>
      sameRecordId(item.stationRecordId, station.recordId) ||
      (item.stationSlug ? item.stationSlug === station.slug : false) ||
      matchesStationTerritory(station, item.stationName ?? ""),
    ),
  };
}

export async function getHighlightSpotContextBySlug(slug: string) {
  const [spot, stations, experiences, artisans, products] = await Promise.all([
    getHighlightSpotBySlug(slug),
    getStations(),
    getExperiences(),
    getArtisans(),
    getProducts(),
  ]);

  if (!spot) {
    return null;
  }

  const relatedStation =
    stations.find(
      (station) =>
        sameRecordId(station.recordId, spot.stationRecordId) ||
        matchesStationTerritory(station, spot.location),
    ) ??
    null;

  const relatedExperiences = experiences.filter((item) =>
    (item.recordId && spot.relatedExperienceRecordIds?.includes(item.recordId)) ||
    sameRecordId(item.stationRecordId, spot.stationRecordId) ||
    normalizeText(item.location).includes(normalizeText(spot.location)),
  );
  const relatedArtisans = artisans.filter((item) =>
    (item.recordId && spot.relatedArtisanRecordIds?.includes(item.recordId)) ||
    sameRecordId(item.stationRecordId, spot.stationRecordId) ||
    normalizeText(item.place).includes(normalizeText(spot.location)),
  );
  const relatedProducts = products.filter((item) =>
    (item.recordId && spot.relatedProductRecordIds?.includes(item.recordId)) ||
    sameRecordId(item.stationRecordId, spot.stationRecordId),
  );

  return {
    spot,
    relatedStation,
    relatedExperiences,
    relatedArtisans,
    relatedProducts,
  };
}

export async function getExperienceContextBySlug(slug: string) {
  const [experience, stations, artisans, spots] = await Promise.all([
    getExperienceBySlug(slug),
    getStations(),
    getArtisans(),
    getHighlightSpots(),
  ]);

  if (!experience) {
    return null;
  }

  const relatedStation =
    stations.find((station) =>
      sameRecordId(station.recordId, experience.stationRecordId) ||
      (experience.stationSlug
        ? station.slug === experience.stationSlug
        : matchesStationTerritory(station, experience.location)),
    ) ?? null;

  const responsibleArtisan =
    artisans.find((artisan) =>
      sameRecordId(artisan.recordId, experience.responsibleRecordId) ||
      (experience.responsibleSlug
        ? artisan.slug === experience.responsibleSlug
        : normalizeText(artisan.name) === normalizeText(experience.responsibleName ?? "")),
    ) ?? null;

  const relatedHighlightSpots = spots.filter((spot) =>
    relatedStation
      ? (experience.recordId
          ? spot.relatedExperienceRecordIds?.includes(experience.recordId)
          : false) ||
        sameRecordId(spot.stationRecordId, relatedStation.recordId) ||
        matchesStationTerritory(relatedStation, spot.location)
      : normalizeText(spot.location).includes(normalizeText(experience.location)),
  );

  return {
    experience,
    relatedStation,
    responsibleArtisan,
    relatedHighlightSpots,
  };
}

export async function getArtisanContextBySlug(slug: string) {
  const [artisan, stations, experiences, spots, products] = await Promise.all([
    getArtisanBySlug(slug),
    getStations(),
    getExperiences(),
    getHighlightSpots(),
    getProducts(),
  ]);

  if (!artisan) {
    return null;
  }

  const relatedStation =
    stations.find((station) =>
      sameRecordId(station.recordId, artisan.stationRecordId) ||
      (artisan.stationSlug
        ? station.slug === artisan.stationSlug
        : matchesStationTerritory(station, artisan.place)),
    ) ?? null;

  const relatedExperiences = experiences.filter((experience) => {
    const byResponsible =
      sameRecordId(experience.responsibleRecordId, artisan.recordId) ||
      (artisan.slug &&
        experience.responsibleSlug &&
        experience.responsibleSlug === artisan.slug);

    const byTerritory = relatedStation
      ? sameRecordId(experience.stationRecordId, relatedStation.recordId) ||
        matchesStationTerritory(relatedStation, experience.location)
      : normalizeText(experience.location).includes(normalizeText(artisan.place));

    return byResponsible || byTerritory;
  });

  const relatedHighlightSpots = spots.filter((spot) =>
    relatedStation
      ? sameRecordId(spot.stationRecordId, relatedStation.recordId) ||
        (artisan.recordId ? spot.relatedArtisanRecordIds?.includes(artisan.recordId) : false) ||
        matchesStationTerritory(relatedStation, spot.location)
      : normalizeText(spot.location).includes(normalizeText(artisan.place)),
  );

  const relatedProducts = products.filter((p) =>
    (artisan.recordId && p.relatedActorRecordIds?.includes(artisan.recordId)) ||
    (relatedStation
      ? sameRecordId(p.stationRecordId, relatedStation.recordId) ||
        (p.stationSlug ? p.stationSlug === relatedStation.slug : false)
      : false),
  );

  return {
    artisan,
    relatedStation,
    relatedExperiences,
    relatedHighlightSpots,
    relatedProducts,
  };
}

function buildJourneySteps(
  station: Station,
  experience?: Experience,
  artisan?: Artisan,
  spot?: HighlightSpot,
) {
  const steps: SuggestedJourneyStep[] = [
    {
      title: `Llegada a ${station.locality}`,
      description: station.slogan || station.summary,
      href: `/estaciones/${station.slug}`,
    },
  ];

  if (experience) {
    steps.push({
      title: experience.title,
      description: experience.description,
      href: `/explorar/${experience.slug}`,
    });
  }

  if (artisan) {
    steps.push({
      title: `Encuentro con ${artisan.name}`,
      description: artisan.craft,
      href: `/artesanas/${artisan.slug}`,
    });
  }

  if (spot) {
    steps.push({
      title: spot.title,
      description: spot.subtitle || spot.description,
      href: `/imperdibles/${spot.slug}`,
    });
  }

  return steps;
}

export async function getSuggestedJourneys(): Promise<SuggestedJourney[]> {
  const [stations, experiences, artisans, highlightSpots] = await Promise.all([
    getStations(),
    getExperiences(),
    getArtisans(),
    getHighlightSpots(),
  ]);

  const journeys = stations.reduce<SuggestedJourney[]>((accumulator, station) => {
      const stationExperiences = experiences.filter(
        (experience) =>
          sameRecordId(experience.stationRecordId, station.recordId) ||
          matchesStationTerritory(station, experience.location),
      );
      const stationArtisans = artisans.filter(
        (artisan) =>
          sameRecordId(artisan.stationRecordId, station.recordId) ||
          matchesStationTerritory(station, artisan.place),
      );
      const stationHighlightSpots = highlightSpots.filter(
        (spot) =>
          sameRecordId(spot.stationRecordId, station.recordId) ||
          matchesStationTerritory(station, spot.location),
      );

      const leadExperience = stationExperiences[0];
      const leadArtisan = stationArtisans[0];
      const leadHighlightSpot = stationHighlightSpots[0];

      if (!leadExperience && !leadArtisan && !leadHighlightSpot) {
        return accumulator;
      }

      const duration =
        leadExperience?.duration ||
        `${Math.max(2, stationExperiences.length + stationHighlightSpots.length)} paradas sugeridas`;
      const theme =
        leadArtisan?.craft ||
        leadHighlightSpot?.type ||
        leadExperience?.tag ||
        "Recorrido territorial";

      accumulator.push({
        slug: `recorrido-${station.slug}`,
        title: `Recorrido sugerido por ${station.locality}`,
        description:
          leadExperience?.summary ||
          station.summary ||
          "Una manera simple de recorrer la Ruta del Telar desde una estacion concreta.",
        duration,
        theme,
        station,
        experiences: stationExperiences,
        artisans: stationArtisans,
        highlightSpots: stationHighlightSpots,
        leadExperience,
        leadArtisan,
        leadHighlightSpot,
        steps: buildJourneySteps(
          station,
          leadExperience,
          leadArtisan,
          leadHighlightSpot,
        ),
      });

      return accumulator;
    }, []);

  return journeys.length > 0
    ? journeys
    : [
        {
          slug: "recorrido-ruta-del-telar",
          title: "Recorrido sugerido por la Ruta del Telar",
          description:
            "Una composicion inicial para explorar estaciones, actores e imperdibles destacados.",
          duration: "Flexible",
          theme: "Descubrimiento territorial",
          station: stationMocks[0],
          experiences: experienceMocks.slice(0, 2),
          artisans: artisanMocks.slice(0, 2),
          highlightSpots: highlightSpotMocks.slice(0, 2),
          leadExperience: experienceMocks[0],
          leadArtisan: artisanMocks[0],
          leadHighlightSpot: highlightSpotMocks[0],
          steps: buildJourneySteps(
            stationMocks[0],
            experienceMocks[0],
            artisanMocks[0],
            highlightSpotMocks[0],
          ),
        },
      ];
}

export async function getSuggestedJourneyBySlug(slug: string) {
  const journeys = await getSuggestedJourneys();
  return journeys.find((journey) => journey.slug === slug) ?? null;
}

// ── Productos ────────────────────────────────────────────────────────────────

function resolveProductStation(record: PocketBaseRecord): { name: string; slug: string; recordId: string } {
  // Try legacy estacion_id first, then estaciones_relacionadas (array)
  const legacyName = readDisplayString(record, ["expand.estacion_id.nombre"], "");
  if (legacyName) {
    return {
      name: legacyName,
      slug: readString(
        record,
        ["expand.estacion_id.slug"],
        slugify(readString(record, ["expand.estacion_id.localidad", "expand.estacion_id.nombre"], "")),
      ),
      recordId: readString(record, ["estacion_id", "expand.estacion_id.id"], ""),
    };
  }
  // Try first of estaciones_relacionadas
  const relatedNames = readExpandedRelationNames(record, "estaciones_relacionadas");
  if (relatedNames.length > 0) {
    const expandData = record.expand as Record<string, unknown> | undefined;
    const relatedStations = expandData?.["estaciones_relacionadas"] as Array<Record<string, unknown>> | undefined;
    const first = relatedStations?.[0];
    return {
      name: relatedNames[0],
      slug: readString({ ...(first ?? {}), id: first?.id ?? "", expand: {} }, ["slug"], slugify(relatedNames[0])),
      recordId: String(first?.id ?? ""),
    };
  }
  return { name: "", slug: "", recordId: "" };
}

function normalizeProduct(record: PocketBaseRecord): Product | null {
  const name = readDisplayString(record, ["nombre", "name", "title"]);
  const slug = readString(record, ["slug", "handle"], slugify(name));

  if (!slug || !name) {
    return null;
  }

  // Techniques: relation to tecnicas_producto, expanded as array of records with nombre
  const techniquesFromExpand = readExpandedRelationNames(record, "tecnicas");
  const techniques = uniqueStrings([
    ...techniquesFromExpand,
    // Fallback: category name as a pseudo-technique if no techniques found
    ...(techniquesFromExpand.length === 0
      ? [readDisplayString(record, ["expand.categoria.nombre"], "")]
      : []),
  ]).filter(Boolean);

  const station = resolveProductStation(record);

  return {
    recordId: record.id,
    slug,
    name,
    description: stripHtml(
      readString(record, ["descripcion", "description"], "Producto disponible en la Ruta del Telar."),
    ),
    category: readDisplayString(record, ["expand.categoria.nombre", "categoria"], "Artesanía"),
    subcategory: readDisplayString(record, ["expand.subcategoria.nombre", "subcategoria"], "") || undefined,
    techniques,
    imageUrl: getPrimaryImageUrl(record, ["fotos"]),
    stationName: station.name || undefined,
    stationRecordId: station.recordId || undefined,
    stationSlug: station.slug || undefined,
    relatedActorRecordIds: readIdArray(record, ["actores_relacionados"]),
  };
}

export async function getProductsResult(): Promise<DataResult<Product>> {
  try {
    const response = await getPocketBaseList("products", {
      // Accept all non-inactive records so partially-reviewed items are visible
      filter: 'estado != "inactivo"',
      expand: "categoria,subcategoria,estacion_id,estaciones_relacionadas,tecnicas,actores_relacionados",
      perPage: 100,
      sort: "nombre",
    });

    if (!response) {
      return createMockResult(productMocks, "PocketBase no esta configurado para productos");
    }

    const items = response.items
      .map(normalizeProduct)
      .filter((item): item is Product => item !== null);

    if (items.length === 0) {
      return createMockResult(productMocks, "No se pudieron mapear productos reales");
    }

    return { items, source: "pocketbase" };
  } catch (error) {
    return createMockResult(productMocks, getErrorMessage(error));
  }
}

export async function getProducts() {
  const result = await getProductsResult();
  return result.items;
}

export async function getProductBySlug(slug: string) {
  const items = await getProducts();
  return items.find((p) => p.slug === slug) ?? getMockProductBySlug(slug);
}

export async function getProductContextBySlug(slug: string) {
  const [product, stations, artisans] = await Promise.all([
    getProductBySlug(slug),
    getStations(),
    getArtisans(),
  ]);

  if (!product) return null;

  const relatedStation =
    stations.find(
      (s) =>
        sameRecordId(s.recordId, product.stationRecordId) ||
        (product.stationSlug ? s.slug === product.stationSlug : false),
    ) ?? null;

  const relatedActors = artisans.filter((a) =>
    (a.recordId && product.relatedActorRecordIds?.includes(a.recordId)) ||
    (relatedStation
      ? sameRecordId(a.stationRecordId, relatedStation.recordId)
      : false),
  );

  return { product, relatedStation, relatedActors };
}

