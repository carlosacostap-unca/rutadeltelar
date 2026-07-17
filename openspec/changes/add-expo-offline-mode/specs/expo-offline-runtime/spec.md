## ADDED Requirements

### Requirement: Explicit exhibition mode
The application SHALL activate the offline exhibition behavior only when `RUTA_EXPO_OFFLINE=true` is present at server startup, and SHALL keep the connected web behavior as the default.

#### Scenario: Exhibition mode is enabled
- **WHEN** the local server starts with `RUTA_EXPO_OFFLINE=true`
- **THEN** the application SHALL use the offline snapshot and local resources
- **AND** it SHALL NOT probe PocketBase or other remote dependencies before rendering core content

#### Scenario: Exhibition mode is not enabled
- **WHEN** the application starts without `RUTA_EXPO_OFFLINE=true`
- **THEN** it SHALL retain the existing connected PocketBase behavior and fallback rules

### Requirement: Offline core navigation
The exhibition package SHALL support the complete demonstration path without outbound network access.

#### Scenario: Visitor navigates the exhibition experience
- **WHEN** the device has no network connectivity and exhibition mode is active
- **THEN** home, catalogs, global search, detail pages, favorites, agenda, maps, and suggested journeys SHALL remain usable
- **AND** their required content, scripts, styles, fonts, images, icons, and route data SHALL be served locally

### Requirement: Controlled external features
Features that require an external destination or remote write SHALL degrade without delaying or breaking the exhibition experience.

#### Scenario: Metrics are triggered offline
- **WHEN** a view tracker runs in exhibition mode
- **THEN** it SHALL complete locally without sending a request to PocketBase
- **AND** a metrics failure SHALL NOT be shown to the visitor

#### Scenario: Visitor encounters an external action
- **WHEN** an action requires WhatsApp, Google Maps, YouTube, social media, or another Internet destination
- **THEN** the UI SHALL identify that the action requires connectivity or omit the action in exhibition mode
- **AND** the action SHALL NOT cause an automatic remote request

### Requirement: Portable Windows startup
The exhibition distribution SHALL provide a portable Windows launcher that starts the bundled local server and opens the application without requiring installation, administrative privileges, restart, or network-adapter changes.

#### Scenario: Successful cold start
- **WHEN** an operator launches the package on any compatible Windows device
- **THEN** the launcher SHALL start the server bound to localhost
- **AND** it SHALL wait until local health is confirmed
- **AND** it SHALL open the application in an app-like or full-screen browser window

#### Scenario: Startup fails
- **WHEN** the runtime, local assets, or a usable port are unavailable
- **THEN** the launcher SHALL stop startup
- **AND** it SHALL show an actionable local error instead of opening a broken page

### Requirement: Internally enforced offline acceptance gate
The exhibition package MUST pass automated and portable acceptance with non-local networking blocked by the application itself.

#### Scenario: Automated exhibition suite runs
- **WHEN** end-to-end tests exercise the defined demonstration paths with non-local requests blocked
- **THEN** all paths SHALL complete without any outbound HTTP request
- **AND** any attempted remote request SHALL fail the suite

#### Scenario: Arbitrary compatible device is validated
- **WHEN** the final package is cold-started on a compatible Windows device
- **THEN** the documented demonstration checklist SHALL complete successfully
- **AND** no preparation unique to that device SHALL be required
