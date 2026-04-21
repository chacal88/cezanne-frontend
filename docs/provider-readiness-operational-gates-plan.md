# Provider Readiness Operational Gates Plan

## Purpose

This document defines the follow-up implementation package after `provider-specific-integrations-depth`.

The provider-specific package created safe normalized readiness signals for calendar, job-board, and HRIS provider families. This package makes operational routes consume those signals without importing provider setup internals into Jobs, Candidates, Settings, or Requisition workflows.


## Implementation status

Implemented and archived through OpenSpec change `provider-readiness-operational-gates` on 2026-04-21.

Validated evidence:
- `openspec validate provider-readiness-operational-gates --strict`
- focused readiness gate and consumer tests
- `npm test`
- `npm run build`

The follow-on sequence is synchronized in `integration-operational-depth-sequence-plan.md`; all eight packages are implemented and validated:
1. `calendar-scheduling-operational-depth`
2. `job-board-publishing-operational-depth`
3. `hris-requisition-operational-depth`
4. `messaging-communication-operational-depth`
5. `contract-signing-operational-depth`
6. `ats-assessment-provider-setup-depth`
7. `survey-review-scoring-operational-depth`
8. `ats-candidate-source-operational-depth`

## First operational consumers

| Consumer area | Readiness family | Provider family | Operational context | Recovery owner |
|---|---|---|---|---|
| Job-scoped scheduling | `scheduling` | `calendar` | job task overlays that schedule interviews | `/integrations/:providerId` when known |
| Candidate-scoped scheduling | `scheduling` | `calendar` | candidate action launchers that schedule interviews | `/integrations/:providerId` when known |
| Job publishing / authoring adjacency | `publishing` | `job-board` | publishing readiness exposed next to authoring/publish actions | `/integrations/:providerId` when known |
| Job listings settings | `publishing` | `job-board` | publish/status surfaces for listing configuration | `/integrations/:providerId` when known |
| Requisition / workflow routes | `sync-workflow` | `hris` | HRIS sync or workflow-adjacent readiness gates | `/integrations/:providerId` when known |

## Gate model

Operational gates consume normalized readiness signals and return route-local action readiness.

Input fields:
- `readinessFamily`
- `providerFamily`
- `outcome`
- `reason`
- `actionContext`
- optional `setupTarget` with `providerId`, `path`, and `label`

Output fields:
- `canProceed`
- `state`: `ready`, `blocked`, `degraded`, `unavailable`, or `unimplemented`
- `message`
- optional `setupTarget`
- safe telemetry data

## Route behavior

- `ready` may proceed to the existing operational action.
- `blocked`, `degraded`, `unavailable`, and `unimplemented` do not proceed for mutation/submit actions.
- Status-only surfaces may display degraded warnings, but must not imply the underlying action can succeed.
- Operational routes do not redirect automatically when provider setup is required.
- Recovery guidance points to `/integrations/:providerId` only when a safe setup target is known.
- Parent return behavior remains owned by the current operational route.

## Safety boundaries

Operational consumers must not inspect or emit:
- credentials
- OAuth secrets
- private tokens
- webhook secrets
- signed URLs
- raw diagnostics logs
- tenant-sensitive identifiers
- provider callback payloads

Allowed telemetry shape:
- readiness family
- provider family
- normalized outcome
- route/action context
- recovery target type
- correlation id

## Design-readiness implication

Scheduling, publishing, and HRIS/requisition screens must include blocked, degraded, unavailable, and unimplemented states in their design flow matrix before detailed screen design starts.


## Extended operational-depth consumers

The first readiness-gate consumers remain scheduling, publishing, and HRIS/requisition. The broader integration sequence also covers messaging, contract/signing, survey/review/scoring, and ATS source/import/sync operational depth. Those later packages follow the same safety model: consume normalized readiness/status outputs where available, keep blocked/degraded/unavailable remediation route-local, preserve public/token boundaries, and avoid raw provider setup or callback payloads.

## HRIS requisition operational depth implementation note

`hris-requisition-operational-depth` is implemented as the HRIS-specific follow-on to provider readiness gates. It scopes `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` as Jobs-side consumers and `/requisition-workflows` as a Settings-side administration consumer. The model covers ready, mapping-required, mapping-drift, sync-pending, sync-degraded, sync-failed, retrying, synced, auth-required, provider-blocked, unavailable, and unimplemented outcomes without exposing raw HRIS mappings, OAuth payloads, provider diagnostics, or tenant-sensitive data.

Mapping drift and workflow drift remain separate: HRIS mapping remediation points to HRIS/workflow administration, while existing requisition workflow drift remains authoritative for removed stages, changed required fields, reassigned approvals, and stale workflow route repair. Public/token `/job-requisition-approval`, `/job-requisition-forms`, and `/integration/*` routes remain unchanged.

