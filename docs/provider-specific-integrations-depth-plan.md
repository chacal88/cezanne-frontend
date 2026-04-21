# Provider-Specific Integrations Depth Plan

## Purpose

This document defines the implemented integrations follow-on package after the R4 integrations shell and R5 closeout.

It turns the deferred provider-specific setup depth into a bounded implementation record while preserving the existing separation between:
- authenticated integrations admin setup under `/integrations` and `/integrations/:id`; and
- public/token provider callbacks under `/integration/cv`, `/integration/forms`, and `/integration/job`.

## Source baseline

Built on top of:
- `../../docs/frontend-2/frontend-provider-by-provider-integration-inventory.md`
- `../../docs/frontend-2/frontend-feature-to-api-ownership-matrix.md`
- `../../docs/frontend-2/frontend-contract-gap-inventory.md`
- `../../docs/frontend-2/frontend-rewrite-matrix.md`
- `r4-integrations-open-points.md`
- `r4-master-plan.md`
- `roadmap.md`
- `modules.md`
- `screens.md`
- `capabilities.md`
- `navigation-and-return-behavior.md`
- `telemetry-events.md`
- `testing.md`

## Confirmed baseline

Confirmed:
- `/integrations` is the authenticated integrations admin index.
- `/integrations/:id` is the authenticated provider detail route.
- provider detail returns to `/integrations`.
- public/token `/integration/*` routes are separate and must not be changed by this package.
- provider states are `connected`, `disconnected`, `degraded`, `reauth_required`, and `unavailable`.
- provider action concerns are `configuration`, `auth`, and `diagnostics`.

## First provider families

This package starts with three provider families:

| Family | Why first | Scope |
|---|---|---|
| `calendar` | highest-priority integration family in the frontend-2 provider inventory and gates scheduling flows | account readiness, scheduling capability, conflict/degraded states, diagnostics |
| `job-board` | currently represented in the provider shell and has concrete setup/readiness needs | posting credentials/readiness, board mapping, publishing eligibility, diagnostics |
| `hris` | currently represented in the provider shell with reauth-required state | OAuth/reauth readiness, sync mapping, diagnostics |

Deferred provider families:
- `ats`
- `assessment`
- `custom`

Those remain shell-visible but unimplemented/unavailable until a later provider-family package names concrete behavior.

## Route contract

Default route:
- `/integrations/:providerId`

The route owns three setup sections:
- `configuration`
- `auth`
- `diagnostics`

Implementation may keep sections as in-page tabs or make section state URL-owned through search when refresh/deep-link behavior requires it. New child routes should only be introduced if section direct-entry cannot be represented safely with route-owned search state.

Parent return:
- `/integrations`

Denied fallback:
- `/dashboard`

Unknown provider behavior:
- render explicit `unavailable` state inside `/integrations/:providerId`.

## State contract

Configuration states:
- `loading`
- `ready`
- `validation-error`
- `saving`
- `saved`
- `save-error`
- `unavailable`
- `unimplemented`

Auth states:
- `connected`
- `disconnected`
- `connecting`
- `auth-pending`
- `auth-failed`
- `reauth-required`
- `degraded`

Diagnostics states:
- `idle`
- `running`
- `passed`
- `failed`
- `logs-ready`
- `degraded`
- `unavailable`

## Security and telemetry rules

Do not emit or display in telemetry:
- credentials
- OAuth secrets
- private tokens
- webhook secrets
- raw logs
- signed URLs
- tenant-sensitive identifiers
- provider callback payloads

Allowed telemetry shape:
- provider family
- provider state
- section id
- action id
- outcome
- safe diagnostic check id/severity
- correlation id

## OpenSpec package

Planning package:
- `provider-specific-integrations-depth`

Artifacts:
- proposal
- design
- specs
- tasks

Implementation was gated on this package validating and the docs in this file staying synchronized with `modules.md`, `screens.md`, `capabilities.md`, `navigation-and-return-behavior.md`, `telemetry-events.md`, and `testing.md`.

## Operational readiness signals

This package defines normalized readiness signals for downstream operational routes without rewriting those routes in the same package:

| Readiness family | Downstream consumers | Signal intent |
|---|---|---|
| scheduling readiness | job-scoped scheduling, candidate scheduling, interview request flows | calendar account availability, conflict/degraded state, booking capability |
| publishing readiness | job authoring/publishing and job-listing flows | job-board credential/mapping readiness and publishing eligibility |
| sync/workflow readiness | HRIS sync, requisition/workflow-adjacent behavior | HRIS auth/mapping readiness and sync availability |

Operational routes should consume these normalized signals in later packages instead of inspecting raw provider configuration, credentials, OAuth payloads, or diagnostics logs.

## Implementation status

Implemented in `src/domains/integrations`:
- calendar, job-board, and HRIS provider-family setup sections for configuration, auth, and diagnostics;
- deterministic configuration, auth lifecycle, diagnostics, and normalized readiness helpers;
- route-local save, auth, and diagnostics interaction helpers with safe telemetry payloads;
- unsupported provider-family rendering through unavailable/unimplemented state rather than redirecting to settings or token-entry routes.

The implementation keeps public/token `/integration/*` callbacks owned by `integrations.token-entry` and does not change API endpoints settings or SysAdmin behavior.

## Operational readiness gates follow-up

`provider-readiness-operational-gates` is the completed and archived immediate follow-up package that consumes the normalized readiness signals from this provider-specific implementation.

First operational consumers:
- job-scoped scheduling consumes calendar scheduling readiness;
- candidate-scoped scheduling consumes calendar scheduling readiness;
- job authoring and publishing-adjacent helpers consume job-board publishing readiness;
- job listings publish/status surfaces consume job-board publishing readiness;
- requisition authoring and workflow-state helpers consume HRIS sync/workflow readiness.

The completed follow-up keeps provider setup under `/integrations/:providerId`, keeps public/token `/integration/*` callbacks unchanged, and requires operational routes to render route-local blocked/degraded/unavailable/unimplemented states instead of reading provider credentials, OAuth payloads, diagnostics logs, or setup forms.

Companion plan: `provider-readiness-operational-gates-plan.md`.


## Provider and operational-depth follow-ons

After `provider-readiness-operational-gates`, the OpenSpec sequence is synchronized in `integration-operational-depth-sequence-plan.md`; all eight packages are implemented and validated:
- `calendar-scheduling-operational-depth` for authenticated job/candidate scheduling conflict, retry, submit, and parent-refresh behavior;
- `job-board-publishing-operational-depth` for publish/unpublish lifecycle, partial outcomes, retry, and public-reflection intent;
- `hris-requisition-operational-depth` for HRIS-linked requisition state, mapping drift, sync retry, and workflow drift separation;
- `messaging-communication-operational-depth` for inbox conversation identity, notification entry, candidate handoff, send/retry, and external chat separation;
- `contract-signing-operational-depth` for candidate contract summaries, offer-adjacent launchers, send/retry/status refresh, and downstream signer separation;
- `ats-assessment-provider-setup-depth` for the implemented authenticated provider setup expansion beyond calendar/job-board/HRIS;
- `survey-review-scoring-operational-depth` for survey/review/scoring schema readiness, submit/retry, read-only terminal states, and scoring refresh;
- `ats-candidate-source-operational-depth` for ATS source identity, import/sync status, duplicate outcomes, stale-source refresh, and status-only jobs context.

These changes must preserve provider setup ownership under `/integrations/:providerId` unless their own accepted specs explicitly say otherwise. Public/token routes remain owned by their existing route families unless an accepted spec explicitly changes them.


## ATS and assessment provider setup depth implementation note

`ats-assessment-provider-setup-depth` is implemented as the next authenticated provider setup expansion beyond calendar, job-board, and HRIS. ATS and assessment providers now expose family-specific configuration, auth lifecycle, diagnostics summaries, and normalized readiness signals under `/integrations/:providerId` without exposing raw ATS sync payloads, webhook secrets, candidate/job payloads, assessment submissions, scoring payloads, or callback tokens.

Custom providers remain explicit as unavailable or unimplemented until a dedicated custom-provider package names concrete behavior. Public/token `/surveys/*`, `/review-candidate/*`, `/interview-feedback/*`, and `/integration/*` routes remain separate from authenticated setup.
