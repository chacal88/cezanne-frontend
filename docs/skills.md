# Frontend Greenfield Recommended Skills

## Purpose

This document maps the best repository-local AI skills under `.ai/rules/` to the greenfield frontend workflow.

It answers:
- which skills are best suited for planning the greenfield package
- which skills are best suited for implementation work
- when each skill should be preferred versus avoided

## Source baseline

Reviewed from:
- `../../.ai/rules/creating-spec/SKILL.md`
- `../../.ai/rules/requirements-clarity/SKILL.md`
- `../../.ai/rules/architecture/SKILL.md`
- `../../.ai/rules/composition-patterns/SKILL.md`
- `../../.ai/rules/react-best-practices/SKILL.md`
- `../../.ai/rules/frontend-design/SKILL.md`

## Selection criteria

A skill is recommended here only if it directly helps one of these jobs:
- clarify greenfield scope before implementation
- formalize planning and ADR decisions
- improve React implementation quality
- improve component API composition and maintainability
- preserve design intent when implementing screens

The goal is not to list every available skill. The goal is to define the default shortlist for this project.

## Recommended default stack

### 1. `requirements-clarity`

Best use:
- before implementation when scope is still ambiguous
- before expanding a release slice
- before introducing a new journey or domain module

Why it fits this project:
- the greenfield package is large and cross-cutting
- release slicing, domain boundaries, and route contracts must not drift because of vague requests
- it reinforces explicit acceptance criteria and scope boundaries

Use it for:
- R0/R1/R2 scope refinement
- screen/module additions that are not clearly covered yet
- feature requests that sound correct but are underspecified

Do not use it for:
- precise file-level tasks
- bug fixes with already-known reproduction and target files

### 2. `creating-spec`

Best use:
- writing or expanding execution documents
- turning cross-cutting discoveries into durable implementation specs
- centralizing fragmented behavior into one greenfield contract

Why it fits this project:
- `recruit-frontend/docs/` is itself a spec package
- many frontend behaviors are still being lifted from legacy evidence into greenfield-native contracts
- the project benefits from a disciplined planning workflow before code generation

Use it for:
- new planning docs
- migration-gap specs
- detailed R1/R2 feature implementation specs
- follow-up docs for domains with especially dense behavior

Do not use it for:
- trivial updates to existing text
- small implementation-only tasks that do not need a new spec

### 3. `architecture`

Best use:
- choosing patterns
- evaluating trade-offs
- writing ADRs
- validating whether a new decision actually needs architectural weight

Why it fits this project:
- the greenfield stack already contains several durable decisions
- new cross-cutting changes should be treated as explicit trade-offs, not ad hoc preferences
- this skill reinforces simplicity and ADR discipline

Use it for:
- new routing, state, observability, transport, or package-boundary decisions
- validating alternative patterns before changing `architecture.md` or ADRs
- documenting why a simpler approach is still sufficient

Do not use it for:
- purely visual refinements
- implementation details already governed by conventions

### 4. `react-best-practices`

Best use:
- implementing new React surfaces
- reviewing performance-sensitive code
- preventing client-side waterfalls and avoidable re-renders

Why it fits this project:
- the greenfield frontend is React-based
- dense hubs like jobs and candidates will become expensive quickly if loaders, queries, and components are not disciplined
- it aligns well with route-loader ownership and progressive instrumentation

Use it for:
- route components
- list/detail hubs
- task-flow containers
- code review of performance-sensitive modules

Do not use it as:
- the source of business architecture
- a substitute for domain boundaries or access rules

### 5. `composition-patterns`

Best use:
- designing reusable UI APIs
- building shell primitives and complex components without prop explosion
- structuring compound components and provider-backed composition

Why it fits this project:
- routed overlays, shell surfaces, and design-system primitives benefit from explicit composition
- it helps avoid boolean-prop sprawl in reusable components
- it complements the routed-overlay and domain-isolation ADRs

Use it for:
- shell layout primitives
- task-flow shells
- compound components in `ui/`
- reusable domain presentation components with shared context

Do not use it for:
- deciding route ownership
- replacing capability or route-boundary logic

### 6. `frontend-design`

Best use:
- implementing high-craft screens where visual intent matters
- translating a defined design direction into production-grade frontend code
- avoiding generic or framework-default UI output

Why it fits this project:
- the recruiter rewrite should not regress into generic utility-first screens
- Figma is a supporting design source and some high-visibility surfaces need a stronger design stance
- it is most useful after route/module contracts are already clear

Use it for:
- shell, dashboard, public pages, and visually important flows
- refinement passes after functional contracts are stable
- implementation that must preserve explicit design intent

Do not use it for:
- initial domain discovery
- access or capability modeling
- purely operational documentation work

## Optional support skills

These are useful, but not part of the default shortlist:

- `figma-generate-design` / `figma-implement-design` / `figma-use`
  - use only when a specific Figma-backed screen must be implemented or synchronized
- `react-view-transitions`
  - use only if the app later adopts transitions as an explicit UX decision
- backend-oriented architecture skills
  - not primary for this frontend package

## Recommended workflow by phase

| Phase | Default skill(s) | Primary outcome |
|---|---|---|
| scope clarification | `requirements-clarity` | clear scope and acceptance criteria |
| cross-cutting spec work | `creating-spec`, `architecture` | durable docs, ADR candidates, explicit trade-offs |
| route/module implementation | `react-best-practices`, `composition-patterns` | maintainable React surfaces and reusable UI APIs |
| design-sensitive implementation | `frontend-design` (+ Figma skills when needed) | visually intentional production code |
| architectural change review | `architecture` | decision quality and ADR discipline |

## Project rule

For work inside `recruit-frontend/docs/`, use this shortlist as the default AI-assistance workflow:

1. clarify when scope is fuzzy
2. write/specify before broad implementation
3. choose architecture patterns explicitly
4. implement React code with performance discipline
5. use composition rules for reusable UI
6. apply design-focused skills only after functional contracts are stable

## Related documents

- `README.md`
- `architecture.md`
- `conventions.md`
- `adrs/README.md`
