# R5 Settings and Token Open Points

## Purpose

This document records the decisions that must be resolved before opening the `R5` settings leftovers and public/token leftovers implementation packages.

It covers:
- `/settings/api-endpoints`
- remaining `/parameters` subsection completion
- `/job-requisition-forms/:id?download`
- possible tokenized integration leftovers after the R3 provider callback implementation

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
- `r4-operational-settings-open-points.md`
- `r4-integrations-open-points.md`
- `r3-requisition-approval-open-points.md`

## Confirmed baseline

Confirmed:
- `/settings/api-endpoints` belongs to `settings.api-endpoints`, not `sysadmin`.
- `/parameters/:settings_id?/:section?/:subsection?` remains compatibility-only and must not become a monolithic settings page.
- remaining `/parameters` subsections must be inventoried before implementation.
- `/job-requisition-forms/:id?download` is a distinct R5 public/token route.
- provider integration callbacks are already represented in source from the R3 baseline, so R5 integration-token scope must be reconciled before opening a new change.

Confirmed R5 settings/token route families from `screens.md`:
- `/settings/api-endpoints`
- `/parameters/:settings_id?/:section?/:subsection?`
- `/job-requisition-forms/:id?download`

Potentially stale R5 roadmap item:
- Integration tokenized entries (`cv/forms/job`)

## Open decisions

### ST1 — Remaining `/parameters` inventory

**Status:** Open

**Decision needed:** Create a closed inventory of remaining `/parameters` subsections that still require R5 work.

Must define:
- subsection key and legacy URL shape.
- owning domain/module.
- whether it needs a dedicated route or compatibility-only resolution.
- required capability decision.
- feature flag or entitlement dependency.
- save/retry/readiness behavior.
- downstream consumers.

Recommendation:
- do not open a generic `/parameters` implementation change.
- inventory first, then open narrow subsection changes.

### ST2 — Compatibility-only `/parameters` behavior

**Status:** Open

**Decision needed:** Freeze compatibility behavior for `/parameters/:settings_id?/:section?/:subsection?` after R4 settings substrate work.

Must define:
- how legacy section/subsection params map to dedicated routes.
- behavior for unknown subsection keys.
- behavior for known but unauthorized subsection keys.
- behavior for known but unimplemented subsection keys.
- whether redirects replace or preserve the original URL.
- telemetry for compatibility-route resolution and fallback.

Recommendation:
- preserve the compatibility route as a resolver/fallback surface, not a feature-owning page.

### ST3 — `/settings/api-endpoints` route contract

**Status:** Open

**Decision needed:** Define API endpoints settings as a dedicated HC Admin settings route.

Must define:
- route entry capability for `canManageApiEndpoints`.
- whether endpoint management is read-only, editable, or both.
- list/detail/edit shape, if applicable.
- validation rules for endpoint URLs, credentials, headers, or environment-specific fields.
- save/retry/readiness behavior.
- whether changes affect integrations, public entry, or backend webhooks.
- denied fallback for HC users, RA users, and SysAdmin users.

Recommendation:
- implement as `settings.api-endpoints`, not as SysAdmin or generic integrations setup.

### ST4 — API endpoints relationship to integrations

**Status:** Open

**Decision needed:** Define whether `/settings/api-endpoints` depends on the integrations domain or only on settings adapters.

Must define:
- whether endpoint configuration is provider-specific.
- whether endpoint health/validation states are shared with integrations setup.
- whether endpoint changes create integration diagnostics events.
- whether failed validation blocks save or creates degraded state.

Recommendation:
- keep route ownership in settings, but use explicit integration support adapters only if provider-specific state is required.

### ST5 — `/job-requisition-forms/:id?download` token/access contract

**Status:** Open

**Decision needed:** Define how requisition forms/download validates access and handles terminal states.

Must define:
- whether access is token-based, id-based with signed URL, or another form-access model.
- whether `download` is a boolean query flag, optional route mode, or separate action.
- valid, invalid, expired, inaccessible, unavailable, already-downloaded, and not-found states.
- whether the route can render a view before download.
- whether download should start automatically or require user action.
- retry behavior for failed downloads.

Recommendation:
- treat this as a separate public/token route contract, not as a variant of requisition approval.

### ST6 — Relationship to `/job-requisition-approval?token`

**Status:** Open

**Decision needed:** Define how requisition forms/download relates to the existing requisition approval public/token route.

Must define:
- whether the same token service is used.
- whether approval terminal states affect form access.
- whether forms/download can be opened from approval success screens.
- whether approval route and forms route share token-state components.
- whether analytics and telemetry event names are shared or separate.

Recommendation:
- share token-state primitives where useful, but keep route behavior, telemetry, and acceptance criteria separate.

### ST7 — Public/token shell behavior for forms/download

**Status:** Open

**Decision needed:** Define public-shell rendering and error behavior for `/job-requisition-forms/:id?download`.

Must define:
- public shell layout.
- internal navigation exclusion.
- user-facing messages for each token/access state.
- file/document unavailable states.
- accessibility and browser behavior for download actions.

Recommendation:
- use the public/external shell contract and avoid authenticated recruiter-shell dependencies.

### ST8 — Integration tokenized entries reconciliation

**Status:** Open

**Decision needed:** Determine whether integration tokenized entries remain in R5 scope.

Current tension:
- `roadmap.md` lists Integration tokenized entries (`cv/forms/job`) under R5.
- current status says provider integration callbacks are represented in source under the integrations token-entry slice.

Must define:
- routes already implemented by R3 provider callbacks.
- route families still missing, if any.
- whether missing entries are callback routes, token entry routes, or direct public/external document routes.
- owning domain: `integrations`, `public-external`, or shared token support.
- whether roadmap/docs should be updated to remove stale R5 scope.

Recommendation:
- do not open `r5-integration-token-leftovers` unless a concrete missing route family is proven.

### ST9 — Token lifecycle consistency

**Status:** Open

**Decision needed:** Ensure any R5 public/token route uses the same lifecycle vocabulary as prior public/external surfaces.

Must define:
- valid.
- invalid.
- expired.
- used or consumed, if applicable.
- inaccessible.
- unavailable.
- stale target state.
- retryable transport failure.

Recommendation:
- reuse public/external token-state primitives, but keep route-specific copy and actions explicit.

### ST10 — Validation evidence and telemetry

**Status:** Open

**Decision needed:** Define validation and telemetry requirements for settings and token leftovers.

Must define:
- route metadata coverage.
- capability unit tests for `/settings/api-endpoints` and any compatibility resolutions.
- compatibility-route tests for `/parameters` mappings.
- public/token state tests for requisition forms/download.
- smoke proof for direct entry and denied/error states.
- telemetry for compatibility resolution, settings save failure, token invalid/expired/inaccessible, and download success/failure.

Recommendation:
- require token-state and compatibility-resolution proof before closing any R5 settings/token change.

## Proposed OpenSpec split

### `r5-settings-leftovers`

Goal:
- implement API endpoints settings and any closed, inventoried `/parameters` leftovers.

Should resolve:
- ST1
- ST2
- ST3
- ST4
- ST10

Expected affected areas:
- `src/domains/settings/**`
- `src/lib/routing/**`
- `src/lib/access-control/**`
- settings tests and docs

### `r5-public-token-leftovers`

Goal:
- implement requisition forms/download as a distinct public/token route.

Should resolve:
- ST5
- ST6
- ST7
- ST9
- ST10

Expected affected areas:
- `src/domains/public-external/requisition-approval/**`
- `src/domains/public-external/token-state/**`
- `src/lib/routing/**`
- public/token tests and docs

### `r5-integration-token-leftovers`

Goal:
- implement only confirmed missing integration tokenized entries after reconciliation.

Should resolve:
- ST8
- ST9
- ST10

Expected affected areas:
- `src/domains/integrations/**` if owned by integrations
- `src/domains/public-external/**` if owned by public/token routes
- `src/lib/routing/**`

Open only if:
- ST8 proves a real missing route family remains after R3 provider callbacks.

## Blocking items before implementation

Before opening `r5-settings-leftovers`:
- ST1 must produce a closed subsection inventory.
- ST2 must define compatibility behavior.
- ST3 must be route-contract ready.
- ST4 must clarify integrations dependency.

Before opening `r5-public-token-leftovers`:
- ST5 must define token/access behavior.
- ST6 must define relationship to requisition approval.
- ST7 must define public-shell behavior.
- ST9 must define token lifecycle states.

Before opening `r5-integration-token-leftovers`:
- ST8 must prove remaining scope exists.
