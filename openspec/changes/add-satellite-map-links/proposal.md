## Why

Some public entities already expose valid `latitud` and `longitud` data. Visitors should be able to open that exact location in a satellite map view, especially when planning access to stations, actors, or imperdibles in rural territory.

## What Changes

- Add a reusable satellite map link/button for entities with valid coordinates.
- Render embedded public maps with satellite imagery plus transportation and administrative/place reference overlays.
- Show the action on public detail pages for stations, actors, and imperdibles when coordinates are present.
- Add the same action to map popups where coordinates are already known.
- Add a metric scale to embedded maps to help visitors estimate distance.
- Preserve current coordinate fallbacks for records without valid latitude/longitude.
- Do not modify PocketBase schema or data.

## Capabilities

### Modified Capabilities
- `public-catalog`: Detail views and map summaries expose location actions for entities with coordinates.
- `search-and-map`: Map popups can provide an external satellite map action for geolocated entities.

## Impact

- Affected code: detail pages for stations, actors, and imperdibles, map popup components, tile layer helpers, and tests if needed.
- External behavior: opens Google Maps in a new tab using satellite map coordinates.
- Internal map behavior: embedded Leaflet maps use satellite imagery with contextual reference overlays.
- No data migrations or backend writes.
