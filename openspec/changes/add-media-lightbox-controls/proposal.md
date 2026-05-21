## Why

Public detail pages already render normalized cover and gallery images, but visitors cannot inspect those images at full size. Related-content carousels also rely on horizontal scrolling without explicit controls, which makes navigation less discoverable on desktop and touch devices.

## What Changes

- Add a reusable lightbox/modal for public detail media.
- Open cover and gallery thumbnails in the modal when clicked.
- Show images complete in the modal using contained scaling, without cropping or distortion.
- Add previous/next controls inside the modal when more than one image is available.
- Add left/right controls to public horizontal carousels.
- Preserve existing visual style and image focus behavior for thumbnails.

## Capabilities

### Modified Capabilities
- `public-catalog`: Detail media galleries support full-image viewing and public carousels expose directional navigation controls.

## Impact

- Affected code: detail media gallery components, actor detail media rendering, carousel components, and tests if needed.
- No PocketBase writes, schema changes, or data migrations.
- No new runtime dependency expected.
