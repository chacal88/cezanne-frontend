## ADDED Requirements

### Requirement: Requisition authoring validation evidence is required
The system SHALL include automated validation for route metadata, capability gates, draft/save/stale-state helpers, and separation from R1 Jobs authoring.

#### Scenario: Validation proves ownership separation
- **WHEN** requisition validation runs
- **THEN** it proves Jobs-side requisition routes and settings-side workflow administration use separate route ownership and capabilities
