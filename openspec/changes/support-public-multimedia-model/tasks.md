## 1. Data Normalization

- [x] 1.1 Add shared multimedia helpers for cover selection, gallery composition, and file-name deduplication.
- [x] 1.2 Update raw PocketBase content typing to include `foto_portada`, `galeria_fotos`, and legacy `fotos`.
- [x] 1.3 Apply normalized cover and gallery outputs to stations, actors, products, experiences, and imperdibles, including expanded related records where image fields are used.

## 2. Public Rendering

- [x] 2.1 Update detail pages so cover and gallery sections use the normalized cover-free gallery without duplicating the cover.
- [x] 2.2 Verify cards, listings, highlighted sections, favorites, search results, map popups, agenda, journeys, and related-content summaries consume the normalized cover image.

## 3. Tests And Verification

- [x] 3.1 Add or update tests for records with `foto_portada` and `galeria_fotos`.
- [x] 3.2 Add or update tests for legacy-only `fotos` records and cover exclusion from galleries.
- [x] 3.3 Add or update tests showing public listings use the correct cover image.
- [x] 3.4 Run OpenSpec validation and the project verification commands.
