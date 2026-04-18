# Frontend Greenfield R0 Code Closeout Checklist

## Purpose

This document records the final R0 closeout state in executable terms.

It answers:
- which closeout items were encoded directly in the codebase
- which files now enforce the R0 contract
- which evidence justifies treating R0 as closed

## Source baseline

Built on top of:
- `r0-execution-plan.md`
- `r0-route-registration-plan.md`
- `observability-implementation-plan.md`
- current implementation in `../src/`

## Final status

As of **April 17, 2026**, R0 is **closed in code** for `recruit-frontend`.

The remaining non-code follow-up is optional repository administration in Bitbucket:
- enable required-build / merge-check enforcement if the team wants the smoke suite to block merges automatically

## 1. Executable code tasks completed

### Task 1.1 — build and env contract are encoded in the app bootstrap

Files:
- `../src/vite-env.d.ts`
- `../src/app/env.ts`
- `../src/app/providers.tsx`
- `../src/app/router.tsx`
- `../package.json`

Completed evidence:
- Vite env typing is declared through `vite/client`
- the router provider shape matches the installed TanStack Router API
- route telemetry is mounted from the router tree instead of being passed as unsupported `RouterProvider` children
- local bootstrap tolerates the documented `.env.example` defaults during smoke execution
- `npm run build` succeeds

### Task 2.1 — route metadata coverage is enforced as code

Files:
- `../src/lib/routing/route-contracts.ts`
- `../src/lib/routing/route-metadata.ts`
- `../src/app/router.tsx`

Completed evidence:
- `registeredRoutePaths` is the canonical list of current R0 route paths
- `routeMetadataRegistry` is typed as `Record<RegisteredRoutePath, RouteMetadata>`
- every route currently registered in `router.tsx` has explicit metadata coverage
- route telemetry no longer falls back to generic system metadata for known R0 routes

### Task 3.1 — typed destinations are handled safely in R0

Files:
- `../src/lib/routing/typed-destinations.ts`
- `../src/lib/routing/destination-resolver.ts`
- `../src/lib/routing/index.ts`
- `../src/shell/notifications/notifications-page.tsx`

Completed evidence:
- destination safety is centralized in `resolveTypedDestinationForR0`
- every `TypedDestination` kind is handled explicitly through one exhaustive switch
- unresolved Jobs / Candidate / Billing destinations are marked as `not-available-in-r0`
- notifications render a safe fallback target instead of implying live navigation into unregistered routes

### Task 4.1 — correlation propagation boundary is prepared

Files:
- `../src/lib/observability/correlation.ts`
- `../src/lib/api-client/correlation-aware-fetch.ts`
- `../src/lib/api-client/index.ts`

Completed evidence:
- the transport boundary owns `x-correlation-id` attachment
- correlation propagation is defined once through `withCorrelationHeaders`
- future HTTP clients can reuse `correlationAwareFetch` instead of wiring headers in leaf components

## 2. Versioned smoke validation completed

### Task 5.1 — the R0 smoke suite exists and passes locally

Files:
- `../scripts/r0-smoke-http.sh`
- `../tests/r0/http/routes.txt`
- `../playwright.r0.config.ts`
- `../tests/r0/ui/r0-shell.smoke.spec.ts`
- `../package.json`

Completed evidence:
- `npm run smoke:r0:http` validates HTTP route reachability from `tests/r0/http/routes.txt`
- `npm run smoke:r0:ui` validates current R0 UI behaviors through Playwright
- `npm run smoke:r0` is the single local smoke entrypoint
- Playwright retains screenshots, traces, and videos on failure

## 3. Bitbucket pipeline gate prepared

Files:
- `../bitbucket-pipelines.yml`

Completed evidence:
- Bitbucket Pipelines is configured to run the R0 smoke suite for pull requests
- the same smoke suite is configured for `main` and `master`
- pipeline artifacts retain the local Vite log plus Playwright report and test outputs
- the pipeline unsets `NO_COLOR` before smoke execution to avoid noisy Playwright warnings

Clarification:
- merge blocking is controlled in Bitbucket settings, not in repository files

## R0 close decision

R0 is treated as closed because:
- `npm run build` succeeds
- route metadata coverage is complete for current R0 routes
- unresolved destination kinds are explicitly guarded through the R0 destination resolver
- `npm run smoke:r0` succeeds locally
- the repository contains the Bitbucket pipeline definition for the same smoke gate
- no foundation-layer ambiguity remains that blocks Jobs (`R1`)

## Handoff to R1

The next implementation slice should be treated as **feature work in Jobs (`R1`)**, not as additional R0 repair.

Recommended next documents:
1. `roadmap.md`
2. `modules.md`
3. `screens.md`
4. `release-skill-workflow.md`

## Related documents

- `r0-execution-plan.md`
- `r0-route-registration-plan.md`
- `observability-implementation-plan.md`
- `implementation-readiness-checklist.md`
