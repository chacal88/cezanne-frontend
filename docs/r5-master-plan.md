# R5 Master Plan

## Purpose

This document consolidates the `R5 — Platform + long-tail` planning baseline into one execution-oriented package.

It exists to:
- turn the R5 decision register into a prioritized planning sequence
- keep platform administration inside `recruit-frontend` while preserving clean SysAdmin ownership
- separate route-heavy SysAdmin work from requisition, settings, and public/token leftovers
- record the first OpenSpec changes that should be opened before broader `R5` execution starts

## Source baseline

Built on top of:
- `roadmap.md`
- `domains.md`
- `modules.md`
- `screens.md`
- `access-model.md`
- `capabilities.md`
- `architecture.md`
- `r5-decision-register.md`
- `r4-team-and-favorites-open-points.md`

## Confirmed baseline

Confirmed:
- `R5` stays inside the existing `recruit-frontend` app.
- `sysadmin` remains a domain, not a separate project or deployable.
- `R5` must not launch as one monolithic platform wave.
- Platform administration must be distinct from recruiter-core shell behavior.
- route and action access must continue to use capability decisions at route/domain boundaries.
- `/parameters` remains compatibility-only and must not become a monolithic settings page.
- R5 completes full requisition authoring workflows that were only partially represented by R1 `jobRequisition` branching.

Resolved R5 closeout:
- SysAdmin foundation, platform master data, platform users/favorite-request queue, taxonomy, requisition authoring, settings leftovers, and public/token forms-download are implemented and validated.
- Generic integration tokenized entries were reconciled as already covered by R3 integrations token-entry source/tests; no R5 implementation package is opened for that line.
- R5 is closed as a set of focused changes rather than a monolithic platform wave.

## Consolidated sequencing

| Priority | Area | Why it goes now | First change |
|---|---|---|---|
| `1` | `R5.1` SysAdmin foundation | establishes platform shell, landing/fallback, navigation grouping, route metadata, and deny behavior before route-heavy SysAdmin implementation | `r5-sysadmin-foundation` |
| `2` | `R5.2` platform master data | implemented as the first route-heavy Platform group for companies, agencies, subscriptions, and company subscription administration | `r5-platform-master-data` |
| `3` | `R5.3` platform users and favorite-request queue | implemented as platform `/users*` CRUD foundation plus platform `/favorites-request*` queue foundation | `r5-platform-users-and-favorite-requests` |
| `4` | `R5.4` taxonomy | implemented as platform sectors/subsectors foundation with parent-child navigation | `r5-platform-taxonomy` |
| `5` | `R5.5` requisition authoring completion | implemented as frontend route/state foundation for Jobs-side authoring and settings-side workflow administration | `r5-requisition-authoring` |
| `6` | `R5.6` settings leftovers | implemented API endpoints and closed `/parameters` compatibility inventory | `r5-settings-leftovers` |
| `7` | `R5.7` public/token leftovers | implemented requisition forms/download as a distinct public/token route | `r5-public-token-leftovers` |
| `8` | `R5.8` integration token leftovers | reconciled as already covered by R3 integrations token-entry source/tests | no R5 change opened |


## Planning package status

Created R5 planning artifacts:
- `r5-decision-register.md`
- `r5-master-plan.md`
- `r5-sysadmin-open-points.md`
- `r5-requisition-authoring-open-points.md`
- `r5-settings-and-token-open-points.md`

Current status:
- R5 planning coverage exists for all major areas and every R5 execution package has completed implementation/validation.
- `r5-sysadmin-foundation`, `r5-settings-leftovers`, and `r5-public-token-leftovers` are archived.
- `r5-platform-master-data`, `r5-platform-users-and-favorite-requests`, `r5-platform-taxonomy`, and `r5-requisition-authoring` are complete and ready for archive/closeout.
- `r5-integration-token-leftovers` is not opened because D10 confirms no remaining generic integration token-entry scope.

## Dependency map

### `R5.1` SysAdmin foundation

Scope:
- SysAdmin landing or platform dashboard behavior.
- platform-only route fallback behavior.
- SysAdmin navigation grouping and discoverability.
- platform route metadata and telemetry conventions.
- SysAdmin error-boundary expectations.

Unlocks:
- platform master data routes.
- platform user routes.
- taxonomy routes.
- favorite-request queue routes.

Blocks:
- any route-heavy SysAdmin implementation that would otherwise invent fallback or navigation behavior locally.

### `R5.2` platform master data

Scope:
- `/hiring-companies`
- `/hiring-companies/:id`
- `/hiring-companies/edit/:id`
- `/hiring-company/:id/subscription`
- `/recruitment-agencies`
- `/recruitment-agencies/:id`
- `/recruitment-agencies/edit/:id`
- `/subscriptions`
- `/subscriptions/:id`

Planning rule:
- keep this as platform-only SysAdmin work.
- do not absorb org-admin settings or billing user flows.
- subscription administration here is platform administration, not HC billing self-service.

### `R5.3` platform users and favorite-request queue

Scope:
- platform-scoped `/users` behavior.
- `/users?page&search&hiringCompanyId&recruitmentAgencyId`.
- `/users/edit/:id`.
- `/users/new`.
- `/users/:id`.
- `/favorites-request`.
- `/favorites-request/:id`.

Consumes:
- accepted R4/R5 split: org invite/membership stays in R4 team routes, while platform user CRUD stays in R5 SysAdmin.
- accepted R4/R5 split: org `/favorites*` and `/favorites/request*` stay recruiter-core, while platform `/favorites-request*` stays in R5 SysAdmin.

Still must define:
- platform user list/create/edit/view route behavior, filtering, cross-tenant denied states, and return behavior.
- platform favorite-request queue states, actions, and stale/inaccessible handling.

Planning rule:
- do not merge org invite/membership flows into platform user management unless the open-points doc explicitly promotes them.
- do not merge org-scoped `/favorites*` behavior into the platform favorite-request queue.

### `R5.4` platform taxonomy

Scope:
- `/sectors`.
- `/sectors/:id`.
- `/sectors/:sector_id/subsectors`.
- `/subsectors/:id`.

Planning rule:
- keep taxonomy under `sysadmin.taxonomy`.
- treat nested sector/subsector navigation as platform master-data navigation, not settings subsection routing.

### `R5.5` requisition authoring completion

Scope:
- `/build-requisition`.
- `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?`.
- `/requisition-workflows`.

Ownership:
- `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` remain in `jobs.workflow-state`.
- `/requisition-workflows` remains in `settings.hiring-flow`.

Planning rule:
- keep execution/authoring and workflow configuration separate.
- share models or adapters only where the contract is explicit.
- preserve R1 Jobs authoring behavior and add the missing requisition authoring workflow instead of replacing the Jobs route family.

### `R5.6` settings leftovers

Scope:
- `/settings/api-endpoints`.
- remaining `/parameters/:settings_id?/:section?/:subsection?` subsection completion.

Resolved for `r5-settings-leftovers`:
- closed compatibility inventory: `hiring-flow`, `custom-fields`, `templates`, `reject-reasons`, and `api-endpoints`.

Planning rule:
- `/settings/api-endpoints` belongs to `settings.api-endpoints`, not `sysadmin`.
- `/parameters` stays compatibility-only.
- dedicated settings routes should own behavior where a subsection needs durable state, save/retry, or route-specific access rules.

### `R5.7` public/token leftovers

Scope:
- `/job-requisition-forms/:id?download`.
- public/token leftovers confirmed by the R5 decision register. Generic integration token entries are excluded because D10 closed them as R3-covered.

Accepted implementation rule:
- requisition forms/download is implemented as a distinct route contract, not a minor variant of `/job-requisition-approval?token`.
- token lifecycle states remain explicit: valid, invalid, expired, inaccessible, unavailable, already-downloaded, not-found, and retryable download failure.
- the `download` query flag selects download-focused mode but requires explicit user action; no automatic browser download is triggered.

### `R5.8` integration token leftovers

Status:
- closed as reconciliation-only. D10 confirms the generic `/integration/cv/:token/:action?`, `/integration/forms/:token`, and `/integration/job/:token/:action?` families are already implemented under R3 integrations token-entry source/tests.

Future rule:
- do not open `r5-integration-token-leftovers` for the generic cv/forms/job line. A future package must name a concrete missing provider or route family.

Closeout rule:
- the generic route family was confirmed to be stale roadmap language, so no R5 implementation package is opened.

## Area-by-area planning summary

### SysAdmin

Plan under one umbrella but implement as separate changes:
- foundation.
- companies/agencies/subscriptions.
- users/favorite-request queue.
- taxonomy.

Do not start with `/users`; it carries unresolved org-admin versus platform-admin ambiguity.

### Requisition authoring

Plan as a Jobs/settings boundary package:
- Jobs owns execution and authoring routes.
- Settings owns workflow configuration routes.
- capability checks must distinguish `canUseJobRequisitionBranching` from `canManageHiringFlowSettings`.

### Settings leftovers

Plan as an inventory-driven package:
- use the accepted closed `/parameters` compatibility inventory for `r5-settings-leftovers`.
- implement `/settings/api-endpoints` as a dedicated settings module.
- keep compatibility routing as a resolver, not a page.
- leave broad company, agency, user, forms/docs, public/token, and integration-token leftovers to later subsection-specific packages unless a route contract is proven.

### Public/token leftovers

Closed as explicit token contracts:
- requisition forms/download is implemented separately from approval behavior.
- token-state handling and download retry behavior are documented and tested.

### Integration token leftovers

Closed after reconciliation:
- R3 already covers the generic token-entry surface.
- roadmap/docs mark the old R5 line as reconciled.
- future work must name an exact missing provider/route contract before opening a new change.

## OpenSpec closeout status

Archived:
1. `r5-sysadmin-foundation`
2. `r5-settings-leftovers`
3. `r5-public-token-leftovers`

Complete and ready to archive:
4. `r5-platform-master-data`
5. `r5-platform-users-and-favorite-requests`
6. `r5-platform-taxonomy`
7. `r5-requisition-authoring`

Not opened:
- `r5-integration-token-leftovers`; D10 confirms no remaining generic integration token-entry scope.

## Docs that should stay synchronized with this plan

- `roadmap.md`
- `domains.md`
- `modules.md`
- `screens.md`
- `capabilities.md`
- `navigation-and-return-behavior.md`
- `notification-destinations.md`
- `r5-decision-register.md`
- future `r5-*-open-points.md`

## Planning rule

No `R5` execution package should open until:
- its route family is frozen in `screens.md`.
- its ownership is explicit in `domains.md`, `modules.md`, or a dedicated R5 open-points doc.
- its capability contract is explicit in `capabilities.md`.
- its deny/fallback behavior is explicit.
- its return/refresh behavior is explicit when the area introduces stateful pages, task flows, or public/token routes.
- unresolved items from `r5-decision-register.md` are either accepted or intentionally deferred out of the slice.

## R5.1 SysAdmin foundation implementation checkpoint

Confirmed implementation baseline for `r5-sysadmin-foundation`:
- `/dashboard` is the canonical SysAdmin platform landing URL when the access context is `sysAdmin` with no active HC/RA operational context.
- The authenticated shell owns a dedicated `Platform` navigation group with child groups for master data, users and requests, and taxonomy. The foundation exposes groups only from platform-nav capabilities and keeps route-heavy links hidden until their owning slices ship.
- `/hiring-companies` was registered as a typed foundation placeholder for direct-entry and fallback proof; `r5-platform-master-data` now supersedes it with implemented master-data foundation routes.
- Platform-only denial resolves to `/dashboard`, allowing the dashboard mode to resolve from the user's access context.
- Validation evidence now includes capability/navigation/fallback unit coverage plus R0 smoke coverage for SysAdmin dashboard platform mode and non-SysAdmin `/hiring-companies` fallback.


## R5.2 platform master-data implementation checkpoint

Confirmed implementation baseline for `r5-platform-master-data`:
- Platform / Master data exposes implemented links for `/hiring-companies`, `/recruitment-agencies`, and `/subscriptions`.
- company, agency, and subscription list/detail/edit routes use shared deterministic platform master-data states.
- `/hiring-company/:id/subscription` remains company-owned for route entry and uses platform subscription capability for mutation readiness.
- platform subscription administration remains separate from R4 HC-admin billing routes.


## R5.3 platform users and favorite-request queue implementation checkpoint

Confirmed implementation baseline for `r5-platform-users-and-favorite-requests`:
- Platform / Users and requests exposes implemented links for `/users` and `/favorites-request`.
- `/users`, `/users/new`, `/users/edit/:id`, and `/users/:id` are platform-owned and gated by `canManagePlatformUsers`.
- `/favorites-request` and `/favorites-request/:id` are platform-owned and gated by `canManageFavoriteRequests`.
- `/users/invite`, `/team*`, `/favorites*`, and `/favorites/request*` remain org-scoped R4 behavior and are not absorbed by R5 platform routes.


## R5.4 platform taxonomy implementation checkpoint

Confirmed implementation baseline for `r5-platform-taxonomy`:
- Platform / Taxonomy exposes an implemented `/sectors` link.
- `/sectors`, `/sectors/:id`, `/sectors/:sector_id/subsectors`, and `/subsectors/:id` are platform-owned and gated by `canManageTaxonomy`.
- taxonomy state helpers preserve parent-child return behavior and stay separate from settings subsection routing and platform master-data routes.


## R5.5 requisition authoring implementation checkpoint

Confirmed implementation baseline for `r5-requisition-authoring`:
- `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` are Jobs-side workflow-state routes gated by `canUseJobRequisitionBranching`.
- `/requisition-workflows` is settings/hiring-flow administration gated by `canManageHiringFlowSettings`.
- requisition authoring models local draft, explicit save, submit, recoverable failure, stale workflow, and workflow-drift states without backend persistence.
- no new typed notification destinations or autosave persistence are introduced.
