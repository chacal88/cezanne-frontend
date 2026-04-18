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
- the next engineering slice is **Jobs (`R1`)**

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
15. `localization-strategy.md` — i18n and Crowdin readiness strategy for the app
16. `i18n-implementation-plan.md` — concrete implementation plan for i18n runtime, locale files, and Crowdin sync
17. `skills.md` — recommended repository-local AI skills for planning and implementation
18. `release-skill-workflow.md` — skill usage by release phase (`R0`, `R1`, `R2`)
19. `implementation-readiness-checklist.md` — go/no-go checklist before implementation starts
20. `r0-execution-plan.md` — final R0 execution record and handoff into `R1`
21. `r0-code-closeout-checklist.md` — final executable closeout evidence for R0

### 4. Then move into R1

22. `r0-route-registration-plan.md` — reference contract that R1 should extend, not redefine
23. `conventions.md` — coding conventions and default implementation patterns
24. `adrs/README.md` — durable architectural decisions that should not be re-debated feature-by-feature
25. `roadmap.md` + `modules.md` + `screens.md` — primary starting point for Jobs (`R1`)

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
| `localization-strategy.md` | defines the i18n and Crowdin readiness contract |
| `i18n-implementation-plan.md` | defines the concrete implementation order for i18n and Crowdin sync |
| `skills.md` | defines the recommended repository-local skill shortlist |
| `release-skill-workflow.md` | defines how the skill shortlist should be used across `R0`, `R1`, and `R2` |
| `implementation-readiness-checklist.md` | defines the go/no-go checklist before implementation starts |
| `r0-execution-plan.md` | records the final R0 execution state and R1 handoff |
| `r0-code-closeout-checklist.md` | records the executable closeout evidence for R0 |
| `r0-route-registration-plan.md` | defines the minimum R0 route-registration contract |
| `conventions.md` | defines implementation conventions and default patterns |

## Source relationship

- `../../docs/frontend-2/` remains the primary migration-analysis evidence base.
- `recruit-frontend/docs/` is the active greenfield execution package derived from that evidence.
- `../../frontend/` remains the source of truth for current business behavior until replacement code exists.
- Figma is complementary visual evidence, not the canonical source of route or capability truth.
