## MODIFIED Requirements

### Requirement: Public detail views
The application SHALL render detail pages for stations, actors, products, experiences, and imperdibles with optional metadata and location actions when available.

#### Scenario: Detail entity has valid coordinates
- **WHEN** a station, actor, or imperdible detail entity has valid latitude and longitude
- **THEN** the detail page SHALL show a button or link to open that location in satellite map view
- **AND** the link SHALL open in a new browser tab with safe external-link attributes
- **AND** any embedded detail map SHALL use satellite imagery with reference overlays for orientation

#### Scenario: Detail entity does not have valid coordinates
- **WHEN** a detail entity lacks valid latitude or longitude
- **THEN** the detail page SHALL NOT show a broken satellite map button
- **AND** existing no-coordinate fallback text SHALL remain available where already implemented
