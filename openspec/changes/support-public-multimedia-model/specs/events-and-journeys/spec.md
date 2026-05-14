## ADDED Requirements

### Requirement: Event and journey multimedia rendering
Imperdible agenda views, highlighted imperdible views, imperdible detail pages, and generated journey views SHALL use normalized multimedia outputs.

#### Scenario: Agenda event has a new cover image
- **WHEN** an imperdible event record includes `foto_portada`
- **THEN** agenda and highlighted event summaries SHALL render `foto_portada` as the event image

#### Scenario: Journey station uses legacy cover fallback
- **WHEN** a generated journey references a station without `foto_portada` and with legacy `fotos`
- **THEN** the journey summary and detail SHALL render `fotos[0]` as the station image
