## ADDED Requirements

### Requirement: Platform master-data validation evidence is required
The system SHALL include automated validation for platform master-data route metadata, access capability boundaries, page-state helpers, navigation exposure, and direct-entry fallback behavior.

#### Scenario: Master-data tests prove platform separation
- **WHEN** the platform master-data test suite runs
- **THEN** it proves SysAdmin access, non-SysAdmin fallback, route metadata, state outcomes, and separation from HC-admin billing routes
