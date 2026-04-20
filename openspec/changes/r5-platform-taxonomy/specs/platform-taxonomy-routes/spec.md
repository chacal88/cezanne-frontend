## ADDED Requirements

### Requirement: Platform taxonomy routes are registered
The system SHALL register `/sectors`, `/sectors/:id`, `/sectors/:sector_id/subsectors`, and `/subsectors/:id` under `sysadmin.taxonomy` with `canManageTaxonomy` and dashboard fallback.

#### Scenario: Taxonomy metadata is explicit
- **WHEN** route metadata is requested for a taxonomy route
- **THEN** the metadata identifies `sysadmin.taxonomy`, the taxonomy route family, `canManageTaxonomy`, and implemented state

### Requirement: Taxonomy parent-child return behavior is deterministic
The system SHALL model parent return behavior for sector detail, nested subsector list, and subsector detail without redirecting to unrelated platform groups.

#### Scenario: Nested subsector list returns to sector detail
- **WHEN** `/sectors/:sector_id/subsectors` is opened
- **THEN** its parent target is `/sectors/:sector_id`
