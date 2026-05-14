## ADDED Requirements

### Requirement: Search and map multimedia rendering
Search results and map summaries SHALL use the normalized cover image for stations, actors, and imperdibles.

#### Scenario: Search result has a new cover image
- **WHEN** a searchable public entity has `foto_portada`
- **THEN** its search result SHALL render `foto_portada` as the result image

#### Scenario: Map summary has only legacy photos
- **WHEN** a station, actor, or imperdible map marker summary has no `foto_portada` and has legacy `fotos`
- **THEN** the map summary SHALL render `fotos[0]` as the marker image
