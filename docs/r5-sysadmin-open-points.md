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

**Status:** Accepted for `r5-platform-master-data`

**Decision:** Companies, agencies, and subscriptions use one shared platform master-data state vocabulary while keeping entity-specific route ownership and capability gates.

Accepted behavior:
- list states are loading, empty, error, denied, and ready.
- detail states are loading, not-found, stale, denied, and ready.
- edit states are editing, saving, success, cancelled, error, and denied.
- list routes return to `/dashboard`; detail routes return to their owning list; edit routes cancel and succeed back to their owning detail route.
- route-heavy master-data pages are frontend foundation pages until real platform APIs are introduced.

### S4 — `/hiring-company/:id/subscription` ownership

**Status:** Accepted for `r5-platform-master-data`

**Decision:** Keep company subscription administration under `sysadmin.companies` route ownership while delegating subscription mutation readiness to platform subscription capability.

Accepted behavior:
- route entry is controlled by `canManageHiringCompanies`.
- subscription mutation actions are controlled by `canManagePlatformSubscriptions`.
- users with company access but without subscription capability can enter the company-owned subscription page but see mutation actions blocked with an explicit capability reason.
- post-save refresh invalidates company detail, company subscription, and subscriptions list state.
- this route remains separate from R4 HC-admin `/billing*` self-service routes.

### S5 — Platform users versus org users

**Status:** Accepted for `r5-platform-users-and-favorite-requests`

**Decision:** R5 `/users*` route-heavy behavior is platform-owned under `sysadmin.users`. Org invite and membership behavior stays in the R4 team boundary.

Accepted behavior:
- `/users`, `/users/new`, `/users/edit/:id`, and `/users/:id` are platform-owned R5 routes gated by `canManagePlatformUsers`.
- `/users/invite`, `/team`, and `/team/recruiters` remain org-scoped R4 routes and do not grant platform user management.
- `/users` list filters are URL-owned: `page`, `search`, `hiringCompanyId`, and `recruitmentAgencyId`; invalid page values degrade to `1`, and empty string filters are omitted.
- authenticated org users denied from platform `/users*` fall back to `/dashboard`.

### S6 — User create/edit/view route contract

**Status:** Accepted for `r5-platform-users-and-favorite-requests`

**Decision:** Platform user create/edit/view routes are frontend foundation routes for platform-managed users only.

Accepted behavior:
- `/users/new` creates platform-managed users only in this route contract; org invite delivery stays at `/users/invite`.
- `/users/edit/:id` and `/users/:id` are cross-tenant platform administration surfaces gated by `canManagePlatformUsers`.
- detail and edit routes preserve sanitized `/users` return targets from list filters where provided.
- not-found, permission-denied, stale, saving, success, cancel, and error are explicit frontend states; backend persistence is outside this slice.

### S7 — Favorite-request queue versus org favorites

**Status:** Accepted for `r5-platform-users-and-favorite-requests`

**Decision:** `/favorites-request` and `/favorites-request/:id` are platform-admin queue routes, separate from org `/favorites*` and `/favorites/request*` flows.

Accepted behavior:
- queue/detail routes are gated by `canManageFavoriteRequests`.
- queue states are pending, resolved, rejected, stale, inaccessible, empty, and error.
- platform queue actions are approve, reject, and reopen with deterministic readiness/blocked reasons.
- org favorite request task flows remain under `/favorites/request*` and continue to use `canViewOrgFavorites`.

### S8 — Taxonomy route behavior

**Status:** Accepted for `r5-platform-taxonomy`

**Decision:** Sectors and subsectors are platform-owned taxonomy routes under `sysadmin.taxonomy`, gated by `canManageTaxonomy`.

Accepted behavior:
- `/sectors`, `/sectors/:id`, `/sectors/:sector_id/subsectors`, and `/subsectors/:id` are implemented frontend foundation routes.
- taxonomy states include ready, loading, empty, error, denied, not-found, stale, mutation-success, and mutation-error.
- `/sectors/:id` returns to `/sectors`.
- `/sectors/:sector_id/subsectors` returns to `/sectors/:sector_id`.
- `/subsectors/:id` returns to `/sectors` by default until API-backed parent-sector resolution exists.
- taxonomy remains separate from settings subsection routing and platform master-data ownership.

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
- smoke proof for an authenticated non-SysAdmin user attempting a platform route and landing on the stable dashboard fallback.
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
- S3 and S4 are resolved by `r5-platform-master-data`.

Before opening `r5-platform-users-and-favorite-requests`:
- S5, S6, and S7 must be resolved.

Before opening `r5-platform-taxonomy`:
- S8 must be resolved.

## Foundation implementation record

`r5-sysadmin-foundation` closes the foundation decisions without adding route-heavy SysAdmin CRUD pages:
- SysAdmin platform entry renders inside `/dashboard` when `isSysAdmin=true` and `organizationType=none`.
- HC/RA dashboard behavior remains the recruiter-core dashboard.
- Platform navigation is visible only through dedicated platform-nav capabilities; org-scoped admin/user-management/favorites capabilities do not grant the Platform group.
- The foundation originally registered `/hiring-companies` as a typed unavailable placeholder for SysAdmin direct entry and as denied-route fallback proof; `r5-platform-master-data` supersedes that placeholder with implemented master-data routes.
- Telemetry event definitions cover platform route entry, denied fallback, and navigation exposure without tenant or organization identifiers.
- SysAdmin notification workflows remain out of scope and unchanged.
