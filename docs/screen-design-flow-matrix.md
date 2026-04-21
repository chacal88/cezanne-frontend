# Screen Design-Flow Matrix

## Purpose

This matrix bridges route ownership, OpenSpec state depth, and design handoff readiness. It does not replace `screens.md`; `screens.md` remains the route truth. Accepted OpenSpec specs remain the state truth. Figma references are complementary evidence and may be `pending` without blocking route/spec readiness.

## Current phase

The frontend roadmap has moved past R0-R5 implementation/planning, provider-specific integrations depth, provider-readiness operational gates, and the eight operational-depth consumer packages. The active next phase is **design/flow preparation** before Figma production.

Design/flow preparation means every priority route or flow selected for visual design must already have:
- route ownership from `screens.md` and `modules.md`;
- accepted state groups from OpenSpec specs;
- entry-mode coverage for shell, direct URL, notification, token, public, parent task, or provider callback paths as applicable;
- parent return, refresh, cancel, and retry behavior;
- telemetry-safe payload expectations;
- public/token and provider setup boundaries preserved.

Figma work starts after the row has this contract. A pending Figma reference is expected until a canonical Figma frame/node is attached.

## Source documents

- `screens.md`
- `modules.md`
- `capabilities.md`
- `navigation-and-return-behavior.md`
- `telemetry-events.md`
- `testing.md`
- `integration-operational-depth-sequence-plan.md`
- accepted OpenSpec specs under `../../openspec/specs`

## Row schema

| Field | Required meaning |
|---|---|
| Route pattern | Route from `screens.md` / router manifest. |
| Route class | Page, PageWithStatefulUrl, RoutedOverlay, ShellOverlay, TaskFlow, EmbeddedFlow, or Public/Token. |
| Domain / module | Owner from `domains.md` and `modules.md`. |
| Personas | Primary user groups. |
| Capabilities | Capability keys from `capabilities.md`. |
| Entry modes | Shell, direct URL, notification, token, public, parent task, or provider callback. |
| State groups | Required states from accepted specs. |
| Actions | User actions and submit/save/retry operations. |
| Error/retry states | Recoverable and terminal failure states. |
| Parent return | Close/cancel/success/refresh behavior. |
| Telemetry | Allowlisted event family and safe payload expectations. |
| Design reference | Figma/reference status. `pending` is valid when no canonical node exists. |
| Source specs/docs | Specs and docs that define the row. |

## Readiness rules

1. Route ownership comes from `screens.md` and `modules.md`.
2. State ownership comes from accepted OpenSpec specs.
3. Public/token rows must not depend on authenticated shell context.
4. Provider setup remains separate from operational task execution.
5. Missing visual references are recorded as `pending`; do not invent Figma links.
6. `implementation-closeout-release-hardening` is a completed closeout record and must not be treated as an active implementation blocker.
7. Design/flow preparation is contract-first: do not use Figma to invent new routes, capabilities, provider setup behavior, public/token entry rules, telemetry payloads, or backend APIs.
8. A row is Figma-ready only when its route/state/action/error/parent-return/telemetry cells are specific enough for a designer to produce screens without adding product behavior.

## Priority operational rows

| Route pattern | Route class | Domain / module | Personas | Capabilities | Entry modes | State groups | Actions | Error/retry states | Parent return | Telemetry | Design reference | Source specs/docs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/job/$jobId/cv/$candidateId/schedule` | TaskFlow | jobs / task-overlays | Recruiter, HC admin | `canScheduleInterviewFromJob` | Shell, direct URL, notification, parent job hub | readiness, conflict, submitting, submitted, parent-refresh | Schedule, retry, cancel | provider-blocked, conflict, submit-failed, stale parent | Return to `/job/$jobId` with refresh intent | `calendar_scheduling_*`, safe correlation only | pending | `calendar-scheduling-operational-depth`, `jobs-product-depth` |
| Candidate schedule routes | TaskFlow | candidates / action-launchers | Recruiter, HC admin | `canScheduleInterviewFromCandidate` | Shell, direct URL, notification, candidate hub, database return | readiness, conflict, submitting, submitted, parent-refresh | Schedule, retry, cancel | provider-blocked, conflict, submit-failed, stale parent | Return to candidate hub or database return target | `calendar_scheduling_*`, candidate-safe payload | pending | `calendar-scheduling-operational-depth`, `candidate-product-depth` |
| `/jobs/manage`, `/jobs/manage/$jobId` | Page | jobs / authoring | HC admin, recruiter | `canCreateJob`, `canEditJob` | Shell, direct URL, requisition branch | draft, validating, saving, saved, publish-blocked, partial-publish | Save draft, publish, retry, reset workflow | save-failed, publish partial, provider blocked | Return to list/detail; publish refresh separate from save | jobs authoring/publishing safe events | pending | `job-authoring`, `job-board-publishing-operational-depth`, `jobs-product-depth` |
| `/settings/job-listings`, `/settings/job-listings/edit/$uuid` | PageWithStatefulUrl / Page | settings / careers-application | HC admin | `canManageJobListings` | Shell, direct URL | listing draft, publish, unpublish, partial outcome | Save, publish, unpublish, retry | partial publish, provider blocked, stale public reflection | Return to job listings with public reflection intent | publishing safe events | pending | `job-listings-settings`, `job-board-publishing-operational-depth` |
| `/job-requisitions/$jobWorkflowUuid` | PageWithStatefulUrl | jobs / workflow-state | HC admin, approver | `canUseJobRequisitionBranching` | Shell, direct URL, job authoring branch | mapping-ready, mapping-drift, sync-ready, sync-failed, workflow-drift | Open requisition, retry sync, recover workflow | mapping drift, sync retry, workflow drift | Return to Jobs or requisition parent | HRIS/requisition safe events | pending | `hris-requisition-operational-depth`, `requisition-authoring-routes` |
| `/inbox?conversation=` | PageWithStatefulUrl | inbox / conversation-list | Recruiter, RA | `canUseInbox`, `canOpenConversation` | Shell, direct URL, notification, candidate handoff | loading, ready, empty, inaccessible, not-found, sending, sent, send-failed, stale-conversation | Select, send, retry, refresh | inaccessible, provider-blocked, stale conversation | Route-local; candidate handoff returns to candidate when provided | messaging safe events, no message bodies | pending | `messaging-communication-operational-depth`, `shell-navigation-notification-depth` |
| Candidate contract summary and offer actions | TaskFlow / support | candidates + contracts | Recruiter, HC admin | `canViewCandidateContracts`, `canCreateOfferFromCandidate` | Candidate hub, job hub | summary, downstream-owned, signing-ready, sent, status-refresh | Launch contract, send, refresh | signer unavailable, provider blocked, stale status | Return to candidate/job parent with refresh intent | contract signing safe events | pending | `contract-signing-operational-depth`, `candidate-product-depth` |
| `/surveys/$surveyuuid/$jobuuid/$cvuuid` | Public/Token | public-external / public-survey | Candidate | `canCompletePublicSurvey` | Public direct URL, token | valid, invalid, expired, inaccessible, submitting, retry, terminal | Answer, submit, retry | schema unavailable, submit failed, terminal read-only | Route-local completion | public token safe events | pending | `public-survey-continuation`, `public-token-product-depth` |
| `/review-candidate/$code`, `/interview-feedback/$code` | Public/Token | public-external / external-review | Reviewer, interviewer | `canUseExternalReviewFlow` | Public direct URL, token | ready, submitting, retry, terminal read-only, already-used | Submit review/feedback, retry | validation failed, submit failed, expired/used token | Route-local terminal state | public token safe events; no answers | pending | `external-review-candidate`, `external-interview-feedback`, `survey-review-scoring-operational-depth`, `public-token-product-depth` |
| `/integrations/$providerId` | Page | integrations / provider-detail | HC admin | `canManageIntegrationProvider` | Shell, direct URL | setup, auth lifecycle, diagnostics, readiness, unimplemented custom | Connect, validate, retry diagnostics | provider-blocked, unavailable, unimplemented | Return to integrations index | provider setup safe events | pending | `provider-specific-integrations-depth`, `ats-assessment-provider-setup-depth` |
| `/candidates-database` and candidate detail from ATS source | PageWithStatefulUrl | candidates / database-search + detail-hub | Recruiter, HC admin | `canViewCandidateDatabase`, `canViewCandidateDetail` | Shell, direct URL, database handoff | source identity, duplicate/import/sync, stale-source, detail return | Open detail, refresh source, resolve duplicate | duplicate, import failed, stale source | Return to candidate database with preserved filters | ATS source safe events | pending | `ats-candidate-source-operational-depth`, `candidate-product-depth` |

## Boundary verification

Public/token routes `/integration/*`, `/chat/:token/:user_id`, `/surveys/*`, `/review-candidate/*`, and `/interview-feedback/*` remain outside authenticated shell ownership. Telemetry expectations above use only route family, action, normalized state/outcome, fallback kind, and correlation id; raw tokens, auth codes, message bodies, survey answers, provider payloads, signed URLs, credentials, and tenant-sensitive identifiers are excluded.

## Pending design references

All rows currently mark design reference as `pending`. This records missing Figma/reference mapping without inventing visual evidence.


## Design-flow contract checklist

Use this checklist before moving a matrix row from `pending` design reference to a Figma-linked reference:

- [ ] Route pattern matches the canonical router/route metadata shape or is explicitly documented as an alias/example.
- [ ] Domain and module ownership match `modules.md`.
- [ ] Capability names match the canonical runtime capability catalog.
- [ ] Entry modes include all relevant direct-entry, notification, token/public, provider callback, parent task, and shell paths.
- [ ] State groups include loading/ready/empty/denied/unavailable/degraded/stale/retry/terminal variants required by the accepted specs.
- [ ] Actions distinguish view-only, save, submit, retry, refresh, cancel, close, and parent-refresh behavior.
- [ ] Error/retry states distinguish recoverable failures from terminal or read-only states.
- [ ] Parent return behavior names the stable target and refresh intent.
- [ ] Telemetry uses allowlisted route/state/action/correlation fields only.
- [ ] Public/token rows do not depend on authenticated shell.
- [ ] Operational rows consume normalized readiness/status outputs and do not expose raw provider setup internals.
- [ ] Figma reference is either `pending` or a canonical frame/node link; screenshots, ad-hoc mockups, and exploratory files are not canonical references.

## Figma handoff contract

When a row becomes ready for visual design, the handoff must include:

| Handoff field | Required content |
|---|---|
| Matrix row id | The route pattern or named flow from this matrix. |
| Canonical owner | Domain/module from `modules.md`. |
| State set | The exact state groups and error/retry states to represent. |
| Entry variants | Direct URL, shell, notification, token/public, parent task, or provider callback variants. |
| Boundary notes | Public/token, provider setup, telemetry, and raw-data exclusions. |
| Figma reference | Canonical frame/node URL once created; `pending` before creation. |

Figma frames created from this matrix are visual evidence only. If design work reveals missing product behavior, open or update an OpenSpec change before changing route, capability, provider, public/token, telemetry, or backend-contract assumptions.
