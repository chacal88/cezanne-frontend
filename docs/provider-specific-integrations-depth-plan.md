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
