## MODIFIED Requirements

### Requirement: Public catalog cards and summaries
The application SHALL render public cards, listings, search results, favorites, map popups, and related-content summaries using normalized entity data and safe optional fields.

#### Scenario: Summary item has highlighted data
- **WHEN** a station, actor, product, experience, or imperdible summary item has highlighted data
- **THEN** the UI SHALL display the highlighted data in a compact, visually consistent treatment
- **AND** the highlighted data SHALL NOT replace the title or required summary text

#### Scenario: Summary item has no highlighted data
- **WHEN** a summary item has no highlighted data
- **THEN** the UI SHALL omit the highlighted-data element
- **AND** no empty label, button, or placeholder SHALL be rendered

### Requirement: Public detail views
The application SHALL render detail pages for stations, actors, products, experiences, and imperdibles with optional highlighted data when available.

#### Scenario: Detail entity has highlighted data
- **WHEN** a detail entity includes highlighted data
- **THEN** the detail page SHALL show the highlighted data near the primary identity or descriptive content
- **AND** the existing contact, media, relation, and practical-information sections SHALL remain intact

#### Scenario: Detail entity has no highlighted data
- **WHEN** a detail entity does not include highlighted data
- **THEN** the detail page SHALL keep the existing layout without empty highlighted-data UI

### Requirement: Public search
The application SHALL allow users to discover public entities by their primary text fields and highlighted data.

#### Scenario: Query matches highlighted data
- **WHEN** a user searches for text contained in `dato_destacado`
- **THEN** the matching entity SHALL be eligible to appear in the corresponding search result group
