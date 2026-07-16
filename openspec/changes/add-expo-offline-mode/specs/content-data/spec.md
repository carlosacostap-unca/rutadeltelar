## ADDED Requirements

### Requirement: Exhibition snapshot generation
The system SHALL generate a read-only exhibition snapshot from approved public PocketBase content while connectivity is available.

#### Scenario: Snapshot generation succeeds
- **WHEN** the preparation command can read all required public collections and files
- **THEN** it SHALL export normalized stations, actors, products, experiences, imperdibles, relations, and required presentation data
- **AND** the manifest SHALL include a schema version, generation timestamp, non-secret source identifier, entity counts, file inventory, and integrity hashes

#### Scenario: Snapshot content is invalid
- **WHEN** required entities are empty, slugs are duplicated, relations are invalid, or required files cannot be materialized
- **THEN** snapshot generation SHALL fail with an actionable report
- **AND** it SHALL NOT mark the artifact as ready for distribution

### Requirement: Exhibition snapshot source selection
The data layer SHALL use the validated exhibition snapshot as its exclusive catalog source while exhibition mode is active.

#### Scenario: Valid snapshot is available
- **WHEN** exhibition mode starts with a compatible and valid snapshot
- **THEN** all public data reads SHALL resolve from that snapshot
- **AND** the application SHALL preserve the same normalized content contracts used by connected pages

#### Scenario: Snapshot is missing or incompatible
- **WHEN** exhibition mode starts without a snapshot or with an unsupported schema version
- **THEN** the local health check SHALL fail
- **AND** the launcher SHALL report that the exhibition package must be regenerated

### Requirement: Local exhibition media
Every media resource required by snapshot content SHALL resolve to a verified local file in exhibition mode.

#### Scenario: PocketBase media is materialized
- **WHEN** the generator encounters an approved cover, gallery item, icon, or selected video
- **THEN** it SHALL download or derive the configured exhibition variant without modifying the remote original
- **AND** the snapshot SHALL reference a stable local path and integrity hash

#### Scenario: Duplicate media content is encountered
- **WHEN** multiple records resolve to the same media content
- **THEN** the package SHALL be allowed to store one deduplicated local file
- **AND** every referencing record SHALL continue to render that file

### Requirement: Public-only snapshot safety
The generated exhibition artifact SHALL contain only fields and files required for the public visitor experience.

#### Scenario: Artifact is inspected for distribution
- **WHEN** snapshot generation completes
- **THEN** the artifact SHALL exclude PocketBase administrative credentials, authentication tokens, unpublished records, and non-allowlisted private fields
- **AND** its validation report SHALL state the included entity and file counts
