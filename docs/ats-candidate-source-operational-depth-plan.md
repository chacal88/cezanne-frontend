# ATS Candidate Source Operational Depth Plan

## Status

Implemented and validated through OpenSpec change `ats-candidate-source-operational-depth` on 2026-04-21.

## Scope

This package deepens ATS source/import/sync operational behavior for these consumers:

- candidate database list rows and list-context actions;
- candidate detail source/status surfaces;
- jobs list status-only ATS indicators;
- job authoring non-draft ATS context.

## Boundaries

Confirmed in scope:

- route-local states for loading, ready, source-linked, source-unlinked, import-pending, import-succeeded, import-failed, duplicate-detected, duplicate-merged, sync-pending, sync-degraded, sync-failed, stale-source, provider-blocked, degraded, unavailable, and unimplemented outcomes;
- normalized source identity, duplicate policy, import/sync result, retry, and refresh-intent helpers;
- consumption of normalized ATS readiness/status output from provider setup without reading setup internals.

Out of scope:

- backend ATS import, sync, webhook, or ingestion implementation;
- candidate merge backend implementation;
- provider setup UI changes;
- job posting or job-board publishing mutation behavior;
- public/token route or `/integration/*` behavior changes.

## Flow rules

- Candidate database preserves query, page, sort, order, stage, and tag state while showing ATS source, import/sync, duplicate, retry, and refresh outcomes.
- Candidate detail exposes source-linked/source-unlinked/stale-source and duplicate/import/sync outcomes without rendering provider setup fields or raw ATS records.
- Jobs list and job authoring are status-only consumers in this package; jobs list filters, authoring draft persistence, and job-board publishing lifecycle remain unchanged.
- Provider setup repair is explicit and may link to `/integrations/:providerId` only when a normalized safe setup target is available and the user has the relevant integrations capability.

## Telemetry

The allowlisted telemetry event is `ats_candidate_source_action` with only:

- `routeFamily`;
- `action` (`source_resolved`, `import_sync_started`, `duplicate_outcome`, `retry_started`, `refreshed`, `failed`, or `recovery_guidance`);
- `atsState`;
- `sourceState`;
- normalized `duplicateOutcome` when available;
- normalized `syncImportOutcome` when available;
- `recoveryTargetType`;
- `correlationId`.

Telemetry must not include raw ATS records, candidate-identifying external ids, webhook payloads, credentials, tokens, diagnostics logs, provider payloads, tenant-sensitive identifiers, or public callback payloads.

## Validation

Validation must prove shared ATS states, source identity, duplicate policy, import/sync outcomes, stale-source refresh, candidate database list-state preservation, candidate detail refresh/remediation, jobs status-only behavior, job authoring draft separation, provider setup separation, safe telemetry, and unchanged `/integration/*` behavior.
