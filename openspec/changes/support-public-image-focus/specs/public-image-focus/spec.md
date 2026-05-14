## ADDED Requirements

### Requirement: Cover focus rendering
The public application SHALL apply configured cover image focus to cropped cover and thumbnail images for stations, actors, products, experiences, and imperdibles.

#### Scenario: Cover focus is complete
- **WHEN** an entity image is rendered with `object-fit: cover`
- **AND** the normalized entity has finite `foto_portada_focus_x` and `foto_portada_focus_y` values
- **THEN** the image SHALL use `object-position: <x>% <y>%`

#### Scenario: Cover focus is incomplete
- **WHEN** an entity image is rendered with `object-fit: cover`
- **AND** either cover focus coordinate is missing or invalid
- **THEN** the image SHALL use `object-position: 50% 50%`

### Requirement: Gallery focus rendering
The public application SHALL apply configured gallery image focus to cropped gallery thumbnails by file name.

#### Scenario: Gallery focus exists for a cropped image
- **WHEN** a gallery image thumbnail is rendered with `object-fit: cover`
- **AND** `galeria_fotos_focus` contains a finite `{ x, y }` entry for that file name
- **THEN** the gallery image SHALL use `object-position: <x>% <y>%`

#### Scenario: Gallery focus is missing
- **WHEN** a gallery image thumbnail is rendered with `object-fit: cover`
- **AND** no valid focus entry exists for that file name
- **THEN** the gallery image SHALL use `object-position: 50% 50%`

### Requirement: Non-destructive focus consumption
The public application SHALL only read image focus fields and SHALL NOT mutate PocketBase schema or image records.

#### Scenario: Public app loads focus metadata
- **WHEN** focus fields are available in PocketBase records
- **THEN** the public app SHALL consume them for rendering only
- **AND** it SHALL NOT write or migrate focus data
