## MODIFIED Requirements

### Requirement: Public map popups
The application SHALL render map popups for geolocated stations, actors, and imperdibles with useful navigation actions.

#### Scenario: Embedded public map uses contextual satellite layers
- **WHEN** a visitor views an embedded public map
- **THEN** the map SHALL use satellite imagery as its base layer
- **AND** the map SHALL include transportation, administrative boundary, and place-name reference overlays
- **AND** the map SHALL show a metric scale control

#### Scenario: Popup entity has coordinates
- **WHEN** a station, actor, or imperdible is shown in a map popup
- **THEN** the popup SHALL include an action to open that location in a satellite map view
- **AND** the action SHALL open in a new tab with safe external-link attributes
- **AND** map views SHALL use a closer default zoom than the previous broad territorial overview

#### Scenario: Popup entity lacks coordinates
- **WHEN** an entity is not geolocated
- **THEN** it SHALL NOT be shown as a map marker
- **AND** no satellite map action SHALL be rendered for it
