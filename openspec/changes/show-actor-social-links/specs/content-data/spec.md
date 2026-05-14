## MODIFIED Requirements

### Requirement: Content normalization
The application SHALL normalize PocketBase records into stable frontend models with slugs, titles or names, display text, relations, images, optional coordinates, and actor social URL fields.

#### Scenario: Record has enough identifying data
- **WHEN** a PocketBase record has the minimum name/title and slug data for its content type
- **THEN** the application SHALL return a normalized item for rendering
- **AND** missing optional display fields SHALL use safe fallback text

#### Scenario: Record cannot be rendered
- **WHEN** a PocketBase record lacks the minimum identifying fields needed for its content type
- **THEN** the application SHALL exclude that record from normalized results
- **AND** if all records fail normalization, the application SHALL fall back to local mock data

#### Scenario: Actor record has social URLs
- **WHEN** an actor PocketBase record includes `facebook_url`, `instagram_url`, or `pagina_web_url`
- **THEN** the normalized actor model SHALL include the populated URL fields
- **AND** empty social URL fields SHALL be omitted or left undefined
