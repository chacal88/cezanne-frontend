# R4 Master Plan

## Purpose

This document consolidates the `R4 — Operations depth` planning baseline into one execution-oriented package.

It exists to:
- turn the six independent `R4` planning threads into one prioritized sequence
- freeze which areas are foundational versus follow-on
- record the first OpenSpec changes that should be opened before broader `R4` execution starts
- record the R4 closeout baseline and the product depth intentionally deferred beyond R4

## Confirmed baseline

Confirmed from `roadmap.md`, `modules.md`, `screens.md`, `capabilities.md`, and the `frontend-2` evidence base:
- `R4` covers operational settings, candidate database, integrations setup, reports, team/users/favorites, billing, and marketplace
- `R4` must not launch as one monolithic admin wave
- settings/config stability is an explicit prerequisite for team/users/favorites/marketplace
- provider integrations, reports, and candidate database each require their own route/capability contracts instead of inheriting generic admin behavior

## Consolidated sequencing

| Priority | Area | Closeout status | First change |
|---|---|---|---|
| `1` | `R4.1` operational settings foundation | implemented and archived with follow-on hiring-flow, custom-fields, templates, and reject-reasons slices | `r4-operational-settings-substrate` |
| `2` | `R4.2` candidate database | foundation implemented and archived; advanced search, bulk actions, and database-specific sequencing are deferred | `r4-candidate-database-contract-foundation` |
| `3` | `R4.4` integrations setup | shell implemented and archived; provider-specific setup, auth, diagnostics, job-board, and HRIS workflows are deferred | `r4-integrations-shell` |
| `4` | `R4.5` reports | foundation implemented and archived; real report families and scheduling CRUD depth are deferred | `r4-reports-foundation` |
| `5` | `R4.3` team/users/favorites | org team, invite/membership, favorites, and org favorite-request slices implemented and archived; platform `/users*` and `/favorites-request*` stay in R5 | `r4-team-users-foundation` |
| `6` | `R4.6` billing + marketplace | billing/card/upgrade/SMS and RA marketplace foundations implemented and archived; persistence/API/payment/bidding/CV handoff depth is deferred | `r4-billing-foundation` |

## Dependency map

### `R4.1` operational settings foundation

Scope:
- settings subsection registry
- `/parameters/:settings_id?/:section?/:subsection?` compatibility contract
- save/retry/readiness/telemetry conventions for operational settings
- one shared substrate consumed by dedicated `hiring-flow`, `custom-fields`, `templates`, and `reject-reasons` routes

Unlocks:
- hiring flow settings
- custom fields settings
- templates
- reject reasons
- cleaner admin discoverability for later `R4.3`, `R4.4`, and `R4.6`

### `R4.2` candidate database

Scope:
- canonical candidate database route family
- preserved URL state
- database-origin entry into candidate detail

Unlocks:
- database implementation without contaminating the existing R2 candidate hub contract

### `R4.4` integrations setup

Scope:
- `/integrations`
- `/integrations/:id`
- provider family state model (`connected`, `disconnected`, `degraded`, `reauth_required`, `unavailable`)

Unlocks:
- job-board setup
- HRIS/workflow setup
- provider auth/diagnostics slices

### `R4.5` reports

Scope:
- report index/family shell
- shared filter/result state contract
- export/scheduling command model

Unlocks:
- first report family delivery
- export UX
- scheduling UX

### `R4.3` team/users/favorites

Scope:
- org-admin team/users boundary
- invite/membership surface
- favorites ownership and request flow split

Blocked by:
- stable operational settings/admin boundary from `R4.1`

### `R4.6` billing + marketplace

Scope:
- billing state model
- marketplace as bounded RA domain

Blocked by:
- clearer admin/access boundaries and commercial capability modeling

## Area-by-area planning summary

### `R4.1` operational settings foundation

Planning rule:
- treat this as one package with follow-on settings slices, not as the full settings implementation itself
- dedicated subsection routes keep route ownership, while the substrate owns compatibility parsing, subsection fallback, and shared admin workflow states

Follow-on slices after the foundation:
- `r4-hiring-flow-settings`
- `r4-custom-fields-settings`
- `r4-templates-foundation`
- `r4-reject-reasons-management`

### `R4.2` candidate database

Planning rule:
- keep candidate database inside the `candidates` domain
- do not reuse the R2 job-pipeline route contract as the database-origin detail contract

R4 closeout:
- canonical route, URL-state preservation, database-origin detail handoff, and explicit sequence degradation are implemented
- advanced search, bulk actions, database-specific sequence navigation, and API-backed list/product depth are intentionally deferred beyond R4

### `R4.3` team/users/favorites

Planning rule:
- plan under one umbrella, but implement as separate changes

Implemented slices:
- team users foundation
- invite and membership management
- favorites management
- org favorite requests

R5 boundary:
- route-heavy platform `/users*` CRUD and platform `/favorites-request*` queues remain R5 SysAdmin scope

### `R4.4` integrations setup

Planning rule:
- shell commonality is allowed
- provider-family contracts must remain distinct

R4 closeout:
- provider contract and state model are implemented in the shell
- job-board setup, HRIS workflow setup, provider auth, and diagnostics execution are intentionally deferred beyond R4

### `R4.5` reports

Planning rule:
- start with a foundation, not with a special-case report family

R4 closeout:
- shared report shell, filter/result states, export command state, and scheduling command state are implemented
- first real report family, exports backed by generation/download, scheduling CRUD, and remaining report families are intentionally deferred beyond R4

### `R4.6` billing + marketplace

Planning rule:
- keep both in `R4` at roadmap level
- keep them separate in execution

Implemented slices:
- billing foundation
- payment method and card states
- subscription upgrade and plan change
- sms add-on
- marketplace-ra

Deferred beyond R4:
- billing persistence, payment APIs, real subscription mutation side effects, marketplace API integration, bidding, and CV handoff

## OpenSpec queue and closeout status

Initial foundation queue opened from this master plan:

1. `r4-operational-settings-substrate`
2. `r4-candidate-database-contract-foundation`
3. `r4-integrations-shell`
4. `r4-reports-foundation`

Additional R4 slices now implemented and archived:

5. `r4-hiring-flow-settings`
6. `r4-custom-fields-settings`
7. `r4-templates-foundation`
8. `r4-reject-reasons-management`
9. `r4-team-users-foundation`
10. `r4-invite-and-membership-management`
11. `r4-favorites-management`
12. `r4-favorite-requests`
13. `r4-billing-foundation`
14. `r4-payment-method-and-card-states`
15. `r4-subscription-upgrade-and-plan-change`
16. `r4-sms-addon`
17. `r4-marketplace-ra`

## Docs that should stay synchronized with this plan

- `roadmap.md`
- `modules.md`
- `screens.md`
- `capabilities.md`
- `navigation-and-return-behavior.md`
- `r4-*-open-points.md`

## Planning rule

No additional `R4` execution package should open until:
- its route family is frozen in `screens.md`
- its ownership is explicit in `domains.md` or a dedicated open-points doc
- its capability contract is explicit in `capabilities.md`
- its return/refresh behavior is explicit when the area introduces stateful pages, overlays, or task flows

## R4 closeout and R5 synchronization checkpoint

R4 is closed as an operations-depth foundation release, not as full product parity for every area. The closeout boundary is:
- implemented: operational settings substrate and four settings slices, candidate database route/detail foundation, integrations shell, reports shell, org team/invite/favorites/request foundations, HC-admin billing/card/upgrade/SMS foundations, and RA marketplace foundation;
- intentionally not implemented: candidate database advanced search/bulk actions/database-specific sequence behavior, provider-specific integrations setup/auth/diagnostics/job-board/HRIS workflows, actual report-family data products and scheduling CRUD depth, billing persistence/payment/API integration, and marketplace API/bidding/CV handoff;
- handed to R5: platform SysAdmin foundations, platform `/users*` CRUD, platform `/favorites-request*` queues, platform subscriptions/master data, requisition authoring completion, settings leftovers, and public/token leftovers;
- not handed to R5 by default: candidate-database product depth, provider setup depth, report-family depth, HC billing payment integration, and RA marketplace workflow depth. Provider setup depth is now planned through `provider-specific-integrations-depth`; the other depths still require dedicated future changes if prioritized.

## R4.1 operational settings implementation checkpoint

The operational settings implementation freezes the shared settings baseline:
- `/parameters/:settings_id?/:section?/:subsection?` is compatibility-only and resolves to route-owned settings slices instead of becoming a monolithic page.
- `/settings/hiring-flow`, `/settings/custom-fields`, `/templates*`, and `/reject-reasons` consume shared readiness/save/retry/stable-outcome semantics while keeping route-specific gates.
- R5 inherits only remaining parameters inventory/completion and requisition workflow administration; it should not reopen the R4 settings substrate decisions.

## R4.2 candidate database foundation implementation checkpoint

The `r4-candidate-database-contract-foundation` implementation freezes the first candidate database baseline:
- `/candidates-database` is the canonical candidate database route.
- `/candidates-database` is the only registered candidate database entry.
- URL-owned state is limited and explicit: `query`, `page`, `sort`, `order`, `stage`, and comma-separated `tags`; invalid values degrade to stable defaults.
- Candidate detail opened from candidate database uses `entry=database` and a sanitized `returnTo` pointing back to `/candidates-database`.
- Candidate task routes preserve the database-origin detail URL through the explicit `parent` parameter.

## R4.4 integrations shell implementation checkpoint

The `r4-integrations-shell` implementation freezes the integrations admin foundation:
- `/integrations` is the internal integrations admin index.
- `/integrations/:id` is the internal provider detail route and uses `/integrations` as its parent-index fallback.
- Internal admin setup remains separate from public/token `/integration/*` callback routes.
- Provider state is explicit: `connected`, `disconnected`, `degraded`, `reauth_required`, and `unavailable`.
- Provider actions are categorized by concern: `configuration`, `auth`, and `diagnostics`; later provider-family slices must consume this shell/state model instead of redefining status handling.

## R4.5 reports foundation implementation checkpoint

The `r4-reports-foundation` implementation freezes the shared report baseline:
- `/report` is the canonical report index shell.
- `/report/:family` is the canonical report family route contract for jobs, hiring-process, teams, candidates, diversity, and source.
- `/hiring-company/report/:id?` remains explicit compatibility behavior and maps into the new report shell instead of becoming the canonical surface.
- Shared filters are `period`, `owner`, and `team`; invalid/missing state degrades to stable defaults.
- Shared result states include loading, empty, denied, error, and data-ready.
- Export and scheduling use one family-aware command contract with visible availability/success/failure states.

## R4.3 org team/users foundation implementation checkpoint

The `r4-team-users-foundation` implementation freezes the first org-scoped team/users baseline:
- `/team` is the org team foundation index.
- `/team/recruiters` is the org-scoped recruiter visibility foundation.
- `/users/invite` is an org invite foundation placeholder for follow-on invite/membership work.
- These routes require org-admin context and fall back to `/dashboard`; they do not grant Platform navigation or platform user-management capabilities.
- Route-heavy `/users*` CRUD and platform favorite-request queues remain outside this R4 foundation and stay reserved for later platform/R5 or dedicated follow-on slices.


## R4.1 follow-on settings implementation checkpoint

The R4 operational settings follow-on slices are archived:
- `r4-hiring-flow-settings` freezes `/settings/hiring-flow` as workflow configuration and keeps full requisition authoring/workflow completion in R5.
- `r4-custom-fields-settings` freezes `/settings/custom-fields` with beta-gated admin access and downstream candidate/public consumers out of scope.
- `r4-templates-foundation` freezes the `/templates*` family and subtype-specific gates without implementing every template subtype in full product depth.
- `r4-reject-reasons-management` freezes `/reject-reasons` as a dedicated settings route while job/candidate reject task flows remain downstream consumers.

## R4.3 team/favorites closeout checkpoint

The R4 team/favorites implementation closes org-scoped ownership:
- `/team`, `/team/recruiters`, and `/users/invite` are org-scoped recruiter-core routes with recruiter-core `/dashboard` fallback.
- invite send/resend/revoke and membership role/status readiness are org team behavior and do not require platform user-management capability.
- `/favorites` and `/favorites/:id` are org-scoped favorites routes with personal, org-shared, and recruiter-linked states.
- `/favorites/request` and `/favorites/request/:id` are org-scoped task flows.
- Platform `/users*` CRUD and platform `/favorites-request*` queues are R5 SysAdmin concerns and must stay separate from the R4 org routes.

## R4.6 billing and marketplace closeout checkpoint

The R4 billing/marketplace implementation closes frontend foundation behavior only:
- `/billing`, `/billing/upgrade`, `/billing/sms`, `/billing/card/:id`, and `/billing/card/new` are HC-admin billing routes and do not grant platform subscription administration.
- card, upgrade, and SMS add-on states are deterministic frontend readiness/action models without payment-processor persistence.
- `/jobmarket/:type` is an RA-owned marketplace route for `fill`, `bidding`, `cvs`, and `assigned` states.
- Real billing persistence/API/payment integration and marketplace API/bidding/CV handoff remain intentionally outside R4 and outside the default R5 SysAdmin scope.

## Post-R5 provider-specific integrations package

The first post-R5 follow-on package is `provider-specific-integrations-depth`. It consumes the R4 integrations shell and adds authenticated provider-family setup depth for `calendar`, `job-board`, and `hris` providers only. Public/token `/integration/*` callback routes remain R3 token-entry behavior and are not part of this package.
