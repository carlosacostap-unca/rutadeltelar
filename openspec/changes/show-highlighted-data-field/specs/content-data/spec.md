## MODIFIED Requirements

### Requirement: Content normalization
The application SHALL normalize PocketBase records into stable frontend models with slugs, titles or names, display text, relations, images, optional coordinates, optional image focus metadata, and optional highlighted data.

#### Scenario: Record has enough identifying data
- **WHEN** a PocketBase record has the minimum name/title and slug data for its content type
- **THEN** the application SHALL return a normalized item for rendering
- **AND** missing optional display fields SHALL use safe fallback text

#### Scenario: Record cannot be rendered
- **WHEN** a PocketBase record lacks the minimum identifying fields needed for its content type
- **THEN** the application SHALL exclude that record from normalized results
- **AND** if all records fail normalization, the application SHALL fall back to local mock data

#### Scenario: Record includes highlighted data
- **WHEN** a station, actor, product, experience, or imperdible record includes a non-empty `dato_destacado` value
- **THEN** the normalized model SHALL expose that value as optional highlighted data for rendering
- **AND** records without `dato_destacado` SHALL remain renderable without empty UI
