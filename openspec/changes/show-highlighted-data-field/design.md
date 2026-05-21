## Context

The public app normalizes PocketBase records in `app/lib/data.ts` into shared models from `app/lib/content.ts`. Those models feed both server-rendered detail pages and client-side catalog/search components. `dato_destacado` is a short optional text field managed in the admin and should be treated like other display-only content fields.

## Goals / Non-Goals

**Goals:**

- Normalize `dato_destacado` for stations, actors, products, experiences, and imperdibles.
- Expose a camelCase frontend property (`datoDestacado`) while preserving the raw optional field name in types for compatibility.
- Render the value in cards and details when present, with no empty placeholder when missing.
- Keep styling compact and consistent with the existing accent chip/card language.

**Non-Goals:**

- No PocketBase schema updates, migrations, writes, or admin forms.
- No requirement to synthesize highlighted data from other fields.
- No redesign of catalog pages or detail page structure.
- No change to search ranking or filtering unless the existing search text can naturally include the new field.

## Decisions

- Add a small presentational component for highlighted data.
  - Rationale: the same visual treatment is needed in cards and details, and hiding empty values should be centralized.

- Normalize into `datoDestacado`.
  - Rationale: the app already maps backend field names to frontend-friendly names for several fields while still exposing raw optional fields where useful.

- Include `dato_destacado` in text search matching.
  - Rationale: users may search for a highlighted phrase they saw in a card or detail.

## Risks / Trade-offs

- [Risk] Some values may be longer than expected. -> Mitigation: card placements use compact text styles and existing line-clamp patterns where appropriate.
- [Risk] Older records do not have the field. -> Mitigation: the UI component returns `null` for missing or empty values.
