# Frontend Greenfield Observability Model

## Purpose

This document defines the observability model for the greenfield frontend.

It answers:
- what must be observable in the frontend
- which telemetry layers exist
- how observability relates to journeys, routes, task flows, and backend correlation
- which implementation rules prevent vendor-specific observability from leaking into product code

## Source baseline

Built on top of:
- `architecture.md`
- `conventions.md`
- `screens.md`
- `capabilities.md`
- `notification-destinations.md`
- `navigation-and-return-behavior.md`

## Observability goals

The frontend observability model must support four outcomes:

1. **Error diagnosis**
   - know what broke, where, and for whom
2. **Journey diagnosis**
   - know where users start, stall, fail, retry, cancel, and abandon
3. **Performance diagnosis**
   - know which routes, loaders, task flows, and interactions are slow
4. **Frontend ↔ backend correlation**
   - connect user interaction, API calls, and backend failures through a stable correlation id

## Telemetry layers

### O1. Error reporting

Captures:
- unhandled runtime exceptions
- React error boundary failures
- route-loader failures
- mutation failures that should be operationally visible
- task-flow failures that should be diagnosable

Minimum context:
- route id
- route class
- domain
- module
- user/org context
- correlation id
- entry mode where relevant

### O2. RUM / performance telemetry

Captures:
- shell boot timing
- route transition timing
- loader timing
- task-flow open/submit timing
- long tasks and degraded UI responsiveness

Primary questions:
- which surfaces are slow?
- which journeys feel slow?
- where is latency frontend-only vs API-driven?

### O3. Product analytics

Captures:
- journey start
- journey step
- journey success/failure/cancel
- task-flow lifecycle
- notification interaction

Primary questions:
- which journeys are used?
- where do users abandon?
- which capabilities or flags correlate with adoption or failure?

### O4. Correlation telemetry

Provides:
- a stable `correlation_id`
- propagation from frontend interaction → API request → backend logs
- linkage between captured errors and journey events

This is mandatory for critical operational flows.

## Provider model

Product code must not import vendor SDKs directly.

Use provider-agnostic ports behind `src/lib/observability/`:
- `TelemetryPort`
- `ErrorReportingPort`
- `RumPort`
- or one composed `ObservabilityPort`

Implementation rule:
- product code depends on the interface
- `src/app/providers.tsx` wires the chosen providers
- provider-specific code stays in one adapter layer

## Required contexts

### Standard event context

Every telemetry event should include, when available:
- `routeId`
- `routeClass`
- `domain`
- `module`
- `entryMode`
- `correlationId`

### User context

When authenticated:
- `userId`
- `organizationType`
- `isAdmin`
- `isSysAdmin`

### Feature and capability context

Include only the relevant subset:
- feature flags that materially changed the path
- capabilities that materially changed visibility or action outcome

Do not attach the full session payload blindly.

## Error boundary model

### Level 1: app-root boundary

Purpose:
- capture catastrophic shell/bootstrap failures

Behavior:
- show a global recovery state
- report error with app-shell context

### Level 2: route boundary

Purpose:
- isolate failure per page/hub route

Behavior:
- route failure should not collapse the entire shell
- render a route-level error state

### Level 3: task-flow boundary

Purpose:
- isolate failures in overlays and task flows

Behavior:
- task-flow failure should not collapse the parent hub
- render task-level recovery UI

## Performance model

Track at least:
- shell boot duration
- route loader duration
- route transition duration
- task-flow open duration
- task-flow submit duration
- API latency per critical domain aggregate

Initial targets:
- shell boot: p95 under 2s in normal conditions
- route transition to dense hubs: p95 under 500ms before data-complete view where feasible

## Journey observability rules

Each H-critical journey should emit:
- `journey_started`
- at least one meaningful step event where multi-step behavior exists
- terminal event: `success`, `failure`, or `cancel`

For task flows:
- `taskflow_opened`
- `taskflow_submitted`
- terminal event: `taskflow_succeeded`, `taskflow_failed`, or `taskflow_cancelled`

## Notification observability rules

Notifications must emit:
- notification clicked
- destination resolved
- destination denied or missing
- fallback used if applicable

This is important because notification routing bypasses normal navigation.

## Operational capture rules

Capture manually when:
- a failure is business-significant but not an unhandled exception
- a route fallback happens due to access or missing entity
- a task flow fails in a recoverable but operationally relevant way

Do not manually capture:
- every validation error field by default
- low-value UI interactions with no operational significance

## Anti-patterns

Do not:
- instrument directly with vendor SDKs inside domains
- emit events without route/journey context
- create event names ad hoc in random feature files
- use analytics events as a replacement for error reporting
- capture entire user/session objects in telemetry payloads

## Related documents

- `telemetry-events.md`
- `correlation-id-policy.md`
- `architecture.md`
