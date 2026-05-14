## Context

The public app normalizes PocketBase records into frontend models in `app/lib/data.ts` and renders those models across App Router pages and client components. Current image handling primarily reads legacy `fotos`, with some newer references already present for selected content, but the rules are not shared consistently across entity types or public surfaces.

The admin now writes a read-only multimedia model for the public app:

- `foto_portada`: optional single cover image.
- `galeria_fotos`: optional list of gallery images, capped by admin rules.
- `fotos`: legacy list that remains valid and must be used as fallback.

## Goals / Non-Goals

**Goals:**

- Normalize cover and gallery images through shared helpers for stations, actors, products, experiences, and imperdibles.
- Prefer `foto_portada` for summarized public surfaces and fall back to `fotos[0]`.
- Build detail galleries from `galeria_fotos` plus compatible legacy `fotos`, excluding the active cover image and deduplicating by file name.
- Preserve all existing placeholder/fallback UI when no image exists.
- Add focused tests for helper behavior and public listing/detail image selection.

**Non-Goals:**

- No PocketBase schema migration.
- No destructive edits or cleanup of `fotos`.
- No public upload, edit form, or admin behavior.
- No redesign of public page layouts beyond wiring the correct image sources.

## Decisions

- Centralize multimedia selection in `app/lib/data.ts`.
  - Rationale: PocketBase file URLs need collection metadata, record IDs, and expanded-record path handling already present in the data layer.
  - Alternative considered: compute images in each component. Rejected because it would duplicate fallback and dedupe rules across many views.

- Expose normalized `imageUrl` and `galleryUrls` from content models.
  - Rationale: public components already consume these properties, so the change can update behavior without broad UI prop churn.
  - Alternative considered: expose raw `foto_portada`, `galeria_fotos`, and `fotos` to components. Rejected because UI should not know PocketBase field details.

- Deduplicate galleries by file name rather than full URL.
  - Rationale: the same file can appear through different source fields but resolves to the same semantic asset.
  - Alternative considered: dedupe by full URL. Rejected because it misses duplicate file names across field lists.

- Treat `fotos[0]` as the fallback cover only when `foto_portada` is absent.
  - Rationale: legacy records should keep their first image as the hero while newer records should allow gallery images independent of the cover.
  - Alternative considered: always include all legacy `fotos` in gallery. Rejected because it repeats the visible cover on legacy detail pages.

## Risks / Trade-offs

- [Risk] Some components may construct ad hoc image arrays on detail pages. -> Mitigation: keep `galleryUrls` cover-free and update detail composition to avoid reintroducing cover duplication.
- [Risk] Expanded station media may use nested PocketBase records. -> Mitigation: keep helper APIs path-based so nested `expand.*` fields can be resolved with their own record metadata.
- [Risk] Tests may need stable sample data independent of PocketBase availability. -> Mitigation: cover core multimedia behavior with unit tests against normalizer helpers and public fallback records.
