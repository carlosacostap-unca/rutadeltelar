type PocketBaseCollectionKey =
  | "experiences"
  | "artisans"
  | "stations"
  | "highlightSpots";

type PocketBaseConfig = {
  baseUrl?: string;
  collections: Record<PocketBaseCollectionKey, string | undefined>;
};

type ListOptions = {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  expand?: string;
};

type PocketBaseListResponse<TRecord> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: TRecord[];
};

export type PocketBaseRecord = Record<string, unknown> & {
  id: string;
  collectionId?: string;
  collectionName?: string;
  created?: string;
  updated?: string;
  expand?: Record<string, unknown>;
};

export type PocketBaseFileRecord = {
  id: string;
  collectionId?: string;
};

function trimTrailingSlash(value?: string) {
  return value?.replace(/\/+$/, "");
}

export function getPocketBaseConfig(): PocketBaseConfig {
  return {
    baseUrl: trimTrailingSlash(
      process.env.POCKETBASE_URL ?? process.env.NEXT_PUBLIC_POCKETBASE_URL,
    ),
    collections: {
      experiences:
        process.env.POCKETBASE_COLLECTION_EXPERIENCES ?? "experiencias",
      artisans: process.env.POCKETBASE_COLLECTION_ARTISANS ?? "actores",
      stations: process.env.POCKETBASE_COLLECTION_STATIONS ?? "estaciones",
      highlightSpots:
        process.env.POCKETBASE_COLLECTION_HIGHLIGHT_SPOTS ?? "imperdibles",
    },
  };
}

export function isPocketBaseConfigured(key: PocketBaseCollectionKey) {
  const config = getPocketBaseConfig();

  return Boolean(config.baseUrl && config.collections[key]);
}

export async function getPocketBaseList(
  key: PocketBaseCollectionKey,
  options: ListOptions = {},
) {
  const config = getPocketBaseConfig();
  const collection = config.collections[key];

  if (!config.baseUrl || !collection) {
    return null;
  }

  const query = new URLSearchParams();
  query.set("page", String(options.page ?? 1));
  query.set("perPage", String(options.perPage ?? 50));

  if (options.filter) query.set("filter", options.filter);
  if (options.sort) query.set("sort", options.sort);
  if (options.expand) query.set("expand", options.expand);

  const response = await fetch(
    `${config.baseUrl}/api/collections/${collection}/records?${query.toString()}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!response.ok) {
    throw new Error(
      `PocketBase request failed for ${collection}: ${response.status}`,
    );
  }

  return (await response.json()) as PocketBaseListResponse<PocketBaseRecord>;
}

export function getPocketBaseFileUrl(
  record: PocketBaseFileRecord,
  fileName?: string,
) {
  const config = getPocketBaseConfig();

  if (!config.baseUrl || !record.collectionId || !record.id || !fileName) {
    return undefined;
  }

  return `${config.baseUrl}/api/files/${record.collectionId}/${record.id}/${fileName}`;
}
