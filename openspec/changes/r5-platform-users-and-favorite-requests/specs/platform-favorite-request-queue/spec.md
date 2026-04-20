## ADDED Requirements

### Requirement: Platform favorite-request queue routes are registered
The system SHALL register `/favorites-request` and `/favorites-request/:id` as platform-owned queue routes under `sysadmin.favorite-requests` with `canManageFavoriteRequests` and dashboard fallback.

#### Scenario: Platform queue is separate from org favorite requests
- **WHEN** route metadata is requested for `/favorites-request/:id`
- **THEN** the route uses platform favorite-request capability and does not use org favorites capability or `/favorites/request*` ownership

### Requirement: Platform favorite-request actions are deterministic
The system SHALL model approve, reject, and reopen actions with explicit available or blocked readiness based on queue state.

#### Scenario: Resolved request blocks approve action
- **WHEN** a favorite request is already resolved
- **THEN** approve is blocked with an explicit resolved-state reason
