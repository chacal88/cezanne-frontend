# Frontend Greenfield Observability Implementation Plan

## Purpose

This document turns the observability strategy into an implementation order for R0.

It answers:
- what must exist in code before feature work starts
- which observability pieces ship in R0 versus later releases
- what the team should implement first to avoid rework

## Source baseline

Built on top of:
- `architecture.md`
- `observability.md`
- `telemetry-events.md`
- `correlation-id-policy.md`
- `aws-observability-strategy.md`
- `r0-route-registration-plan.md`

## R0 observability goal

R0 must establish a **working observability foundation**, not full coverage.

That foundation must provide:
- provider-agnostic frontend observability ports
- route-aware context attachment
- correlation id generation and propagation
- error boundaries at the right levels
- initial RUM and telemetry wiring
- baseline canary target list for AWS rollout

## R0 deliverables

### 1. Internal observability ports

Create internal interfaces under `src/lib/observability/`:
- `TelemetryPort`
- `ErrorReportingPort`
- `RumPort`
- optional composed `ObservabilityPort`

Rule:
- domain code imports only these ports
- no vendor SDK import is allowed in domains, shell, or route files

### 2. App provider wiring

Implement provider selection in `src/app/providers.tsx`.

R0 requirement:
- app boot initializes observability adapters once
- adapters receive environment config from typed env
- no feature code manually bootstraps telemetry

### 3. Standard telemetry context

Implement a shared context builder that can attach:
- `routeId`
- `routeClass`
- `domain`
- `module`
- `correlationId`
- authenticated actor context when available

This should be callable from:
- route loaders
- route components
- task-flow containers
- mutation wrappers

### 4. Correlation id propagation

R0 must support:
- correlation id creation at journey entry
- reuse through the active journey/task flow
- propagation in outbound API requests through `x-correlation-id`

Minimum implementation points:
- notification entry
- direct route entry
- task-flow submit
- critical mutation submit

### 5. Error boundary stack

Implement three levels:
- app-root boundary
- route boundary
- task-flow boundary

Each boundary must:
- render a user-facing recovery state
- capture the error through `ErrorReportingPort`
- attach route and correlation context where available

### 6. Initial event instrumentation

R0 should instrument only high-value events.

Required initial event groups:
- shell boot
- auth lifecycle
- route page view
- notification click and resolution
- task-flow open / submit / success / failure / cancel

Do not attempt full domain event coverage in R0.

### 7. Initial RUM wiring

R0 must capture:
- shell boot duration
- route transition timing
- loader timing for critical routes
- task-flow open and submit timing

This is enough to validate the port and adapter model.

### 8. AWS rollout targets

Prepare the first AWS-backed operational targets:
- CloudWatch RUM app config
- canary target list
- correlation-aware request headers
- backend trace/log acceptance of propagated correlation id

R0 does not require a finalized production dashboard set, but it does require the contracts that make dashboards possible.

## Implementation order

### Phase 1 — foundation

1. define ports
2. define typed env contract
3. wire adapters in `providers.tsx`
4. add correlation id utility
5. add HTTP header propagation

### Phase 2 — UI safety

6. add app-root boundary
7. add route boundary pattern
8. add task-flow boundary wrapper
9. add fallback capture helpers

### Phase 3 — first telemetry

10. instrument shell boot
11. instrument auth events
12. instrument page views
13. instrument notification routing
14. instrument task-flow lifecycle

### Phase 4 — AWS activation

15. map `RumPort` to CloudWatch RUM adapter
16. validate correlation id reaches APIs and backend logs
17. define Synthetics journey list
18. confirm Application Signals / tracing path in platform runtime

## Out of scope for R0

Leave for R1+ unless needed sooner:
- full event coverage for every domain action
- advanced funnel analysis
- exhaustive dashboard design
- domain-specific performance budgets beyond the critical routes
- provider-specific enhancements that leak into product code

## Acceptance checklist

R0 observability is ready when:
- provider SDKs are isolated behind ports
- every routed surface can attach standard route context
- correlation id reaches outbound requests
- app, route, and task-flow boundaries capture errors
- shell/auth/notification/task-flow events are visible end-to-end
- at least one AWS-backed RUM path is validated in a non-local environment
- canary targets are defined for critical entry flows

## Suggested ownership

| Area | Primary ownership |
|---|---|
| observability ports and providers | platform/frontend foundation |
| route context integration | routing foundation |
| task-flow instrumentation | domain owners |
| AWS adapter configuration | platform/infrastructure |
| correlation propagation to APIs | frontend + backend integration owners |

## Related documents

- `observability.md`
- `telemetry-events.md`
- `correlation-id-policy.md`
- `aws-observability-strategy.md`
- `r0-route-registration-plan.md`
