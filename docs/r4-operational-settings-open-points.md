# R4 Operational Settings Open Points

## Purpose

This document records the R4.1 operational settings closeout boundary after the foundation and follow-on slices moved into implementation.

## Confirmed baseline

- `R4` settings work must ship subsection-by-subsection, not as one monolithic `/parameters` replacement.
- The active operational settings scope for the first `R4` planning step is:
  - operational settings substrate
  - hiring flow settings
  - custom fields settings
  - templates
  - reject reasons
- Team/users, favorites, reports, integrations setup, billing, and marketplace are not part of the first operational settings package.

## What must be frozen now

1. `/parameters` remains a compatibility and subsection-resolution route, not the new monolithic admin page.
2. Operational settings need one shared save/retry/readiness/telemetry contract.
3. `templates` and `reject-reasons` need explicit route-owning module and capability treatment.
4. `jobRequisition` remains an adjacency for hiring flow, but requisition authoring stays outside `R4.1`.

## Substrate decisions now fixed

- The substrate owns the subsection registry for the first operational settings consumers:
  - `hiring-flow`
  - `custom-fields`
  - `templates`
  - `reject-reasons`
- Each subsection keeps its own route owner and capability gate.
- `/parameters/:settings_id?/:section?/:subsection?` only resolves, redirects, or denies at subsection level; it does not become a feature surface of its own.
- Save behavior stays inside the active subsection after recoverable failure and exposes explicit retry semantics instead of bouncing back to a generic settings landing page.

## R4 closeout status

Resolved by the R4 operational settings slices:
- subsection registry logic lives in the shared operational settings substrate, while each route-owning slice keeps its own capability gate, route metadata, and page behavior;
- the reusable admin workflow baseline is the operational settings readiness/save/retry/stable-outcome contract implemented by hiring flow, custom fields, templates, and reject reasons;
- integrations and billing reuse the same planning vocabulary for readiness and retry states, but they keep domain-specific helpers instead of sharing settings-only form internals.

Intentionally deferred beyond R4:
- closed inventory and completion of any remaining `/parameters` subsections; this is tracked by R5 settings leftovers.
- full requisition workflow administration under `/requisition-workflows`; this stays in R5 requisition/settings planning rather than the R4 hiring-flow settings slice.

## First change from this area

- `r4-operational-settings-substrate`

## Follow-on changes expected after the substrate

- `r4-hiring-flow-settings`
- `r4-custom-fields-settings`
- `r4-templates-foundation`
- `r4-reject-reasons-management`

## Hiring flow slice execution notes

- `/settings/hiring-flow` is the first dedicated operational settings route after the substrate.
- The route owns workflow-configuration behavior only; it must not absorb `/requisition-workflows` or broader requisition authoring.
- `jobRequisition` changes which requisition-adjacent controls are available, but lack of that capability does not turn hiring flow settings into a requisition workflow surface.
- Hiring flow saves stay inside `/settings/hiring-flow` on recoverable failure and reuse the shared operational settings readiness/save/retry/stable-outcome contract.

## Custom fields slice execution notes

- `/settings/custom-fields` is a dedicated operational settings route, not a generic `/parameters` subsection fallback UI.
- The route remains explicitly gated by `customFieldsBeta`; general settings access is not enough.
- Custom fields saves stay inside `/settings/custom-fields` on recoverable failure and reuse the shared operational settings readiness/save/retry/stable-outcome contract.
- Candidate detail and public application remain downstream consumers of the configured custom-field shape, but those consuming routes stay out of scope for this slice.

## Templates slice execution notes

- `/templates` is the root of a shared templates family, not an unrelated collection of admin pages.
- `/templates/:id`, `/templates/smart-questions`, `/templates/diversity-questions`, and `/templates/interview-scoring` stay inside the same family contract.
- Subtype-specific gates remain explicit: smart questions is admin-scoped, diversity questions depends on `surveysBeta` + `customSurveys`, and interview scoring depends on interview-feedback capability.
- When a templates subsection is unavailable, the route falls back to a stable templates-family state instead of redirecting to unrelated settings navigation.

## Reject reasons slice execution notes

- `/reject-reasons` is a dedicated operational settings route, not a hidden settings-container subsection.
- The route remains explicitly gated by `rejectionReason`; general admin access is not enough.
- Reject-reasons saves stay inside `/reject-reasons` on recoverable failure and reuse the shared operational settings readiness/save/retry/stable-outcome contract.
- Job and candidate reject flows remain downstream consumers of admin-managed reasons, but those flows stay out of scope for this slice.
