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

Resolved for `r5-sysadmin-foundation`:
- SysAdmin landing/fallback and navigation grouping have an accepted foundation baseline in `r5-sysadmin-open-points.md` and `openspec/changes/r5-sysadmin-foundation/`.

Still unresolved for later R5 route-heavy slices:
- platform user route behavior after the accepted org/platform user-management split.
- platform favorite-request queue behavior after the accepted org-favorites/platform-queue split.
- closed inventory of remaining `/parameters` subsections.
- whether tokenized integration entries still have any R5 scope after the R3 provider callback implementation.
- route-specific public/token contract for `/job-requisition-forms/:id?download`.

## Consolidated sequencing

| Priority | Area | Why it goes now | First change |
|---|---|---|---|
| `1` | `R5.1` SysAdmin foundation | establishes platform shell, landing/fallback, navigation grouping, route metadata, and deny behavior before route-heavy SysAdmin implementation | `r5-sysadmin-foundation` |
| `2` | `R5.2` platform master data | companies, agencies, and subscriptions are clearer platform-only surfaces than `/users` or favorite requests | `r5-platform-master-data` |
| `3` | `R5.3` platform users and favorite-request queue | consumes the accepted R4/R5 split and still needs route-heavy platform user and queue behavior | `r5-platform-users-and-favorite-requests` |
| `4` | `R5.4` taxonomy | sectors/subsectors are platform-only but lower criticality than companies/agencies/subscriptions | `r5-platform-taxonomy` |
| `5` | `R5.5` requisition authoring completion | completes `jobRequisition` authoring without letting requisition workflows consume the Jobs domain | `r5-requisition-authoring` |
| `6` | `R5.6` settings leftovers | API endpoints and remaining `/parameters` subsections need a closed inventory before implementation | `r5-settings-leftovers` |
| `7` | `R5.7` public/token leftovers | requisition forms/download and any confirmed tokenized leftovers need distinct route contracts | `r5-public-token-leftovers` |
| `8` | `R5.8` integration token leftovers | only opens if the decision register confirms scope still exists after R3 provider callbacks | conditional: `r5-integration-token-leftovers` |


## Planning package status

Created R5 planning artifacts:
- `r5-decision-register.md`
- `r5-master-plan.md`
- `r5-sysadmin-open-points.md`
- `r5-requisition-authoring-open-points.md`
- `r5-settings-and-token-open-points.md`

Current status:
- planning coverage exists for all major R5 areas.
- SysAdmin foundation decisions for landing/fallback, navigation grouping, and validation evidence now have an accepted baseline in `r5-sysadmin-open-points.md`.
- the `r5-sysadmin-foundation` OpenSpec package has been created and validates strictly.
- route-heavy platform implementation should still wait until `r5-sysadmin-foundation` is implemented and accepted.

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

Blocked by:
- closed inventory of remaining `/parameters` subsections.

Planning rule:
- `/settings/api-endpoints` belongs to `settings.api-endpoints`, not `sysadmin`.
- `/parameters` stays compatibility-only.
- dedicated settings routes should own behavior where a subsection needs durable state, save/retry, or route-specific access rules.

### `R5.7` public/token leftovers

Scope:
- `/job-requisition-forms/:id?download`.
- any public/token leftovers that remain after the R5 decision register is resolved.

Planning rule:
- requisition forms/download is a distinct route contract, not a minor variant of `/job-requisition-approval?token`.
- token lifecycle states must remain explicit: valid, invalid, expired, inaccessible, unavailable, and downloaded/viewed states where relevant.

### `R5.8` integration token leftovers

Scope:
- only the integration tokenized entry routes still proven missing after comparing current source, R3 provider callback implementation, and the R5 roadmap line.

Blocked by:
- decision register D10.

Planning rule:
- do not open this change until the route family is confirmed to be real R5 scope rather than stale roadmap language.

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
- close the list of remaining `/parameters` subsections first.
- implement `/settings/api-endpoints` as a dedicated settings module.
- keep compatibility routing as a resolver, not a page.

### Public/token leftovers

Plan as explicit token contracts:
- do not infer requisition forms/download behavior from approval behavior.
- document token-state handling before implementation.

### Integration token leftovers

Plan only after reconciliation:
- if R3 already covers the token-entry surface, update roadmap/docs to remove stale R5 scope.
- do not confuse this conditional token-entry reconciliation with R4 authenticated provider setup depth, which remains outside default R5 scope.
- if R5 still has missing entries, open a narrow change for those exact route contracts.

## First OpenSpec queue

Current first change:
1. `r5-sysadmin-foundation` — opened and validates strictly.

Next changes to open after the foundation is implemented and accepted:
2. `r5-platform-master-data`
3. `r5-platform-users-and-favorite-requests`
4. `r5-requisition-authoring`
5. `r5-settings-leftovers`
6. `r5-public-token-leftovers`

Conditional:
- `r5-platform-taxonomy` can open after or alongside platform users if SysAdmin foundation is stable.
- `r5-integration-token-leftovers` opens only if D10 confirms remaining scope.

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
- `/hiring-companies` is registered only as a typed foundation placeholder for direct-entry and fallback proof; company CRUD remains owned by `r5-platform-master-data`.
- Platform-only denial resolves to `/dashboard`, allowing the dashboard mode to resolve from the user's access context.
- Validation evidence now includes capability/navigation/fallback unit coverage plus R0 smoke coverage for SysAdmin dashboard platform mode and non-SysAdmin `/hiring-companies` fallback.
