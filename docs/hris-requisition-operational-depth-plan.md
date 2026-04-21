# HRIS Requisition Operational Depth Plan

## Status

Implemented by OpenSpec change `hris-requisition-operational-depth`.

## Scoped consumers

This package deepens authenticated HRIS-linked requisition consumers only:

- **Jobs-side requisition authoring and workflow routes** (`/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?`) — expose HRIS readiness, mapping, sync, retry, and remediation states without replacing draft/save/submit or workflow-drift contracts.
- **Requisition workflow administration** (`/requisition-workflows`) — exposes HRIS administration readiness and mapping remediation while staying a settings-owned administration surface.

Public/token `/job-requisition-approval?token`, `/job-requisition-forms/:id?download`, and `/integration/*` routes remain outside this package.

## Operational model

HRIS requisition operational depth consumes normalized HRIS sync/workflow readiness gate output before exposing HRIS-linked actions. Route-local helpers model:

- ready and synced states;
- mapping-required and mapping-drift states;
- sync-pending, sync-degraded, sync-failed, and retrying states;
- auth-required, provider-blocked, unavailable, and unimplemented remediation states;
- mapping drift versus workflow drift authority so workflow drift remains authoritative for removed stages, changed required fields, reassigned approvals, and stale workflow route repair.

Helpers must not expose raw HRIS mappings, OAuth payloads, provider diagnostics, webhook payloads, signed URLs, private tokens, public route tokens, or tenant-sensitive identifiers.

## Route ownership and recovery

- `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` preserve Jobs-side parent/fallback behavior.
- `/requisition-workflows` remains Settings-side workflow administration and must not expose active Jobs-side requisition submission behavior.
- HRIS mapping remediation points to workflow/provider administration when known; provider setup recovery links to `/integrations/:providerId` only when supplied by the normalized gate.
- Public/token requisition approval and forms routes keep their token lifecycle, same-route retry/terminal behavior, and public route contracts unchanged.

## Telemetry

The allowlisted HRIS requisition telemetry event is `hris_requisition_sync_action` with only:

- `routeFamily` (`requisition-authoring`, `requisition-workflow`, or `requisition-workflows-settings`);
- `action` (`readiness-evaluated`, `sync-intent`, `sync-retry`, `mapping-drift`, `blocked-action`, or `remediation`);
- `hrisState`;
- normalized `readinessOutcome` when available from the gate;
- `recoveryTargetType`;
- `driftType`;
- `correlationId`.

Telemetry must not include OAuth secrets, private tokens, webhook secrets, signed URLs, raw HRIS payloads, raw mappings, diagnostics logs, tenant-sensitive identifiers, provider callback payloads, or public route tokens.

## Validation

Validation covers shared HRIS operational states, mapping drift, workflow drift precedence, sync retry/result helpers, Jobs-side parent/fallback preservation, Settings-side administration-only behavior, safe telemetry payloads, and separation from provider setup UI plus public/token requisition approval/forms and `/integration/*` routes.
