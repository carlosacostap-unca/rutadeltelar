## ADDED Requirements

### Requirement: Application exposes installable web metadata
The system SHALL expose a web application manifest with the Ruta del Telar name, a standalone display mode, a root start URL, brand colors, and application icons suitable for Android and Apple mobile devices.

#### Scenario: Browser loads the public application metadata
- **WHEN** a user opens any public Ruta del Telar page
- **THEN** the document SHALL reference a valid web manifest and an Apple touch icon

#### Scenario: Supported browser evaluates installation metadata
- **WHEN** a compatible browser evaluates the public application over HTTPS
- **THEN** it SHALL receive a manifest identifying the application as “Ruta del Telar” with a root start URL and standalone display mode

### Requirement: User receives an appropriate installation path
The system SHALL offer installation only while the application is not already running in standalone mode and SHALL select the interaction appropriate to the current mobile platform.

#### Scenario: Android-compatible browser can prompt for installation
- **WHEN** the browser emits an installation prompt event and the user has not dismissed the invitation during the dismissal period
- **THEN** the system SHALL show an accessible install invitation that invokes the browser prompt only after the user selects its install action

#### Scenario: User visits from Safari on iPhone or iPad
- **WHEN** the application is opened in Safari on an iPhone or iPad and is not installed
- **THEN** the system SHALL present accessible instructions to use Share and add the application to the home screen

#### Scenario: Application is already installed
- **WHEN** the application is running in standalone mode
- **THEN** the system SHALL not show an installation invitation or Safari installation instructions

#### Scenario: User dismisses the invitation
- **WHEN** a user closes an installation invitation
- **THEN** the system SHALL hide it and SHALL not show it again for 30 days on that device

### Requirement: Installation support preserves live content behavior
The system SHALL register a versioned service worker for the normal web application without changing the existing Expo offline mode or caching dynamic application data for offline reuse.

#### Scenario: Navigation is unavailable from the network
- **WHEN** a navigation request fails because the normal web application is offline
- **THEN** the service worker SHALL return an offline fallback page explaining that an internet connection is required to load the requested content

#### Scenario: Dynamic data request is made
- **WHEN** the application requests dynamic content or media
- **THEN** the service worker SHALL not serve a stale cached response for that request

#### Scenario: Expo offline mode is active
- **WHEN** Ruta del Telar runs with Expo offline mode enabled
- **THEN** the system SHALL not show the PWA installation experience or register the PWA service worker
