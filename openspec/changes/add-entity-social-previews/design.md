## Context

The App Router detail pages already call a shared `createPageMetadata` helper and pass normalized entity cover URLs. That helper emits Open Graph and Twitter fields, but omits images when the caller has no image. Root metadata also has no social image. Existing institutional assets are either square icons or multi-megabyte hero photographs, so none is an efficient, intentional social fallback as-is.

## Goals / Non-Goals

**Goals:**

- Centralize preview-image selection and absolute URL construction in the shared metadata layer.
- Preserve the entity-specific image behavior already used by all detail routes.
- Provide one optimized 1200×630 institutional fallback for pages without content imagery.
- Make metadata behavior directly testable without depending on a social platform cache.

**Non-Goals:**

- Attaching image files through the Web Share API.
- Changing PocketBase fields or multimedia normalization.
- Creating platform-specific posting integrations or guaranteeing how every Instagram surface renders an external link.
- Generating a custom branded composite for every entity.

## Decisions

### Use one static institutional social asset

Add an optimized 1200×630 image under `public/images/social`. Compose it from existing Ruta del Telar visual assets so the fallback is stable, cacheable, and does not depend on PocketBase or runtime image generation. A dynamic image route was considered, but it adds runtime work without improving this fixed fallback.

### Select and normalize the preview image in the shared metadata helper

`createPageMetadata` will select the caller-provided image when present and otherwise select the institutional asset. Relative image paths will be resolved against the configured public site URL, while already absolute entity URLs will remain intact. Centralizing the rule prevents individual routes from diverging and automatically covers non-detail pages that use the helper.

### Always emit large-preview metadata

Open Graph and Twitter-compatible image fields will always be present. The image descriptor will include alternative text and the known fallback dimensions/type when the institutional asset is selected. Entity images may not expose reliable dimensions in the normalized model, so the implementation will not invent dimensions for them.

### Keep current journey image semantics

Suggested journeys will continue to pass the principal station image as their contextual preview. If it is absent, the shared fallback applies. Introducing a separate journey image field would require a data-model decision outside this change.

### Verify metadata at helper and rendered-page levels

Unit tests will assert explicit-image and fallback selection. Existing SEO end-to-end coverage will be extended to assert rendered Open Graph and Twitter tags on representative detail routes, while implementation review will confirm all supported entity routes continue passing their cover images.

## Risks / Trade-offs

- [Risk] Social platforms may retain a stale preview after deployment. → Mitigation: verify source metadata first and document that platform caches may require a new URL or Facebook re-scrape during manual validation.
- [Risk] A PocketBase image URL may be public to browsers but unavailable to a crawler. → Mitigation: preserve absolute HTTPS URLs and include representative production validation after deployment.
- [Risk] Entity images have varied aspect ratios and may be cropped differently by platforms. → Mitigation: use the normalized cover selection and allow platform cropping; custom per-entity composites remain out of scope.
- [Risk] Instagram surfaces do not all render web previews consistently. → Mitigation: meet the shared Open Graph contract while treating platform presentation as external behavior.

## Migration Plan

Deploy the new static asset and metadata changes together. Existing URLs and entity data require no migration. Rollback consists of reverting the shared helper/root metadata changes and removing the unused fallback asset.
