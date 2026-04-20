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
