## Why

Shared detail links should identify the exact Ruta del Telar content being recommended instead of appearing without a thumbnail when an entity has no cover image. Consistent social previews improve recognition and trust when links circulate through WhatsApp, Facebook, and compatible Instagram surfaces.

## What Changes

- Publish entity-specific Open Graph and Twitter metadata for every station, actor, product, experience, imperdible, and suggested journey detail route.
- Use the entity cover image when available; suggested journeys use their principal station image.
- Fall back to a dedicated Ruta del Telar institutional social image whenever the selected content image is unavailable.
- Include explicit social-image metadata suitable for external crawlers and large preview cards.
- Add automated coverage for entity images, journey images, and the institutional fallback.

## Capabilities

### New Capabilities

- `social-link-previews`: Defines social metadata and image-selection behavior for public detail links.

### Modified Capabilities

None.

## Impact

- Affects the shared metadata helper, root metadata defaults, and detail-route metadata generation.
- Adds a public institutional image asset optimized for social previews.
- Adds metadata-focused unit or end-to-end tests.
- Does not change PocketBase schema, entity data, public route URLs, or sharing-button behavior.
