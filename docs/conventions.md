# Frontend Greenfield Conventions

## Purpose

This document defines the default frontend implementation conventions for the greenfield app.

It is written for execution, especially when requirements are clear but framework-level choices should not be reinvented in every feature.

## Source baseline

Built on top of:
- `README.md`
- `architecture.md`
- `domains.md`
- `modules.md`
- `screens.md`
- `capabilities.md`
- `access-model.md`
- `navigation-and-return-behavior.md`

## Core implementation rules

### C1. Build by domain, not by technical layer

Put feature code inside the owning domain:
- routes
- API adapters
- models
- capabilities
- tests

Do not create cross-domain folders such as:
- `src/pages/*` for unrelated product areas
- `src/hooks/*` with mixed business meaning
- `src/utils/*` that silently become a second app architecture

### C2. Route files own entry contracts

A route file must define:
- path and search params
- route class
- loader-level access check
- direct-entry validity
- fallback behavior

Components must not decide whether the route is valid after render if the route loader could decide it first.

### C3. Components consume view models, never raw transport payloads

UI components should receive:
- frontend-facing view models
- capability objects
- normalized enum values

UI components should not receive:
- raw GraphQL documents
- REST DTOs
- mixed backend field naming

### C4. Capabilities at the boundary, not in leaf components

Leaf components must not call raw role/flag checks.

Allowed:
- `capabilities.canEditJob`
- `capabilities.canRejectCandidate`

Not allowed:
- `user.role === ...`
- `feature('admin')`
- `feature('jobRequisition')`

### C5. URL state is product state

If state must survive:
- refresh
- copied URL
- notification entry
- browser back

then it belongs in the route, not in local component state.

### C6. Task flows are isolated containers

Schedule, offer, reject, upload, approval, and similar flows must:
- own their own provider scope
- define success/cancel/failure behavior explicitly
- define parent refresh behavior explicitly

No task flow may silently mutate parent state without an invalidation rule.

### C7. Shared UI stays dumb

Shared primitives in `ui/` may own:
- presentation
- variants
- loading/empty/error slots
- accessibility behavior

Shared primitives may not own:
- business routing
- domain permissions
- backend field interpretation

### C8. One file, one responsibility bias

Prefer:
- one route per route file
- one adapter per aggregate family
- one capability module per domain slice
- one test file per module/behavior cluster

Avoid oversized files that mix route, data, permissions, and rendering.

## File and folder conventions

## Domain shape

Each domain should prefer this structure:

```text
domains/<domain>/
  models/
  api/
    adapters/
    queries/
    mutations/
  capabilities/
  routes/
  components/
  state/
  tests/
```

### Route folder convention

Use folders named by user-facing surface:
- `list`
- `detail`
- `authoring`
- `task-flows`
- `settings`

Do not use generic names such as:
- `main`
- `index2`
- `misc`

### Naming convention

- route ids: noun-first, stable, explicit
- capability names: `canXxx`
- adapters: `<Entity><Variant>Adapter`
- query keys: `[domain, entity, identifier, variant]`
- view models: `<Entity><View|Summary|Detail|Draft>`

## Route conventions

### Route loader checklist

Every route loader should answer:
1. who can enter?
2. what params/search are valid?
3. what typed data must be loaded first?
4. what happens if access fails?
5. what happens if entity is missing?

### Overlay/task-flow checklist

Every routed overlay/task flow must define:
1. parent route
2. close target
3. cancel target
4. success target
5. parent refresh rule
6. direct-entry behavior

## Data conventions

### Adapter rule

Adapters are mandatory for:
- hub aggregates
- lists used in more than one component
- payloads with mixed naming or optional subsections

### Query rule

React components should not build transport queries inline.

Instead:
- route loader or domain hook decides query
- adapter normalizes result
- component renders normalized output

### Mutation rule

Each mutation must define:
- optimistic or non-optimistic policy
- invalidation targets
- validation error handling
- conflict/failure handling

## Access conventions

### Navigation

Navigation visibility uses:
- identity
- entitlements

### Route and action logic

Route and action logic uses:
- capabilities
- entity context
- route context

Do not use navigation visibility as authorization.

## Testing conventions

### Minimum per module

Every implementation-critical module should ship with:
- adapter/unit tests
- route/access tests
- component or journey coverage where behavior is dense

### Preferred testing split

- pure transforms → unit tests
- route/access contracts → unit/integration tests
- task-flow behavior → component + journey tests
- cross-domain user outcomes → Playwright journeys

## ADR trigger rules

Create an ADR when changing:
- router pattern
- domain boundary
- state ownership rule
- access model
- transport strategy
- provider abstraction
- route class behavior

Do not create an ADR for ordinary feature implementation inside an existing pattern.

## PR checklist

Every frontend PR should answer:
- which domain owns this change?
- which route/module owns entry?
- what capability gates it?
- what URL state exists?
- what parent return behavior exists?
- what adapter normalizes the payload?
- which tests prove behavior?

## AI-assisted workflow conventions

When using repository-local skills from `.ai/rules/`, prefer the shortlist in `skills.md`.

Default order:
1. `requirements-clarity` when scope is ambiguous
2. `creating-spec` when a change needs a durable planning artifact
3. `architecture` when a cross-cutting decision or ADR is involved
4. `react-best-practices` during React implementation and review
5. `composition-patterns` for reusable component APIs
6. `frontend-design` only after functional and routing contracts are already stable

Rule:
- do not use design-oriented or component-pattern skills to bypass domain, route, capability, or access decisions that belong in the greenfield docs
## Localization conventions

- new product strings should be externalized from the start
- use stable semantic keys, not sentence-as-key or visual naming
- do not block R0 on full translated coverage, but do block new hardcoded product copy in durable app code
- Crowdin is the sync mechanism, not the runtime architecture

