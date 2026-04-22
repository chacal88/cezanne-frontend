# V2 Candidates Visual Contract

## Purpose

This document is the V2 visual-readiness package from `pre-figma-flow-review.md`. It prepares the candidate route family for screen-flow work without using Figma as a source of product behavior. Current V2 candidate implementation evidence is behaviour-complete for selected paths but parity-blocked against legacy until the side-by-side blockers in `visual-evidence-v2-candidates.md` are resolved or explicitly accepted.

Project-wide pixel-parity rule: V2 is not a special case. Every release package must match the legacy frontend wherever a legacy screen/state exists. `Figma-ready` is not replacement approval; unapproved visual differences are blockers until fixed or recorded as an explicit product exception.

V2 covers:
- candidate detail hub and optional contextual route segments;
- candidate database/search canonical route;
- candidate action launchers for schedule, offer, and reject;
- candidate documents/contracts/surveys/custom-field/collaboration panels as route-local visual states;
- parent-return behavior from jobs, candidate database, notifications, and task flows.

## Readiness status

| Family | Contract status | Visual status | Figma-ready? | Notes |
|---|---|---|---|---|
| Candidate detail hub | Contract-reviewed | Behaviour evidence recaptured + legacy reference | No | Current greenfield shows profile summary, context/return, sequence, action stack, document/insight/collaboration panels, degraded, and upload states, but side-by-side parity remains blocked. |
| Candidate database/search | Contract-reviewed | Behaviour evidence recaptured + legacy reference | No | Current greenfield shows header/search context, saved filters/list rail, bulk toolbar, result table, empty/filtered-empty, advanced invalid/unsupported, and ATS/bulk states, but side-by-side parity remains blocked. |
| Schedule launcher | Contract-reviewed | Behaviour evidence recaptured + legacy reference | No | Current greenfield now renders the route-owned task as a modal-like surface with a four-step scheduler, but exact legacy modal parity remains blocked until recapture. |
| Offer launcher | Contract-reviewed | Behaviour evidence recaptured; legacy reference incomplete | No | Current greenfield now renders the route-owned task as a modal-like surface with contract readiness and database-origin parent return, but legacy offer reference and exact modal parity remain unresolved. |
| Reject launcher | Contract-reviewed | Behaviour evidence recaptured + legacy reference | No | Current greenfield now renders the route-owned task as a modal-like surface and keeps readiness boundaries; legacy reject modal fields/reason catalog/terminal variants remain deferred. |
| Documents/contracts/surveys/collaboration | Contract-reviewed | Behaviour evidence recaptured + legacy reference | No | Current greenfield shows bounded panels without raw payloads, but panel grouping and detail composition parity remain unresolved. |

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
| Mobile | Required only for legacy-backed mobile states that product includes in replacement scope; otherwise document the omission explicitly. |

## Non-goals

- Do not design final backend candidate aggregate schemas, database columns, advanced query DSL, ATS duplicate/import payloads, CV/document body schemas, offer payloads, reject reason catalogs, survey answer schemas, or custom-field payloads.
- Do not merge candidate-owned schedule/offer/reject launchers with job-owned task overlay frames.
- Do not merge provider setup screens with provider-blocked operational states.
- Do not create canonical frames for legacy candidate database aliases.
- Do not change implementation code from this visual contract.

## Covered behaviour evidence

1. Candidate detail hub behaviour evidence exists for ready, job/database/notification context, sequence navigation, degraded section rendering, and upload feedback. Denied, not-found, unavailable, and mobile variants remain deferred until recaptured.
2. Candidate database behaviour evidence exists for canonical search/list, active filters, empty/filtered-empty, advanced invalid/unsupported, bulk partial/blocked/failed, ATS duplicate/import, and detail handoff. Field-specific backend columns remain deferred.
3. Candidate action behaviour evidence exists for schedule, offer, and reject task shells with ready, failure/retry, database-origin parent, cancel controls, and success/refresh evidence. Provider-blocked/degraded/unavailable and terminal/read-only variants need separate evidence before promotion.
4. Candidate panel boundaries are behaviour-evidenced for documents/contracts/surveys/custom fields/collaboration/upload without raw payloads.
5. Alias handling remains documentation-only for candidate offer reference rows and must not become standalone frames.
6. `pre-figma-flow-review.md` must not mark V2 candidate rows as final `Figma-ready` until the parity acceptance rule below is satisfied or a product exception explicitly records the affected route/family/gap id.


## Parity acceptance rule

For this package, `Figma-ready` requires side-by-side legacy parity review. Functional captures alone are insufficient. A row may be promoted only after current and legacy captures are compared for layout, spacing, typography, icons, menu placement, modal placement, table behaviour, tab behaviour, and task/action behaviour, with every accepted difference documented.

## Legacy parity requirement

Candidate database, detail, and action launcher screens must match the authenticated legacy reference in appearance and behaviour before final Figma-ready promotion. The current greenfield screenshots are behaviour evidence only where `visual-evidence-v2-candidates.md` marks them parity-blocked. Do not use standalone task pages as final schedule/offer/reject references while the legacy flow uses modal composition unless product explicitly accepts that deviation.

Product decision on 2026-04-22: **all replacement surfaces require legacy pixel parity wherever a legacy screen/state exists**. No visual or behavioural deviation is accepted unless a future product decision explicitly records the exception and the affected route/family/gap id.

Implementation update on 2026-04-22: the first parity pass improved database saved-filter/list density, action task modal composition, candidate detail legacy modal/action entry points, and recapture seed parity for Finn/Diego/API-seed-style screenshots. Follow-up passes moved schedule toward the legacy wizard, moved reject toward the legacy template/editor modal, moved Email candidate to the legacy-style Emails-tab composer surface, aligned the database ready frame's vertical rhythm and search sizing closer to legacy, brought the database ready capture to the legacy-style 8-row/card/table geometry with pagination below the primary viewport, added closer database menu/header icon treatment, improved detail card/tabs/CV vertical proportions, and moved schedule/reject closer to legacy modal geometry and footer composition. Validation is green (`npm test`, `npm run build`, `npm run smoke:r0:ui`), but these changes remain behaviour evidence only until side-by-side legacy recapture confirms visual parity. The latest side-by-side review still blocks V2 on remaining database exact icon/bulk selected details, detail lateral shell/proportion differences, and exact legacy action modal/editor field details.
