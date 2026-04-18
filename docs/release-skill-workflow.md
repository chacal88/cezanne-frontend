# Frontend Greenfield Release Skill Workflow

## Purpose

This document defines the recommended AI-skill workflow for each greenfield release phase.

It answers:
- which repository-local skills should be preferred in R0, R1, and R2
- what each skill is expected to produce in each phase
- how to avoid using the wrong skill for the wrong type of work

## Source baseline

Built on top of:
- `README.md`
- `skills.md`
- `roadmap.md`
- `r0-route-registration-plan.md`
- `conventions.md`
- `observability-implementation-plan.md`

## Core rule

Use skills in the order that matches the type of work:

1. clarify scope
2. write or refine the spec
3. validate architecture or ADR impact
4. implement React code with performance discipline
5. refine component composition
6. refine design intent only after functional contracts are stable

## Release workflow

## R0 — foundation and routing contract

### Primary goals

R0 is about:
- app shell foundation
- route registration
- auth and shell behavior
- typed destination contracts
- capability and observability foundations

### Recommended skill order

1. `requirements-clarity`
2. `creating-spec`
3. `architecture`
4. `react-best-practices`
5. `composition-patterns`

### How to use them in R0

#### `requirements-clarity`
Use when:
- a route family is still underspecified
- a shell responsibility is still fuzzy
- a capability or notification rule is ambiguous

Expected output:
- clarified acceptance criteria
- explicit in-scope vs out-of-scope statement
- reduced ambiguity before touching implementation docs or code

#### `creating-spec`
Use when:
- a routing or observability contract still needs a durable document
- a foundation concern must be centralized into one artifact

Expected output:
- route, access, observability, or destination specs that remove ad hoc decisions

#### `architecture`
Use when:
- a new cross-cutting decision appears
- a pattern challenges existing ADRs or `architecture.md`

Expected output:
- trade-off summary
- ADR candidate or explicit confirmation that existing architecture still holds

#### `react-best-practices`
Use when:
- implementing providers, route containers, shell surfaces, and data-loading boundaries

Expected output:
- no obvious waterfalls
- disciplined loader/query boundaries
- avoidable re-renders prevented early

#### `composition-patterns`
Use when:
- building shell layout primitives
- designing reusable overlays and task-flow shells

Expected output:
- component APIs that do not collapse into boolean-prop sprawl


### Current repository status

As of the current repository state, the R0 foundation has already been scaffolded in `recruit-frontend/`.
The primary use of this section now is validation and controlled closure before moving to Jobs (`R1`), not fresh R0 planning.

### Avoid in R0

Avoid using `frontend-design` as a driver for foundation work.
R0 should not let visual refinement override route, access, or ownership contracts.

## R1 — jobs delivery

### Primary goals

R1 is about:
- jobs list
- jobs authoring
- jobs detail hubs
- jobs task overlays
- workflow-state preservation

### Recommended skill order

1. `requirements-clarity`
2. `creating-spec`
3. `react-best-practices`
4. `composition-patterns`
5. `architecture`
6. `frontend-design` when needed

### How to use them in R1

#### `requirements-clarity`
Use when:
- a jobs flow has legacy nuance not yet captured in docs
- a task overlay has unclear direct-entry or return behavior

#### `creating-spec`
Use when:
- jobs-specific behavior needs a denser implementation spec than the package-level docs
- a legacy fragment must be centralized into one jobs artifact

#### `react-best-practices`
Use when:
- implementing dense list/detail hubs
- handling filtering, pagination, and query invalidation
- protecting jobs screens from unnecessary re-renders

#### `composition-patterns`
Use when:
- building reusable jobs panels, headers, tab containers, and action shells

#### `architecture`
Use when:
- a jobs implementation pressures a cross-cutting pattern change
- route class behavior needs reconsideration

#### `frontend-design`
Use when:
- the jobs surfaces are functionally correct and need a stronger design pass
- dashboards or high-visibility jobs surfaces need refinement without changing contracts

## R2 — candidates delivery

### Primary goals

R2 is about:
- candidate detail hub
- candidate actions and workflow progression
- candidate database/search surfaces
- dense aggregate rendering across multiple subdomains

### Recommended skill order

1. `requirements-clarity`
2. `creating-spec`
3. `react-best-practices`
4. `composition-patterns`
5. `architecture`
6. `frontend-design` when needed

### How to use them in R2

#### `requirements-clarity`
Use when:
- candidate-action semantics differ by persona or capability
- dense candidate subsections still have unresolved ownership or entry rules

#### `creating-spec`
Use when:
- candidate-detail complexity needs explicit implementation sequencing
- a cross-subdomain candidate aggregate needs a more precise contract

#### `react-best-practices`
Use when:
- implementing the dense candidate hub
- coordinating multiple data sources and expensive UI trees
- protecting the hub from performance regressions

#### `composition-patterns`
Use when:
- building candidate action launchers
- structuring detail subsections that share context without overcoupling

#### `architecture`
Use when:
- candidate complexity reveals a flaw in an existing global pattern
- new abstractions are being proposed outside the current ADR set

#### `frontend-design`
Use when:
- candidate detail needs refinement after behavior is stable
- high-visibility candidate collaboration surfaces need a deliberate design pass

## Cross-release guardrails

### Use `requirements-clarity` first when
- the request changes scope
- ownership is unclear
- acceptance criteria are not obvious

### Use `creating-spec` first when
- multiple docs or modules are affected
- the same behavior is scattered across legacy evidence
- implementation would otherwise rely on chat memory only

### Use `architecture` first when
- the change affects routing, state ownership, observability, access, or package boundaries
- an ADR may be required

### Use `react-best-practices` first when
- the task is mostly implementation inside an already-accepted pattern
- performance and rendering discipline matter immediately

### Use `composition-patterns` first when
- the hardest part is API shape of reusable components
- multiple sibling surfaces need shared context without prop drilling

### Use `frontend-design` last when
- the functional contract is already settled
- design quality, polish, and distinctiveness are the main remaining concern

## Anti-patterns

Do not:
- start with design-oriented skills before route and capability contracts are stable
- use component-composition guidance as a substitute for domain architecture
- use React implementation skills to bypass unresolved product requirements
- create ADR-level changes from implementation instinct alone

## Suggested operating rhythm

For any non-trivial release task:

1. check whether scope is already clear in the docs
2. if not, run clarification
3. if the decision is durable, write or refine the spec
4. if the decision is cross-cutting, validate architecture/ADR impact
5. implement with React and composition discipline
6. apply visual refinement only after behavior is stable

## Related documents

- `skills.md`
- `roadmap.md`
- `r0-route-registration-plan.md`
- `conventions.md`
- `observability-implementation-plan.md`
