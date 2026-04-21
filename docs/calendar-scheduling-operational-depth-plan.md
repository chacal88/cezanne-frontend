# Calendar Scheduling Operational Depth Plan

## Status

Implemented by OpenSpec change `calendar-scheduling-operational-depth`.

## Scope

This plan implements authenticated calendar scheduling depth for these consumers only:

- job-scoped schedule task routes in `jobs.task-overlays`;
- candidate-scoped schedule task routes in `candidates.action-launchers`.

Public/token `/integration/*` callback routes and `/interview-request/*` external review routes remain outside this package.

## Operational model

Scheduling consumes normalized provider readiness gate output before exposing submit-ready actions. Once readiness is `ready`, route-local scheduling helpers model:

- loading and ready states;
- draft validation and slot-unavailable states;
- conflict recovery with retry or select-new-slot actions;
- submitting, submit-failed, and submitted states;
- provider-blocked, degraded, and unavailable remediation states from readiness gates.

Scheduling helpers use safe slot summaries only. They do not expose raw calendar provider payloads, provider credentials, OAuth material, webhook payloads, signed URLs, private tokens, or tenant-sensitive identifiers.

## Parent return and refresh

- Job-scoped scheduling preserves the originating Job parent target and records job parent-refresh intent after submitted success.
- Candidate-scoped scheduling preserves candidate direct-entry context, candidate/job/workflow parent return when available, and records candidate plus related job refresh intent after submitted success.
- Conflict, validation, submit-failed, degraded, blocked, and unavailable outcomes stay inside the current task route.

## Telemetry

The allowlisted scheduling telemetry event is `calendar_scheduling_action` with only:

- `routeFamily` (`job` or `candidate`);
- `action` (`slot_selected`, `submit_started`, `conflict`, `submit_failed`, `submitted`);
- `schedulingState`;
- normalized `readinessOutcome` when already available from the gate;
- `correlationId`.

Telemetry must not include credentials, OAuth secrets, private tokens, webhook secrets, signed URLs, raw calendar payloads, raw slot payload bodies, tenant-sensitive identifiers, or external callback payloads.

## Validation

Validation covers shared state helpers, draft and slot normalization, conflict/retry/submit outcomes, submitted parent-refresh intent, readiness-gate preconditions, safe telemetry payloads, and separation from public/token integration and interview-request routes.
