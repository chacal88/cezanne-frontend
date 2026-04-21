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
- for `r5-settings-leftovers`, the closed compatibility inventory is now `hiring-flow`, `custom-fields`, `templates`, `reject-reasons`, and `api-endpoints`.
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

**Status:** Accepted for `r5-settings-leftovers`

**Decision:** Use a closed compatibility inventory for this slice. Recognized subsection keys are:

| Subsection key | Legacy URL shape | Owning module | Resolution | Capability | Flags / entitlements | Save/retry/readiness | Downstream consumers |
|---|---|---|---|---|---|---|---|
| `hiring-flow` | `/parameters/:settings_id/settings/hiring-flow` | `settings.hiring-flow` | dedicated route `/settings/hiring-flow` | `canManageHiringFlowSettings` | `hc`, `admin`; requisition adjacency where relevant | R4 operational settings substrate | Jobs authoring and requisition configuration |
| `custom-fields` | `/parameters/:settings_id/settings/custom-fields` | `settings.custom-fields` | dedicated route `/settings/custom-fields` | `canManageCustomFields` | `hc`, `admin`, `customFieldsBeta` | R4 operational settings substrate | Candidate/public custom-field consumers |
| `templates` | `/parameters/:settings_id/settings/templates` | `settings.templates` | dedicated route `/templates` | `canManageTemplates` | `hc`; subtype gates remain inside templates | R4 operational settings substrate | Jobs/candidate/public template consumers |
| `reject-reasons` | `/parameters/:settings_id/settings/reject-reasons` | `settings.reject-reasons` | dedicated route `/reject-reasons` | `canManageRejectReasons` | `hc`, `admin`, `rejectionReason` | R4 operational settings substrate | Job/candidate reject task flows |
| `api-endpoints` | `/parameters/:settings_id/settings/api-endpoints` | `settings.api-endpoints` | dedicated route `/settings/api-endpoints` | `canManageApiEndpoints` | `hc`, `admin` | R5 API endpoint readiness/save/retry model | Private-token/webhook configuration consumers |

Other legacy subsection keys are not implemented by this change. They are treated as unknown compatibility requests until a later subsection-specific package proves their route contract, capability, readiness behavior, and downstream consumers.

### ST2 — Compatibility-only `/parameters` behavior

**Status:** Accepted for `r5-settings-leftovers`

**Decision:** Preserve `/parameters/:settings_id?/:section?/:subsection?` as a resolver/fallback surface, not a feature-owning page.

Accepted behavior:
- known and authorized subsection keys resolve to their dedicated routes.
- unknown subsection keys fall back to the first available recognized subsection for the current actor.
- known but unauthorized subsection keys do not render subsection controls; they fall back to another available recognized subsection or `/dashboard` when none is available.
- known but unavailable subsection keys use the same fallback model and record an unavailable outcome.
- known but unimplemented subsection keys are treated as unknown until a later OpenSpec package adds a dedicated contract.
- compatibility redirects should replace the compatibility URL when a dedicated route is selected, preventing browser-back loops into the resolver.
- compatibility telemetry records resolution outcome, requested subsection, resolved subsection when available, and route id without tenant-sensitive payloads.

### ST3 — `/settings/api-endpoints` route contract

**Status:** Accepted for `r5-settings-leftovers`

**Decision:** Implement `/settings/api-endpoints` as a dedicated HC Admin settings foundation route owned by `settings.api-endpoints`.

Accepted behavior:
- route entry uses `canManageApiEndpoints`.
- `canManageApiEndpoints` is granted to authenticated HC Admin contexts only.
- HC non-admin, RA, SysAdmin platform, and unauthenticated contexts are denied and fall back through the stable dashboard behavior.
- the frontend foundation exposes one route-level settings surface rather than separate list/detail/edit routes.
- endpoint management is modeled as editable foundation state with loading, ready, empty, validation-error, saving, saved, save-error, denied, and unavailable states.
- validation covers URL shape plus placeholder credential/header/environment fields without logging sensitive values.
- save failure is recoverable in-route; save success refreshes the route-level endpoint state.
- real private-token/webhook persistence is outside this frontend foundation slice.

### ST4 — API endpoints relationship to integrations

**Status:** Accepted for `r5-settings-leftovers`

**Decision:** Keep `/settings/api-endpoints` owned by settings and do not require integrations-domain route capabilities for entry.

Accepted behavior:
- this slice treats endpoint configuration as settings-owned utility configuration, not provider-specific setup.
- route entry does not consume `canViewIntegrations` or `canManageIntegrationProvider`.
- endpoint health/validation states are local API-endpoint readiness states in this slice.
- integration diagnostics events are not introduced by default; a future provider-specific package may add explicit integration support adapters.
- failed validation blocks save and creates a route-local `validation-error` state; transport/save failure creates a recoverable `save-error` state.

### ST5 — `/job-requisition-forms/:id?download` token/access contract

**Status:** Accepted for `r5-public-token-leftovers`

**Decision:** Implement `/job-requisition-forms/:id?download` as a distinct public/token forms-download route. The path id identifies the requested form/document target, token-derived access is accepted through route search when available, and the optional `download` query flag selects download-focused presentation rather than automatic browser download.

Accepted behavior:
- `/job-requisition-forms/:id?download` is registered separately from `/job-requisition-approval?token`.
- valid access renders a public-shell view with an explicit `Download forms` action.
- `download`, `download=true`, and `download=1` set download mode, but the user must still click the action.
- invalid, expired, inaccessible, unavailable, already-downloaded, and not-found states render route-owned public messages.
- already-downloaded is document-oriented and maps to shared `used` token-state presentation without approval terminal copy.
- retryable download failures remain on the same route and expose a retry path.

### ST6 — Relationship to `/job-requisition-approval?token`

**Status:** Accepted for `r5-public-token-leftovers`

**Decision:** Share public token-state primitives where useful, but keep forms/download state helpers, route id, telemetry names, and workflow outcomes separate from requisition approval.

Accepted behavior:
- forms/download does not reuse approval approve/reject terminal states.
- approval completion does not implicitly consume or unlock forms/download in this frontend foundation slice.
- forms/download may later be linked from approval success screens, but no approval mutation behavior changes in this package.
- telemetry uses `requisition_forms_*` events, not `requisition_approval_*` events.

### ST7 — Public/token shell behavior for forms/download

**Status:** Accepted for `r5-public-token-leftovers`

**Decision:** Render requisition forms/download in the public/external shell with no authenticated recruiter-shell navigation, session route capability dependency, or automatic download side effect.

Accepted behavior:
- direct entry and refresh preserve token/form interpretation.
- invalid token, expired token, inaccessible link, unavailable document, not-found document, and already-downloaded states render public messages.
- the explicit download action is accessible, retryable, and keeps transient failures in-route.
- telemetry payloads omit raw tokens, document contents, signed URLs, and tenant-sensitive identifiers.

### ST8 — Integration tokenized entries reconciliation

**Status:** Accepted; no R5 implementation change required

**Decision:** The generic integration tokenized entries line (`cv/forms/job`) is already covered by the R3 integrations token-entry implementation. R5 does not open `r5-integration-token-leftovers`.

Evidence:
- `/integration/cv/:token/:action?` is registered as `integrations.token-entry.cv` and renders the CV callback route with interview/offer action handling.
- `/integration/forms/:token` is registered as `integrations.token-entry.forms` and renders requested forms/documents with sequential upload/persistence/retry behavior.
- `/integration/job/:token/:action?` is registered as `integrations.token-entry.job` and renders normalized job callback presentation.
- access and workflow tests cover route metadata, token lifecycle, route-family mismatch, CV conflict recovery, forms upload/persistence failure, and stable forms completion.

Accepted behavior:
- treat the roadmap R5 line as stale planning text, not a missing implementation slice.
- keep ownership under `integrations.token-entry`; do not move these routes into `public-external`.
- only open a future integration-token change when a concrete missing provider/route family is named.

### ST9 — Token lifecycle consistency

**Status:** Accepted for `r5-public-token-leftovers`

**Decision:** Reuse shared `valid`, `invalid`, `expired`, `used`, and `inaccessible` token-state vocabulary while adding route-specific forms/download readiness for `ready`, `unavailable`, `already-downloaded`, `not-found`, `download-failed`, and `downloaded`. Retryable transport failures stay in-route and do not change token state.

### ST10 — Validation evidence and telemetry

**Status:** Accepted for `r5-settings-leftovers` and `r5-public-token-leftovers`

**Decision:** Require route-specific validation and telemetry evidence before closing each R5 leftover package.

Accepted settings evidence:
- route metadata coverage for `/settings/api-endpoints` and `/parameters*` compatibility entries.
- capability tests for `canEnterSettings` and `canManageApiEndpoints`.
- compatibility-route tests for matched, unknown, unauthorized, unavailable, and unimplemented subsection requests.
- API endpoint state tests for loading, ready, empty, validation-error, saving, saved, save-error, denied, and unavailable states.
- smoke proof for direct entry and denied/fallback behavior where the existing smoke surface supports it.
- telemetry for compatibility resolution, compatibility fallback, API endpoint validation failure, save failure, and save success.

Accepted public/token evidence for `r5-public-token-leftovers`:
- route metadata coverage for `/job-requisition-forms/:id`.
- search parsing tests for token and optional `download` mode.
- token/form access tests for valid, invalid, expired, inaccessible, unavailable, already-downloaded, and not-found states.
- explicit download workflow tests for success, hardened request headers, and retryable same-route failure.
- telemetry docs for `requisition_forms_opened`, `requisition_forms_download_started`, `requisition_forms_download_completed`, `requisition_forms_download_failed`, and `requisition_forms_token_state_resolved`.

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

Status:
- not opened. ST8 confirms the generic cv/forms/job route families are already covered by R3 integrations token-entry source and tests.

Future rule:
- open only if a later audit identifies a concrete missing provider/route family beyond `/integration/cv/:token/:action?`, `/integration/forms/:token`, and `/integration/job/:token/:action?`.

## Blocking items before implementation

Before implementing `r5-settings-leftovers`:
- the OpenSpec package must validate strictly.
- implementation must preserve the accepted ST1-ST4 and ST10 settings decisions above.

Before opening `r5-public-token-leftovers`:
- ST5-ST7 and ST9 are accepted for `r5-public-token-leftovers` and implemented through the route-specific forms/download contract.

Before opening any future integration-token leftover:
- name the concrete missing provider/route family. The generic ST8 cv/forms/job line is closed as already covered by R3.
