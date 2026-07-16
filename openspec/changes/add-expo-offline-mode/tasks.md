## 1. Offline Mode Foundation

- [x] 1.1 Add a centralized server-side exhibition configuration that recognizes `RUTA_EXPO_OFFLINE=true` and expose only the non-secret mode state required by client components.
- [x] 1.2 Define the versioned exhibition manifest, normalized entity, media inventory, map extent, and route-geometry types with runtime validation.
- [x] 1.3 Add a small valid snapshot fixture and invalid fixture cases for deterministic unit and end-to-end tests.
- [x] 1.4 Add a local health endpoint that rejects missing, incompatible, or integrity-invalid exhibition artifacts.

## 2. Snapshot Preparation Pipeline

- [x] 2.1 Implement a connected preparation command that reads every required PocketBase collection using approved-public filters and existing collection configuration.
- [x] 2.2 Normalize the exported entities and relations through an explicit public-field allowlist without serializing credentials, tokens, or unpublished records.
- [x] 2.3 Materialize configured cover and gallery variants plus selected videos as local files, deduplicate them by hash, and rewrite snapshot media references to stable local paths.
- [x] 2.4 Generate manifest metadata, entity counts, file inventory, hashes, geographic bounds, and a human-readable preparation report.
- [x] 2.5 Fail preparation for empty required catalogs, duplicate slugs, broken relations, missing required media, out-of-bounds coordinates, unsupported schema, or invalid hashes.
- [x] 2.6 Add package scripts and documentation for preparing and validating a snapshot before the content freeze date.

## 3. Local Data and Media Runtime

- [x] 3.1 Add an exhibition snapshot loader that returns the same `DataResult` and normalized content contracts used by connected pages.
- [x] 3.2 Route every catalog, detail-context, search, agenda, and suggested-journey read to the snapshot exclusively when exhibition mode is active.
- [x] 3.3 Ensure all exhibition cover, gallery, video, font, icon, and fallback references resolve locally without passing through the PocketBase image proxy.
- [x] 3.4 Preserve the existing PocketBase and mock-fallback behavior when exhibition mode is disabled.

## 4. Offline Maps and Journeys

- [x] 4.1 Select and document a redistributable map source, attribution, geographic extent, resolution, and package-size budget for the stand.
- [x] 4.2 Package a georeferenced local map base and Leaflet marker assets for the selected Ruta del Telar extent.
- [x] 4.3 Make map components select local layers and icons in exhibition mode while preserving station, actor, and imperdible controls.
- [x] 4.4 Extend snapshot preparation to store suggested-journey route geometry as local GeoJSON and render it without OSRM.
- [x] 4.5 Render a straight-line local fallback when packaged route geometry is unavailable and cover both route paths with tests.
- [x] 4.6 Generate and verify a redistributable Protomaps PMTiles extract covering every snapshot coordinate and packaged journey geometry with an explicit zoom and size budget.
- [x] 4.7 Render the packaged vector basemap through the existing Leaflet maps while preserving markers, filters, popups, route polylines, attribution, and the schematic fallback.
- [x] 4.8 Add automated checks for local PMTiles metadata, HTTP range delivery, visible vector rendering, schematic fallback, and zero non-local requests.
- [x] 4.9 Record the vector-map source, attribution, regeneration command, geographic coverage, zoom limit, and package-size impact in the operator documentation.

## 5. Controlled Offline Degradation

- [x] 5.1 Make view-metric tracking a successful local no-op in exhibition mode without authenticating or writing to PocketBase.
- [x] 5.2 Identify actions for WhatsApp, Google Maps, YouTube, social media, and other remote destinations and mark or hide them consistently in exhibition mode.
- [x] 5.3 Audit application code, CSS, metadata, and media for remaining runtime remote URLs and remove them from the exhibition path.

## 6. Portable Windows Distribution

- [x] 6.1 Configure and verify the Next.js standalone output, including copied `public`, `.next/static`, exhibition artifacts, and a compatible portable Node runtime.
- [x] 6.2 Add a packaging command that assembles a clean versioned Windows distribution and emits file counts, hashes, and total size.
- [x] 6.3 Add a Windows launcher that enables exhibition mode, binds to `127.0.0.1`, selects a safe local port, waits for health, and opens Microsoft Edge in app or full-screen mode.
- [x] 6.4 Add actionable launcher failures and a documented manual startup fallback for unavailable assets, runtime, port, or browser.
- [x] 6.5 Verify that stopping or relaunching the package does not leave conflicting local server processes.
- [x] 6.6 Add a sandboxed Electron window that owns the bundled localhost server lifecycle without depending on Microsoft Edge.
- [x] 6.7 Enforce an Electron-session network policy that cancels every non-local request, popup, and navigation while physical connectivity remains enabled.
- [x] 6.8 Add startup self-diagnostics for package integrity, required runtime assets, local health, and actionable failures.
- [x] 6.9 Build a versioned portable Windows x64 distribution and ZIP with complete inventory, size, and SHA-256 checksum.
- [x] 6.10 Show an immediate branded splash with animated feedback and explicit integrity, server, content, and launch stages.
- [x] 6.11 Generate Windows PNG/ICO assets from `footer-vicuna.png` and apply them to the splash, BrowserWindow, taskbar, and executable resources.

## 7. Offline Verification

- [x] 7.1 Add unit tests for mode selection, manifest compatibility, public-field safety, integrity validation, media deduplication, and connected-mode regression.
- [x] 7.2 Add Playwright exhibition coverage for home, all catalogs, global search, representative details, favorites, agenda, maps, and suggested journeys.
- [x] 7.3 Make the exhibition Playwright project block and fail on every non-local request while allowing only localhost and local browser schemes.
- [x] 7.4 Add a packaged cold-start smoke test that verifies launcher health and a representative page from the assembled distribution.
- [ ] 7.5 Run OpenSpec validation, lint, unit tests, production build, connected E2E tests, exhibition E2E tests, and the package smoke test.
- [x] 7.6 Verify that packaged iDrive/PocketBase media is accepted by the Next.js local image policy and assert real image dimensions in both browser and Electron smoke tests.

## 8. Final Stand Readiness

- [x] 8.1 Generate the final artifact from the live approved source and review the exact entity counts, missing-media report, map coverage, video selection, and package size.
- [x] 8.2 Execute and record the complete demonstration checklist with the Electron package on any compatible Windows x64 computer while connectivity remains enabled and confirm that no device-specific preparation is required.
- [x] 8.3 Document the operator startup, shutdown, recovery, content-refresh, and pre-event verification procedures.
- [ ] 8.4 Copy the validated package and its checksum to primary and backup removable media without changing the connected web deployment.
