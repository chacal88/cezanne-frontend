## Context

R1 Jobs authoring already branches when `canUseJobRequisitionBranching` is available, and R4 hiring-flow settings exposes requisition adjacency. R5 adds explicit route foundations for requisition authoring execution and workflow administration while preserving those earlier contracts.

## Goals / Non-Goals

**Goals:**
- Register `/build-requisition`, `/job-requisitions/:jobWorkflowUuid`, `/job-requisitions/:jobWorkflowUuid/:jobStageUuid`, and `/requisition-workflows`.
- Keep `/build-requisition` and `/job-requisitions*` under `jobs.workflow-state` with `canUseJobRequisitionBranching`.
- Keep `/requisition-workflows` under `settings.hiring-flow` with `canManageHiringFlowSettings`.
- Model draft, explicit save, submit, validation-error, recoverable-failure, stale-workflow, and workflow-drift states.

**Non-Goals:**
- No backend persistence, autosave service, notification destinations, workflow engine, or replacement of R1 Jobs create/edit.

## Decisions

1. Requisition execution stays in Jobs.
   - `/build-requisition` and `/job-requisitions*` are Jobs workflow-state routes and fall back to `/dashboard` when requisition branching is unavailable.

2. Requisition workflow configuration stays in Settings.
   - `/requisition-workflows` is a settings/hiring-flow administration page and does not own active authoring execution state.

3. Draft behavior is explicit but local-only.
   - This slice models local draft/save/submit states and data-loss warning needs; server persistence is deferred.

4. Workflow drift is first-class.
   - Removed stage, changed required fields, and stale workflow are modeled separately from generic error states.
