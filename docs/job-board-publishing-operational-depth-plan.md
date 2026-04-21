# Job-board Publishing Operational Depth Plan

## Status

Implemented by OpenSpec change `job-board-publishing-operational-depth`.

## Scoped consumers

This package deepens two authenticated consumers only:

- **Job Authoring** (`jobs.authoring`) — exposes publishing readiness, lifecycle, retry, and partial outcome status next to authoring actions while ordinary draft create/edit persistence remains owned by the existing draft adapter and serializer.
- **Job Listings** (`settings.job-listings`) — exposes list/editor publishing status, retry, unpublish, partial outcome, and public-reflection intent while preserving list/editor return context.

## Boundaries

Confirmed in scope:

- deterministic frontend lifecycle states for not-ready, ready, validating, publishing, published, publish-failed, partially-published, unpublish-ready, unpublishing, unpublished, unpublish-failed, provider-blocked, degraded, and unavailable;
- normalized target/status helpers that expose only route family, target type, and safe route-local references;
- publish/unpublish result helpers for success, retryable failure, partial outcome, and public-reflection intent;
- safe telemetry for publish/unpublish start, success, failure, and partial outcomes using correlation id and allowlisted state fields only.

Explicitly out of scope:

- provider credential management, board mapping persistence, or provider setup fields in Jobs or Job Listings;
- new backend job-board publishing APIs;
- public/token `/integration/*` callback behavior changes;
- public shared job route behavior changes under `/shared/:jobOrRole/:token/:source`.

## Operational model

Publishing readiness gates are consumed as preconditions. A ready gate can expose publish-ready or unpublish-ready lifecycle actions. Degraded, blocked, unavailable, or unimplemented gates are non-proceeding and map to provider-blocked, degraded, or unavailable states with route-local remediation.

Publishing success does not automatically mean downstream public reflection is complete. Partial outcomes stay distinct from published outcomes and carry retry/remediation guidance plus public-reflection intent.

## Validation

Validation covers shared lifecycle helpers, safe telemetry payloads, Job Authoring draft/publish separation, Job Listings list/editor continuity, provider setup separation, and public/token route separation.
