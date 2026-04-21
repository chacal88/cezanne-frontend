# Survey Review Scoring Operational Depth Plan

## Status

Implemented and validated through OpenSpec change `survey-review-scoring-operational-depth` on 2026-04-21.

## Scope

This package deepens survey, review, feedback, and scoring operational behavior for these consumers:

- authenticated candidate review launchers and candidate-scoped review/feedback actions;
- public/external `/review-candidate/:code`;
- public/external `/interview-feedback/:code`;
- public `/surveys/:surveyuuid/:jobuuid/:cvuuid`;
- template and interview-scoring readiness signals consumed by downstream review/scoring surfaces.

## Boundaries

Confirmed in scope:

- route-local states for loading, ready, schema-required, template-required, reviewer-required, submitting, submitted, submit-failed, partially-submitted, scoring-pending, scored, read-only, token-invalid, token-expired, inaccessible, provider-blocked, degraded, and unavailable outcomes;
- schema/template readiness before draft submission;
- retryable submission failure, terminal read-only behavior, scoring refresh, and candidate parent-refresh intent;
- public/token route behavior that stays inside the public/external boundary.

Out of scope:

- backend assessment, survey, feedback, or scoring API implementation;
- scoring engine implementation;
- assessment provider setup UI changes;
- public token lifecycle replacement;
- `/integration/*` callback behavior changes.

## Flow rules

- Authenticated candidate review launchers preserve candidate parent return and record parent-refresh intent after successful review/feedback submission.
- Public/external review, feedback, and survey routes stay same-route for retry, invalid/expired/inaccessible token states, and read-only terminal states.
- Schema-required, template-required, reviewer-required, provider-blocked, degraded, and unavailable outcomes are non-proceeding states with route-local remediation.
- Submitted feedback may remain `scoring-pending`; consumers must not claim `scored` until a normalized scored outcome is available.

## Telemetry

The allowlisted telemetry event is `survey_review_scoring_action` with only:

- `routeFamily`;
- `action` (`opened`, `submit_started`, `submit_failed`, `retry_started`, `terminal_outcome`, or `scoring_refreshed`);
- `operationalState`;
- normalized `tokenState` when already available;
- `taskContext`;
- normalized `terminalOutcome` when already available;
- `correlationId`.

Telemetry must not include answers, scoring rubrics, reviewer private notes, private tokens, raw schema payloads, provider payloads, tenant-sensitive identifiers, or public callback payloads.

## Validation

Validation must prove schema/template readiness, draft validation, submit/retry/terminal outcomes, scoring refresh, candidate parent-refresh intent, public-token route separation, provider setup separation, safe telemetry, and unchanged `/integration/*` behavior.
