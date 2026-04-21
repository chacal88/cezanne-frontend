# ATS and Assessment Provider Setup Depth Plan

## Status

Implemented as the `ats-assessment-provider-setup-depth` OpenSpec change.

## Scope

This package expands authenticated provider setup under `/integrations/:providerId` from calendar, job-board, and HRIS providers to include ATS and assessment provider families.

Included setup depth:
- ATS configuration for source ownership, candidate/job sync readiness, webhook presence, duplicate/import policy, validation, save, auth lifecycle, diagnostics, and normalized sync/import readiness.
- Assessment configuration for template/catalog readiness, candidate handoff readiness, reviewer/scoring callback readiness, validation, save, auth lifecycle, diagnostics, and normalized review/scoring readiness.
- Safe telemetry payloads for ATS and assessment configuration, auth, and diagnostics actions.

## Boundaries

Confirmed facts:
- Provider setup remains authenticated-admin scoped under `/integrations` and `/integrations/:providerId`.
- Public/token routes such as `/surveys/*`, `/review-candidate/*`, `/interview-feedback/*`, and `/integration/*` remain separate route families.
- Readiness signals are normalized handoffs for later operational consumers.

Deferred:
- Custom provider setup remains visible but unavailable or unimplemented until a dedicated custom-provider package defines concrete behavior.
- Operational ATS sync/import, candidate source management, assessment submission, survey/review scoring execution, callback receivers, backend OAuth exchange, and backend provider APIs are not implemented by this package.

## Safety rules

ATS and assessment setup models, diagnostics, and telemetry must not expose credentials, webhook secrets, callback tokens, tenant identifiers, raw logs, raw ATS records, candidate/job payloads, assessment submissions, scoring payloads, survey answers, or callback payloads.
