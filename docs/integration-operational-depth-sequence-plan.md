# Integration Operational Depth Sequence Plan

## Purpose

This document synchronizes the post-R5 integration operational-depth sequence across the greenfield frontend execution docs and the reference analysis in `../../docs/frontend-2/`.

It turns the provider-family inventory into an implementation order that preserves these boundaries:
- provider setup remains under `/integrations/:providerId` unless an accepted spec says otherwise;
- public/token routes remain separate from authenticated recruiter-shell routes;
- operational routes consume normalized readiness/status signals instead of raw provider setup, credentials, diagnostics, or callback payloads;
- each operational package owns route-local blocked, degraded, unavailable, retry, stale, and refresh behavior for its own consumer surfaces.

## Source reference coverage

The sequence was checked against:
- `../../docs/frontend-2/frontend-provider-by-provider-integration-inventory.md`
- `../../docs/frontend-2/frontend-contract-gap-inventory.md`
- `../../docs/frontend-2/frontend-file-upload-and-document-flow-inventory.md`
- `../../docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `../../docs/frontend-2/frontend-edge-case-and-exception-catalog.md`
- `../../docs/frontend-2/frontend-notification-destination-inventory.md`
- `../../docs/frontend-2/frontend-jobs-domain-specification.md`
- `../../docs/frontend-2/frontend-candidate-domain-specification.md`
- `provider-specific-integrations-depth-plan.md`
- `provider-readiness-operational-gates-plan.md`
- `roadmap.md`, `modules.md`, `screens.md`, `capabilities.md`, `navigation-and-return-behavior.md`, `telemetry-events.md`, and `testing.md`

## OpenSpec sequence

| Order | Change | Status | Family | Primary consumers | Main flow states |
|---:|---|---|---|---|---|
| 1 | `calendar-scheduling-operational-depth` | Implemented and validated | Calendar/interview scheduling | job task overlays, candidate action launchers | loading, ready, validation-error, slot-unavailable, conflict, retry, submit, submit-failed, submitted, parent refresh |
| 2 | `job-board-publishing-operational-depth` | Implemented and validated | Job board publishing | job authoring, job listings settings, public reflection boundary | publish/unpublish, partial publish, retry, publish-failed, public-route separation |
| 3 | `hris-requisition-operational-depth` | Implemented and validated | HRIS requisition/workflow | requisition authoring, requisition workflows, jobs requisition branching | mapping-required, mapping-drift, sync retry, workflow-drift separation |
| 4 | `messaging-communication-operational-depth` | Implemented and validated | Messaging/inbox | inbox, notifications, candidate conversation handoff | conversation identity, inaccessible/not-found, send/retry, stale conversation |
| 5 | `contract-signing-operational-depth` | Implemented and validated | Contracts/signing | candidate contract summaries, job/candidate offer-adjacent launchers | template/document prerequisites, send/retry, status-stale, downstream signer separation |
| 6 | `ats-assessment-provider-setup-depth` | Implemented and validated | ATS/assessment provider setup | authenticated integrations admin | ATS/assessment configuration, auth, diagnostics, readiness signals |
| 7 | `survey-review-scoring-operational-depth` | Implemented and validated | Survey/review/scoring | candidate review launchers, public survey, external review, interview feedback | schema/template readiness, submit/retry, read-only terminal, scoring pending/scored |
| 8 | `ats-candidate-source-operational-depth` | Implemented and validated | ATS source/import/sync | candidate database, candidate detail, jobs list, job authoring status | source-linked, duplicate, import/sync, stale-source, status-only jobs context |

## Flow validation matrix

| Flow family | Entry paths | Parent/return rule | Public/token boundary | Provider/setup boundary | Required validation proof |
|---|---|---|---|---|---|
| Scheduling | job task route, candidate task route, direct URL | return to job or candidate parent; refresh visible parent after success | `/interview-request/*` remains external and unchanged | consumes calendar readiness only | conflict/retry/submit states, parent refresh, no raw provider payloads |
| Publishing | job authoring, job listings | preserve authoring/list/editor context; draft save remains separate | shared/public job routes remain token-owned | consumes job-board readiness only | publish/unpublish/partial states, draft separation, public separation |
| HRIS requisition | build requisition, requisition workflow routes | preserve requisition/workflow parent and fallback | requisition approval/forms public routes remain separate | consumes HRIS readiness only | mapping drift vs workflow drift, sync retry, route-local repair |
| Messaging | inbox URL state, notification entry, candidate handoff | preserve `/inbox?conversation=` selection and candidate recovery context | `/chat/:token/:user_id` remains external token-owned | no raw provider/send transport details | typed destination resolution, send retry, stale conversation, external chat separation |
| Contract/signing | candidate contract summary, offer task flows | preserve job/candidate parent; refresh summary after send/sign status | signer-facing/public routes and `/integration/*` remain separate | no signer/provider internals in recruiter surfaces | document/signing separation, status-stale, downstream handoff, safe telemetry |
| Survey/review/scoring | candidate review, external review, interview feedback, public survey | candidate launchers return to candidate; public routes stay same-route | `/surveys/*`, `/review-candidate/*`, `/interview-feedback/*` remain token/public owned | consumes normalized assessment readiness when available | schema readiness, retry, read-only terminal, scoring refresh, no answer/rubric telemetry |
| ATS source/import/sync | candidate database, candidate detail, jobs list, job authoring status | preserve candidate/list/job authoring context; jobs authoring draft unaffected | no public/token route changes | consumes normalized ATS readiness/status only | duplicate/import/sync distinction, stale-source refresh, provider setup separation |

## Cross-package rules

1. Operational packages must not inspect provider credentials, OAuth payloads, webhook payloads, diagnostics logs, signed URLs, private tokens, or tenant-sensitive identifiers.
2. Public/token routes must retain their own token lifecycle and same-route terminal/retry behavior.
3. Authenticated task flows must preserve explicit parent-return and visible refresh intent.
4. Degraded states for mutation/submit actions are non-proceeding unless the accepted spec explicitly defines a status-only surface.
5. Telemetry must use allowlisted payload builders and must not include raw business content such as message bodies, contract documents, signatures, survey answers, scoring rubrics, provider records, or callback payloads.
6. Job authoring draft persistence remains separate from publishing, ATS sync, and other operational status surfaces.
7. Candidate document metadata remains separate from downstream contract/signing status.
8. Duplicate/import/sync outcomes must be explicit for ATS and must not collapse into generic unavailable or failed states.

## Readiness result

All eight operational-depth OpenSpec packages are implemented and validated, including `survey-review-scoring-operational-depth` and `ats-candidate-source-operational-depth`. The synchronized validation command is:

```bash
openspec validate --all --strict
```

## Calendar scheduling operational depth implementation note

`calendar-scheduling-operational-depth` is implemented as the calendar-specific follow-on to provider readiness gates. It scopes authenticated job and candidate schedule task routes as consumers, covers loading, ready, validation-error, slot-unavailable, conflict, submitting, submit-failed, submitted, provider-blocked, degraded, and unavailable outcomes, and records parent-refresh intent after submitted success. Public/token `/integration/*` callbacks and `/interview-request/*` external routes remain unchanged.

## Job-board publishing operational depth implementation note

`job-board-publishing-operational-depth` is implemented as the publishing-specific follow-on to provider readiness gates. It scopes Job Authoring and Job Listings as consumers, keeps ordinary job draft persistence separate from publishing lifecycle state, covers publish/unpublish, failed, partially-published, retry, public-reflection intent, provider-blocked, degraded, and unavailable outcomes, and keeps `/shared/:jobOrRole/:token/:source` public route behavior unchanged.

## Messaging communication operational depth implementation note

`messaging-communication-operational-depth` is implemented as the authenticated inbox and notification-entry follow-on. It scopes `/inbox?conversation=`, typed `inbox.conversation` notification destinations, and candidate conversation handoff as consumers. The model covers loading, ready, empty, inaccessible, not-found, provider-blocked, degraded, unavailable, sending, sent, send-failed, and stale-conversation outcomes while keeping public/token `/chat/:token/:user_id` and `/integration/*` routes unchanged.

## HRIS requisition operational depth implementation note

`hris-requisition-operational-depth` is implemented as the HRIS-specific follow-on to provider readiness gates. It scopes `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` as Jobs-side consumers and `/requisition-workflows` as a Settings-side administration consumer. The model covers ready, mapping-required, mapping-drift, sync-pending, sync-degraded, sync-failed, retrying, synced, auth-required, provider-blocked, unavailable, and unimplemented outcomes without exposing raw HRIS mappings, OAuth payloads, provider diagnostics, or tenant-sensitive data.

Mapping drift and workflow drift remain separate: HRIS mapping remediation points to HRIS/workflow administration, while existing requisition workflow drift remains authoritative for removed stages, changed required fields, reassigned approvals, and stale workflow route repair. Public/token `/job-requisition-approval`, `/job-requisition-forms`, and `/integration/*` routes remain unchanged.


## ATS and assessment provider setup depth closeout

`ats-assessment-provider-setup-depth` is implemented and validated. It expands provider setup ownership under `/integrations/:providerId` for ATS and assessment families and produces normalized ATS sync/import and assessment review/scoring readiness handoffs for later operational packages. It does not implement ATS source/import operations, assessment scoring execution, public/token route changes, or custom-provider setup.


## Survey review scoring operational depth closeout

`survey-review-scoring-operational-depth` is implemented and validated. It scopes authenticated candidate review launchers plus public/external `/review-candidate/:code`, `/interview-feedback/:code`, and `/surveys/:surveyuuid/:jobuuid/:cvuuid` consumers. The model covers schema/template/reviewer readiness, submit/retry, partial submission, read-only terminal outcomes, scoring-pending/scored refresh, parent-refresh intent, safe telemetry, provider setup separation, and unchanged `/integration/*` behavior.

## ATS candidate source operational depth closeout

`ats-candidate-source-operational-depth` is implemented and validated. It scopes candidate database, candidate detail, jobs list, and job authoring status-only consumers. The model covers source-linked/source-unlinked, import/sync outcomes, duplicate-detected/duplicate-merged, stale-source refresh, provider-blocked/degraded/unavailable/unimplemented states, safe telemetry, provider setup separation, preserved candidate/job route state, and unchanged public/token `/integration/*` behavior.
