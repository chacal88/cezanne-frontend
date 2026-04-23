# V5 SysAdmin Platform Visual Contract

## Purpose

This document is the V5 visual-readiness package from `pre-figma-flow-review.md`. It prepares SysAdmin/platform routes for Figma/screen-flow work without using Figma as a source of product behavior.

Project-wide pixel-parity rule: wherever a legacy screen/state exists, the final Figma and implementation replacement must match the legacy frontend at the matched viewport and data/state. `Figma-ready` is not replacement approval; unapproved visual differences are blockers until fixed or recorded as an explicit product exception.

V5 covers:
- platform users list/detail/create/edit;
- platform favorite-request queue and request detail;
- platform master data for hiring companies, recruitment agencies, and subscriptions;
- company subscription administration;
- platform taxonomy for sectors and subsectors.

## Readiness status

| Family | Contract status | Visual status | Figma-ready? | Notes |
|---|---|---|---|---|
| Platform users | Contract-reviewed | State-hook screenshots captured | Yes, desktop current-app screen-flow base | List filters, create, detail, edit, stale/not-found/permission-denied/saving/success/cancelled/error states are captured; backend-backed fields remain deferred. |
| Platform favorite requests | Contract-reviewed | State-hook screenshots captured | Yes, desktop current-app screen-flow base | Queue/detail pending/resolved/rejected/stale/inaccessible/empty/error/action-failure plus approve/reject/reopen readiness and retry labels are captured; action payloads remain deferred. |
| Platform master data | Contract-reviewed | State-hook screenshots captured | Yes, desktop current-app screen-flow base | Company/agency/subscription list/detail/edit non-ready states are captured; entity field layouts and backend schemas remain deferred. |
| Company subscription admin | Contract-reviewed | State-hook screenshots captured | Yes, desktop current-app screen-flow base | Loading plus route-vs-mutation capability labels and mutation blocked/success/error/stale/not-found states are captured; mutation payloads remain deferred. |
| Platform taxonomy | Contract-reviewed | State-hook screenshots captured | Yes, desktop current-app screen-flow base | Sector/subsector list/detail mutation/not-found/stale/denied/error states are captured; taxonomy schemas remain deferred. |

## Evidence sources

| Evidence | Source | How it may be used | Limit |
|---|---|---|---|
| Route and state contracts | `pre-figma-flow-review.md`, `screens.md`, `modules.md`, `capabilities.md` | Canonical product behavior for SysAdmin routes | Must not be overridden by screenshots. |
| OpenSpec specs | `sysadmin-platform-foundation`, `platform-users-routes`, `platform-favorite-request-queue`, `platform-master-data-routes`, `platform-company-subscription-admin`, `platform-taxonomy-routes` | Required state/action/error/parent-return coverage | Specs do not define final layout. |
| Current greenfield source | `src/domains/sysadmin/users-and-requests/**`, `src/domains/sysadmin/master-data/**`, `src/domains/sysadmin/taxonomy/**` | Runtime state and current UI behavior | Fixture-backed/platform adapter-backed data remains a seam. |
| First-pass current evidence | `visual-evidence-v5-sysadmin-platform.md`, `visual-evidence-assets/v5/v5-capture-manifest.json` | Baseline route-shell, platform navigation, parent-target, and boundary evidence | Establishes the route-shell baseline but not backend schema or replacement approval. |
| State-hook screenshots | `visual-evidence-assets/v5/state-hooks-2026-04-23/v5-state-hooks-manifest.json` | Desktop current-app state-depth evidence for V5 Figma drafting | Does not define backend schemas, responsive/mobile scope, or replacement pixel parity. |
| Shell/access contracts | `authenticated-shell-navigation-completion`, route metadata, access-control capability evaluation | Platform navigation and capability boundaries | Do not grant org-scoped permissions from platform visuals. |

## Platform users frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Users list ready | `/users` with page/search/hiringCompanyId/recruitmentAgencyId filters and platform scope | Show filters and return target state without implying org team ownership. | Final user columns, tenant assignment fields, and role schema unknown. |
| Loading/empty/error/denied | List state variants | Denied falls back safely; empty and error must be visually distinct. | Error taxonomy unknown. |
| Create user | `/users/new`, optional return/search context | Platform user creation only; not org invite flow. | Create payload and validation schema unknown. |
| User detail | `/users/:id`, ready/loading/not-found/permission-denied/stale | Preserve parent/returnTo to users list. | Detail schema unknown. |
| User edit | `/users/edit/:id`, editing/saving/success/cancelled/error/permission-denied | Parent/success/cancel targets must be explicit. | Update payload, role/tenant assignment schema unknown. |

## Platform favorite-request frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Queue pending | `/favorites-request` platform queue with pending requests | Separate from org `/favorites/request*`. | Queue item schema unknown. |
| Queue empty/error/inaccessible/stale/action-failure | Queue state variants | Stale/error/action-failure expose retry; inaccessible and empty must remain distinct non-retry states. | Error taxonomy unknown. |
| Detail pending | `/favorites-request/:id`, approve/reject readiness | Show action readiness and parent `/favorites-request`. | Detail schema/action payload unknown. |
| Resolved/rejected | Reopen readiness; approve/reject blocked | Make terminal vs reopenable state explicit. | Reopen payload unknown. |
| Action failure/retry | Approve/reject/reopen failed | Retry without losing context; approve/reject/reopen remain visible as the failed action context until backend outcome refresh resolves. | Action error schema unknown. |

## Platform master-data frame set

| Entity | Routes | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|---|
| Hiring companies | `/hiring-companies`, `/hiring-companies/:id`, `/hiring-companies/edit/:id` | list loading/ready/empty/error/denied; detail loading/ready/not-found/stale/denied; edit editing/saving/success/cancelled/error/denied | Platform master-data, not org company settings. | Company list/detail/update schema unknown. |
| Recruitment agencies | `/recruitment-agencies`, `/recruitment-agencies/:id`, `/recruitment-agencies/edit/:id` | list/detail/edit variants matching master-data contract | Platform master-data, not RA account settings. | Agency list/detail/update schema unknown. |
| Subscriptions | `/subscriptions`, `/subscriptions/:id` | list loading/ready/empty/error/denied; detail loading/ready/not-found/stale/denied | Platform subscription admin, separate from org `/billing`. | Subscription schema unknown. |

## Company subscription admin frame set

| Frame/state | Required behavior | Visual notes | Backend/API unknowns |
|---|---|---|---|
| Ready | `/hiring-company/:id/subscription` with company context and subscription controls | Route access requires `canManageHiringCompanies`; mutation requires `canManagePlatformSubscriptions`. | Subscription mutation payload unknown. |
| Loading/not-found/denied/stale | Company subscription context unavailable or stale | Loading blocks mutation while context resolves; denied is route capability failure for `canManageHiringCompanies`; stale/not-found block mutation because company context is not fresh. | Stale/not-found reason details unknown. |
| Mutation blocked | Missing platform subscription mutation capability with route access still allowed | Show blocked reason without implying route denial. | None. |
| Mutation success/error | Subscription mutation outcome and refresh targets | Refresh company detail, company subscription, and subscriptions list as documented. | Error schema unknown. |

## Platform taxonomy frame set

| Surface | Route | Required states | Visual rule | Backend/API unknowns |
|---|---|---|---|---|
| Sector list | `/sectors` | ready, loading, empty, error, denied, mutation-success, mutation-error | Taxonomy route family, not settings subsection/master-data route. | Sector list schema unknown. |
| Sector detail | `/sectors/:id` | ready, loading, not-found, stale, denied, mutation-success, mutation-error | Parent `/sectors` must be explicit. | Sector detail/update schema unknown. |
| Subsector list | `/sectors/:sector_id/subsectors` | sector-scoped list, loading, empty, error, denied, stale, mutation states | Parent sector detail must be explicit. | Subsector list schema unknown. |
| Subsector detail | `/subsectors/:id` | ready, loading, not-found, stale, denied, error, mutation states | Parent is sector subsectors when sector context exists, otherwise `/sectors`. | Subsector detail/update schema unknown. |

## Platform boundary rules

- Platform users are not org team members/invite management; `/users/new` and `/users/edit/:id` must not look like `/team` or `/users/invite` flows.
- Platform favorite request queues are not org favorite request workflows; `/favorites-request*` must stay separate from `/favorites/request*`.
- Platform subscriptions are not org commercial billing; `/subscriptions*` and `/hiring-company/:id/subscription` must stay separate from `/billing*`.
- Platform company/agency master data is not org account/company/agency settings.
- Platform taxonomy is not a settings subsection and not generic master-data.
- Legacy `/recruiters` is not SysAdmin and must not be mapped to `/users`.
- Do not expose raw tenant payloads, user PII beyond contract-approved display fields, subscription/payment provider raw payloads, or platform diagnostic data.

## Responsive assumptions

| Viewport | Requirement |
|---|---|
| Desktop primary | SysAdmin/platform routes are desktop-first authenticated shell admin screens. |
| Narrow desktop/tablet | Preserve filters, list/detail/edit parent returns, mutation action bars, and blocked-state explanations. |
| Mobile | Required only for legacy-backed mobile states that product includes in replacement scope; otherwise document the omission explicitly. |

## Non-goals

- Do not design final backend schemas for platform users, user roles, tenant assignments, favorite request queue items, company/agency records, subscription records, or taxonomy entities.
- Do not implement code from this visual contract.
- Do not merge platform admin surfaces with org-scoped settings, billing, team, favorites, or marketplace flows.
- Do not create standalone screens for legacy documentation residue.

## Required outputs before marking V5 rows `Figma-ready`

1. Done: platform users visual map for list filters, create lifecycle, detail, edit, returnTo, stale/not-found/permission-denied, saving, success, cancelled, and error states.
2. Done: platform favorite-request queue visual map for pending/resolved/rejected/stale/inaccessible/empty/error/action-failure and approve/reject/reopen readiness plus retry behavior.
3. Done: master-data visual map for hiring companies, recruitment agencies, and subscriptions list/detail/edit states.
4. Done: company subscription admin visual map for route-vs-mutation capability, blocked, success/error, and refresh targets.
5. Done: taxonomy visual map for sectors/subsectors list/detail/mutation/not-found/stale/denied states.
6. Done: `pre-figma-flow-review.md` rows are promoted from `Contract-reviewed` to `Figma-ready` only for covered desktop current-app state evidence; replacement approval remains blocked until legacy pixel parity is confirmed where legacy exists.

## First-pass evidence closeout

`visual-evidence-v5-sysadmin-platform.md` completes the current runtime evidence pass for all V5 route families exposed today. It captures platform landing, users, favorite-request queue, master-data, company subscription, taxonomy, and non-SysAdmin fallback shells.

The runtime state-depth update adds explicit fixture/test-hook exposure for the non-ready, mutation, terminal, stale, not-found, permission-denied, action-failure, and retry state variants through `fixtureState` query parameters. The 2026-04-23 state-hook capture records those hooks as visual evidence and moves the covered V5 route rows to desktop current-app `Figma-ready`. Backend/API schemas, responsive/mobile scope, and replacement pixel parity remain deferred unless confirmed.
