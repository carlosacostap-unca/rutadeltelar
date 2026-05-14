## Context

The public app fetches `actores` through the shared PocketBase data layer in `app/lib/data.ts`, normalizes them into the `Artisan` model from `app/lib/content.ts`, and renders the public detail route at `app/artesanas/[slug]/page.tsx`. Actor contact actions are already grouped in `ContactButtons`, which matches the desired placement for optional social and web links.

## Goals / Non-Goals

**Goals:**

- Add optional actor social URL fields to the public actor type.
- Read `facebook_url`, `instagram_url`, and `pagina_web_url` from PocketBase records without writing data.
- Render only populated links on actor detail pages, using clear labels and safe external link attributes.
- Preserve current visual language and contact placement.
- Cover the no-links case so empty UI is not rendered.

**Non-Goals:**

- No PocketBase schema migration or data backfill.
- No admin form, upload, or edit behavior.
- No validation beyond trimming and ignoring empty values.
- No broad redesign of actor detail pages or catalog cards.

## Decisions

- Extend `ContactButtons` instead of creating a separate visual section by default.
  - Rationale: actor detail already has a contact area, and social/web links are contact-adjacent.
  - Alternative considered: add a new page section after the bio. Rejected because it adds visual weight when the existing contact area is available.

- Keep field names as provided by PocketBase in the public model: `facebook_url`, `instagram_url`, and `pagina_web_url`.
  - Rationale: the requested interface matches the backend fields and avoids an unnecessary mapping layer.
  - Alternative considered: camelCase aliases. Rejected to keep the public model explicit and aligned with PocketBase.

- Render links only when normalized values are non-empty strings.
  - Rationale: prevents empty buttons and keeps old records unchanged.
  - Alternative considered: show disabled buttons. Rejected because disabled social actions are not useful to visitors.

## Risks / Trade-offs

- [Risk] A stored URL may be malformed. -> Mitigation: use the value only when non-empty and rely on PocketBase/admin validation for complete URLs as stated in the request.
- [Risk] Actors with no contact or social fields could render an empty contact area. -> Mitigation: keep `ContactButtons` returning `null` when all values are absent.
