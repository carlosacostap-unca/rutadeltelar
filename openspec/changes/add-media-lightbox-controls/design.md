## Context

`DetailMediaGallery` renders cover and gallery images for stations, products, experiences, and imperdibles. Actor detail pages currently render a smaller cover image and gallery strip directly in the page. Related-content sections use `HomeCarousel`, a horizontal scroll container.

## Goals / Non-Goals

**Goals:**

- Let visitors click cover and gallery thumbnails to inspect complete images in a modal.
- Keep modal images uncropped with `object-fit: contain`.
- Provide previous/next controls in the modal.
- Provide left/right scroll controls for horizontal carousels.
- Keep current thumbnail cropping, focus styles, and page layouts intact.

**Non-Goals:**

- No admin upload/edit behavior.
- No image transformations or downloads.
- No large redesign of detail pages or related-content cards.

## Decisions

- Convert shared gallery/carousel components to client components where interaction state is required.
  - Rationale: modal state and scroll buttons require browser events.

- Keep thumbnail rendering cropped with existing focus styles.
  - Rationale: the current layouts depend on stable thumbnail aspect ratios.

- Render modal images with contained scaling.
  - Rationale: this satisfies the requirement to show the complete image without distortion.

- Reuse a single lightbox pattern across cover and gallery images.
  - Rationale: detail pages should behave consistently across entity types.

## Risks / Trade-offs

- [Risk] Clientifying shared components can increase client JavaScript. -> Mitigation: scope state to media and carousel components only.
- [Risk] Modal controls can overlap on small screens. -> Mitigation: use fixed-size icon controls and responsive image bounds.
