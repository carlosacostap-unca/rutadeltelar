## Why

The admin now stores image focus metadata so cropped public images can preserve important faces, objects, and composition. The public app must read that metadata and apply it anywhere images are rendered with `object-fit: cover`, without mutating PocketBase schema or data.

## What Changes

- Read optional `foto_portada_focus_x`, `foto_portada_focus_y`, and `galeria_fotos_focus` fields for stations, actors, products, experiences, and imperdibles.
- Add shared image-focus helpers that default missing or invalid focus values to `50% 50%`.
- Normalize cover focus and gallery-image focus alongside existing `imageUrl` and `galleryUrls` data.
- Apply `object-position` to cropped cover images, thumbnails, cards, list summaries, search/map popups, related-content cards, and cropped gallery thumbnails.
- Preserve current visual layout and avoid image distortion.

## Capabilities

### New Capabilities
- `public-image-focus`: Covers public rendering rules for PocketBase image focus metadata.

### Modified Capabilities
- `content-data`: Entity normalization includes optional image focus fields and default-safe focus outputs.
- `public-catalog`: Public cards, summaries, detail covers, and gallery thumbnails apply normalized focus metadata when cropped.

## Impact

- Affected code: `app/lib/content.ts`, `app/lib/data.ts`, image helpers, public detail pages, catalog client components, home/search/map image renderers, and tests.
- Data model: read-only consumption of `foto_portada_focus_x`, `foto_portada_focus_y`, and `galeria_fotos_focus`.
- No PocketBase migrations, writes, schema changes, or layout redesign.
