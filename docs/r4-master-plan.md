# R4 Master Plan

## Purpose

This document consolidates the `R4 — Operations depth` planning baseline into one execution-oriented package.

It exists to:
- turn the six independent `R4` planning threads into one prioritized sequence
- freeze which areas are foundational versus follow-on
- record the first OpenSpec changes that should be opened before broader `R4` execution starts

## Confirmed baseline

Confirmed from `roadmap.md`, `modules.md`, `screens.md`, `capabilities.md`, and the `frontend-2` evidence base:
- `R4` covers operational settings, candidate database, integrations setup, reports, team/users/favorites, billing, and marketplace
- `R4` must not launch as one monolithic admin wave
- settings/config stability is an explicit prerequisite for team/users/favorites/marketplace
- provider integrations, reports, and candidate database each require their own route/capability contracts instead of inheriting generic admin behavior

## Consolidated sequencing

| Priority | Area | Why it goes now | First change |
|---|---|---|---|
| `1` | `R4.1` operational settings foundation | establishes subsection routing, `/parameters` compatibility, and admin save/retry/readiness contract used by later areas | `r4-operational-settings-substrate` |
| `2` | `R4.2` candidate database | freezes URL state, canonical route family, and database → detail handoff before any implementation divergence | `r4-candidate-database-contract-foundation` |
| `3` | `R4.4` integrations setup | needs an admin shell and provider-family state model before provider-specific setup slices | `r4-integrations-shell` |
| `4` | `R4.5` reports | needs a shared report shell/export/scheduling contract before family pages branch | `r4-reports-foundation` |
| `5` | `R4.3` team/users/favorites | still has unresolved ownership between org-admin, recruiter visibility, and platform sysadmin | later after `R4.1` stabilizes |
| `6` | `R4.6` billing + marketplace | still needs clearer commercial state modeling and does not block earlier R4 foundations | later after admin/config boundaries stabilize |

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

Likely follow-on slices:
- database list foundation
- search/filter/sort URL state
- database → detail navigation
- database actionability

### `R4.3` team/users/favorites

Planning rule:
- plan under one umbrella, but implement as separate changes

Likely follow-on slices:
- team users foundation
- invite and membership management
- favorites management
- favorite requests

### `R4.4` integrations setup

Planning rule:
- shell commonality is allowed
- provider-family contracts must remain distinct

Likely follow-on slices:
- provider contract and state model
- job-board setup
- HRIS workflow setup
- provider auth and diagnostics

### `R4.5` reports

Planning rule:
- start with a foundation, not with a special-case report family

Likely follow-on slices:
- first report family (`jobs` first, then `hiring-process`)
- exports
- scheduling
- remaining report families

### `R4.6` billing + marketplace

Planning rule:
- keep both in `R4` at roadmap level
- keep them separate in execution

Likely follow-on slices:
- billing foundation
- payment method and card states
- subscription upgrade and plan change
- sms add-on
- marketplace-ra

## First OpenSpec queue

These are the first changes opened from this master plan:

1. `r4-operational-settings-substrate`
2. `r4-candidate-database-contract-foundation`
3. `r4-integrations-shell`
4. `r4-reports-foundation`

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
