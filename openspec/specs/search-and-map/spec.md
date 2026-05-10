# Search And Map Specification

## Purpose
Define cross-site search and interactive map behavior for exploring the Ruta del Telar by text and geography.

## Requirements

### Requirement: Global search
The search page SHALL search across stations, actors, products, experiences, and imperdibles using client-side data provided by the server page.

#### Scenario: Query is empty
- **WHEN** the search query is blank
- **THEN** the page SHALL show an invitation to type a search term
- **AND** no result groups SHALL be shown

#### Scenario: Query matches content
- **WHEN** the query matches one or more content records
- **THEN** results SHALL be grouped by content type
- **AND** each group SHALL show its count
- **AND** each result SHALL link to the corresponding detail route

#### Scenario: Query has no matches
- **WHEN** the query does not match any indexed fields
- **THEN** the page SHALL show a no-results state for that query

### Requirement: Search matching
Search matching SHALL be case-insensitive and accent-insensitive.

#### Scenario: Query differs by case or accents
- **WHEN** a visitor searches with different case or without accents
- **THEN** matching SHALL still consider normalized station names, localities, slogans, departments, actor fields, product fields, experience fields, and imperdible fields

### Requirement: Search URL state
The search page SHALL keep the `q` query parameter synchronized with the search input.

#### Scenario: Visitor types a query
- **WHEN** the input changes to a non-empty value
- **THEN** the page SHALL update the URL to `/buscar?q={value}` without scrolling

#### Scenario: Visitor clears a query
- **WHEN** the input is cleared
- **THEN** the page SHALL remove the `q` parameter without scrolling

### Requirement: Map layer controls
The map page SHALL expose independent visibility controls for stations, actors, and imperdibles.

#### Scenario: Toggling a map layer
- **WHEN** a visitor disables a layer
- **THEN** records from that layer SHALL be omitted from the rendered territory map
- **AND** enabling the layer again SHALL restore those records

### Requirement: Coordinate counting
The map page SHALL count only visible records with both latitude and longitude.

#### Scenario: Visible records include coordinates
- **WHEN** map layers are active
- **THEN** the page SHALL display the number of visible records that have valid coordinates

#### Scenario: No visible coordinates exist
- **WHEN** active layers contain no records with both latitude and longitude
- **THEN** the page SHALL show an empty-coordinate message below the map

### Requirement: Dynamic map rendering
Map components SHALL be loaded on the client to avoid server-side rendering of Leaflet-dependent UI.

#### Scenario: Map is loading
- **WHEN** the client map bundle is still loading
- **THEN** the page SHALL show a loading placeholder
- **AND** the server render SHALL NOT require browser-only Leaflet APIs
