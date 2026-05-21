## Why

PocketBase now exposes an optional `dato_destacado` field across the public content entities. The public app should read and render that field so admins can surface a short, high-value fact without changing descriptions, titles, or legacy content.

## What Changes

- Read optional `dato_destacado` values for stations, actors, products, experiences, and imperdibles.
- Add the field to shared frontend entity types and normalized PocketBase models.
- Display the highlighted data in public summary cards and detail pages only when the field has content.
- Keep existing layouts, filters, search behavior, and fallback content intact.
- Do not write to PocketBase, change schemas, or migrate data.

## Capabilities

### Modified Capabilities
- `content-data`: Entity normalization includes optional highlighted data from PocketBase.
- `public-catalog`: Public listings, cards, search results, and detail views can show highlighted data when present.

## Impact

- Affected code: `app/lib/content.ts`, `app/lib/data.ts`, public catalog/detail pages, reusable highlighted-data UI, and tests.
- Data model: read-only consumption of `dato_destacado`.
- No destructive data changes, admin editing, migrations, or large visual redesign.
