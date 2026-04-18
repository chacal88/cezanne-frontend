# Frontend Greenfield R0 Execution Plan

## Purpose

This document records the execution status of R0 and defines the handoff from R0 into R1.

It answers:
- what R0 foundation work has already been implemented in `recruit-frontend`
- what evidence validates the final R0 state
- what enables the handoff from R0 into Jobs (`R1`)

## Source baseline

Built on top of:
- `roadmap.md`
- `architecture.md`
- `r0-route-registration-plan.md`
- `observability-implementation-plan.md`
- `implementation-readiness-checklist.md`
- current implementation evidence in `../`

## Current R0 status

R0 is **closed in code** in `recruit-frontend`.

Confirmed implementation evidence:
- app bootstrap, providers, and typed env exist
- public routes and authenticated shell routes exist
- shell pages for dashboard, notifications, inbox, and user profile exist
- access boundary and capability evaluation foundation exist
- route contract and typed destination foundation exist
- observability ports, correlation utilities, and route telemetry observer exist
- route metadata coverage is explicit for the current R0 route set
- unresolved typed-destination families are handled intentionally for R0
- HTTP and UI smoke validation exist as executable checks
- GitHub Actions workflow configuration exists for the R0 smoke gate

R0 is therefore ready for **handoff into R1**, not for further foundation repair.

## Implementation evidence map

| Concern | Current evidence in `recruit-frontend` |
|---|---|
| app bootstrap | `src/app/main.tsx`, `src/app/providers.tsx` |
| typed env | `src/app/env.ts`, `.env.example`, `src/vite-env.d.ts` |
| public/auth route family | `src/domains/auth/routes/public-pages.tsx`, `src/app/router.tsx` |
| authenticated shell root | `src/shell/layout/authenticated-shell.tsx`, `src/app/router.tsx` |
| dashboard / notifications / inbox | `src/domains/dashboard/dashboard-page.tsx`, `src/shell/notifications/notifications-page.tsx`, `src/domains/inbox/inbox-page.tsx` |
| user profile shell overlay | `src/shell/account/user-profile-overlay.tsx` |
| access boundary and capabilities | `src/lib/access-control/*` |
| route ids / route classes | `src/lib/routing/route-contracts.ts` |
| route metadata coverage | `src/lib/routing/route-metadata.ts` |
| typed destinations | `src/lib/routing/typed-destinations.ts`, `src/lib/routing/destination-resolver.ts` |
| observability ports and correlation | `src/lib/observability/*`, `src/lib/api-client/*` |
| HTTP smoke validation | `scripts/r0-smoke-http.sh`, `tests/r0/http/routes.txt` |
| UI smoke validation | `playwright.r0.config.ts`, `tests/r0/ui/r0-shell.smoke.spec.ts` |
| GitHub smoke gate | `.github/workflows/r0-smoke.yml` |

## Final R0 validation outcome

### Passed structurally and executably

The repository now demonstrates the intended R0 foundation shape and executable proof:
- route roots exist for public and authenticated surfaces
- shell-owned surfaces exist
- capability/access foundation exists
- observability foundation exists
- typed destination contracts are reserved and R0-safe
- `npm run build` succeeds
- `npm run smoke:r0` succeeds locally against the current codebase

### Confirmed closeout evidence

Confirmed in code:
- dependencies install successfully with `npm install`
- production build succeeds with `npm run build`
- route metadata covers the current registered R0 routes intentionally
- unresolved Jobs / Candidate / Billing destinations resolve through explicit R0-safe behavior
- local smoke tooling can bootstrap env values from `.env.example` without hardcoding API defaults into application code
- Playwright failure artifacts are retained for diagnosis

Confirmed in repository configuration:
- `.github/workflows/r0-smoke.yml` runs `npm run smoke:r0` for pull requests and primary branches

Clarification:
- merge policy is a GitHub repository administration concern, but the smoke gate workflow is now committed in source and ready to be required by branch protection if desired

## Exit criteria for R0

R0 should be considered complete when all of the following are true:

- [x] foundation source structure is present
- [x] route registration matches the R0 plan
- [x] shell routes render successfully in a local run/build
- [x] typed destination contracts are safe for unresolved target families
- [x] observability foundation works at least in noop/local mode
- [x] environment variables required by typed env are documented and usable
- [x] no unresolved architectural blocker remains for entering Jobs (`R1`)

## R1 unlock rule

Jobs (`R1`) may start because:
- R0 exit criteria are satisfied in code
- remaining operational work is repository-administration work, not foundation repair
- Jobs-specific scope can now be taken from `modules.md` and `screens.md`

## Recommended next actions

### Immediate

1. treat R0 as closed for engineering work in `recruit-frontend`
2. use `git add`, `git commit`, and `git push` together with `npm run smoke:r0` as the default repository workflow
3. optionally require the `R0 Smoke` GitHub Actions workflow through branch protection
4. start `R1` Jobs implementation using:
   - `roadmap.md`
   - `modules.md`
   - `screens.md`
   - `skills.md`
   - `release-skill-workflow.md`

### Do not reopen R0 for

- Jobs-specific screen implementation
- Candidate flow implementation
- visual refinement unrelated to the foundation contract
- future destination families that belong to later releases

## Related documents

- `r0-route-registration-plan.md`
- `r0-code-closeout-checklist.md`
- `implementation-readiness-checklist.md`
- `release-skill-workflow.md`
- `observability-implementation-plan.md`
- `skills.md`
