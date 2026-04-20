# R5 Decision Register

## Purpose

This document records the decisions that must be resolved before `R5` can become an implementation-ready package for `recruit-frontend`.

`R5` is the platform and long-tail release. It closes route families and entry contracts that are intentionally outside the earlier recruiter-core, public/external, and operations-depth slices.

## Source baseline

Built on top of:
- `README.md`
- `roadmap.md`
- `domains.md`
- `modules.md`
- `screens.md`
- `access-model.md`
- `capabilities.md`
- `architecture.md`
- `r4-team-and-favorites-open-points.md`

## Current readiness summary

Workflow note:
- Formal PRD/Tech Spec artifacts are not required for this project-local R5 planning package; `recruit-frontend/docs/r5-*` plus the OpenSpec change are the active planning baseline.

Confirmed:
- `R5` stays inside the existing `recruit-frontend` application.
- `sysadmin` remains a domain in the app, not a separate project.
- Platform administration must remain distinct from recruiter-core shell behavior.
- `/parameters` remains a compatibility entry, not a monolithic settings page.
- Requisition authoring completes the `jobRequisition` branching started in `R1`.

Current executable-package status:
- the first executable OpenSpec package, `r5-sysadmin-foundation`, exists and validates strictly.
- route-heavy R5 packages are not open yet.
- R4 now closes the org/platform split for team/users/favorites: org invite, membership, `/favorites*`, and `/favorites/request*` stay recruiter-core, while platform `/users*` and `/favorites-request*` remain R5 SysAdmin scope.
- several route-heavy details remain open, especially platform user CRUD behavior, platform favorite-request queue actions, settings leftovers, and tokenized integration leftovers.

## Decision statuses

Use these statuses until each decision is promoted into an OpenSpec package:

| Status | Meaning |
|---|---|
| `Proposed` | Recommended direction exists, but it has not been accepted as a planning constraint. |
| `Accepted` | The decision is frozen for `R5` planning. |
| `Blocked` | More evidence or a preceding decision is required. |
| `Deferred` | The decision is intentionally left to a later slice. |

## Decisions

### D1 — Keep `R5` in `recruit-frontend`

**Status:** Accepted

**Decision:** Implement `R5` inside the existing `recruit-frontend` application. Do not split SysAdmin into a separate project for this release.

**Rationale:** The current architecture and documentation already model `sysadmin` as a domain inside the single application. Splitting it now would require a broader architecture decision around auth/session, shared capabilities, destination routing, observability, and cross-app navigation.

**Implications:**
- `R5` uses the existing shell, routing, access-control, telemetry, and testing foundations.
- Platform separation is achieved through domain and shell contracts, not repository or deployment separation.

### D2 — Add a SysAdmin foundation slice before route-heavy work

**Status:** Accepted

**Decision:** Start `R5` with a `sysadmin` foundation slice before implementing companies, agencies, subscriptions, taxonomy, users, or favorite-request queues.

**Rationale:** The R5 gate requires platform ownership to be cleanly separated from recruiter-core shell behavior. Route implementation should not define fallback, navigation, or platform landing behavior ad hoc.

**Accepted foundation baseline:**
- `/dashboard` remains the canonical authenticated landing URL and renders SysAdmin platform-mode content for SysAdmin platform entry.
- platform-only route denial falls back to `/dashboard` for authenticated shell users.
- platform navigation is grouped under a dedicated `Platform` group in the existing shell.
- platform telemetry and validation evidence are required before route-heavy platform slices.

### D3 — Separate platform user management from org user management

**Status:** Accepted

**Decision:** Treat platform user management and org-admin user management as separate contracts, even if some legacy URLs remain shared or compatibility-routed.

**Rationale:** `/users` currently mixes HC Admin, RA Admin, and SysAdmin use cases. R4 resolved the org-scoped side by keeping `/users/invite` and membership readiness in the team boundary while leaving route-heavy platform `/users*` CRUD to R5. A single undifferentiated `/users` implementation would blur capability rules and fallback behavior.

**Implications:**
- platform-scoped user administration belongs to `sysadmin.users`.
- org-scoped invite, membership, and role-change behavior should remain tied to the R4 team/users planning boundary unless explicitly promoted to R5.
- route-level capability evaluation must distinguish `canManagePlatformUsers` from org-scoped user-management decisions.

### D4 — Split favorite ownership from platform favorite-request queues

**Status:** Accepted

**Decision:** Keep org/user favorite behavior separate from the platform-level favorite-request queue.

**Rationale:** The screen inventory distinguishes `/favorites*` from `/favorites-request*`, and R4 now resolves org-scoped favorites plus `/favorites/request*` task flows. R5 should only own the platform queue unless the R5 master plan explicitly moves additional favorite surfaces into the release.

**Implications:**
- `/favorites-request` and `/favorites-request/:id` are platform-admin surfaces.
- `/favorites`, `/favorites/:id`, and `/favorites/request/:id?` stay outside the platform queue contract unless re-sliced.
- capability behavior for `canManageFavoriteRequests` must be route-specific.

### D5 — Implement SysAdmin as multiple slices, not one large change

**Status:** Proposed

**Decision:** Split SysAdmin implementation into at least three slices:
1. SysAdmin foundation.
2. platform master data: companies, agencies, subscriptions.
3. users, taxonomy, and favorite-request queues as follow-up slices.

**Rationale:** The R5 sysadmin scope includes unrelated operational surfaces with different risks. Smaller slices preserve reviewability and reduce the chance of coupling platform master data to user-management ambiguity.

**Recommended first implementation slice after foundation:** companies, agencies, and subscriptions.

### D6 — Keep requisition authoring execution in `jobs.workflow-state`

**Status:** Proposed

**Decision:** Keep `/build-requisition` and `/job-requisitions/:jobWorkflowUuid/:jobStageUuid?` under the `jobs.workflow-state` contract.

**Rationale:** The roadmap says R5 completes the authoring workflow that R1 started with minimum `jobRequisition` branching. This is execution/authoring behavior adjacent to Jobs, not generic settings behavior.

**Implications:**
- the Jobs domain coordinates requisition authoring entry and route state.
- the implementation must not consume or absorb the entire Jobs domain into requisition-specific code.
- dependencies on hiring-flow configuration should remain explicit.

### D7 — Keep `/requisition-workflows` in `settings.hiring-flow`

**Status:** Proposed

**Decision:** Treat `/requisition-workflows` as a settings/hiring-flow administration route, not as a Jobs execution route.

**Rationale:** The route configures requisition workflow behavior and is guarded by hiring-flow settings capabilities. It should remain separate from the route family that authors or executes requisitions.

**Implications:**
- `/requisition-workflows` depends on `canManageHiringFlowSettings`.
- it may share models or adapters with requisition authoring, but it should not own execution state for `/build-requisition`.

### D8 — Inventory remaining `/parameters` subsections before implementation

**Status:** Blocked

**Decision needed:** Create a closed inventory of remaining `/parameters` subsections before opening any R5 implementation change for settings leftovers.

**Rationale:** The roadmap calls out parameters subsection completion, but a generic `/parameters` implementation would violate the documented compatibility-only rule.

**Must define:**
- which subsections still need dedicated routes.
- which subsections remain compatibility-only.
- subsection-specific capabilities, deny behavior, save/retry model, and downstream consumers.

### D9 — Keep `/settings/api-endpoints` in `settings`, not `sysadmin`

**Status:** Proposed

**Decision:** Implement `/settings/api-endpoints` as an HC Admin settings route, not a SysAdmin route.

**Rationale:** The current screen and module docs place API endpoints under `settings.api-endpoints` with HC Admin access. It is part of the R5 release but not part of the `sysadmin` domain.

**Implications:**
- this slice should not depend on SysAdmin shell behavior.
- it should consume the settings substrate and capability model.
- integration-domain dependencies should be explicit if provider or endpoint validation is involved.

### D10 — Reconcile tokenized integration entries before opening an R5 change

**Status:** Blocked

**Decision needed:** Determine whether `Integration tokenized entries (cv/forms/job)` are still R5 scope or have already been covered by the R3 provider callback implementation.

**Rationale:** The roadmap still lists tokenized integration entries under R5, while the current documentation status says provider integration callbacks are represented in source under the integrations token-entry slice. This may be a real leftover or a stale planning note.

**Must define:**
- the exact route family still missing, if any.
- the difference between R3 provider callbacks and R5 tokenized entries.
- whether this belongs to `integrations`, `public-external`, or a shared token-entry support layer.

### D11 — Treat `/job-requisition-forms/:id?download` as a separate public/token contract

**Status:** Proposed

**Decision:** Plan `/job-requisition-forms/:id?download` as a distinct public/token route, not as a minor variant of `/job-requisition-approval?token`.

**Rationale:** The screen inventory assigns it to R5 and describes a forms/download contract. Reusing approval semantics without a route-specific contract could blur token handling, download behavior, terminal states, and access failure handling.

**Must define:**
- token or form-access validation shape.
- view vs download behavior.
- invalid, expired, inaccessible, and unavailable states.
- relationship to requisition approval terminal states.

### D12 — Preserve route-bound capability decisions for R5

**Status:** Accepted

**Decision:** R5 route and action access must continue to be computed at route/domain boundaries through capability decisions. Components must not read raw roles, flags, or session payloads directly.

**Rationale:** This follows the architecture principle that access is a capability decision, not a feature check.

**Implications:**
- new capabilities must be added or refined in the access-control layer before route implementation.
- deny behavior must be testable per route family.

### D13 — Use several OpenSpec changes for R5

**Status:** Proposed

**Decision:** Do not implement R5 as one large OpenSpec change. Create separate changes for foundation, sysadmin master data, platform users/favorite requests, requisition authoring, settings leftovers, and public/token leftovers.

**Rationale:** R5 combines several unrelated domains and unresolved boundaries. Smaller changes make scope, acceptance criteria, validation, and rollback clearer.

**Recommended change queue:**
1. `r5-sysadmin-foundation`
2. `r5-platform-master-data`
3. `r5-platform-users-and-favorite-requests`
4. `r5-requisition-authoring`
5. `r5-settings-leftovers`
6. `r5-public-token-leftovers`
7. `r5-integration-token-leftovers` only if D10 confirms remaining scope

## Blocking decisions before `R5` implementation

Resolve these before opening route-heavy implementation work:

1. D8 — inventory of remaining `/parameters` subsections.
2. D10 — status of tokenized integration entries.
3. D11 — public/token contract for requisition forms/download.

Resolved for foundation and R4/R5 sync:
- D2 — SysAdmin foundation contract is now represented by the valid `r5-sysadmin-foundation` OpenSpec package.
- D3 — platform and org user-management split is accepted after R4 org team/invite/membership closeout.
- D4 — org favorites and platform favorite-request queue split is accepted after R4 favorites/request closeout.

Still open inside later route-heavy packages:
- platform user list/create/edit/view route behavior.
- platform favorite-request queue states and actions.

## Created planning artifacts

The register has been expanded into:

- `r5-master-plan.md`
- `r5-sysadmin-open-points.md`
- `r5-requisition-authoring-open-points.md`
- `r5-settings-and-token-open-points.md`

The master plan promotes the accepted and proposed directions into release sequencing. The open-points docs keep unresolved items explicit before executable OpenSpec changes are opened.
