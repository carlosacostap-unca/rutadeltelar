## ADDED Requirements

### Requirement: Cover image selection
The public application SHALL select the primary image for stations, actors, products, experiences, and imperdibles from `foto_portada` first, then from the first legacy `fotos` image, then no image.

#### Scenario: New cover exists
- **WHEN** a public entity record has `foto_portada` and any other image fields
- **THEN** summarized public surfaces SHALL use `foto_portada` as the entity primary image

#### Scenario: Legacy cover fallback exists
- **WHEN** a public entity record has no `foto_portada` and has at least one `fotos` image
- **THEN** summarized public surfaces SHALL use `fotos[0]` as the entity primary image

#### Scenario: No image exists
- **WHEN** a public entity record has no `foto_portada` and no `fotos` image
- **THEN** public surfaces SHALL preserve the existing placeholder or empty-image state

### Requirement: Detail gallery composition
Detail pages SHALL display a cover image using `foto_portada || fotos[0]` and a separate gallery made from `galeria_fotos` plus legacy `fotos` images that are not the active cover.

#### Scenario: Cover and gallery fields exist
- **WHEN** a public entity detail record has `foto_portada`, `galeria_fotos`, and `fotos`
- **THEN** the cover area SHALL render `foto_portada`
- **AND** the visible gallery SHALL include `galeria_fotos` and compatible legacy `fotos`
- **AND** the cover file SHALL NOT appear in the visible gallery

#### Scenario: Legacy-only record is rendered
- **WHEN** a public entity detail record has only legacy `fotos`
- **THEN** the cover area SHALL render `fotos[0]`
- **AND** the visible gallery SHALL include only the remaining legacy `fotos` entries

### Requirement: Gallery deduplication
The public application SHALL deduplicate gallery image candidates by file name before rendering.

#### Scenario: Same file appears in multiple image fields
- **WHEN** `galeria_fotos` and `fotos` contain the same file name
- **THEN** the visible gallery SHALL include that file only once

### Requirement: Read-only multimedia compatibility
The public application SHALL only read `foto_portada`, `galeria_fotos`, and `fotos` for public rendering and SHALL NOT remove or mutate legacy `fotos`.

#### Scenario: Public app loads multimedia records
- **WHEN** stations, actors, products, experiences, or imperdibles are fetched from PocketBase
- **THEN** the public app SHALL read the multimedia fields needed for rendering
- **AND** it SHALL NOT perform destructive migrations or write image fields
