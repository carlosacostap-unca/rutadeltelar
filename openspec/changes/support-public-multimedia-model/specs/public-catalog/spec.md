## ADDED Requirements

### Requirement: Catalog multimedia rendering
Public catalog cards, listing rows, highlighted catalog sections, related-content cards, and detail pages SHALL use the normalized cover and gallery outputs for stations, actors, products, experiences, and imperdibles.

#### Scenario: Catalog card renders an entity with a cover
- **WHEN** a station, actor, product, experience, or imperdible card is rendered for a record with `foto_portada`
- **THEN** the card SHALL render the normalized cover image from `foto_portada`

#### Scenario: Catalog detail renders a legacy-only entity
- **WHEN** a detail page renders an entity with only legacy `fotos`
- **THEN** the detail cover SHALL render `fotos[0]`
- **AND** the detail gallery SHALL NOT repeat `fotos[0]`
