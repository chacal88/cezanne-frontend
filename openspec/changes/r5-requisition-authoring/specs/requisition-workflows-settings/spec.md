## ADDED Requirements

### Requirement: Requisition workflows settings route is registered
The system SHALL register `/requisition-workflows` under `settings.hiring-flow` with `canManageHiringFlowSettings` and dashboard fallback.

#### Scenario: Workflow settings route stays out of Jobs execution
- **WHEN** route metadata is requested for `/requisition-workflows`
- **THEN** the route is owned by settings/hiring-flow and does not use Jobs workflow-state ownership
