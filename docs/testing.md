# Frontend Greenfield Testing Strategy

## Purpose

This document defines the current testing contract for `recruit-frontend`.

It complements:
- `architecture.md`
- `conventions.md`
- `roadmap.md`
- `r0-code-closeout-checklist.md`

## Current testing stack

The repository now uses three layers:

1. **Unit and module-contract tests** — `Vitest`
2. **Component rendering helpers** — `Testing Library`
3. **Journey and smoke validation** — `Playwright`

## Current commands

```bash
npm test
npm run test:watch
npm run test:coverage
npm run smoke:r0
npm run smoke:r0:http
npm run smoke:r0:ui
```

## Scope by layer

### Vitest

Use Vitest for:
- pure transforms
- capability evaluation
- route metadata and navigation helpers
- request hardening helpers
- domain adapters and serializers

Current examples in source include:
- `src/lib/access-control/evaluate-capabilities.test.ts`
- `src/lib/routing/navigation-helpers.test.ts`
- `src/lib/api-client/correlation-aware-fetch.test.ts`
- `src/domains/public-external/support/routing.test.ts`
- `src/domains/public-external/support/access.test.ts`
- `src/domains/public-external/support/workflow.test.ts`
- `src/domains/public-external/requisition-approval/support/routing.test.ts`
- `src/domains/public-external/requisition-approval/support/access.test.ts`
- `src/domains/public-external/requisition-approval/support/adapters.test.ts`
- `src/domains/public-external/requisition-approval/support/workflow.test.ts`

### Testing Library

Use Testing Library helpers when the behavior depends on rendering, providers, or interaction.

Shared helper:
- `src/testing/render.tsx`

Rule:
- prefer provider-wrapped rendering through `renderWithProviders`
- do not recreate app wiring in each test file

### Playwright

Use Playwright for:
- route registration proof
- URL-owned state
- parent-return behavior
- shell integration
- critical smoke journeys

Current smoke suite:
- `tests/r0/http/routes.txt`
- `tests/r0/ui/r0-shell.smoke.spec.ts`

## Coverage contract before R2

The pre-R2 baseline is:
- unit coverage for critical shared contracts
- Playwright smoke coverage for the registered route family
- build proof in CI/local validation

This baseline is intentionally smaller than the future R2/R3 journey suite.
It is meant to make refactors safer without pretending the app already has full domain-density coverage.

## Preferred split

- **pure logic** → Vitest
- **provider-aware rendering** → Vitest + Testing Library
- **route and browser contracts** → Playwright

## Rules

1. Add a Vitest file when changing shared logic in `src/lib/`.
2. Add or extend Playwright smoke coverage when changing registered route behavior.
3. Do not rely on Playwright alone for pure transform logic.
4. Keep tests close to the owning module whenever practical.

## Validation checklist for hardening work

For security, routing, and shared-library changes, run:

```bash
npm test
npm run build
npm run smoke:r0
```

## R2 candidate baseline

The current smoke and unit baseline now also proves:
- contextual candidate direct entry via `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?`
- notification-driven candidate entry
- candidate action parent-return behavior
- visible candidate-hub refresh after candidate actions
- candidate route/action/document helper contracts

## R3 public baseline

The current baseline also proves the first public-external slice through:
- direct entry to `/shared/:jobOrRole/:token/:source`
- public application launch from the shared-job route
- explicit expired-token rendering for public token routes
- public application completion that remains stable after reload
- public survey completion that remains stable after reload
- unit coverage for public route helpers, token-state interpretation, upload/submission workflow contracts, and requisition-approval route bootstrap/readiness/serializer behavior
- external-review direct entry, token-state handling, notification-ownership rules, recoverable retry behavior, and stable terminal outcomes for interview request, review-candidate, and interview-feedback
- provider integration callback direct entry, token-state handling, conflict/retry behavior for CV callbacks, sequential upload/persistence proof for forms/documents callbacks, and normalized job callback rendering

## R4 operational settings baseline

The shared baseline for `R4.1` operational settings work now includes:
- subsection registry parsing for `/parameters/:settings_id?/:section?/:subsection?`
- stable fallback when an unknown or unavailable subsection is requested
- typed readiness states before a subsection becomes editable
- typed mutation outcomes for recoverable failure, validation failure, retry, and stable post-save success

For `r4-hiring-flow-settings`, the baseline additionally proves:
- direct entry to `/settings/hiring-flow`
- admin gating for hiring-flow controls
- recoverable save failure with explicit retry while remaining on the same route
- stable refreshed workflow state after a successful save

For `r4-custom-fields-settings`, the baseline additionally proves:
- direct entry to `/settings/custom-fields`
- explicit `customFieldsBeta` gating for custom-fields administration
- recoverable save failure with explicit retry while remaining on the same route
- stable refreshed field configuration state after a successful save

For `r4-templates-foundation`, the baseline additionally proves:
- direct entry to `/templates`
- subtype-specific gating for smart questions, diversity questions, and interview scoring
- stable templates-family fallback when a subsection is unavailable
- stable templates-family save/retry behavior without leaving the family contract

For `r4-reject-reasons-management`, the baseline additionally proves:
- direct entry to `/reject-reasons`
- explicit `rejectionReason` gating for reject-reasons administration
- recoverable save failure with explicit retry while remaining on the same route
- stable refreshed reject-reasons state after a successful save

## R4 candidate database validation baseline

Candidate database foundation validation includes:
- Vitest coverage for URL-state parsing, invalid-state degradation, canonical path building, and database-origin detail handoff.
- Module-contract coverage for candidate task return behavior when launched from database-origin detail.
- Browser smoke coverage for `/candidates-database` direct entry, restored URL state, database → detail handoff, task close back to database-origin detail, and return to the database list.
- HTTP smoke coverage for `/candidates-database`, `/candidates-old`, and `/candidates-new` entries.

## R4 integrations admin validation baseline

Integrations shell validation includes:
- Vitest coverage for provider-state rendering and action concern taxonomy.
- Route metadata coverage for `/integrations` and `/integrations/:id`.
- Capability coverage for HC admin-only integrations access.
- Browser smoke coverage for index direct entry, provider detail direct navigation, explicit provider state/action rendering, parent-index fallback, and unknown-provider unavailable state.
- HTTP smoke coverage for `/integrations`, `/integrations/lever`, and `/integrations/unknown-provider`.

## R4 reports validation baseline

Reports foundation validation includes:
- Vitest coverage for shared filters, family result-state, legacy compatibility targets, and export/scheduling command states.
- Route metadata coverage for `/report/:family` and `/hiring-company/report/:id`.
- Capability coverage for HC admin-only report access.
- Browser smoke coverage for report index direct entry, family direct navigation, export success, scheduling success, unsupported scheduling state, and legacy compatibility routing.
- HTTP smoke coverage for `/report`, `/report/jobs`, `/report/diversity`, and `/hiring-company/report/:id?`.

## R4 org team/users validation baseline

Org team/users foundation validation includes:
- Vitest coverage for org team view-model state and org/platform capability split.
- Route metadata coverage for `/team/recruiters` and `/users/invite`.
- Browser smoke coverage for org team direct entry, recruiter visibility, invite foundation, and non-platform scope proof.
- HTTP smoke coverage for `/team`, `/team/recruiters`, and `/users/invite`.

Org invite and membership-management validation additionally includes:
- Vitest coverage for deterministic invite send, resend, revoke, pending, success, and blocked action states.
- Vitest coverage for org team membership role/status action readiness without requiring `canManagePlatformUsers`.
- Route metadata proof that `/users/invite` uses the `team` domain, `invite-management` module, `/team` parent target, `canManageOrgInvites`, and `/dashboard` fallback.

## R4 org favorites validation baseline

Org favorites validation includes:
- Vitest coverage for org favorites capability gating without granting Platform navigation or `canManageFavoriteRequests`.
- Route metadata coverage for `/favorites` and `/favorites/:id`.
- Vitest coverage for personal, org-shared, recruiter-linked, empty, and unavailable favorite states.
- Detail-state proof that unknown favorites return to `/favorites` instead of a platform request queue.

## R4 org favorite requests validation baseline

Org favorite request validation includes:
- Route metadata coverage for `/favorites/request` and `/favorites/request/:id`.
- Vitest coverage for draft, submitted, pending, approved, rejected, and unavailable request states.
- Vitest coverage for submit, cancel, and resubmit action readiness.
- Platform queue separation proof that org request routes use `/favorites` as parent and never require `canManageFavoriteRequests`.

## R4 billing foundation validation baseline

Billing foundation validation includes:
- Vitest coverage for billing capability gating without granting Platform navigation or `canManagePlatformSubscriptions`.
- Route metadata coverage for `/billing`, `/billing/upgrade`, `/billing/sms`, and `/billing/card/:id`.
- Vitest coverage for ready, hidden, unavailable, action-readiness, and card unavailable commercial states.
- Platform subscription separation proof that billing routes do not require SysAdmin subscription capabilities.

Payment-method/card validation additionally includes:
- Vitest coverage for primary, backup, expired, missing, add-new, and unavailable card states.
- Vitest coverage for edit, remove, and make-default readiness.
- Route metadata proof that card management stays under `/billing/card/:id` with `/billing` as parent and `canManageBillingCard` as the gate.

Subscription upgrade validation additionally includes:
- Vitest coverage for current plan, target plan, catalog, same-plan, card-blocked, confirmation, submitted, success, and failure states.
- Vitest coverage for plan-change action readiness consuming card readiness.
- Platform subscription separation proof that upgrade behavior stays under `/billing/upgrade` and never requires `canManagePlatformSubscriptions`.

SMS add-on validation additionally includes:
- Vitest coverage for unavailable, inactive, trial, active, suspended, usage-warning, and card-blocked states.
- Vitest coverage for enable, disable, and update-limit readiness consuming card readiness.
- Platform subscription separation proof that SMS behavior stays under `/billing/sms` and never requires `canManagePlatformSubscriptions`.

## R4 marketplace RA validation baseline

Marketplace RA validation includes:
- Vitest coverage for RA capability gating without granting billing or Platform navigation.
- Route metadata coverage for `/jobmarket/:type`.
- Vitest coverage for fill, bidding, cvs, assigned, empty, and unavailable list states.
- Billing/platform separation proof that marketplace behavior stays under `canViewMarketplace`.

## R5 platform master-data baseline

The `r5-platform-master-data` validation baseline proves:
- route metadata for hiring companies, recruitment agencies, subscriptions, and company subscription administration.
- SysAdmin-only capability fallback for Platform / Master data routes.
- live Platform / Master data navigation links while later platform groups remain linkless.
- deterministic list/detail/edit/company-subscription state helpers.
- separation between platform subscription administration and R4 HC-admin billing routes.

## R5 platform users and favorite-request baseline

The `r5-platform-users-and-favorite-requests` validation baseline proves:
- route metadata for platform `/users*` and `/favorites-request*` routes.
- URL-state sanitization for platform user list filters.
- favorite-request queue state and action-readiness helpers.
- live Platform / Users and requests navigation links while taxonomy is handled by `r5-platform-taxonomy`.
- separation from R4 `/users/invite`, `/team*`, `/favorites*`, and `/favorites/request*` org routes.

## R5 platform taxonomy baseline

The `r5-platform-taxonomy` validation baseline proves:
- route metadata for `/sectors`, `/sectors/:id`, `/sectors/:sector_id/subsectors`, and `/subsectors/:id`.
- live Platform / Taxonomy navigation link to `/sectors`.
- deterministic taxonomy state helpers and parent-child return behavior.
- taxonomy separation from settings subsection routing and platform master-data route ownership.

## R5 requisition authoring baseline

The `r5-requisition-authoring` validation baseline proves:
- route metadata for `/build-requisition`, `/job-requisitions*`, and `/requisition-workflows`.
- `canUseJobRequisitionBranching` requires HC admin requisition context.
- requisition draft/save/workflow-drift state helpers.
- settings-side `/requisition-workflows` ownership remains separate from Jobs-side authoring execution.


## R5 settings leftovers validation baseline

The `r5-settings-leftovers` validation baseline must prove:
- route metadata for `/settings/api-endpoints` and `/parameters/:settings_id?/:section?/:subsection?`.
- capability coverage for `canEnterSettings` and HC Admin-only `canManageApiEndpoints`.
- proof that RA, SysAdmin platform, integrations access, and HC non-admin contexts do not grant API endpoints access.
- compatibility resolution coverage for matched, unknown, unauthorized, unavailable, and unimplemented subsection keys.
- the closed recognized compatibility inventory: `hiring-flow`, `custom-fields`, `templates`, `reject-reasons`, and `api-endpoints`.
- API endpoint state-helper coverage for loading, ready, empty, validation-error, saving, saved, save-error, denied, and unavailable states.
- settings ownership separation proof: `/settings/api-endpoints` does not require integrations or SysAdmin capabilities, and `/parameters*` does not render a monolithic settings page.
- safe telemetry payload proof for compatibility resolution/fallback and API endpoint validation/save outcomes.

## R5 public/token requisition forms validation baseline

Requisition forms/download validation includes:
- Route metadata coverage for `/job-requisition-forms/:id`.
- Search parsing coverage for optional `download` mode and token search.
- Vitest coverage for valid, invalid, expired, inaccessible, unavailable, already-downloaded, and not-found access states.
- Vitest coverage for explicit download success, hardened request headers, and retryable same-route download failure.
- Separation proof that forms/download route id, state helpers, and telemetry are distinct from requisition approval approve/reject behavior.

## R5 integration token reconciliation baseline

ST8 reconciliation confirms no new R5 integration-token implementation is required because the generic tokenized families are already covered by R3 source/tests:
- `/integration/cv/:token/:action?` route metadata and CV callback workflow coverage.
- `/integration/forms/:token` route metadata plus sequential upload/persistence/retry workflow coverage.
- `/integration/job/:token/:action?` route metadata and normalized job callback presentation coverage.
- access tests for `canUseIntegrationTokenEntry`, token lifecycle, and route-family mismatch/inaccessible outcomes.

## R5 closeout validation baseline

R5 closeout validation includes:
- OpenSpec validation for archived and active R5 specs/changes through `openspec validate --all --strict`.
- Vitest coverage for platform route metadata/capabilities, requisition authoring helpers, settings API endpoints, `/parameters` compatibility, requisition forms/download, and integration token reconciliation evidence.
- Build proof through `npm run build`.
- Documentation synchronization across roadmap, R5 decision/open-points docs, screens, modules, capabilities, navigation, telemetry, and testing docs.

## Provider-specific integrations depth validation baseline

Validation covers:
- provider-family configuration sections for calendar, job-board, and HRIS;
- deterministic configuration states for ready, validation-error, saving, saved, save-error, unavailable, and unimplemented outcomes;
- auth lifecycle states for connect, reauthorize, auth-pending, auth-failed, connected, disconnected, degraded, and reauth-required outcomes;
- diagnostics states for running, passed, failed, logs-ready, degraded, unavailable, and retry outcomes;
- normalized scheduling, publishing, and HRIS sync/workflow readiness signals;
- separation between authenticated provider setup capabilities and unsigned token-entry capability assumptions;
- safe telemetry payloads for configuration, auth, and diagnostics events that exclude credentials, tokens, secrets, raw logs, signed URLs, and tenant-sensitive identifiers;
- route metadata preserving `/integrations/:id` direct entry and `/integrations` parent return while leaving public/token `/integration/*` route metadata unchanged.
