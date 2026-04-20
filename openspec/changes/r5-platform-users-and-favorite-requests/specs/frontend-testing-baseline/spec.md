## ADDED Requirements

### Requirement: Platform users and requests validation evidence is required
The system SHALL include automated validation for route metadata, capability separation, user filter parsing, favorite-request action readiness, navigation links, and build/test success.

#### Scenario: Validation proves org/platform separation
- **WHEN** the validation suite runs
- **THEN** it proves `/users/invite` and `/favorites/request*` remain org-scoped while `/users*` and `/favorites-request*` are platform-scoped
