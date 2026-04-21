# V2 Candidates Visual Contract

## Purpose

This document is the V2 visual-readiness package from `pre-figma-flow-review.md`. It prepares the candidate route family for Figma/screen-flow work without using Figma as a source of product behavior.

V2 covers:
- candidate detail hub and optional contextual route segments;
- candidate database/search and legacy compatibility entries;
- candidate action launchers for schedule, offer, and reject;
- candidate documents/contracts/surveys/custom-field/collaboration panels as route-local visual states;
- parent-return behavior from jobs, candidate database, notifications, and task flows.

## Readiness status

| Family | Contract status | Visual status | Figma-ready? | Notes |
|---|---|---|---|---|
| Candidate detail hub | Contract-reviewed | Pending | No | Hub panels, optional context segments, sequence navigation, degraded panels, and parent return need canonical visual frames. |
| Candidate database/search | Contract-reviewed | Pending | No | Canonical `/candidates-database` screen, filter state, advanced/bulk behavior, ATS source state, and legacy redirects need visual confirmation. |
| Schedule launcher | Contract-reviewed | Pending | No | Candidate-owned schedule task needs provider readiness, slots/conflict, submission, retry, and parent refresh states. |
| Offer launcher | Contract-reviewed | Pending | No | Candidate-owned offer task needs contract-signing readiness, send/status-refresh, failure, retry, and parent refresh states. |
| Reject launcher | Contract-reviewed | Pending | No | Candidate-owned reject task needs reason/review/scoring states and terminal/read-only handling. |
| Documents/contracts/surveys/collaboration | Contract-reviewed | Pending | No | Route-local panel states need visual boundaries without inventing backend schemas. |

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
| Canonical database ready | `/candidates-database` with sanitized query/page/sort/order/stage/tags/advanced state | This is the only visual target for `/candidates-old` and `/candidates-new`. | Final columns, facets, and row aggregates unknown. |
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

## Compatibility and alias rules

| Legacy/reference row | Canonical visual target | Rule |
|---|---|---|
| `/candidates-old?query&page` | `/candidates-database` | Do not create a standalone visual family; show redirect/canonicalization only if needed. |
| `/candidates-new?query&page` | `/candidates-database` | Do not create a standalone visual family; show redirect/canonicalization only if needed. |
| `/candidate/$id/.../cv/$cv_id/offer` | Candidate action route family | Treat as alias/reference for the candidate offer launcher, not as a separate route. |

## Responsive assumptions

| Viewport | Requirement |
|---|---|
| Desktop primary | Candidate hub/database/action launchers are desktop-first authenticated shell screens. |
| Narrow desktop/tablet | Preserve panel navigation, filter controls, action launcher close/return actions, and parent context indicators. |
| Mobile | Out of scope for V2 Figma-ready unless product confirms mobile parity. |

## Non-goals

- Do not design final backend candidate aggregate schemas, database columns, advanced query DSL, ATS duplicate/import payloads, CV/document body schemas, offer payloads, reject reason catalogs, survey answer schemas, or custom-field payloads.
- Do not merge candidate-owned schedule/offer/reject launchers with job-owned task overlay frames.
- Do not merge provider setup screens with provider-blocked operational states.
- Do not create canonical frames for legacy candidate database aliases.
- Do not change implementation code from this visual contract.

## Required outputs before marking V2 rows `Figma-ready`

1. Candidate detail hub visual state map for loading, ready, contextual entry, sequence navigation, degraded/stale, denied, not-found, and unavailable states.
2. Candidate database visual map for canonical search/list, advanced filters, empty/filtered-empty, bulk action readiness, ATS source states, and detail handoff.
3. Candidate action visual map for schedule, offer, and reject with provider/contract/readiness states, submit/retry/failure/success, and parent refresh intent.
4. Candidate panel visual boundaries for documents/contracts/surveys/custom fields/collaboration/upload without inventing backend schemas.
5. Alias handling note showing `/candidates-old`, `/candidates-new`, and candidate offer reference rows map to canonical visual targets.
6. Updated `pre-figma-flow-review.md` rows from `Contract-reviewed` to `Figma-ready` only for states covered by the evidence above.
