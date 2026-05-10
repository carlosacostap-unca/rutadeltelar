# Public Catalog Specification

## Purpose
Define the public browsing experience for stations, actors, products, experiences, imperdibles, and detail pages in the Ruta del Telar application.

## Requirements

### Requirement: Home discovery
The home page SHALL present a mobile-first discovery entry point for the Ruta del Telar with territorial, product, actor, and upcoming event content.

#### Scenario: Home content is available
- **WHEN** the home page loads
- **THEN** it SHALL display the Ruta del Telar hero
- **AND** it SHALL list stations as territorial entry points
- **AND** it SHALL show products as a horizontal discovery carousel
- **AND** it SHALL show actors whose type includes artisan/artesano as a community carousel

#### Scenario: Upcoming events exist
- **WHEN** highlight spots include events with dates from now through the next 30 days
- **THEN** the home page SHALL show an agenda section
- **AND** events SHALL be sorted by ascending event date
- **AND** each event SHALL link to its imperdible detail page

### Requirement: Station catalog
The stations page SHALL let visitors browse approved stations by list or map.

#### Scenario: Filtering stations
- **WHEN** a visitor enters a station search query
- **THEN** stations SHALL be filtered by station name or locality

#### Scenario: Filtering by department
- **WHEN** department values are available
- **THEN** the page SHALL expose department filter chips
- **AND** selecting a department SHALL restrict results to stations in that department

#### Scenario: Switching station views
- **WHEN** the visitor switches from list to map view
- **THEN** the page SHALL render the same filtered stations in the territory map
- **AND** related actor and imperdible map data SHALL remain available to the map component

### Requirement: Actor catalog
The actors page SHALL let visitors browse actors and artisans by text, actor type, and station.

#### Scenario: Filtering actors
- **WHEN** a visitor enters a search query
- **THEN** actors SHALL be filtered by name or craft

#### Scenario: Actor type and station filters
- **WHEN** actor types or stations are available
- **THEN** the page SHALL expose closed filter chips for those values
- **AND** selected filters SHALL be shown as active chips that can be cleared individually
- **AND** visitors SHALL be able to clear all active filters at once

### Requirement: Product catalog
The products page SHALL let visitors browse products by text, category, subcategory, and station.

#### Scenario: Filtering products
- **WHEN** a visitor enters a search query
- **THEN** products SHALL be filtered by name, description, or technique

#### Scenario: Category changes
- **WHEN** the visitor selects a product category
- **THEN** the subcategory filter SHALL reset to all
- **AND** available subcategories SHALL be recalculated from products in the selected category

#### Scenario: Product cards
- **WHEN** products are displayed
- **THEN** each card SHALL link to the product detail route
- **AND** it SHALL show category, optional subcategory, station name when available, and an image or fallback

### Requirement: Experience catalog
The experiences page SHALL let visitors browse experiences by category, duration, station, and textual content.

#### Scenario: Experiences are listed
- **WHEN** approved experiences are available
- **THEN** the page SHALL show experience cards with title, description, category/tag, duration, location, and image fallback where needed
- **AND** each card SHALL link to its detail route

### Requirement: Detail pages
Each public content detail page SHALL render a detail view for the selected slug and related context from the same territory or explicit relations.

#### Scenario: Station detail
- **WHEN** a visitor opens a station detail route
- **THEN** the page SHALL show station identity, gallery or image fallback, location details, and related actors, experiences, imperdibles, and products

#### Scenario: Actor detail
- **WHEN** a visitor opens an actor detail route
- **THEN** the page SHALL show actor identity, craft/type, station context, contact information when present, subtype fields when present, and related experiences, imperdibles, and products

#### Scenario: Product detail
- **WHEN** a visitor opens a product detail route
- **THEN** the page SHALL show product identity, category, optional subcategory, techniques, station context, and related actors

#### Scenario: Experience detail
- **WHEN** a visitor opens an experience detail route
- **THEN** the page SHALL show experience identity, duration, location, intensity, includes, stops, responsible actor when available, station context, and related imperdibles

#### Scenario: Imperdible detail
- **WHEN** a visitor opens an imperdible detail route
- **THEN** the page SHALL show imperdible identity, type, priority, location, event date when available, gallery, practical details, and related station, experiences, actors, and products
