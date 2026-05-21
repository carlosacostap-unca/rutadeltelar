## MODIFIED Requirements

### Requirement: Catalog multimedia rendering
Public catalog cards, listing rows, highlighted catalog sections, related-content cards, and detail pages SHALL use the normalized cover and gallery outputs for stations, actors, products, experiences, and imperdibles.

#### Scenario: Detail cover opens full image modal
- **WHEN** a detail page renders a cover image
- **THEN** clicking the cover image SHALL open a modal showing the complete image without cropping or distortion

#### Scenario: Detail gallery thumbnail opens full image modal
- **WHEN** a detail page renders gallery thumbnails
- **THEN** clicking a gallery thumbnail SHALL open a modal showing the complete image without cropping or distortion
- **AND** the modal SHALL include previous and next controls when there is more than one image

#### Scenario: Public carousel has directional controls
- **WHEN** a public horizontal carousel is rendered
- **THEN** it SHALL include controls to move left and right through the carousel content
