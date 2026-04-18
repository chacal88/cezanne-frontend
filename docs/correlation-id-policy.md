# Frontend Greenfield Correlation ID Policy

## Purpose

This document defines how correlation ids are created, propagated, and rotated in the greenfield frontend.

## Source baseline

Built on top of:
- `observability.md`
- `notification-destinations.md`
- `navigation-and-return-behavior.md`

## Policy goals

The correlation id policy exists to:
- connect user intent to frontend telemetry
- connect frontend telemetry to API requests
- connect API requests to backend logs
- reduce guesswork during incident analysis

## Canonical field name

Use:
- telemetry field: `correlationId`
- HTTP header: `x-correlation-id`

## When a correlation id is created

Create a new correlation id at the start of:
- authenticated shell bootstrap
- login or SSO/SAML completion flow
- notification-driven navigation into a destination
- direct entry into a critical H-journey
- task-flow submission for critical recruiter actions

## When a correlation id is reused

Reuse the current correlation id across:
- route transitions inside the same journey
- loaders and API calls caused by the same journey step
- task-flow retries when they are clearly the same operational attempt

## When a correlation id is rotated

Rotate when:
- a new top-level journey starts
- the user intentionally starts a separate task unrelated to the previous flow
- the session resets or identity changes

## Required propagation

The active correlation id should flow into:
- telemetry events
- error reporting context
- RUM/performance spans where supported
- all API requests initiated inside the active journey

## Scope examples

### Example 1: notification → candidate detail

1. user clicks notification
2. correlation id is created
3. destination resolves
4. candidate route loader runs
5. candidate API requests include `x-correlation-id`
6. any frontend or backend failure can be linked to the same journey

### Example 2: candidate offer flow

1. user opens candidate offer flow
2. current journey correlation id is reused or a new task correlation id is started depending on implementation policy
3. submit mutation uses same correlation id
4. backend logs and frontend taskflow events share the same id

## Implementation rules

- the active correlation id should be accessible through a small frontend service/hook
- API clients should read the active correlation id automatically
- product code should not hand-build correlation ids in random components

## Anti-patterns

Do not:
- create a new correlation id for every render
- create a new correlation id for every minor click
- lose the correlation id on route transitions inside the same journey
- attach different field names for the same concept in different layers

## Minimum implementation shape

Suggested responsibilities:
- `createCorrelationId()` for new journey/task roots
- `getActiveCorrelationId()` for telemetry and API clients
- `withCorrelation()` helper where explicit scoping is needed

## Planning rule

Critical R0/R1/R2 journeys should not ship without correlation id propagation through telemetry and API request headers.
