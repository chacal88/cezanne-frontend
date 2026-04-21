# R5 Requisition Authoring Open Points

## Purpose

This document records the decisions that must be resolved before opening the `R5` requisition authoring implementation package.

It covers:
- the boundary between Jobs execution routes and Settings workflow configuration
- full requisition authoring workflows that complete the `R1` `jobRequisition` branching baseline
- route behavior for build, workflow-stage navigation, and requisition workflow administration
- capability, fallback, refresh, and validation evidence requirements

## Source baseline

Built on top of:
- `r5-decision-register.md`
- `r5-master-plan.md`
- `roadmap.md`
- `domains.md`
- `modules.md`
- `screens.md`
- `access-model.md`
- `capabilities.md`
- `navigation-and-return-behavior.md`

## Confirmed baseline

Confirmed:
- R1 already introduced the minimum `jobRequisition` branching needed for Jobs create/edit behavior.
- R5 completes full requisition authoring workflows.
- `/build-requisition` belongs to the `jobs.workflow-state` support contract.
- `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` belongs to the `jobs.workflow-state` support contract.
- `/requisition-workflows` belongs to `settings.hiring-flow`.
- requisition authoring must not consume or replace the Jobs domain.
- requisition workflow configuration must remain separate from requisition execution/authoring.

Confirmed R5 requisition routes from `screens.md`:
- `/build-requisition`
- `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?`
- `/requisition-workflows`

Confirmed capability signals:
- `canUseJobRequisitionBranching` gates Jobs-side requisition authoring and workflow-state routes.
- `canManageHiringFlowSettings` gates hiring-flow administration and `/requisition-workflows`.
- `jobRequisition` and `seeJobRequisition` remain feature/subscription/pivot inputs for route availability.

## R5 requisition authoring foundation decisions implemented

The `r5-requisition-authoring` frontend foundation resolves RQ1-RQ10 at route/state level:
- `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` are Jobs-side `jobs.workflow-state` routes gated by `canUseJobRequisitionBranching`.
- `/requisition-workflows` is a settings/hiring-flow administration route gated by `canManageHiringFlowSettings`.
- `canUseJobRequisitionBranching` requires authenticated HC admin context plus `jobRequisition`; non-admin HC users do not enter R5 requisition authoring routes.
- authoring state models include local draft, explicit save, submit, validation error, recoverable failure, stale workflow, and workflow drift.
- autosave and backend draft persistence are intentionally not implemented; save behavior is modeled as explicit-save only.
- workflow drift is first-class through removed-stage, changed-required-fields, reassigned-approval, and stale-workflow reasons.
- R1 Jobs create/edit behavior remains unchanged; requisition authoring is an adjacent Jobs workflow-state route family.
- no new typed notification destinations are introduced by this frontend foundation.
- validation evidence covers route metadata, capability gates, state helpers, and settings-vs-Jobs ownership separation.

Deferred beyond this foundation:
- backend requisition API integration, autosave persistence, workflow engine mutations, notification destination additions, and production approval/signoff reassignment behavior.

## Open decisions

### RQ1 — Authoring versus configuration ownership

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Freeze the boundary between requisition authoring execution and workflow configuration.

Recommendation:
- keep `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` under `jobs.workflow-state`.
- keep `/requisition-workflows` under `settings.hiring-flow`.

Must define:
- which shared models can be used by both sides.
- which mutations belong to authoring versus configuration.
- which route owns save, submit, cancel, and reset behavior.
- which domain owns invalidation when configuration changes affect active authoring sessions.

### RQ2 — `/build-requisition` route contract

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Define `/build-requisition` as a task flow with explicit entry, exit, and fallback behavior.

Must define:
- whether the route starts a new requisition draft or resumes an existing draft.
- required query/search params, if any.
- default entry source from Jobs authoring.
- behavior when `jobRequisition` is disabled.
- behavior when `seeJobRequisition` is missing.
- cancel destination.
- success destination after a requisition is created or submitted.
- stale configuration handling if workflow setup changes during authoring.

Recommendation:
- treat `/build-requisition` as a bounded task flow whose parent context is explicit rather than inferred from global Jobs state.

### RQ3 — `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` route contract

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Define the URL-state, stage navigation, and direct-entry behavior for requisition workflow pages.

Must define:
- whether `jobWorkflowUuid` identifies a requisition workflow, job workflow, or requisition instance.
- whether `jobStageUuid` is optional stage selection or required for actionability.
- default stage resolution when `jobStageUuid` is absent.
- not-found behavior for missing workflow or stage.
- stale workflow behavior when a stage was removed or reordered.
- back/refresh behavior for stateful URL use.
- relationship to Jobs detail and Jobs authoring return targets.

Recommendation:
- model it as a `PageWithStatefulUrl` with explicit stage resolution and stable stale-state behavior.

### RQ4 — `/requisition-workflows` route contract

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Define `/requisition-workflows` as a settings/hiring-flow administration route.

Must define:
- whether it lists workflows, edits one workflow, or opens a workflow builder.
- relationship to `/settings/hiring-flow`.
- save/retry/readiness behavior inherited from the operational settings substrate.
- fallback when `jobRequisition` is disabled.
- fallback when the user can manage hiring flow but cannot use requisitions.
- downstream invalidation for authoring routes when workflow configuration changes.

Recommendation:
- keep `/requisition-workflows` as configuration/admin and avoid adding active requisition execution state there.

### RQ5 — Capability and deny behavior split

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Freeze the capability matrix for the three requisition routes.

Must define:
- exact route-entry inputs for `canUseJobRequisitionBranching`.
- exact route-entry inputs for `canManageHiringFlowSettings`.
- whether `seeJobRequisition` is required for all Jobs-side routes or only stateful workflow pages.
- whether HC Admin is always required.
- deny fallback for authenticated but non-admin HC users.
- deny fallback for RA users.
- deny fallback for SysAdmin users without HC context.

Recommendation:
- keep Jobs-side authoring deny fallback to Jobs/dashboard context.
- keep settings-side deny fallback to settings/dashboard context.

### RQ6 — Draft and partial-save behavior

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Define how requisition authoring handles drafts, autosave, explicit save, validation errors, and recoverable failures.

Must define:
- whether drafts are server-side or local-only during authoring.
- validation timing per section or stage.
- partial-save semantics.
- retry behavior after network failure.
- stale draft behavior after workflow configuration changes.
- data-loss warnings on cancel, back, and refresh.

Recommendation:
- align with the Jobs authoring baseline where possible, but document requisition-specific stage/workflow drift separately.

### RQ7 — Workflow drift and stale-state handling

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Define what happens when requisition workflow configuration changes while a user is authoring or reviewing a requisition.

Must define:
- stale stage behavior.
- removed stage behavior.
- changed required fields behavior.
- reassigned approval/signoff behavior.
- user-facing recovery actions.
- whether users can continue, must refresh, or must restart.

Recommendation:
- make workflow drift a first-class state, not a generic error.

### RQ8 — Integration with Jobs create/edit

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Define how full requisition authoring integrates with Jobs create/edit without replacing R1 Jobs authoring behavior.

Must define:
- entry points from job create/edit.
- whether a requisition can create a job, modify a job, or only attach to a job.
- how resetWorkflow interacts with requisition state.
- parent refresh after requisition success.
- failure handling when job save succeeds but requisition linking fails, or vice versa.

Recommendation:
- treat requisition authoring as an adjacent workflow-state flow with explicit handoff contracts to Jobs authoring and detail routes.

### RQ9 — Notification and typed destination support

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Define whether requisition authoring or workflow administration introduces new typed notification destinations.

Must define:
- destination kind for requisition authoring resume.
- destination kind for requisition workflow-stage entry.
- destination kind for workflow configuration alerts, if any.
- fallback when the target workflow or stage is stale.
- whether public approval destinations remain separate from internal authoring destinations.

Recommendation:
- keep internal requisition destinations separate from public approval/form destinations.

### RQ10 — Validation evidence and telemetry

**Status:** Accepted for `r5-requisition-authoring`

**Decision:** Define the minimum test and telemetry evidence for requisition authoring.

Must define:
- route metadata coverage for all three routes.
- unit/module-contract tests for capability decisions.
- smoke proof for direct route entry, denied entry, and happy-path route rendering.
- telemetry for authoring start, save, submit, cancel, stale workflow, denied route, and failed mutation.
- correlation-id propagation for mutation-heavy flows.

Recommendation:
- include capability and stale-state proof in the first OpenSpec package rather than deferring to route implementation.

## Proposed OpenSpec split

### `r5-requisition-authoring`

Goal:
- freeze and implement the Jobs-side requisition authoring route contract.

Should resolve:
- RQ1
- RQ2
- RQ3
- RQ5
- RQ6
- RQ7
- RQ8
- RQ9
- RQ10

Expected affected areas:
- `src/domains/jobs/**`
- `src/lib/routing/**`
- `src/lib/access-control/**`
- `src/shell/notifications/**` if new typed destinations are added

### `r5-requisition-workflows-settings`

Goal:
- freeze and implement `/requisition-workflows` as a settings/hiring-flow administration route.

Should resolve:
- RQ1
- RQ4
- RQ5
- RQ7
- RQ10

Expected affected areas:
- `src/domains/settings/hiring-flow/**`
- `src/domains/settings/operational/**`
- `src/lib/routing/**`
- `src/lib/access-control/**`

## Blocking items before implementation

Before opening `r5-requisition-authoring`:
- RQ1 must be accepted.
- RQ2 and RQ3 must be route-contract ready.
- RQ5 must be accepted.
- RQ7 must define stale-state behavior.
- RQ8 must define Jobs create/edit handoff behavior.

Before opening `r5-requisition-workflows-settings`:
- RQ1 must be accepted.
- RQ4 must be route-contract ready.
- RQ5 must be accepted.
- settings substrate dependencies must be known.

## HRIS requisition operational depth implementation note

`hris-requisition-operational-depth` is implemented as the HRIS-specific follow-on to provider readiness gates. It scopes `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` as Jobs-side consumers and `/requisition-workflows` as a Settings-side administration consumer. The model covers ready, mapping-required, mapping-drift, sync-pending, sync-degraded, sync-failed, retrying, synced, auth-required, provider-blocked, unavailable, and unimplemented outcomes without exposing raw HRIS mappings, OAuth payloads, provider diagnostics, or tenant-sensitive data.

Mapping drift and workflow drift remain separate: HRIS mapping remediation points to HRIS/workflow administration, while existing requisition workflow drift remains authoritative for removed stages, changed required fields, reassigned approvals, and stale workflow route repair. Public/token `/job-requisition-approval`, `/job-requisition-forms`, and `/integration/*` routes remain unchanged.

