## Context

The public app normalizes PocketBase records into shared models in `app/lib/data.ts`, then renders `imageUrl` and `galleryUrls` across server pages and client components. The previous multimedia change already separates cover and gallery images. The new focus fields must travel with that normalized image data so components can apply CSS `object-position` wherever an image is cropped with `object-fit: cover`.

## Goals / Non-Goals

**Goals:**

- Normalize cover focus for stations, actors, products, experiences, and imperdibles.
- Normalize gallery focus by file name for cropped gallery thumbnails.
- Apply default `50% 50%` focus when either coordinate is missing or invalid.
- Preserve existing image sizing and `object-fit: cover` behavior without distortion.
- Keep focus helpers small and reusable in both server and client components.

**Non-Goals:**

- No admin editing, upload, schema migration, or PocketBase writes.
- No attempt to infer focus from image content.
- No redesign of cards, map popups, or detail galleries.
- No focus application to images rendered with `object-fit: contain`.

## Decisions

- Add a shared `app/lib/image-focus.ts` helper.
  - Rationale: focus math and CSS object-position formatting should stay identical across all render surfaces.
  - Alternative considered: inline `style={{ objectPosition: ... }}` everywhere. Rejected because it duplicates defaulting and validation.

- Store normalized `imageFocus` and `galleryImages` in public models while preserving `galleryUrls`.
  - Rationale: existing components can keep using `imageUrl`, and detail galleries can use richer image items when focus is available.
  - Alternative considered: expose only raw PocketBase fields to UI. Rejected because UI components should not parse PocketBase file-name maps.

- Match `galeria_fotos_focus` by file name key.
  - Rationale: gallery focus is keyed by file name and should work regardless of the generated PocketBase file URL path.
  - Alternative considered: match full generated URL. Rejected because PocketBase URLs contain collection and record paths not present in the focus map.

## Risks / Trade-offs

- [Risk] Some older records have no focus fields. -> Mitigation: helpers default to centered `50% 50%`.
- [Risk] Gallery focus maps may include keys that are not displayed after dedupe or cover exclusion. -> Mitigation: unused keys are ignored.
- [Risk] A few image renderers may be in client components. -> Mitigation: helpers return plain serializable values and React style objects.
