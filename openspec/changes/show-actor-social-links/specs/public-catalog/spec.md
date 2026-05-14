## MODIFIED Requirements

### Requirement: Detail pages
Each public content detail page SHALL render a detail view for the selected slug and related context from the same territory or explicit relations.

#### Scenario: Station detail
- **WHEN** a visitor opens a station detail route
- **THEN** the page SHALL show station identity, gallery or image fallback, location details, and related actors, experiences, imperdibles, and products

#### Scenario: Actor detail
- **WHEN** a visitor opens an actor detail route
- **THEN** the page SHALL show actor identity, craft/type, station context, contact information when present, subtype fields when present, and related experiences, imperdibles, and products
- **AND** it SHALL show populated Facebook, Instagram, and Página web links in the actor contact area when those URLs exist
- **AND** it SHALL NOT show empty social or web buttons when those URLs are missing

#### Scenario: Actor social link behavior
- **WHEN** a populated actor social or web link is rendered
- **THEN** it SHALL use a clear label of `Facebook`, `Instagram`, or `Página web`
- **AND** it SHALL open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`

#### Scenario: Product detail
- **WHEN** a visitor opens a product detail route
- **THEN** the page SHALL show product identity, category, optional subcategory, techniques, station context, and related actors

#### Scenario: Experience detail
- **WHEN** a visitor opens an experience detail route
- **THEN** the page SHALL show experience identity, duration, location, intensity, includes, stops, responsible actor when available, station context, and related imperdibles

#### Scenario: Imperdible detail
- **WHEN** a visitor opens an imperdible detail route
- **THEN** the page SHALL show imperdible identity, type, priority, location, event date when available, gallery, practical details, and related station, experiences, actors, and products
