## Context

The public app already normalizes `latitud` and `longitud` into `latitude` and `longitude` for stations, actors, and imperdibles. `hasValidCoordinates` centralizes validation and excludes empty or invalid points. Station detail pages already show a coordinate block, while actor and imperdible detail pages do not yet expose a direct map action.

## Goals / Non-Goals

**Goals:**

- Provide a clear "Ver en mapa satelital" action wherever a public entity has valid coordinates and location context.
- Show embedded public maps over satellite imagery.
- Add administrative/place labels and main transportation references over the satellite base.
- Reuse coordinate validation so invalid or missing points do not render broken links.
- Open the satellite map in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
- Make visible address chips actionable when the record has valid coordinates.
- Keep the current layout and existing embedded/internal maps intact.
- Increase map zoom so coordinate-based views open closer to the selected location.

**Non-Goals:**

- No admin editing, schema changes, or coordinate updates.
- No replacement of the internal Leaflet map library.
- No attempt to geocode records without coordinates.

## Decisions

- Add `app/lib/map-links.ts` for URL generation.
  - Rationale: every surface should generate identical external satellite links.

- Add a reusable `SatelliteMapButton` component.
  - Rationale: consistent label, external-link attributes, and hidden-empty behavior.

- Use Google Maps satellite URL format.
  - Rationale: visitors commonly understand Google Maps, and the app already links to Google Maps in station fallback copy.

- Use a pinned Google Maps query URL for coordinate links.
  - Rationale: visitors should see an explicit pin at the entity coordinates, not only a centered map view.

- Use closer default zoom levels for internal Leaflet maps and external satellite links.
  - Rationale: coordinate actions are most useful when they show the immediate surroundings of the place.

- Use Esri `World_Imagery` as the embedded map base layer.
  - Rationale: it provides satellite imagery without changing the current Leaflet implementation.

- Overlay Esri `World_Transportation` and `World_Boundaries_and_Places`.
  - Rationale: visitors can keep political/administrative, place-name, and route context while viewing the satellite base.

- Add a shared tile-layer config and rendering component.
  - Rationale: station detail and territorial maps must stay consistent.

## Risks / Trade-offs

- [Risk] External map URL formats can evolve. -> Mitigation: isolate URL generation in one helper.
- [Risk] Too many map actions may clutter small popups. -> Mitigation: use compact buttons in popups and render only for valid coordinates.
