# V1 Jobs Visual Contract

## Purpose

This document is the V1 visual-readiness package from `pre-figma-flow-review.md`. It prepares the jobs route family for Figma/screen-flow work without using Figma as a source of product behavior.

Project-wide pixel-parity rule: wherever a legacy screen/state exists, the final Figma and implementation replacement must match the legacy frontend at the matched viewport and data/state. `Figma-ready` is not replacement approval; unapproved visual differences are blockers until fixed or recorded as an explicit product exception.

V1 covers:
- jobs list and URL-owned filters;
- job authoring/create/edit/copy;
- job detail hub and section selection;
- job task overlays for bid, CV, reject, schedule, and offer;
- requisition authoring and requisition workflow entry points.

## Readiness status

| Family | Contract status | Visual status | Figma-ready? | Notes |
|---|---|---|---|---|
| Jobs list | Contract-reviewed | Pending | No | List, filtered-empty, source health, clear-filters, pagination, and admin/scope variants need canonical visual frames. |
| Job authoring | Contract-reviewed | Pending | No | Draft/save/publish/resetWorkflow/provider-blocked states need visual decisions. |
| Job detail hub | Contract-reviewed | Pending | No | Section layout, degraded sections, activity/workflow/candidate panels, and task-launch placement need frames. |
| Job task overlays | Contract-reviewed | Pending | No | Bid/CV/reject/schedule/offer overlays need separate ready/submitting/success/failure/provider-blocked states. |
| Requisition authoring/workflow | Contract-reviewed | Pending | No | Build requisition and workflow-stage routes need visual separation from settings-owned requisition workflow configuration. |

## Evidence sources

| Evidence | Source | How it may be used | Limit |
|---|---|---|---|
| Route and state contracts | `pre-figma-flow-review.md`, `screens.md`, `modules.md`, `capabilities.md` | Canonical product behavior for jobs flows | Must not be overridden by screenshots. |
| OpenSpec specs | `jobs-list`, `job-authoring`, `job-detail-hub`, `job-task-overlays`, `jobs-product-depth`, `jobs-requisition-branching`, `requisition-authoring-routes` | Required state/action/error/parent-return coverage | Specs do not define final layout. |
| Operational specs | `calendar-scheduling-operational-depth`, `job-board-publishing-operational-depth`, `contract-signing-operational-depth`, `hris-requisition-operational-depth`, `provider-readiness-operational-gates` | Provider-blocked/degraded/readiness state semantics consumed by jobs tasks | Do not expose provider setup internals inside job task screens. |
| Current greenfield source | `src/domains/jobs/**` | Runtime state and current UI behavior | Fixture-backed data remains an adapter seam. |
| Legacy jobs reference | Legacy frontend route captures for matching jobs list/detail/authoring/task states | Required pixel-parity comparison source where a legacy state exists | Does not override route/state contracts or backend unknowns. |

## Jobs list frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Loading | Page skeleton while list/source loads | Preserve filter/header placement to avoid layout jump. | Exact backend loading granularity unknown. |
| Ready | Jobs table/list with scope, search, label, asAdmin, pagination, source health | URL-owned state must be visible enough to explain filters. | Final table columns and aggregate fields unknown. |
| Empty | No jobs for selected scope without active restrictive filter | Empty state should offer allowed create action when capability exists. | Backend empty reason unknown. |
| Filtered empty | Active search/filter returns no rows | Must show clear-filters action. | Exact filter semantics may be backend-driven. |
| Degraded/stale source | List available with source warning or stale status | Keep degraded source separate from total failure. | Source health payload unknown. |
| Denied/admin blocked | User lacks scope/admin access | Safe fallback to dashboard or visible denial. | None. |
| Unavailable | List source unavailable | Retry/refresh state; do not invent support/debug details. | Error taxonomy unknown. |

## Job authoring frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Create draft | New job draft entry | Separate draft save from publish. | Final job schema and validation copy unknown. |
| Edit/copy draft | Existing job or copied draft with dirty state | Show parent return to detail/list. | Copy/reset semantics payload unknown. |
| Validating | Local/server validation pending | Preserve form context and disabled duplicate submit. | Validation response shape unknown. |
| Saving/saved | Draft save pending/succeeded | Saved state must not imply published. | Save payload unknown. |
| Save failed/retry | Recoverable save failure | Retry without losing draft. | Error code/copy unknown. |
| Publish blocked | Provider/readiness or validation blocks publishing | Show remediation target without opening provider setup inline. | Provider-specific reason labels unknown. |
| Partial publish | Some boards/providers succeed and others fail | Separate from draft save success. | Board-specific result schema unknown. |
| resetWorkflow | Explicit resetWorkflow route/query semantics | Must communicate downstream impact/data-loss warning. | Exact workflow reset effects unknown. |

## Job detail hub frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Loading | Job aggregate loading | Keep shell and route title stable. | Aggregate endpoint shape unknown. |
| Ready overview | Job summary, status, task links, candidate/activity/workflow entry points | Sections must match route-owned `section` state. | Final field labels unknown. |
| Section selected | Overview/candidates/workflow/activity selected from URL | URL state must survive refresh/direct entry. | Section payloads unknown. |
| Partial degraded | One or more sections degraded while hub remains usable | Show section-specific warning, not global failure. | Partial failure taxonomy unknown. |
| Stale after task | Parent refresh required after overlay success | Show refresh intent or refreshed state explicitly. | Refresh trigger contract unknown. |
| Not found/denied/unavailable | Missing/inaccessible job or unavailable source | Do not leak job data on denied/not-found. | None. |

## Job task overlay frame set

| Task family | Required states | Parent-return rule | Visual rule |
|---|---|---|---|
| Bid create/view | ready, submitting, success, failed, retry, cancel, denied, unavailable, degraded | Return to `/job/:id` with section/refresh intent preserved | Bid create and bid detail are separate frames or clearly annotated variants. |
| CV create/view | ready, upload/document placeholder, submitting, success, failed, retry, cancel, denied, unavailable | Return to job hub with refresh intent | Do not invent CV document body/schema. |
| CV reject | ready, reason required, submitting, success, failed, retry, terminal/read-only | Return to candidate/job parent with refresh intent | Reject reason catalog is unknown until API confirmed. |
| Schedule | readiness ready, provider-blocked, degraded, unavailable, slot selection, conflict, submitting, success, failed, retry | Return to job hub with refresh intent and setup remediation target when blocked | Consume calendar readiness; do not embed provider setup flow. |
| Offer | ready, contract/signing readiness, document placeholder, sending, sent, failed, retry, stale status | Return to job hub with refresh intent | Consume contract-signing state; do not invent offer payload fields. |

## Requisition frame set

| Route/family | Required states | Visual rule |
|---|---|---|
| `/build-requisition` | draft, explicit save, dirty, data-loss warning, save failed, retry, saved | Jobs-side requisition authoring only; not settings workflow configuration. |
| `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` | workflow/stage selected, stale workflow, workflow drift, HRIS readiness, retry, dashboard/jobs fallback | Preserve workflow/stage context and distinguish HRIS readiness from provider setup. |

## Responsive assumptions

| Viewport | Requirement |
|---|---|
| Desktop primary | Primary jobs list/detail/authoring and overlays are desktop-first authenticated shell screens. |
| Narrow desktop/tablet | Preserve filters, section navigation, and task overlay close/return actions. |
| Mobile | Required only for legacy-backed mobile states that product includes in replacement scope; otherwise document the omission explicitly. |

## Non-goals

- Do not design final backend job table columns, job aggregate schema, CV document schema, bid schema, offer payload, requisition payload, or provider-specific publishing payloads.
- Do not merge job authoring with requisition workflow configuration under settings.
- Do not merge provider setup with schedule/publish/provider-blocked operational states.
- Do not create canonical frames for candidate-owned action routes in this V1 package.
- Do not change implementation code from this visual contract.

## Required outputs before marking V1 rows `Figma-ready`

1. Jobs list visual state map for loading, ready, empty, filtered-empty, degraded/stale, denied, unavailable, and clear-filters behavior, with legacy pixel-parity comparison where legacy exists.
2. Job authoring visual map for create/edit/copy, dirty/save/publish/resetWorkflow, blocked/partial-publish, and retry states.
3. Job detail hub visual map with URL section ownership and partial-degraded sections.
4. Task overlay visual map for bid, CV, reject, schedule, and offer, including parent-return and refresh intent.
5. Requisition visual map separating jobs-side authoring/execution from settings-side workflow configuration.
6. Updated `pre-figma-flow-review.md` rows from `Contract-reviewed` to `Figma-ready` only for states covered by the evidence above.
