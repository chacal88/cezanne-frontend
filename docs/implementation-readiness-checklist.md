# Frontend Greenfield Implementation Readiness Checklist

## Purpose

This document defines the minimum readiness checks before implementation starts for a greenfield release slice.

It answers:
- what must be true before coding begins
- which documents must already be aligned
- which gaps should block implementation versus which can be handled later

## Source baseline

Built on top of:
- `README.md`
- `roadmap.md`
- `architecture.md`
- `domains.md`
- `modules.md`
- `screens.md`
- `skills.md`
- `release-skill-workflow.md`
- `r0-route-registration-plan.md`
- `observability-implementation-plan.md`

## How to use this checklist

Use this checklist before starting:
- a release foundation effort
- a new domain/module implementation
- a non-trivial routed screen family
- a cross-cutting refactor that affects architecture or routing

Rule:
- if a blocking item is unresolved, do not start implementation by improvisation
- resolve the gap in docs first or make the decision explicit through the right skill and ADR path


## Current repository status

Based on the current `recruit-frontend/` state, the repository appears to satisfy the **structural** R0 readiness conditions already.
Use this checklist primarily to close validation gaps and determine whether R1 can start safely.

## Blocking readiness checks

These must be true before implementation starts.

### 1. Scope is explicit

- [ ] the target release slice is identified (`R0`, `R1`, or `R2`)
- [ ] in-scope outcomes are explicit
- [ ] out-of-scope items are explicit
- [ ] no critical product ambiguity remains for the slice

Primary sources:
- `roadmap.md`
- `release-skill-workflow.md`

### 2. Domain ownership is explicit

- [ ] every affected screen belongs to a defined domain in `domains.md`
- [ ] shared vs shell vs domain ownership is explicit
- [ ] dependency edges to other domains are known
- [ ] no screen is being implemented under an undefined ownership model

Primary sources:
- `domains.md`
- `modules.md`

### 3. Module decomposition is explicit

- [ ] the affected module exists in `modules.md`
- [ ] the implementation is scoped to a known module, not a vague area
- [ ] module responsibilities are not mixed with adjacent modules
- [ ] release target for the module is understood

Primary source:
- `modules.md`

### 4. Screen and route contract is explicit

- [ ] every screen or route in scope exists in `screens.md`
- [ ] route class is defined
- [ ] parent/return behavior is defined
- [ ] direct-entry behavior is known
- [ ] personas and release targets are assigned

Primary sources:
- `screens.md`
- `navigation-and-return-behavior.md`

### 5. Access and capability rules are explicit

- [ ] relevant personas are known
- [ ] relevant capability decisions are known
- [ ] feature flags or entitlement dependencies are known
- [ ] deny/fallback behavior is defined

Primary sources:
- `access-model.md`
- `capabilities.md`
- `screens.md`

### 6. Architecture fit is explicit

- [ ] the work fits the current architecture without hidden pattern changes
- [ ] if a cross-cutting change is needed, it is captured as an ADR or explicit architecture update
- [ ] there is no silent deviation from route, state, access, or adapter rules

Primary sources:
- `architecture.md`
- `conventions.md`
- `adrs/README.md`

### 7. Observability baseline is known

- [ ] required telemetry for the slice is known
- [ ] error boundary expectations are known
- [ ] correlation requirements are known for critical flows
- [ ] R0 foundation dependencies are understood when applicable

Primary sources:
- `observability.md`
- `telemetry-events.md`
- `correlation-id-policy.md`
- `observability-implementation-plan.md`

## Non-blocking but recommended checks

These should usually be true, but can sometimes be completed during implementation.

### 8. Figma or design evidence exists where needed

- [ ] important visual surfaces have design references where available
- [ ] Figma is mapped as supporting evidence, not as route truth
- [ ] visually sensitive screens have enough design intent to avoid generic output

Primary sources:
- `screens.md`
- Figma references

### 9. Skill path is chosen

- [ ] the right skill sequence is obvious for the task
- [ ] unclear scope will be clarified before coding
- [ ] architecture-impacting work will use the architecture/ADR path
- [ ] React implementation work will use performance and composition guidance

Primary sources:
- `skills.md`
- `release-skill-workflow.md`

### 10. Integration dependencies are visible

- [ ] upstream backend or gateway dependencies are known
- [ ] typed destination or notification dependencies are known where relevant
- [ ] settings or entitlement dependencies are known where relevant

Primary sources:
- `notification-destinations.md`
- `screens.md`
- current `frontend/` behavior for validation

## Release-specific readiness

## R0 checklist

Implementation may start only if:

- [ ] authenticated shell routes are defined
- [ ] public/token routes are defined
- [ ] route registration plan is explicit
- [ ] typed destination registry expectations are explicit
- [ ] capability foundation is explicit
- [ ] observability foundation plan is explicit

Primary sources:
- `r0-route-registration-plan.md`
- `capabilities.md`
- `observability-implementation-plan.md`

## R1 checklist

Implementation may start only if:

- [ ] jobs modules are scoped and separated
- [ ] jobs list, authoring, detail, and task overlays are already enumerated
- [ ] workflow-state and URL-state behavior are explicit
- [ ] parent-return behavior for jobs actions is explicit

Primary sources:
- `modules.md`
- `screens.md`
- current `frontend/` jobs routes for business-rule validation

## R2 checklist

Implementation may start only if:

- [ ] candidates modules are scoped and separated
- [ ] candidate detail and action surfaces are enumerated
- [ ] candidate database/search access rules are explicit
- [ ] dense aggregate ownership is explicit across candidate subsections

Primary sources:
- `modules.md`
- `screens.md`
- current `frontend/` candidate routes for business-rule validation

## Stop conditions

Stop and return to planning if any of these is true:

- [ ] a screen cannot be placed in a domain or module confidently
- [ ] route class is still disputed
- [ ] capability logic is not explicit enough to define deny behavior
- [ ] implementation requires changing a cross-cutting pattern without an ADR decision
- [ ] a visually important screen has no usable design intent and would force arbitrary UI invention

## Minimum sign-off summary

Before coding starts, the implementation owner should be able to answer:

1. what release is this in?
2. what domain owns it?
3. what module owns it?
4. what routes/screens are included?
5. what capability gates it?
6. what happens on direct entry, back, close, cancel, success, and failure?
7. what telemetry/error/correlation is required?
8. which skill path applies if new ambiguity appears?

If these answers are not available, the work is not ready.

## Related documents

- `skills.md`
- `release-skill-workflow.md`
- `roadmap.md`
- `architecture.md`
- `screens.md`
- `r0-route-registration-plan.md`
- `observability-implementation-plan.md`
