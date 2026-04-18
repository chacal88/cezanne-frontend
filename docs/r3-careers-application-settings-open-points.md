# R3 Careers and Application Settings Open Points

## Purpose

This document captures the decision register for the `R3` careers/application settings slice.

It is focused on admin route ownership, public-surface coupling, job-listings statefulness, settings-vs-public boundaries, and adapter/API separation.

## Status

- **Current readiness:** initial implementation landed in `recruit-frontend`
- **Validation baseline:** `npm test`, `npm run build`, and `npm run smoke:r0`
- **Execution note:** the implemented slice now covers the full first route family:
  - `/settings/careers-page`
  - `/settings/application-page/:settings_id?/:section?/:subsection?`
  - `/settings/job-listings?tab&brand`
  - `/settings/job-listings/edit/:uuid?new&brand`

## Implemented execution baseline

- Route metadata and access contracts exist for the full `settings.careers-application` family.
- Stateful URL restoration is implemented for application-page section/subsection and job-listings tab/brand.
- Job listings editor preserves brand context and explicit return-to-list behavior through route-owned context.
- Save and publish/status workflows use the shared hardened request helper so correlation-id and CSRF behavior stay centralized.
- Downstream public behavior is modeled through explicit admin-to-public contracts rather than raw payload reuse.

## Canonical Source Baseline

Use these documents as the primary baseline for discovery and execution planning:

- `recruit-frontend/docs/roadmap.md`
- `recruit-frontend/docs/modules.md`
- `recruit-frontend/docs/screens.md`
- `recruit-frontend/docs/capabilities.md`
- `docs/frontend-2/frontend-wave-2-and-wave-3-journey-catalog.md`
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md`
- `docs/frontend-2/frontend-rewrite-matrix.md`
- `docs/frontend-2/frontend-parameters-settings-domain-decomposition.md`
- `docs/frontend-2/frontend-screen-inventory.md`
- `docs/frontend-2/frontend-provider-by-provider-integration-inventory.md`

## Decision Register

### 1. Missing executable planning package

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The careers/application settings slice should be opened as its own dedicated OpenSpec change.

**Confirmed decision**
- Use a dedicated package for `settings.careers-application`.
- Do not mix it into public-application runtime changes or broader settings decomposition work.
- Recommended change shape:
  - `r3-careers-application-settings`

**Why this is the right package boundary**
- `recruit-frontend/docs/modules.md` already defines `careers-application` as a dedicated route-owning settings module.
- `docs/frontend-2/frontend-parameters-settings-domain-decomposition.md` identifies this module as S5 with clearer extraction boundaries than the broader `parameters` surface.

---

### 2. Slice scope is not frozen

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- Keep the whole `careers-application` family together in one first executable change:
  - `/settings/careers-page`
  - `/settings/application-page/:settings_id?/:section?/:subsection?`
  - `/settings/job-listings?tab&brand`
  - `/settings/job-listings/edit/:uuid?new&brand`

**Confirmed decision**
- First slice includes the whole `careers-application` route family.
- Do not split `careers-page + application-page` from `job-listings + editor` at the planning-package level.

**Why this is correct**
- `recruit-frontend/docs/modules.md` models them as one route-owning module.
- `docs/frontend-2/frontend-parameters-settings-domain-decomposition.md` treats them as one coherent S5 module whose primary purpose is to configure public job presentation and application behavior.
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md` says this area is one of the better modular targets because ownership is more explicit than in recruiter-core hubs.

**Operational rule**
- One planning/change family
- Multiple route contracts inside it
- Subflows remain explicit, but not split into separate first-change packages

---

### 3. Public-surface coupling boundary is not explicit enough

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- This slice is an **internal admin module** with **downstream public-surface effects** through explicit contracts.

**Confirmed decision**
- The routes live under the authenticated admin/settings surface.
- They do not inherit public/token runtime behavior.
- Their output must intentionally shape:
  - public job presentation
  - public application behavior
  - branding/source/application-flow configuration

**Why this is correct**
- `docs/frontend-2/frontend-parameters-settings-domain-decomposition.md` explicitly says admin changes must map intentionally to public application behavior.
- It also says the module should coordinate tightly with `frontend-public-application-slice-specification.md`.
- `recruit-frontend/docs/roadmap.md` makes careers/application/job-listing configuration part of `R3` and requires that it be reflected correctly in public surfaces.

---

### 4. Careers-page vs application-page vs job-listings ownership is not frozen

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze one route-owning module with three subflows:
  - careers page configuration
  - application page configuration
  - job listings list/editor management

**Confirmed decision**
- `careers-page` = admin configuration page flow
- `application-page` = stateful configuration flow
- `job-listings` = stateful list + editor flow family

**Why this is correct**
- `recruit-frontend/docs/screens.md` already distinguishes these route shapes clearly.
- `docs/frontend-2/frontend-rewrite-matrix.md` groups them as one domain while acknowledging different route patterns and coexistence risk.

**Rule**
- one module
- distinct subflows
- no need to split into separate planning families before implementation

---

### 5. Stateful URL contract for settings routes is not frozen deeply enough

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- The stateful URL contract is now frozen for the module.

**Confirmed decision**
- `/settings/application-page/:settings_id?/:section?/:subsection?`
  - section/subsection state is part of the route contract
  - refresh must restore equivalent configuration context
- `/settings/job-listings?tab&brand`
  - `tab` and `brand` are part of the route contract
  - refresh must restore list context
- `/settings/job-listings/edit/:uuid?new&brand`
  - `brand` remains part of the route contract
  - `new` and edit are two variants of the same editor route family
  - cancel/close should return to the list context when entered from it

**Why this is correct**
- `recruit-frontend/docs/screens.md` explicitly marks application-page and job-listings list as `PageWithStatefulUrl`.
- The editor route explicitly carries `new` and `brand`, so list/editor continuity is part of the product contract.

---

### 6. Capability/readiness model is not frozen beyond high-level keys

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- The base capability model is frozen, with additional route/subflow readiness rules.

**Confirmed decision**
- Base route gating:
  - `canManageCareersPage`
  - `canManageApplicationPage`
  - `canManageJobListings`
- Route/subflow readiness may additionally depend on:
  - brand/label context
  - opt-in/feature state
  - editor mode (`new` vs edit)
  - downstream provider/publishing readiness where surfaced

**Why this is correct**
- `recruit-frontend/docs/capabilities.md` already defines the three route-level planning capabilities.
- `docs/frontend-2/frontend-rewrite-matrix.md` explicitly calls out brand/label context and opt-in flags as part of this area’s behavior.

**Rule**
- Admin capability grants route family access.
- Subflow readiness and messaging may still vary by brand/config/provider state.

---

### 7. Adapter/API boundaries are not defined

**Status:** Resolved  
**Priority:** Critical

**Resolution summary**
- The slice requires explicit route-facing adapter boundaries.

**Confirmed decision**
- Define dedicated route-facing models for at least:
  - `CareersPageConfigView`
  - `ApplicationPageConfigView`
  - `JobListingsListView`
  - `JobListingEditorDraft`
- Use explicit serializers for save/publish mutations where applicable.

**Why this is correct**
- `docs/frontend-2/frontend-feature-to-api-ownership-matrix.md` describes the area as mixed leaning GraphQL with a composite REST + GraphQL contract.
- `docs/frontend-2/frontend-parameters-settings-domain-decomposition.md` explicitly requires downstream behavior mapping and separation of admin CRUD from downstream contracts.

---

### 8. Coexistence risk between legacy and new application-page concepts is not resolved

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze the greenfield slice around one canonical admin configuration model, not legacy concept parity at the route layer.

**Confirmed decision**
- The greenfield slice should define one canonical `ApplicationPageConfigView`.
- Legacy/new concept coexistence is treated as adapter-level normalization work, not as multiple competing route models.

**Why this is correct**
- `docs/frontend-2/frontend-rewrite-matrix.md` calls out coexistence risk, which is exactly why the route layer should stay singular and the compatibility work should live in adapters.
- `docs/frontend-2/frontend-parameters-settings-domain-decomposition.md` favors modular extraction with intentional downstream contract mapping.

---

### 9. Job listings publishing/provider boundary is not explicit enough

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- The first slice includes provider/publishing status handling where it is part of job-listings behavior, but not broader provider setup/admin flows.

**Confirmed decision**
- Include job-listings behavior and status that materially affect listing management and public publishing reflection.
- Exclude broader provider-setup UI and integration admin surfaces from this slice.

**Why this is correct**
- `docs/frontend-2/frontend-provider-by-provider-integration-inventory.md` says job authoring and job-listings-related settings include provider-heavy publishing concerns.
- `recruit-frontend/docs/roadmap.md` explicitly requires that careers/application/job-listing configuration publish correctly and be reflected in public surfaces.

**Rule**
- include listing-side publish/status behavior
- exclude provider setup/configuration consoles

---

### 10. Editor/list return behavior is not frozen

**Status:** Resolved  
**Priority:** Medium

**Resolution summary**
- Freeze editor/list continuity as part of the route contract.

**Confirmed decision**
- The job-listings editor returns to the job-listings list context when entered from it.
- `tab` and `brand` context should be preserved across edit/create entry and cancellation when applicable.
- Refresh on the editor route must preserve edit/create interpretation explicitly.

**Why this is correct**
- The list route is explicitly stateful with `tab` and `brand`.
- The editor route explicitly carries `brand` plus `new` vs edit variant, so the user-facing contract implies contextual return behavior.

---

### 11. Validation baseline is not defined for the slice

**Status:** Resolved  
**Priority:** High

**Resolution summary**
- Freeze the minimum validation baseline for the careers/application settings slice.

**Required proof**
- direct route entry for each settings surface
- refresh with preserved section/subsection/tab/brand context
- create/edit job-listings entry behavior
- capability/subsection visibility behavior
- downstream public-surface reflection for the settings that claim to control public behavior

**Blocking scenarios**
- route refresh loses section/subsection/tab/brand meaning
- job-listings editor breaks return behavior
- admin save behavior does not map predictably to public-facing outcomes
- capability gating or subsection visibility is inconsistent

**Evidence**
- `docs/frontend-2/frontend-parameters-settings-domain-decomposition.md`
- `docs/frontend-2/frontend-rewrite-matrix.md`
- `recruit-frontend/docs/roadmap.md`

---

### 12. Observability baseline is not defined for the slice

**Status:** Resolved  
**Priority:** Medium

**Resolution summary**
- Freeze the minimum observability baseline for careers/application settings.

**Required event areas**
- route opened
- settings section/subsection resolved
- job-listings list/editor entered
- save started / succeeded / failed
- publish/status actions started / succeeded / failed where surfaced
- downstream public-affecting configuration change applied
- correlation-id propagation

**Required context**
- `routeId`
- `routeClass`
- `domain`
- `module`
- `entryMode`
- `correlationId`

**Why this is correct**
- The repository already freezes route-aware telemetry as a cross-slice rule.
- This slice affects downstream public behavior, so observability needs to capture both admin action and public-facing impact intent.

## Confirmed Current-Code State

These are confirmed current-code facts relevant to planning:

- current source already contains `src/domains/public-external/**` for the first public slice
- implementation now exists under:
  - `src/domains/settings/careers-application/**`
- route ids and route metadata now exist for the full route family in:
  - `src/lib/routing/route-contracts.ts`
  - `src/lib/routing/route-metadata.ts`
- the careers/application settings routes are now registered in:
  - `src/app/router.tsx`
- route/capability planning is now partially encoded in source, including access, adapters, routing helpers, workflow helpers, and tests

## Recommended Resolution Order

1. keep docs synchronized with the implemented route family
2. verify downstream public-surface contracts stay aligned with public-application behavior
3. revisit only if a later slice expands provider-setup scope or introduces new job-listings publishing semantics

## Ready-to-Start Condition

This implemented slice should be treated as the baseline for any follow-up work, and future expansion should only proceed when:

- downstream public-surface ownership remains explicit
- provider/publishing scope changes are explicitly respecified
- any new route family or admin surface gets its own OpenSpec package
