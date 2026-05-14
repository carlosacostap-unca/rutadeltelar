## MODIFIED Requirements

### Requirement: Content normalization
The application SHALL normalize PocketBase records into stable frontend models with slugs, titles or names, display text, relations, images, optional coordinates, and optional image focus metadata.

#### Scenario: Record has enough identifying data
- **WHEN** a PocketBase record has the minimum name/title and slug data for its content type
- **THEN** the application SHALL return a normalized item for rendering
- **AND** missing optional display fields SHALL use safe fallback text

#### Scenario: Record cannot be rendered
- **WHEN** a PocketBase record lacks the minimum identifying fields needed for its content type
- **THEN** the application SHALL exclude that record from normalized results
- **AND** if all records fail normalization, the application SHALL fall back to local mock data

#### Scenario: Record includes image focus metadata
- **WHEN** a station, actor, product, experience, or imperdible record includes `foto_portada_focus_x`, `foto_portada_focus_y`, or `galeria_fotos_focus`
- **THEN** the normalized model SHALL expose cover focus metadata and gallery-image focus metadata for rendering
- **AND** missing or invalid coordinates SHALL be safe to render as centered focus
