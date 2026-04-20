# R5 SysAdmin Open Points

## Purpose

This document records the decisions that must be resolved before opening `R5` SysAdmin implementation changes.

It covers:
- SysAdmin foundation behavior
- platform master-data route ownership
- platform user-management boundaries
- favorite-request queue ownership
- taxonomy route boundaries

## Source baseline

Built on top of:
- `r5-decision-register.md`
- `r5-master-plan.md`
- `roadmap.md`
- `domains.md`
- `modules.md`
- `screens.md`
- `access-model.md`
- `capabilities.md`
- `r4-team-and-favorites-open-points.md`

## Confirmed baseline

Confirmed:
- SysAdmin remains inside `recruit-frontend`.
- `sysadmin` is the domain for platform master data and global administration.
- R5 SysAdmin should not be implemented as one large route package.
- SysAdmin work should start with a foundation slice.
- platform route access must be capability-driven, not component-level role checks.

Confirmed SysAdmin modules from `modules.md`:
- `companies`
- `agencies`
- `subscriptions`
- `taxonomy`
- `users`
- `favorite-requests`

Confirmed R5 SysAdmin route families from `screens.md`:
- `/hiring-companies`
- `/hiring-companies/:id`
- `/hiring-companies/edit/:id`
- `/hiring-company/:id/subscription`
- `/recruitment-agencies`
- `/recruitment-agencies/:id`
- `/recruitment-agencies/edit/:id`
- `/subscriptions`
- `/subscriptions/:id`
- `/sectors`
- `/sectors/:id`
- `/sectors/:sector_id/subsectors`
- `/subsectors/:id`
- `/users?page&search&hiringCompanyId&recruitmentAgencyId`
- `/users/edit/:id`
- `/users/new`
- `/users/:id`
- `/favorites-request`
- `/favorites-request/:id`

## Open decisions

### S1 — SysAdmin landing and fallback

**Status:** Accepted for `r5-sysadmin-foundation`

**Decision:** Use `/dashboard` as the canonical authenticated landing URL, with a SysAdmin platform mode inside the existing shell. Do not add a separate platform app or a new platform-dashboard route in the foundation slice.

Accepted behavior:
- SysAdmin post-auth landing resolves to `/dashboard`.
- `/dashboard` renders platform-oriented landing content when the access context is SysAdmin and no HC/RA operational context is active.
- denied platform-only routes redirect to `/dashboard` when the user is authenticated and can enter the shell.
- authenticated HC/RA users who attempt platform-only routes fall back to their normal dashboard state, not to a platform route.
- unauthenticated users follow the existing public/auth entry behavior.
- partial SysAdmin capability sets render only the available platform entry groups and an explicit unavailable/denied state for unavailable groups.

Implementation note:
- `platform dashboard fallback` in capability docs maps to `/dashboard` with SysAdmin platform-mode content for R5.
- frontend-2 evidence says legacy SysAdmin login may bypass the recruiter-core dashboard and redirect to platform management; this R5 baseline is an intentional greenfield consolidation, not a claim of legacy route parity.
- a future dedicated platform route would require a separate architecture decision and route inventory update.

### S2 — SysAdmin navigation grouping

**Status:** Accepted for `r5-sysadmin-foundation`

**Decision:** Add a dedicated `Platform` navigation group for SysAdmin-visible routes inside the existing authenticated shell. Keep it separate from recruiter-core, settings, reports, billing, and public/token surfaces.

Accepted grouping:
- `Platform / Master data`: hiring companies, recruitment agencies, and subscriptions.
- `Platform / Users and requests`: platform user management and platform favorite-request queue.
- `Platform / Taxonomy`: sectors and subsectors.

Accepted visibility rules:
- show the `Platform` group only when `canViewPlatformNavigation` is true.
- show each child group only when its dedicated platform-nav capability is true.
- require `sysAdmin` for the Platform group; org-admin user-management and org favorite capabilities must not grant Platform navigation.
- do not show org-scoped user management or org favorites in the platform navigation group.
- foundation may register navigation metadata before all route-heavy pages exist, but unavailable entries must not link to unimplemented routes.

First route-heavy navigation release:
- expose `Platform / Master data` first after `r5-sysadmin-foundation`, because companies/agencies/subscriptions are the least ambiguous platform-only surfaces.

### S3 — Platform master-data route behavior

**Status:** Open

**Decision needed:** Freeze the common route behavior for companies, agencies, and subscriptions.

Must define:
- list loading, empty, error, and denied states.
- detail loading, not-found, stale, and denied states.
- edit success/cancel/error behavior.
- return behavior from edit to detail or list.
- refresh behavior after subscription updates.

Recommendation:
- plan companies, agencies, and subscriptions as the first route-heavy SysAdmin implementation after foundation.

### S4 — `/hiring-company/:id/subscription` ownership

**Status:** Open

**Decision needed:** Define whether company subscription administration is owned by `sysadmin.companies` or `sysadmin.subscriptions`.

Current evidence:
- `screens.md` places the route in `sysadmin` and module `companies`.
- the route requires both `canManageHiringCompanies` and `canManagePlatformSubscriptions`.

Recommendation:
- keep the route under `sysadmin.companies` route ownership, while delegating subscription-specific models/actions to shared subscription support or `sysadmin.subscriptions` adapters.

Must define:
- which capability controls route entry.
- which capability controls subscription mutation actions.
- where post-save refresh invalidates company and subscription data.

### S5 — Platform users versus org users

**Status:** Accepted boundary; route-heavy details remain open

**Decision:** Split platform user management from org-admin user management.

Current evidence:
- `/users` includes HC Admin, RA Admin, and SysAdmin personas in `screens.md`.
- `capabilities.md` allows `canManagePlatformUsers` through `sysAdmin` or org-admin user-management context.
- R4 team/invite/membership closeout keeps `/team`, `/team/recruiters`, and `/users/invite` org-scoped and explicitly separate from platform user CRUD.

Accepted boundary:
- platform-scoped user administration belongs to `sysadmin.users` for R5.
- org invite/membership behavior stays in the R4 team/users boundary unless explicitly promoted by a future change.
- `canManagePlatformUsers` must not be granted by R4 org invite, membership, or recruiter visibility behavior.

Still must define for the platform users slice:
- which `/users` URLs are platform-owned in R5.
- whether org-admin `/users` access remains a compatibility path or moves to a separate future route family.
- distinct fallback behavior for org-admin and SysAdmin denial.
- search/filter semantics for `hiringCompanyId` and `recruitmentAgencyId`.

### S6 — User create/edit/view route contract

**Status:** Open

**Decision needed:** Define the route contract for user creation, editing, viewing, and list return behavior.

Must define:
- whether `/users/new` creates only platform-managed users or also org-scoped users.
- whether `/users/edit/:id` can edit users across organization boundaries.
- whether `/users/:id` is a read-only view or a management hub.
- how list filters are preserved when returning from detail/edit.
- not-found and permission-denied states for cross-tenant user access.

### S7 — Favorite-request queue versus org favorites

**Status:** Accepted boundary; queue details remain open

**Decision:** Split platform favorite-request queue behavior from org/user favorite behavior.

Current evidence:
- `/favorites*` routes are R4 and entitlement-heavy.
- `/favorites/request*` task flows are R4 org-scoped favorite request behavior.
- `/favorites-request*` routes are R5 SysAdmin platform queue routes.
- R4 favorites/request closeout freezes personal, org-shared, recruiter-linked, and org request task-flow states outside the platform queue.

Accepted boundary:
- `/favorites-request` and `/favorites-request/:id` are platform-admin request queue routes.
- org-scoped `/favorites*` and `/favorites/request*` behavior stays outside R5 SysAdmin unless explicitly re-sliced.

Still must define for the platform queue slice:
- whether platform queue can act on org/user favorite requests.
- route states for pending, resolved, rejected, stale, or inaccessible requests.
- action success/failure behavior.
- relationship to org favorite request task flows.

### S8 — Taxonomy route behavior

**Status:** Open

**Decision needed:** Freeze route behavior for sectors and subsectors.

Must define:
- whether sector/subsector routes are read-only, editable, or both.
- parent/child navigation behavior between sector and subsector pages.
- not-found behavior for nested subsector route access.
- mutation refresh behavior for sector and subsector lists.

Recommendation:
- plan taxonomy after platform master data unless it becomes a prerequisite for company/agency editing.

### S9 — SysAdmin telemetry and evidence requirements

**Status:** Accepted for `r5-sysadmin-foundation`

**Decision:** The SysAdmin foundation must define platform telemetry and minimum validation evidence before route-heavy platform pages are implemented.

Accepted telemetry requirements:
- capture platform route-entry attempts by route id, route family, and outcome.
- capture platform denied-route outcomes without logging tenant-sensitive identifiers.
- capture platform navigation exposure by group, not by raw session payload.
- capture fallback from denied platform route to `/dashboard`.
- reserve mutation success/failure telemetry names for platform master-data slices, even if mutation implementation lands later.

Accepted validation evidence:
- route metadata coverage for new platform route ids and platform fallback behavior.
- capability unit/module-contract proof for platform nav visibility and denied route outcomes.
- smoke proof for SysAdmin dashboard/platform-mode entry.
- smoke proof for an authenticated non-SysAdmin user attempting `/hiring-companies` and landing on the stable dashboard fallback once the foundation placeholder exists.
- documentation update proof in `r5-sysadmin-open-points.md`, `r5-master-plan.md`, `screens.md`, `capabilities.md`, `navigation-and-return-behavior.md`, `observability.md`, and `telemetry-events.md` when runtime behavior changes.

Notification decision:
- SysAdmin notification workflows are not introduced by `r5-sysadmin-foundation`.
- Existing shell notification behavior must not regress for HC/RA users.
- Any future platform notification destinations require a separate typed-destination decision.

## Proposed OpenSpec split

### `r5-sysadmin-foundation`

Goal:
- freeze platform landing, navigation, fallback, route metadata, and telemetry conventions.

Should resolve:
- S1
- S2
- S9

### `r5-platform-master-data`

Goal:
- implement companies, agencies, and subscriptions route contracts.

Should resolve:
- S3
- S4

### `r5-platform-users-and-favorite-requests`

Goal:
- freeze and implement platform user-management and favorite-request queue boundaries.

Should resolve:
- S5
- S6
- S7

### `r5-platform-taxonomy`

Goal:
- implement sectors and subsectors as platform taxonomy routes.

Should resolve:
- S8

## Blocking items before SysAdmin implementation

Before opening `r5-sysadmin-foundation`:
- S1 is accepted for the foundation slice.
- S2 is accepted for the foundation slice.
- S9 is accepted for the foundation slice.
- the OpenSpec package must turn S1, S2, and S9 into executable acceptance criteria.

Before opening `r5-platform-master-data`:
- `r5-sysadmin-foundation` must freeze landing, fallback, navigation, and route metadata.
- S3 and S4 must be resolved.

Before opening `r5-platform-users-and-favorite-requests`:
- S5, S6, and S7 must be resolved.

Before opening `r5-platform-taxonomy`:
- S8 must be resolved.

## Foundation implementation record

`r5-sysadmin-foundation` closes the foundation decisions without adding route-heavy SysAdmin CRUD pages:
- SysAdmin platform entry renders inside `/dashboard` when `isSysAdmin=true` and `organizationType=none`.
- HC/RA dashboard behavior remains the recruiter-core dashboard.
- Platform navigation is visible only through dedicated platform-nav capabilities; org-scoped admin/user-management/favorites capabilities do not grant the Platform group.
- The foundation registers `/hiring-companies` as a typed unavailable placeholder for SysAdmin direct entry and as the denied-route fallback proof for authenticated non-SysAdmin users.
- Telemetry event definitions cover platform route entry, denied fallback, and navigation exposure without tenant or organization identifiers.
- SysAdmin notification workflows remain out of scope and unchanged.
