## Purpose

Define how public Ruta del Telar links expose recognizable, image-backed metadata to social platforms and messaging applications.

## ADDED Requirements

### Requirement: Detail links expose entity-specific social metadata
The application SHALL expose a title, description, canonical URL, and preview image for every public station, actor, product, experience, imperdible, and suggested journey detail link.

#### Scenario: Entity has a cover image
- **WHEN** a public entity detail page has a valid cover image
- **THEN** its social metadata SHALL use that image as the preview image
- **AND** the preview SHALL identify the entity with its title and description

#### Scenario: Suggested journey has a principal station image
- **WHEN** a suggested journey detail page has a principal station with a valid image
- **THEN** its social metadata SHALL use the principal station image as the journey preview image

### Requirement: Social previews use an institutional fallback
The application SHALL use a dedicated Ruta del Telar institutional preview image whenever a public page has no valid content image.

#### Scenario: Entity has no cover image
- **WHEN** a station, actor, product, experience, or imperdible detail page has no valid cover image
- **THEN** its social metadata SHALL use the institutional Ruta del Telar preview image

#### Scenario: Suggested journey has no usable station image
- **WHEN** a suggested journey and its principal station have no valid preview image
- **THEN** its social metadata SHALL use the institutional Ruta del Telar preview image

#### Scenario: General public page has no content image
- **WHEN** a public page creates social metadata without an explicit image
- **THEN** its social metadata SHALL use the institutional Ruta del Telar preview image

### Requirement: Preview images are consumable by external platforms
The application SHALL expose social preview images as absolute public URLs with large-image card metadata suitable for compatible messaging and social crawlers.

#### Scenario: A crawler reads public page metadata
- **WHEN** a compatible external crawler reads a public page
- **THEN** the Open Graph metadata SHALL include the absolute preview image URL and descriptive alternative text
- **AND** the Twitter-compatible metadata SHALL request a large image card using the same preview image
