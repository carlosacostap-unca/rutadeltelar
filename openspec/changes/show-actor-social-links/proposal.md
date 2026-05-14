## Why

Actor records in the shared PocketBase now include optional social and web URLs. The public app should surface those links on actor detail pages so visitors can continue to official channels without requiring any schema or data changes from this app.

## What Changes

- Read optional `facebook_url`, `instagram_url`, and `pagina_web_url` fields from `actores`.
- Add the three optional fields to the public actor model.
- Render only populated social/web links on the public actor detail page.
- Place the links with the existing actor contact area and open external URLs in a new tab using `target="_blank"` and `rel="noopener noreferrer"`.
- Preserve current visual patterns and avoid empty or broken buttons when fields are missing.

## Capabilities

### New Capabilities

### Modified Capabilities
- `content-data`: Actor normalization includes optional social and web URL fields from PocketBase.
- `public-catalog`: Actor detail pages display optional social and web links in the contact area.

## Impact

- Affected code: `app/lib/content.ts`, `app/lib/data.ts`, actor detail UI under `app/artesanas/[slug]/page.tsx`, and actor/contact tests if present.
- Data model: read-only consumption of `facebook_url`, `instagram_url`, and `pagina_web_url`.
- No migrations, PocketBase writes, dependency changes, or public editing/upload behavior.
