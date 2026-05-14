## MODIFIED Requirements

### Requirement: Detail pages
Each public content detail page SHALL render a detail view for the selected slug and related context from the same territory or explicit relations.

#### Scenario: Station detail
- **WHEN** a visitor opens a station detail route
- **THEN** the page SHALL show station identity, gallery or image fallback, location details, and related actors, experiences, imperdibles, and products

#### Scenario: Actor detail
- **WHEN** a visitor opens an actor detail route
- **THEN** the page SHALL show actor identity, craft/type, station context, contact information when present, subtype fields when present, and related experiences, imperdibles, and products

#### Scenario: Product detail
- **WHEN** a visitor opens a product detail route
- **THEN** the page SHALL show product identity, category, optional subcategory, techniques, station context, and related actors

#### Scenario: Experience detail
- **WHEN** a visitor opens an experience detail route
- **THEN** the page SHALL show experience identity, duration, location, intensity, includes, stops, responsible actor when available, station context, and related imperdibles

#### Scenario: Imperdible detail
- **WHEN** a visitor opens an imperdible detail route
- **THEN** the page SHALL show imperdible identity, type, priority, location, event date when available, gallery, practical details, and related station, experiences, actors, and products

#### Scenario: Cropped detail images have focus
- **WHEN** a detail cover or gallery thumbnail is rendered with `object-fit: cover`
- **THEN** it SHALL apply normalized image focus using `object-position`

### Requirement: Catalog image focus rendering
Public catalog cards, listing rows, highlighted sections, search results, map popups, and related-content cards SHALL apply normalized focus metadata to cropped images.

#### Scenario: Summary image has configured focus
- **WHEN** a station, actor, product, experience, or imperdible summary image has normalized cover focus
- **THEN** the cropped image SHALL render with that `object-position`

#### Scenario: Summary image has no configured focus
- **WHEN** a station, actor, product, experience, or imperdible summary image has no valid focus metadata
- **THEN** the cropped image SHALL render with centered `object-position`
