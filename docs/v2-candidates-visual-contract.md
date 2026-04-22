# V2 Candidates Visual Contract

## Purpose

This document is the V2 visual-readiness package from `pre-figma-flow-review.md`. It prepares the candidate route family for screen-flow work without using Figma as a source of product behavior. Current V2 candidate implementation evidence is behaviour-complete for selected paths but parity-blocked against legacy until the side-by-side blockers in `visual-evidence-v2-candidates.md` are resolved or explicitly accepted.

V2 covers:
- candidate detail hub and optional contextual route segments;
- candidate database/search canonical route;
- candidate action launchers for schedule, offer, and reject;
- candidate documents/contracts/surveys/custom-field/collaboration panels as route-local visual states;
- parent-return behavior from jobs, candidate database, notifications, and task flows.

## Readiness status

| Family | Contract status | Visual status | Figma-ready? | Notes |
|---|---|---|---|---|
| Candidate detail hub | Contract-reviewed | Current product-composition recaptured + legacy reference | Yes, covered rows | Current greenfield shows profile summary, context/return, sequence, action stack, document/insight/collaboration panels, degraded, and upload states. Legacy remains reference-only. |
| Candidate database/search | Contract-reviewed | Current product-composition recaptured + legacy reference | Yes, covered rows | Current greenfield shows header/search context, saved filters/list rail, bulk toolbar, result table, empty/filtered-empty, advanced invalid/unsupported, and ATS/bulk states. Legacy remains reference-only. |
| Schedule launcher | Contract-reviewed | Current product-composition recaptured | Yes, covered rows | Current greenfield shows task shell, parent return, ready/job-context, and failure/retry states; additional provider-blocked variants require separate evidence before promotion. |
| Offer launcher | Contract-reviewed | Current product-composition recaptured | Yes, covered rows | Current greenfield shows task shell, contract readiness, database-origin parent, ready, and success/refresh states; field-specific offer payloads remain deferred. |
| Reject launcher | Contract-reviewed | Current product-composition recaptured | Yes, covered rows | Current greenfield shows reject task shell and readiness boundary; reason catalog and terminal/read-only variants remain deferred until separately evidenced. |
| Documents/contracts/surveys/collaboration | Contract-reviewed | Current product-composition recaptured | Yes, covered rows | Current greenfield shows bounded document/contract, survey/custom-field/feedback, and collaboration panels without raw payloads. |

## Evidence sources

| Evidence | Source | How it may be used | Limit |
|---|---|---|---|
| Route and state contracts | `pre-figma-flow-review.md`, `screens.md`, `modules.md`, `capabilities.md` | Canonical product behavior for candidate flows | Must not be overridden by screenshots. |
| OpenSpec specs | `candidate-detail-hub`, `candidate-database-list-state`, `candidate-database-detail-handoff`, `candidate-database-advanced-search-bulk-depth`, `candidate-task-flows`, `candidate-product-depth`, `candidate-document-truth`, `candidate-implementation-depth-closeout` | Required state/action/error/parent-return coverage | Specs do not define final layout. |
| Operational specs | `calendar-scheduling-operational-depth`, `contract-signing-operational-depth`, `survey-review-scoring-operational-depth`, `ats-candidate-source-operational-depth`, `messaging-communication-operational-depth` | Candidate task and panel operational state semantics | Do not expose provider setup internals inside candidate task screens. |
| Current greenfield source | `src/domains/candidates/**` and shared operational support modules | Runtime state and current UI behavior | Fixture-backed data remains an adapter seam. |

## Candidate detail hub frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Loading | Candidate aggregate loading | Keep shell and route title stable. | Aggregate endpoint shape unknown. |
| Ready hub | Candidate summary plus panels/actions allowed by capability/context | Optional route segments must not create unrelated screen families. | Final field labels and panel payloads unknown. |
| Job-context entry | Detail opened from job/CV context | Show contextual parent return to job route. | Exact job-stage/status labels unknown. |
| Database-context entry | Detail opened from candidate database | Preserve sanitized database return filters. | Database result schema unknown. |
| Notification/direct entry | Detail opened from notification or direct URL | Safe fallback when context is missing/invalid. | Notification payload shape unknown. |
| Sequence navigation | Previous/next candidate context from status/order/filter route state | Sequence UI must preserve parent context. | Server sequence authority unknown. |
| Partial degraded | One or more panels unavailable while hub remains usable | Show panel-specific degradation. | Partial failure taxonomy unknown. |
| Stale source | Candidate source is stale or ATS-backed data requires refresh | Show refresh/source status without inventing ATS internals. | ATS freshness metadata unknown. |
| Not found/denied/unavailable | Candidate inaccessible or source unavailable | Do not leak candidate data on denied/not-found. | None. |

## Candidate database/search frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Canonical database ready | `/candidates-database` with sanitized query/page/sort/order/stage/tags/advanced state | This is the only candidate database visual target. | Final columns, facets, and row aggregates unknown. |
| Loading | Search/list loading | Preserve filter/header layout. | Exact loading granularity unknown. |
| Empty | No candidates for default state | Offer valid next actions only when capability exists. | Backend empty reason unknown. |
| Filtered empty | Active query/filter returns no rows | Show clear-filters action. | Exact filter semantics unknown. |
| Advanced invalid/unsupported | Advanced search state invalid or unsupported | Treat as route-local state, not new route. | Advanced query DSL unknown. |
| Bulk none/eligible/partial/blocked/failed | Bulk action selection and readiness variants | Do not invent hidden action payloads. | Bulk mutation schema unknown. |
| ATS duplicate/import/sync | ATS-backed duplicate/import/sync source states | Surface source identity/status safely. | Provider-specific ATS payload unknown. |
| Detail handoff | Open candidate detail and return with filters preserved | Parent return must be explicit. | None. |

## Candidate action-launcher frame set

| Action | Required states | Parent-return rule | Visual rule |
|---|---|---|---|
| Schedule | readiness ready, provider-blocked, degraded, unavailable, slot selection, conflict, submitting, success, failed, retry, cancel | Return to candidate hub or database-origin parent with refresh intent | Consume calendar readiness; do not embed calendar/provider setup flow. |
| Offer | contract/signing readiness, ready, document placeholder, sending, sent, status-refresh, failed, retry, stale/read-only | Return to candidate or job parent with refresh intent | Consume contract-signing state; do not invent offer/contract payload fields. |
| Reject | ready, reason required, review/scoring adjacency, submitting, success, failed, retry, terminal/read-only, cancel | Return to candidate/job/database context with refresh intent | Reject reason and scoring fields must follow confirmed contract only. |

## Candidate panels and downstream visual boundaries

| Panel/surface | Required states | Visual rule |
|---|---|---|
| Documents/CVs | ready, missing, unavailable, stale, upload launcher available/blocked | Do not render raw document contents or signed URL assumptions. |
| Contracts | summary, downstream-owned, signing-ready, sent, stale status, unavailable | Keep contract signing operational state separate from provider setup. |
| Surveys/reviews | schema ready, score pending, completed, unavailable, validation/retry states | Do not expose raw answers in telemetry or visual artifacts. |
| Custom fields | ready, schema unavailable, degraded, stale | Do not invent field schema beyond current contract. |
| Collaboration/messages | handoff to inbox/candidate communication, provider-blocked/degraded | Message bodies are not telemetry or screen-contract data. |
| Upload CV | upload handshake failure, binary transfer failure, metadata persistence failure, retry, success | Upload workflow remains a seam until API is confirmed. |

## Alias rules

| Legacy/reference row | Canonical visual target | Rule |
|---|---|---|
| `/candidate/$id/.../cv/$cv_id/offer` | Candidate action route family | Treat as alias/reference for the candidate offer launcher, not as a separate route. |

## Responsive assumptions

| Viewport | Requirement |
|---|---|
| Desktop primary | Candidate hub/database/action launchers are desktop-first authenticated shell screens. |
| Narrow desktop/tablet | Preserve panel navigation, filter controls, action launcher close/return actions, and parent context indicators. |
| Mobile | Out of scope for V2 final visual readiness unless product confirms mobile parity. |

## Non-goals

- Do not design final backend candidate aggregate schemas, database columns, advanced query DSL, ATS duplicate/import payloads, CV/document body schemas, offer payloads, reject reason catalogs, survey answer schemas, or custom-field payloads.
- Do not merge candidate-owned schedule/offer/reject launchers with job-owned task overlay frames.
- Do not merge provider setup screens with provider-blocked operational states.
- Do not create canonical frames for legacy candidate database aliases.
- Do not change implementation code from this visual contract.

## Covered `Figma-ready` outputs

1. Candidate detail hub visual map is covered for ready, job/database/notification context, sequence navigation, degraded section rendering, and upload feedback. Denied, not-found, unavailable, and mobile variants remain deferred until recaptured.
2. Candidate database visual map is covered for canonical search/list, active filters, empty/filtered-empty, advanced invalid/unsupported, bulk partial/blocked/failed, ATS duplicate/import, and detail handoff. Field-specific backend columns remain deferred.
3. Candidate action visual map is covered for schedule, offer, and reject task shells with ready, failure/retry, database-origin parent, cancel controls, and success/refresh evidence. Provider-blocked/degraded/unavailable and terminal/read-only variants need separate evidence before promotion.
4. Candidate panel visual boundaries are covered for documents/contracts/surveys/custom fields/collaboration/upload without raw payloads.
5. Alias handling remains documentation-only for candidate offer reference rows and must not become standalone frames.
6. `pre-figma-flow-review.md` may mark only the rows and states covered by the recaptured current evidence as `Figma-ready`.


## Parity acceptance rule

For this package, `Figma-ready` requires side-by-side legacy parity review. Functional captures alone are insufficient. A row may be promoted only after current and legacy captures are compared for layout, spacing, typography, icons, menu placement, modal placement, table behaviour, tab behaviour, and task/action behaviour, with every accepted difference documented.

## Legacy parity requirement

Candidate database, detail, and action launcher screens must match the authenticated legacy reference in appearance and behaviour before final Figma-ready promotion. The current greenfield screenshots are behaviour evidence only where `visual-evidence-v2-candidates.md` marks them parity-blocked. Do not use standalone task pages as final schedule/offer/reject references while the legacy flow uses modal composition unless product explicitly accepts that deviation.
