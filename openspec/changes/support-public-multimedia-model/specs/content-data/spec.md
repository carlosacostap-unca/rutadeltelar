## ADDED Requirements

### Requirement: Multimedia normalization
The content data layer SHALL normalize PocketBase multimedia fields into shared cover and gallery outputs for stations, actors, products, experiences, and imperdibles.

#### Scenario: Record uses the new multimedia model
- **WHEN** a PocketBase record includes `foto_portada` and `galeria_fotos`
- **THEN** the normalized model SHALL expose the cover image from `foto_portada`
- **AND** it SHALL expose gallery URLs derived from `galeria_fotos` plus non-cover legacy `fotos`

#### Scenario: Record uses only legacy photos
- **WHEN** a PocketBase record includes only `fotos`
- **THEN** the normalized model SHALL expose the cover image from `fotos[0]`
- **AND** it SHALL expose gallery URLs derived from the remaining legacy photos

### Requirement: Multimedia field typing
The public TypeScript types for PocketBase-backed content SHALL retain `fotos?: string[]` and include `foto_portada?: string` and `galeria_fotos?: string[]` where raw multimedia fields are represented.

#### Scenario: Raw record media fields are used
- **WHEN** the data layer reads raw PocketBase multimedia fields
- **THEN** TypeScript SHALL allow `foto_portada`, `galeria_fotos`, and `fotos`
