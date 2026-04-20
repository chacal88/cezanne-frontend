# Frontend Greenfield Documentation Index

## Purpose

This folder contains the active greenfield planning and execution package for rebuilding the recruiter frontend.

It converts the migration analysis in `../../docs/frontend-2/` into an execution-ready baseline for:
- domain ownership
- module decomposition
- screen and route registration
- access and capability modeling
- notification routing
- release-by-release implementation planning

## Current execution status

Confirmed:
- **R0 is closed in code** in `recruit-frontend`
- the current implementation includes build proof, route metadata coverage, typed-destination safety, smoke validation, and a GitHub Actions smoke workflow
- the repository now uses a **Git/GitHub workflow with the R0 smoke gate defined in source**
- **R0 and R1 are closed in code**
- a pre-R2 hardening pass is now in place for testing and browser-side request/security boundaries
- **R2 is closed in code**
- the current source also includes the initial archived **R3** baselines for:
  - public application / survey / shared job
  - tokenized chat
  - external review (interview request, review-candidate, interview-feedback)
  - requisition approval
  - provider integration callbacks
  - careers/application/job-listings settings
- the previously open provider integration callback family is now represented in source under the `integrations` domain token-entry slice
- the active **R4** planning package is now consolidated in:
  - `r4-master-plan.md`
  - `r4-operational-settings-open-points.md`
  - `r4-candidate-database-open-points.md`
  - `r4-team-and-favorites-open-points.md`
  - `r4-integrations-open-points.md`
  - `r4-reports-open-points.md`
  - `r4-billing-marketplace-open-points.md`
- initial **R5** planning has started with:
  - `r5-decision-register.md`
  - `r5-master-plan.md`
  - `r5-sysadmin-open-points.md`
  - `r5-requisition-authoring-open-points.md`
  - `r5-settings-and-token-open-points.md`

## Recommended reading order

### 1. Start here: scope and target architecture

1. `roadmap.md` — release slicing, journey priority, and release gates
2. `architecture.md` — target technical architecture and execution contract

### 2. Then define what exists

3. `domains.md` — definitive domain boundaries and dependencies
4. `modules.md` — implementation modules inside each domain
5. `screens.md` — executable route/screen manifest with personas, capabilities, flags, and release targets

### 3. Then define how access and routing work

6. `access-model.md` — canonical access categories and precedence rules
7. `capabilities.md` — `canXxx` catalog, decision layers, and deny behavior
8. `notification-destinations.md` — typed notification destination contract
9. `navigation-and-return-behavior.md` — deep-link, refresh, back, and close/cancel behavior
10. `observability.md` — observability model, telemetry layers, and capture rules
11. `telemetry-events.md` — event taxonomy
12. `correlation-id-policy.md` — correlation creation and propagation policy
13. `aws-observability-strategy.md` — recommended AWS-backed observability approach
14. `observability-implementation-plan.md` — R0 implementation order for telemetry, boundaries, and AWS activation
15. `testing.md` — current Vitest + Testing Library + Playwright contract
16. `security.md` — browser-side header and request-hardening baseline
17. `localization-strategy.md` — i18n and Crowdin readiness strategy for the app
18. `i18n-implementation-plan.md` — concrete implementation plan for i18n runtime, locale files, and Crowdin sync
19. `skills.md` — recommended repository-local AI skills for planning and implementation
20. `release-skill-workflow.md` — skill usage by release phase (`R0`, `R1`, `R2`)
21. `implementation-readiness-checklist.md` — go/no-go checklist before implementation starts
22. `r0-execution-plan.md` — final R0 execution record and handoff into `R1`
23. `r0-code-closeout-checklist.md` — final executable closeout evidence for R0

### 4. Then move into the next implementation slice

24. `r0-route-registration-plan.md` — reference contract that later slices should extend, not redefine
25. `conventions.md` — coding conventions and default implementation patterns
26. `adrs/README.md` — durable architectural decisions that should not be re-debated feature-by-feature
27. `roadmap.md` + `modules.md` + `screens.md` — primary starting point for Candidate (`R2`) and later slices
28. `r4-master-plan.md` — consolidated sequencing, dependencies, and first-change queue for `R4`
29. `r4-*-open-points.md` — per-area decision registers before opening each `R4` change
30. `r5-decision-register.md` — initial decision register for platform and long-tail planning before opening executable `R5` changes
31. `r5-master-plan.md` — consolidated R5 sequencing and first OpenSpec queue
32. `r5-sysadmin-open-points.md` — SysAdmin foundation, master-data, users, favorite-request, and taxonomy decisions
33. `r5-requisition-authoring-open-points.md` — requisition authoring and hiring-flow workflow boundary decisions
34. `r5-settings-and-token-open-points.md` — settings leftovers, public/token leftovers, and integration token reconciliation decisions

## Package roles

| Document | Primary role |
|---|---|
| `roadmap.md` | defines why and when |
| `architecture.md` | defines how the target frontend is built |
| `domains.md` | defines ownership boundaries |
| `modules.md` | defines implementation slices |
| `screens.md` | defines what must be routed and shipped |
| `access-model.md` | defines access categories and precedence |
| `capabilities.md` | defines concrete capability decisions |
| `notification-destinations.md` | defines notification destination typing |
| `navigation-and-return-behavior.md` | defines browser and return-path behavior |
| `observability.md` | defines telemetry layers and observability rules |
| `telemetry-events.md` | defines the initial event taxonomy |
| `correlation-id-policy.md` | defines correlation id creation and propagation |
| `aws-observability-strategy.md` | defines the recommended AWS observability mapping |
| `observability-implementation-plan.md` | defines the R0 delivery order for observability |
| `testing.md` | defines the current testing contract and validation commands |
| `security.md` | defines the browser-side security and request-hardening baseline |
| `localization-strategy.md` | defines the i18n and Crowdin readiness contract |
| `i18n-implementation-plan.md` | defines the concrete implementation order for i18n and Crowdin sync |
| `skills.md` | defines the recommended repository-local skill shortlist |
| `release-skill-workflow.md` | defines how the skill shortlist should be used across `R0`, `R1`, and `R2` |
| `implementation-readiness-checklist.md` | defines the go/no-go checklist before implementation starts |
| `r0-execution-plan.md` | records the final R0 execution state and R1 handoff |
| `r0-code-closeout-checklist.md` | records the executable closeout evidence for R0 |
| `r0-route-registration-plan.md` | defines the minimum R0 route-registration contract |
| `conventions.md` | defines implementation conventions and default patterns |
| `r5-decision-register.md` | records R5 platform and long-tail decisions before executable planning starts |
| `r5-master-plan.md` | consolidates R5 sequencing, dependencies, and first OpenSpec queue |
| `r5-sysadmin-open-points.md` | records SysAdmin open decisions before R5 platform implementation starts |
| `r5-requisition-authoring-open-points.md` | records requisition authoring and hiring-flow workflow open decisions before R5 implementation starts |
| `r5-settings-and-token-open-points.md` | records settings leftovers, public/token leftovers, and integration token reconciliation decisions before R5 implementation starts |

## Source relationship

- `../../docs/frontend-2/` remains the primary migration-analysis evidence base.
- `recruit-frontend/docs/` is the active greenfield execution package derived from that evidence.
- `../../frontend/` remains the source of truth for current business behavior until replacement code exists.
- Figma is complementary visual evidence, not the canonical source of route or capability truth.
