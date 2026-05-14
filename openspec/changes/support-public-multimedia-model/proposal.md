## Why

The public application must render the multimedia model already available in the admin panel without breaking older PocketBase records that only use `fotos`. Aligning the public read model now keeps listings, detail pages, search, maps, metadata, and related content visually consistent while preserving legacy content.

## What Changes

- Add public support for `foto_portada` as the preferred image for stations, actors, products, experiences, and imperdibles.
- Add public support for `galeria_fotos` as the detail gallery source, combined with compatible legacy `fotos`.
- Preserve `fotos` as a legacy fallback for all affected entity types.
- Deduplicate gallery images by file name and ensure the selected cover image is not repeated in the visible gallery.
- Update shared data normalization helpers and TypeScript types so cards, listings, highlighted sections, search results, map popups, metadata, favorites, and detail views use the same cover and gallery rules.
- Add tests covering new multimedia records, legacy-only records, cover/gallery deduplication, and listing cover selection.

## Capabilities

### New Capabilities
- `public-multimedia`: Covers how the public app reads and renders cover and gallery images for PocketBase-backed public entities.

### Modified Capabilities
- `content-data`: Public content normalization must include `foto_portada`, `galeria_fotos`, and legacy `fotos` handling.
- `public-catalog`: Public listings and detail pages must render the new cover/gallery model.
- `events-and-journeys`: Imperdible, agenda, journey, and related content views must use the new cover/gallery model.
- `search-and-map`: Search results and map summaries must use the normalized cover image.

## Impact

- Affected code: `app/lib/data.ts`, `app/lib/content.ts`, public route pages under `app/`, image-rendering client components under `components/`, and tests under `tests/`.
- Data model: read-only support for PocketBase fields `foto_portada?: string`, `galeria_fotos?: string[]`, and existing `fotos?: string[]`.
- No destructive migrations, no field removal, and no admin editing/upload behavior.
- Dependencies: no new runtime dependency expected.
