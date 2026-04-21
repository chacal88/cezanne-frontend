# Screen Design-Flow Matrix

## Purpose

This matrix bridges route ownership, OpenSpec state depth, and design handoff readiness. It does not replace `screens.md`; `screens.md` remains the route truth. Accepted OpenSpec specs remain the state truth. Figma references are complementary evidence and may be `pending` without blocking route/spec readiness.

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
6. `implementation-closeout-release-hardening` is a completed active closeout record, not an archived change at the time this matrix was created.

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
