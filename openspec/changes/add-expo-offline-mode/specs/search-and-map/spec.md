## ADDED Requirements

### Requirement: Offline geographic rendering
The territory map SHALL render an interactive local geographic context when exhibition mode is active.

#### Scenario: Exhibition map loads
- **WHEN** a visitor opens a map-bearing page in exhibition mode
- **THEN** Leaflet SHALL render the configured local map base, local marker icons, and snapshot coordinates
- **AND** it SHALL preserve applicable station, actor, and imperdible layer controls
- **AND** it SHALL NOT request ArcGIS, public tile servers, CDNs, or other remote map resources

#### Scenario: Record lies outside the packaged map extent
- **WHEN** a snapshot record has valid coordinates outside the local map bounds
- **THEN** snapshot validation SHALL report the record before distribution

#### Scenario: Detailed packaged basemap is available
- **WHEN** a visitor opens a map-bearing page and the packaged PMTiles archive is valid
- **THEN** Leaflet SHALL render the local vector basemap with roads, settlements, water, terrain context, and required attribution
- **AND** existing markers, filters, popups, and journey polylines SHALL remain interactive

#### Scenario: Detailed packaged basemap is unavailable
- **WHEN** the PMTiles archive is missing or cannot be rendered
- **THEN** the map SHALL fall back to the packaged georeferenced schematic image
- **AND** it SHALL NOT attempt to load a remote tile provider

### Requirement: Offline suggested route geometry
Suggested journeys SHALL use packaged route geometry instead of a live routing service in exhibition mode.

#### Scenario: Precomputed route exists
- **WHEN** a suggested journey contains two or more geographic stops with packaged GeoJSON geometry
- **THEN** the map SHALL render the precomputed road route locally
- **AND** it SHALL NOT call OSRM

#### Scenario: Precomputed route is unavailable
- **WHEN** a journey has multiple geographic stops but no packaged route geometry
- **THEN** the map SHALL render a local straight-line fallback between stops
- **AND** the remaining map interaction SHALL stay available
