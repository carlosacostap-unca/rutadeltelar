# Events And Journeys Specification

## Purpose
Define event, imperdible, static agenda, and suggested journey behavior for visitors planning a Ruta del Telar visit.

## Requirements

### Requirement: Imperdible agenda and highlights
The imperdibles page SHALL provide agenda and highlighted-place views over the same approved imperdible dataset.

#### Scenario: Upcoming events exist
- **WHEN** at least one imperdible has type `evento` and an event date
- **THEN** the imperdibles page SHALL open on the agenda view
- **AND** agenda events SHALL be sorted by ascending date
- **AND** events SHALL be grouped by localized date label

#### Scenario: No upcoming events exist
- **WHEN** no imperdible event has an event date
- **THEN** the imperdibles page SHALL open on the destacados view
- **AND** the agenda view SHALL show an empty event state if selected

#### Scenario: Highlighted imperdibles are shown
- **WHEN** the destacados view is active
- **THEN** event-type imperdibles SHALL be excluded
- **AND** remaining imperdibles SHALL be sorted by priority order alta, media, baja
- **AND** type filter chips SHALL restrict highlighted imperdibles by type

### Requirement: Event calendar export
Event detail UI SHALL allow calendar export for imperdibles that have event dates.

#### Scenario: Event has a date
- **WHEN** an imperdible detail has `eventDate`
- **THEN** the UI SHALL be able to generate an ICS file using the event title, date, location, and description

#### Scenario: Event date is missing
- **WHEN** an imperdible does not have `eventDate`
- **THEN** calendar export SHALL NOT be offered for that record

### Requirement: Suggested journeys
The recorridos page SHALL generate suggested journeys from available stations and their related experiences, actors, and imperdibles.

#### Scenario: Station has related content
- **WHEN** a station has at least one related experience, actor, or imperdible
- **THEN** the application SHALL create a suggested journey for that station
- **AND** the journey slug SHALL be `recorrido-{station.slug}`
- **AND** the journey SHALL include steps for station arrival and any lead experience, lead actor, or lead imperdible

#### Scenario: No station journey can be generated
- **WHEN** available content does not produce any station-specific journey
- **THEN** the application SHALL return a fallback Ruta del Telar journey based on mock content

### Requirement: Journey details
Journey detail pages SHALL render the selected suggested journey and its ordered steps.

#### Scenario: Journey exists
- **WHEN** a visitor opens a journey detail route for an existing journey slug
- **THEN** the page SHALL show the journey title, description, duration, theme, station, related content, and ordered steps

#### Scenario: Journey does not exist
- **WHEN** a visitor opens a journey detail route for an unknown slug
- **THEN** the page SHALL handle the missing journey as not found

### Requirement: Static agenda page
The agenda page SHALL provide a lightweight agenda entry point using local curated agenda entries.

#### Scenario: Agenda page loads
- **WHEN** the agenda page is requested
- **THEN** it SHALL show curated agenda items with day, title, and metadata
- **AND** the page SHALL remain available independently of PocketBase event data
