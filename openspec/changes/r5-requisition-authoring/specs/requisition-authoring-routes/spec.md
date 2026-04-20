## ADDED Requirements

### Requirement: Jobs-side requisition authoring routes are registered
The system SHALL register `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` under `jobs.workflow-state` with `canUseJobRequisitionBranching` and dashboard fallback.

#### Scenario: Requisition route metadata is explicit
- **WHEN** route metadata is requested for a Jobs-side requisition route
- **THEN** the metadata identifies the Jobs domain, workflow-state module, `canUseJobRequisitionBranching`, and implemented state

### Requirement: Requisition workflow drift is explicit
The system SHALL model stale workflow, removed stage, changed required fields, and recoverable save failure as explicit states instead of generic errors.

#### Scenario: Removed workflow stage is modeled
- **WHEN** the authoring route detects a removed stage
- **THEN** it exposes a workflow-drift state with a stable dashboard or authoring parent target
