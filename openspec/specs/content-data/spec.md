# Content Data Specification

## Purpose
Define how the public Ruta del Telar application reads, normalizes, and falls back for territorial content from PocketBase and local mock data.

## Requirements

### Requirement: PocketBase collection mapping
The application SHALL read the PocketBase base URL from `POCKETBASE_URL` or `NEXT_PUBLIC_POCKETBASE_URL` and SHALL map logical content keys to PocketBase collections with configurable environment overrides.

#### Scenario: Default collection names are used
- **WHEN** no collection override environment variables are present
- **THEN** experiences are read from `experiencias`
- **AND** actors are read from `actores`
- **AND** stations are read from `estaciones`
- **AND** highlight spots are read from `imperdibles`
- **AND** products are read from `productos`

#### Scenario: PocketBase is not configured
- **WHEN** the base URL is missing
- **THEN** content fetchers SHALL return local mock data
- **AND** the data source SHALL be reported as `mock`
- **AND** the caller SHALL receive an explanatory error message

### Requirement: Approved public content only
The application SHALL request only records with `estado = "aprobado"` for public content collections.

#### Scenario: Fetching public content
- **WHEN** stations, actors, products, experiences, or highlight spots are fetched from PocketBase
- **THEN** the request SHALL include a filter for approved records
- **AND** draft, review, or inactive records SHALL NOT appear in public listings through the normal fetchers

### Requirement: Content normalization
The application SHALL normalize PocketBase records into stable frontend models with slugs, titles or names, display text, relations, images, and optional coordinates.

#### Scenario: Record has enough identifying data
- **WHEN** a PocketBase record has the minimum name/title and slug data for its content type
- **THEN** the application SHALL return a normalized item for rendering
- **AND** missing optional display fields SHALL use safe fallback text

#### Scenario: Record cannot be rendered
- **WHEN** a PocketBase record lacks the minimum identifying fields needed for its content type
- **THEN** the application SHALL exclude that record from normalized results
- **AND** if all records fail normalization, the application SHALL fall back to local mock data

### Requirement: Text cleanup
The application SHALL clean text returned by PocketBase before display.

#### Scenario: Text contains HTML or encoded entities
- **WHEN** a field contains HTML tags, HTML entities, or mojibake patterns
- **THEN** the application SHALL strip unsafe markup
- **AND** decode supported entities
- **AND** repair known mojibake patterns where possible
- **AND** collapse extra whitespace

### Requirement: PocketBase file URLs
The application SHALL construct PocketBase file URLs only when the base URL, record collection ID, record ID, and file name are available.

#### Scenario: File metadata is complete
- **WHEN** a normalized item has a file field and valid PocketBase record metadata
- **THEN** the generated image URL SHALL point to `/api/files/{collectionId}/{recordId}/{fileName}` on the configured PocketBase base URL

#### Scenario: File metadata is incomplete
- **WHEN** a file name or required record metadata is missing
- **THEN** the application SHALL omit the image URL
- **AND** UI components SHALL render their configured visual fallback

### Requirement: Relation context
The application SHALL resolve related stations, actors, products, experiences, and highlight spots using record IDs first and slug or text matching as fallbacks.

#### Scenario: Detail context is requested
- **WHEN** a detail page asks for the context of a station, actor, product, experience, or highlight spot
- **THEN** the application SHALL include directly related records by matching record IDs where available
- **AND** it SHALL use station slug, station locality, or place text as fallback matching signals

### Requirement: Data source visibility
List pages SHALL expose whether rendered data came from PocketBase or from mock fallback data.

#### Scenario: Listing data is loaded
- **WHEN** a listing page renders content from a result fetcher
- **THEN** the page SHALL render a data source badge
- **AND** the badge SHALL distinguish PocketBase data from mock fallback data
