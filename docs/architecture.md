# Greenfield Frontend Architecture

## Purpose

This document defines the target architecture for the greenfield recruiter frontend.

It is meant to answer:
- which technologies we use and why
- how the codebase is organized
- how state, routing, access, and transport are implemented concretely
- how testing, observability, and release engineering are set up
- which decisions are durable and which are left to follow-up ADRs

It is the execution companion to:
- [roadmap.md](./roadmap.md)
- [domains.md](./domains.md)
- [modules.md](./modules.md)
- [screens.md](./screens.md)

## Source baseline

Built on top of:
- [`roadmap.md`](./roadmap.md) — release slicing and journey inventory
- [`domains.md`](./domains.md) — domain boundaries and ownership
- [`modules.md`](./modules.md) — domain implementation slices
- [`screens.md`](./screens.md) — route-classified screen and capability manifest
- `../../docs/frontend-2/frontend-state-management-strategy.md` — 5-layer state model
- `../../docs/frontend-2/frontend-modal-and-child-route-classification.md` — 7 route classes
- `../../docs/frontend-2/frontend-permission-decision-model.md` — access primitives
- `../../docs/frontend-2/frontend-data-shape-and-frontend-adapter-inventory.md` — adapter boundary
- `../../docs/frontend-2/frontend-url-and-history-behavior-spec.md` — URL behavior contract
- `../../docs/frontend-2/frontend-parity-test-strategy.md` — verification model (adapted for greenfield)
- `../../docs/frontend-design-system/*` — already-generated design tokens and component templates

## Non-goals

This document does **not**:
- redefine scope or releases (see roadmap)
- redefine domain ownership (see `domains.md`)
- replace the module registry (see `modules.md`)
- replace the route inventory (see `screens.md`)
- specify per-component API (see design-system docs and ADRs)
- prescribe UI visual decisions (see design-system docs)
- dictate backend architecture (only the contracts consumed by the frontend)

## Planning contract

The four greenfield docs have distinct responsibilities and should be read together:

- `roadmap.md` defines release slicing, journey priority, and go/no-go gates
- `domains.md` defines durable ownership boundaries and dependency edges
- `modules.md` defines the implementation slices that packages and teams build
- `screens.md` defines the route tree inventory, route class, persona visibility, and capability/flag surface

Architecture decisions in this document should assume those three documents are normative inputs, not optional references.

---

## 1. Architectural principles

Seven principles that every decision downstream must respect.

### P1. Domain isolation over framework features

Jobs and Candidate are dense domains. They own their models, queries, capabilities, and routes. Framework features (router, state library, forms) are tools the domains use — not the axis the codebase is organized around.

### P2. Route-first state ownership

Shareable context lives in the URL. The router is the first stop for any state decision. "State that should survive refresh / copy-link / back button" belongs in route state, period.

### P3. Server state is owned by a cache, not by components

Server state lives in TanStack Query. Components consume normalized domain models through adapters. No manual `useEffect + fetch + useState` triads.

### P4. Access is a capability decision, not a feature check

Components never read `user.role` or `flags.something`. They receive decision objects (`canEditJob`, `canScheduleInterview`). Decisions are computed once, at the route/domain boundary.

### P5. Task flows are isolated state containers

Every action (schedule, offer, reject, upload) is a transient container with its own state, its own success/cancel/failure contract, and its own parent-refresh rule. State does not leak to the hub or shell.

### P6. Route class dictates history, back, and refresh behavior

Each route declares its class (Page / PageWithStatefulUrl / RoutedOverlay / ShellOverlay / TaskFlow / EmbeddedFlow / Public/Token). Class defines URL-addressability, back behavior, close behavior, refresh behavior. Deviation requires an ADR.

### P7. Error paths are first-class

Every query, action, and route ships with: loading, empty, error, permission-denied, unavailable-feature, stale-state, retry. Primitives in the design system expose these as slots.

---

## 2. Stack decisions

Stack is committed for R0. Any change after R0 is an ADR.

| Layer | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| **Build** | Vite 5 + TypeScript 5 strict | Next.js, Remix, RSPack | SPA authenticated, no SSR need, fast HMR |
| **Framework** | React 18 | Solid, Svelte, Vue | Team familiarity; largest ecosystem for domain primitives (Radix, TanStack, React Hook Form) |
| **Router** | TanStack Router | React Router 7 data mode | Type-safe params/search, loader contract maps cleanly to route-boundary access resolution (P4) |
| **Server state** | TanStack Query v5 | SWR, Apollo client-only, RTK Query | Best invalidation model; pairs with TanStack Router loaders |
| **Client state (domain)** | Zustand | Redux Toolkit, Jotai | Per-domain stores; no global store by default |
| **Client state (task flow)** | Jotai atoms in provider scope | Zustand, React Context | Atoms die with provider → matches P5 |
| **Forms** | React Hook Form + Zod | Formik, tanstack-form | RHF perf + Zod schema reuse with backend contracts |
| **Styling** | Tailwind CSS + CVA (class-variance-authority) | CSS Modules, styled-components, vanilla-extract | Tokens already generated; CVA for type-safe variants |
| **Component primitives** | Radix UI (unstyled) | Headless UI, Ark UI | A11y correctness; we wrap to own the API |
| **Icons** | Lucide | Heroicons, custom | Tree-shakeable, comprehensive |
| **HTTP — REST** | `openapi-fetch` + `openapi-typescript` codegen | axios + manual types, ky | Types from OpenAPI spec; zero adapter boilerplate |
| **HTTP — GraphQL** | urql + `graphql-codegen` (typed-document-node) | Apollo Client, Relay | Lighter than Apollo; pairs with TanStack Query through document adapters |
| **Feature flags** | OpenFeature SDK + provider adapter (start self-hosted, swap to LaunchDarkly/Unleash later) | Direct LaunchDarkly SDK, custom | Provider-agnostic interface; swap without rewriting call sites |
| **Dates** | date-fns + date-fns-tz | dayjs, Luxon | Tree-shakeable; explicit tz handling |
| **Localization** | i18next + react-i18next + Crowdin-compatible locale files | Hardcoded strings, vendor-specific translation runtime | Translation-ready from R0 without forcing full locale coverage before core releases |
| **Testing — unit** | Vitest | Jest | Native Vite integration |
| **Testing — component** | Vitest + Testing Library | Cypress Component | Fast, runs with unit tests |
| **Testing — E2E/journey** | Playwright | Cypress | Multi-browser, better debugging, parallelization |
| **Testing — API mocking** | MSW | Nock, manual | Same mocks for unit/component/E2E |
| **Observability** | Provider-agnostic observability ports + AWS-first adapter strategy | Direct vendor SDK in app code, single-vendor hard coupling | Product code stays vendor-neutral while AWS deployments can map RUM, synthetics, service health, and tracing by concern |
| **Analytics** | Provider-agnostic analytics port + adapter (`AnalyticsPort`) | Direct vendor SDK in app code, GA4-first | Event model stays stable while provider choice remains open |
| **Linting** | ESLint (flat config) + Prettier | Biome | Biome still maturing; ESLint ecosystem larger |
| **Git hooks** | Lefthook | Husky, simple-git-hooks | Faster; no `node_modules` runtime requirement |
| **Package manager** | pnpm | npm, yarn, bun | Disk efficiency; better monorepo support when we split |

### What we are **not** using and why

- **Next.js / Remix / any SSR framework** — SPA authenticated app. SSR adds complexity without meaningful SEO or TTI gain for this surface.
- **Redux** — Rule S1 (route state) and Rule S2 (server state) absorb most of what Redux was traditionally used for. A global store is anti-pattern here (Rule S5).
- **Styled-components / Emotion** — runtime cost; tokens already fit Tailwind model.
- **Lerna / Nx** — start single-app (see §3). When we extract public-web, reevaluate.

### Closed decisions vs. open extension points

Closed for R0:
- React 18 + Vite + TypeScript strict
- TanStack Router + TanStack Query
- Zustand for domain UI state
- Jotai for transient task flows
- React Hook Form + Zod
- Tailwind + CVA + Radix
- OpenFeature abstraction for flags
- single-app repository shape through R2

Intentionally open behind stable interfaces:
- analytics **provider** (not the analytics event model)
- specific observability backends only where they are already behind wrappers
- eventual monorepo split timing after the triggers in §3 are met

Planning rule:
- keep the **interface and event contract fixed**
- keep the **provider implementation swappable**
- do not leave call sites vendor-specific

---

## 3. Repository structure

### R0 → R2: single-app

Start as a single Vite app. Domain isolation is enforced through folder boundaries and ESLint rules, not package boundaries. This is deliberately less complex than a monorepo while the team is still learning the domains.

```
recruit-frontend/
├── src/
│   ├── app/
│   │   ├── main.tsx              # Entry
│   │   ├── providers.tsx         # Query client, router, observability, theme
│   │   ├── router.tsx            # Route tree
│   │   └── env.ts                # Typed env (Zod-validated)
│   ├── shell/
│   │   ├── layout/               # Authenticated shell frame
│   │   ├── navigation/           # Role-aware nav
│   │   ├── notifications/        # Notification center + destination resolver
│   │   └── account/              # Account menu, user-profile overlay
│   ├── domains/
│   │   ├── auth/
│   │   │   ├── models/           # Session, token, SSO callback types
│   │   │   ├── api/              # Query hooks + mutations
│   │   │   ├── routes/           # Sign-in, forgot, reset, SSO callback
│   │   │   └── access/           # Identity context provider
│   │   ├── jobs/
│   │   │   ├── models/           # JobSummary, JobDetailView, JobAuthoringDraft, etc.
│   │   │   ├── api/              # Queries + mutations + adapters
│   │   │   ├── capabilities/     # canCreateJob, canEditJob, etc.
│   │   │   ├── routes/
│   │   │   │   ├── list/
│   │   │   │   ├── authoring/
│   │   │   │   ├── detail/
│   │   │   │   └── task-overlays/    # schedule, offer, reject, bid, cv
│   │   │   ├── components/       # Jobs-specific, NOT shared
│   │   │   └── state/            # Zustand store (domain UI state)
│   │   ├── candidates/
│   │   │   └── … (same shape)
│   │   ├── inbox/
│   │   └── dashboard/
│   ├── ui/                       # Design system
│   │   ├── primitives/           # Button, Input, Select, Checkbox, etc.
│   │   ├── layout/               # Shell frame, task container, page shells
│   │   ├── data/                 # List, table, filter bar, pagination
│   │   ├── states/               # Loading, empty, error, denied, stale, retry
│   │   └── tokens/               # Re-export from tokens package (or local)
│   ├── lib/
│   │   ├── api-client/           # openapi-fetch + urql clients
│   │   ├── access-control/       # Capability model, decision hooks
│   │   ├── routing/              # Route-class types, RoutedOverlay helpers
│   │   ├── feature-flags/        # OpenFeature wrapper
│   │   ├── observability/        # observability adapters, ports, and correlation utilities
│   │   ├── forms/                # RHF + Zod helpers
│   │   └── utils/
│   ├── testing/
│   │   ├── msw/                  # Handlers per domain
│   │   ├── fixtures/
│   │   └── helpers/
│   └── types/
│       ├── api.generated.ts      # OpenAPI codegen output
│       └── graphql.generated.ts  # GraphQL codegen output
├── tests/
│   └── e2e/                      # Playwright journey tests
├── public/
├── .env.example
├── eslint.config.js
├── playwright.config.ts
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### When to split into a monorepo

Split when any of these is true:
- Public/external slice (R3) is extracted into its own deployable (`apps/public-web`)
- A design-system package becomes a shared dependency for more than one app
- A domain is consumed by a second surface (mobile, embedded partner widget)

At that point, adopt Turborepo + pnpm workspaces. Layout:

```
recruit/
├── apps/
│   ├── recruiter-web/
│   └── public-web/
├── packages/
│   ├── ui/                       # Design system
│   ├── tokens/                   # Design tokens
│   ├── access-control/
│   ├── routing/
│   ├── api-client/
│   └── testing/
└── tools/
```

Splitting prematurely slows R0–R2. Splitting at R3 is the right moment.

### Recommended codebase patterns for R0–R2

Follow these patterns unless an ADR explicitly overrides them:

1. **Domain-first folders**
   - routes, adapters, models, capabilities, and tests live with the domain
2. **Route loader boundary**
   - route loaders resolve access, direct-entry validity, and identifiers before rendering
3. **Adapter-only transport exposure**
   - components never import generated API types directly
4. **Capability objects at the boundary**
   - components receive decisions, not raw role/flag checks
5. **Typed URL state**
   - search params are schema-validated and treated as product behavior
6. **Task-flow provider isolation**
   - transient flows own their own provider and invalidation rules
7. **Boundary-enforced imports**
   - domain isolation is lint-enforced, not convention-only

### ESLint rules that enforce domain isolation

Even in the single-app layout, `eslint-plugin-boundaries` or `eslint-plugin-import` with `no-restricted-paths`:

- `src/domains/jobs/**` cannot import from `src/domains/candidates/**` (or any other domain)
- `src/domains/**/components/**` cannot be imported from outside the domain
- `src/ui/**` cannot import from `src/domains/**` or `src/shell/**`
- `src/lib/**` cannot import from `src/domains/**`, `src/shell/**`, or `src/ui/**`
- Only `src/app/**` and `src/shell/**` can compose across domains

These rules catch the failure mode that made the legacy codebase a blob.

---

## 4. State management implementation

Maps the 5-layer model from the state management strategy to concrete libraries.

### 4.1 Route state → TanStack Router

- Path params and search params are fully typed via `createRoute` and Zod validators
- Search-param schemas are per-route; changes are type-checked at call sites
- Loaders resolve: route params → access check → entity identifiers → direct-entry validity
- Search-param changes use `navigate({ search: (prev) => ... })`, never local state sync

Example route definition for jobs list:

```ts
export const jobsListRoute = createRoute({
  path: '/jobs/$type',
  validateSearch: z.object({
    page: z.number().int().positive().default(1),
    search: z.string().optional(),
    label: z.string().optional(),
    asAdmin: z.boolean().optional(),
  }),
  loader: async ({ params, context }) => {
    const access = await context.resolveAccess({ for: 'jobsList', type: params.type });
    if (!access.canView) throw redirect({ to: '/dashboard' });
    return { access };
  },
});
```

### 4.2 Server state → TanStack Query v5

- One `useXxxQuery` hook per entity aggregate, co-located in `domains/<name>/api/`
- Queries return **adapted** domain models, not raw API payloads. Adapters live in `domains/<name>/api/adapters/`
- Query keys follow `[domain, entity, identifier, variant]` — e.g. `['jobs', 'detail', jobId, { section }]`
- Mutations invalidate narrowly: prefer `queryClient.invalidateQueries({ queryKey: [...] })` over full-cache invalidation
- Partial-load for hub aggregates: split into `useXxxHeader`, `useXxxSections`, so one failed section doesn't collapse the hub (addresses edge case #5)

### 4.3 Domain UI state → Zustand per domain

- One store per domain, scoped to interaction state that doesn't belong in URL or server cache
- Example: `jobs/state/authoring-ui.ts` holds section expansion, dirty flags, current editing section
- Domain stores are **not** exported outside the domain folder (ESLint-enforced)

### 4.4 Transient task-flow state → Jotai in provider scope

Task flows (schedule, offer, reject, upload) are rendered inside a `<TaskFlowProvider>` that owns a Jotai `Provider`. When the task unmounts, the provider unmounts, atoms are garbage-collected. State cannot leak.

```tsx
<TaskFlowProvider taskType="schedule" context={{ candidateId, jobId }}>
  <ScheduleInterviewOverlay />
</TaskFlowProvider>
```

Inside the provider: wizard step, form draft, submit state, retry state are Jotai atoms. Parent invalidation is declared on the provider:

```tsx
<TaskFlowProvider
  taskType="schedule"
  context={{ candidateId, jobId }}
  onSuccess={({ queryClient }) => {
    queryClient.invalidateQueries({ queryKey: ['candidates', 'detail', candidateId] });
  }}
/>
```

### 4.5 Shell/global state → single Zustand store

`useShellStore` holds only:
- authenticated session (identity + organization context)
- normalized navigation visibility
- notification counters (where genuinely cross-domain)
- durable user preferences (theme, locale)
- feature-flag evaluations (cached, refreshed per session)

Nothing else. Not "selected job", not "current candidate", not "return path". Those are route state or task-flow state.

### 4.6 State decision enforcement

Before introducing new state, engineer must answer the decision table from `frontend-2/frontend-state-management-strategy.md` §Decision table. PR template includes the table. Reviewer rejects PRs that bypass it.

---

## 5. Routing implementation

### 5.1 Route class mapping

From roadmap §6. Each class maps to a concrete implementation pattern.

| Class | TanStack Router primitive | Notes |
|---|---|---|
| Page | `createRoute` | Default |
| PageWithStatefulUrl | `createRoute` + `validateSearch` | Search params are product behavior |
| RoutedOverlay | Nested child route rendered in overlay slot on parent | See §5.2 |
| ShellOverlay | `useShellStore` flag + optional search-param alias | Not a content route |
| TaskFlow | `createRoute` with fullscreen layout | When overlay doesn't fit |
| EmbeddedFlow | Local React state, no route | Rare, internal helpers only |
| Public/Token | Top-level route under `/public/*` with separate layout | See §5.3 |

### 5.2 RoutedOverlay pattern

Candidate `schedule` overlay is a child route of candidate detail:

```
/candidate/$id
/candidate/$id/schedule
```

Parent route renders `<Outlet />` in an overlay slot. Overlay is a `<Dialog>` or `<Drawer>` from Radix. On close, navigate to parent path. On refresh at child URL, parent loader runs first (reconstructs context), then child loader runs (opens overlay with reconstructed parent).

- **Open**: `navigate({ to: '/candidate/$id/schedule', params: { id } })`
- **Close**: `navigate({ to: '/candidate/$id', params: { id } })`
- **Back**: browser back pops to parent (same behavior as close)
- **Refresh**: parent loads, then child loads, overlay opens with full context
- **Cancel**: same as close, but triggers `onCancel` in task provider

This is the only pattern that satisfies the URL-addressability rule in P6.

### 5.3 Public/Token routes

Separate layout (`PublicLayout`) without shell, nav, or account context. Separate error model with explicit states:

- `valid` → render flow
- `invalid` → "link is invalid"
- `expired` → "link has expired" + recovery action
- `used` → "this action is already complete"
- `inaccessible` → "you don't have access" (for partially-authenticated cases)

Public routes do **not** import from `src/shell/**`. ESLint-enforced.

### 5.4 Notification destination resolver

Lives in `src/shell/notifications/destination-resolver.ts`. Takes a notification payload, returns a typed destination:

```ts
type NotificationDestination =
  | { kind: 'route'; to: string; params: object; search?: object }
  | { kind: 'missing'; reason: 'deleted' | 'inaccessible' | 'feature-gated' }
  | { kind: 'legacy-redirect'; url: string }  // Only during initial cut-over
  | { kind: 'unknown' };
```

Notification click calls the resolver, handles each kind explicitly. No opaque `referer` redirects.

---

## 6. Access control implementation

### 6.1 Layers

Three layers, each with a single responsibility:

1. **Identity layer** — authenticated session. `useIdentity()` returns `{ actor, organizationContext }`.
2. **Primitive layer** — composite booleans from the session payload. `useAccessPrimitives()` returns `{ platformAdmin, hcAdmin, raAdmin, pivot: {...}, subscription: {...}, flags: {...} }`.
3. **Capability layer** — domain decisions. `useCapabilities()` returns `{ canCreateJob, canEditJob, canScheduleInterview, ... }`.

Components consume **only** the capability layer. Ever.

### 6.2 Evaluation site

Capabilities are evaluated at the **route loader**, not inside components:

```ts
loader: async ({ params, context }) => {
  const capabilities = await context.resolveCapabilities({
    for: 'jobDetail',
    jobId: params.id,
  });
  if (!capabilities.canView) throw redirect({ to: '/dashboard' });
  return { capabilities };
},
```

Components receive capabilities as prop or via context established at the route boundary. They do not re-evaluate.

### 6.3 Server-authoritative capabilities

Capability decisions are **computed on the server** and returned in the aggregate payload (e.g. `JobDetailView.actions`). The frontend caches and uses them; it does not re-derive them from primitives.

Why: the composite model (identity × admin × pivot × subscription × beta × config × entity state) is too complex to keep in sync across frontend and backend. One source of truth.

### 6.4 Primitive layer only used for nav

The shell's navigation visibility uses primitives (role, pivots, flags) because nav decisions are coarse. Domain actions use capabilities. Never mix.

---

## 7. API / transport layer

### 7.1 REST via OpenAPI codegen

- Backend ships OpenAPI spec (source of truth)
- `openapi-typescript` generates `src/types/api.generated.ts`
- `openapi-fetch` client uses the types directly
- Per-domain `api/` folder wraps generated endpoints in TanStack Query hooks + adapters

### 7.2 GraphQL via graphql-codegen

- `graphql-codegen` with `typed-document-node` preset generates typed documents
- urql client consumes typed documents
- Same adapter pattern: domain hook returns adapted model, not raw document

### 7.3 Adapter boundary

The frontend **never** consumes raw backend payloads in components. Adapters transform backend shape → canonical frontend model. Adapters live in `domains/<name>/api/adapters/` and are unit-tested against fixtures.

Why: backend contracts churn during R0–R2. Adapters localize the churn. Components stay stable.

### 7.4 Mixed transport strategy

- Jobs authoring and detail: likely REST (aggregator/BFF returns `JobDetailView`)
- Candidate detail: likely REST (aggregator/BFF returns `CandidateDetailView`)
- Real-time / subscription-shaped data (notifications, inbox): GraphQL subscriptions if available, else polling via Query
- Choice is per-endpoint, not global. Domain owns the decision.

### 7.5 Error model

All API errors normalize to:

```ts
type ApiError =
  | { kind: 'network' }
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden'; reason?: string }
  | { kind: 'not_found' }
  | { kind: 'validation'; fields: Record<string, string[]> }
  | { kind: 'conflict'; message: string }
  | { kind: 'server'; message: string };
```

UI primitives in `src/ui/states/` know how to render each kind. Components forward the error; they don't interpret it.

---

## 8. Feature flags

### 8.1 OpenFeature wrapper

`src/lib/feature-flags/` exposes:

```ts
export const useFlag = (key: FlagKey): boolean => { ... };
export const useFlags = (keys: FlagKey[]): Record<FlagKey, boolean> => { ... };
```

`FlagKey` is a union type derived from a registry. No string literals at call sites.

### 8.2 Flag registry

`src/lib/feature-flags/registry.ts` lists every flag the app uses, grouped by the 4 groups from roadmap §5:

- Group A (shell/identity)
- Group B (job-core)
- Group C (candidate-core)
- Group D (boundary)
- Later-release flags in their own group

Adding a flag: add to registry → TS picks it up → implement the gate. Orphan flags get flagged by a lint rule.

### 8.3 Provider swap

Start with a self-hosted JSON endpoint (simple). When growth demands, swap the OpenFeature provider adapter — call sites don't change.

---

## 9. Design system

### 9.1 Reuse what's already generated

`docs/frontend-design-system/` already has tokens, typography, spacing, and component specs. Implementation:

- Tokens from `colors.md`, `typography.md`, `spacing.md` → `tailwind.config.ts` (CSS variables + Tailwind theme extension)
- Component templates from `component-templates.md` → `src/ui/primitives/` (adapted to CVA for variants)
- Component specs from `components.md` → source of truth for Button, Input, Card, etc.

### 9.2 Primitives own behavior slots, not policy

Every primitive exposes slots for loading, error, empty, denied, disabled, retry. Primitives never decide:
- whether the user has permission (policy → access-control layer)
- which route to navigate to (routing → domain layer)
- which data to fetch (data → domain layer)

### 9.3 Storybook

Storybook is the visual contract surface. Every primitive and every state shell has a story. CI runs a Storybook snapshot check (Chromatic or Playwright visual).

### 9.4 Iconography

Lucide only. Icon imports are tree-shaken (per-icon import). ESLint rule forbids importing the full `lucide-react` bundle.

---

## 10. Forms

### 10.1 React Hook Form + Zod

- Zod schema per form, imported from the domain
- RHF resolver bridges schema → form validation
- Schema can be shared with backend contract if they agree on JSON Schema

### 10.2 Partial-save and dirty-state

Multi-section forms (job authoring) need partial-save semantics:

- Each section has its own Zod schema + RHF form
- Sections communicate through a shared domain store (Zustand) for dirty flags + save status
- Global "unsaved changes" indicator subscribes to the store
- Save action saves only dirty sections; server returns section-level success/failure

### 10.3 Draft model explicit (Rule S6)

Authoring is a draft, not a direct edit of the persisted entity. Draft lives in domain state or task-flow state depending on flow. Serializer that converts draft → API payload is unit-tested.

---

## 11. Testing strategy

Replaces the parity-test strategy (which was legacy-comparison). Greenfield tests the product against spec, not against a prior implementation.

### 11.1 Pyramid

| Level | Tool | Covers | Speed |
|---|---|---|---|
| Unit | Vitest | Adapters, capability evaluators, draft reducers, pure utilities | <1s per file |
| Component | Vitest + RTL + MSW | Component API + state contracts + error/denied/empty slots | 1–5s per file |
| Journey | Playwright + MSW (or staging) | End-to-end journeys from §3 | 10–60s per journey |
| Contract | Vitest + OpenAPI/GraphQL snapshots | API adapter stability vs. backend contracts | <5s per domain |
| Visual | Playwright visual / Chromatic | Design-system primitives + critical hub screens | Per-change |

### 11.2 Journey test acceptance

Every journey from roadmap §3 has a Playwright test that covers:

1. **Entry parity**: every valid entry path (direct URL, notification, domain-context entry)
2. **Access parity**: correct personas can complete; incorrect personas are blocked
3. **Behavior parity**: main task completes with side effects
4. **State-transition parity**: post-action state is correct (refresh, return-path, stale handling)
5. **Exception parity**: the edge cases from roadmap §10 that apply

No journey is "done" without coverage of all five.

### 11.3 MSW as the default boundary

MSW handlers per domain, reusable across unit/component/journey tests. A single change to a backend contract updates one MSW handler and propagates.

### 11.4 Staging-connected tests

A subset of journey tests run against a real staging backend nightly. MSW tests run on every PR. This catches contract drift without slowing the PR loop.

### 11.5 Coverage target

Not a line-coverage percentage. The metric is **journey coverage**: % of journeys from §3 with all five acceptance dimensions tested. Target: 100% of H-criticality journeys before the release's go/no-go gate.

---

## 12. Observability

### 12.1 Correlation ID per journey

Every user action at the shell level starts a correlation ID. The ID flows through:
- frontend observability context and breadcrumbs via the active adapter
- RUM/session context via the selected runtime adapter
- API request headers (`x-correlation-id`)
- backend logs and traces (via the propagated header)

A production incident can be traced from the user's click to the backend log in one query.

### 12.2 Structured events at journey boundaries

- Journey start (entry)
- Journey decision points (route transitions inside the journey)
- Journey end (success / cancel / failure / abandon)
- Task-flow lifecycle events (open, submit, retry, close)

Events go through an internal analytics interface first, then to the selected provider adapter.

### 12.2.1 Analytics interface contract

Product code must depend on a provider-agnostic port:

```ts
type AnalyticsEvent =
  | { name: 'journey_started'; journey: string; context?: Record<string, unknown> }
  | { name: 'journey_step'; journey: string; step: string; context?: Record<string, unknown> }
  | { name: 'journey_finished'; journey: string; outcome: 'success' | 'cancel' | 'failure'; context?: Record<string, unknown> }
  | { name: 'taskflow_event'; task: string; phase: 'open' | 'submit' | 'retry' | 'close'; context?: Record<string, unknown> };

interface AnalyticsPort {
  identify(actor: { id: string; organizationType?: string; isAdmin?: boolean }): void;
  track(event: AnalyticsEvent): void;
  page(view: { routeId: string; routeClass: string }): void;
  reset(): void;
}
```

Implementation rule:
- `src/lib/analytics/` exposes the port
- `src/app/providers.tsx` wires the chosen provider
- domains and shell import only the port, never vendor SDKs directly

This keeps the provider open while closing the event model and instrumentation shape.

### 12.2.2 AWS-oriented deployment recommendation

If the stack is deployed primarily on AWS, prefer:
- CloudWatch RUM for real user monitoring
- CloudWatch Synthetics for critical canaries
- CloudWatch Application Signals for service-level health and SLO visibility
- OpenTelemetry as the tracing standard behind AWS-compatible collectors/agents

Detailed guidance lives in `aws-observability-strategy.md`.

### 12.3 Error reporting

- the selected error-reporting adapter captures unhandled errors + React error boundaries + TanStack Query errors
- Error boundary granularity: one per route, one per task-flow provider, one at the shell root
- Error boundaries render recovery UI from `src/ui/states/`, not generic "something went wrong"

### 12.4 Performance

- Vite's build outputs per-domain chunks (code-split by domain routes)
- the selected RUM adapter tracks TTI and long tasks
- Target: TTI < 2s on authenticated shell entry; route-change < 500ms p95 for hubs

---

## 13. Release engineering

### 13.1 Branching

- `main` is deployable at all times
- Short-lived feature branches (merge within 2 working days)
- Releases are tags, not branches (R0, R1, etc.)

### 13.2 CI pipeline (per PR)

Runs in parallel:

1. `pnpm typecheck` — TS strict
2. `pnpm lint` — ESLint flat config + boundaries rules
3. `pnpm test:unit` — Vitest
4. `pnpm test:component` — Vitest component tests
5. `pnpm test:e2e:msw` — Playwright against MSW
6. `pnpm build` — Vite production build
7. `pnpm codegen:check` — ensure generated types are up-to-date

All must pass. Blocking.

### 13.3 Preview deploys

Every PR gets a preview deploy (Vercel or Netlify) pointing at the staging backend. Product + design review on the preview URL, not on local.

### 13.4 Release promotion

- `main` deploys to staging on every merge
- Promotion to production is a manual tagged release
- Feature flags gate in-progress work → `main` can contain unreleased features safely

### 13.5 Rollback

- Previous production build retained
- Rollback is a one-command redeploy of the previous tag
- Feature flag kill-switch is the primary rollback mechanism for individual features

---

## 14. ADR list (follow-ups)

Decisions durable enough to capture as ADRs in `recruit-frontend/docs/adrs/`:

- `0001-spa-over-ssr.md` — why Vite SPA, not Next.js/Remix
- `0002-tanstack-router-over-react-router.md`
- `0003-zustand-plus-jotai-over-redux.md`
- `0004-tailwind-plus-cva-over-css-in-js.md`
- `0005-openfeature-provider-abstraction.md`
- `0006-domain-isolation-via-folder-boundaries.md` — and when to split to monorepo
- `0007-server-authoritative-capabilities.md` — why capabilities live in the aggregate payload
- `0008-routed-overlay-pattern.md` — URL-addressability for action flows
- `0009-journey-test-over-coverage-percent.md`
- `0010-adapter-boundary-mandatory.md`
- `0011-correlation-id-convention.md`
- `0012-mixed-rest-graphql-strategy.md`

Each ADR is short (1 page): context, decision, consequences, alternatives rejected.

---

## 15. Resolution of open questions from roadmap §14

| # | Question | Resolution |
|---|---|---|
| 1 | Monorepo vs. single-app at R0 | **Single-app.** Split to Turborepo + pnpm workspaces when R3 extracts public-web or a second consumer emerges. |
| 2 | GraphQL-first vs. REST-first transport | **Mixed, per-endpoint.** Aggregator BFFs (REST) for hub views; GraphQL for subscription-shaped data. Adapter boundary hides the choice. |
| 3 | Router choice | **TanStack Router.** Type-safe params/search + loader contract maps to route-boundary access resolution. |
| 4 | Feature flag provider | **OpenFeature SDK** with a provider adapter. Start self-hosted JSON; swap to LaunchDarkly/Unleash later without changing call sites. |
| 4a | Analytics provider | **Provider remains open.** Close the event contract now, implement behind `AnalyticsPort`, choose provider later without changing product code. |
| 5 | How access-control capabilities are exposed | **Server-authoritative**, returned in aggregate payload. Frontend consumes decision objects via `useCapabilities()`. Route loader is the evaluation site. |
| 6 | Task-flow overlay structure | **RoutedOverlay pattern** (§5.2) — child route rendered in parent's overlay slot. Jotai provider owns transient state; invalidation declared on provider. |
| 7 | Observability + journey correlation ID | **Correlation ID per journey**, flows through the observability port, `x-correlation-id` header propagation, and backend logs/traces. AWS deployment mapping is defined in `aws-observability-strategy.md`. |

---

## 16. What this architecture explicitly rejects

- **A global Redux store** — violates S3/S5 in the state strategy
- **Reading `user.role` or flags directly in components** — violates P4
- **`useEffect + fetch + useState` triads for data fetching** — violates P3
- **Modals as pure React state without URL** when the modal is reachable externally — violates P6
- **Shared "utils" that import from domains** — breaks domain isolation
- **Backend payloads consumed directly in components** — violates adapter boundary
- **Feature-flag string literals at call sites** — orphan flags pile up
- **Line-coverage percent as the quality metric** — replaced by journey coverage

---

## 17. Next deliverables

1. `release-r0-plan.md` — detailed R0 tasks, sequencing, and ownership
2. `adrs/0001-*.md` through `adrs/0012-*.md` — capture durable decisions
3. `conventions.md` — code conventions, naming, route-file shape, adapter pattern, PR template (including state decision table)
4. Scaffold the actual Vite project per §3, with R0 foundation code in place
