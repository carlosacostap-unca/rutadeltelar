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
The exhibition distribution SHALL provide a portable Electron application that starts the bundled local server and opens the application without requiring installation, a separate browser, administrative privileges, restart, or network-adapter changes.

#### Scenario: Successful cold start
- **WHEN** an operator launches the package on any compatible Windows device
- **THEN** the launcher SHALL start the server bound to localhost
- **AND** it SHALL wait until local health is confirmed
- **AND** it SHALL open the application in its bundled app-like or full-screen browser window

#### Scenario: Device remains connected
- **WHEN** Ethernet, Wi-Fi, or another system network adapter remains active
- **THEN** the Electron session SHALL cancel every non-local HTTP(S) request and external navigation
- **AND** the core demonstration SHALL continue using only packaged resources

#### Scenario: Package self-diagnostic
- **WHEN** the portable application starts
- **THEN** it SHALL validate the package manifest, required files, local server health, and network-blocking policy before showing the visitor experience
- **AND** it SHALL report an actionable local error if validation fails

#### Scenario: Visible startup progress
- **WHEN** integrity validation and local server startup take noticeable time
- **THEN** the application SHALL immediately show a branded splash window with a loading indicator and current startup stage
- **AND** it SHALL replace the splash with the visitor experience only after local health and rendering succeed

#### Scenario: Branded Windows identity
- **WHEN** the portable package is viewed or executed on Windows
- **THEN** the executable, taskbar window, and splash SHALL use the packaged Ruta del Telar vicuña icon derived from `public/images/home/footer-vicuna.png`

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
- **WHEN** the final package is cold-started on a compatible Windows device while system connectivity may remain enabled
- **THEN** the self-diagnostic and documented demonstration checklist SHALL complete successfully
- **AND** no preparation unique to that device SHALL be required
