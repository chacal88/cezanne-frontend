# ADR 0008: Routed overlay pattern

## Context

Several important flows are URL-addressable today but behave as overlays or task containers rather than normal pages.

## Decision

Use routed overlays for URL-addressable overlay flows and explicit task-flow routes for action-heavy flows.

Each such route must define:
- parent route
- close behavior
- direct-entry behavior
- refresh behavior
- success/cancel return behavior

## Consequences

- preserves deep-link and notification behavior
- keeps browser back behavior aligned with user intent
- avoids losing overlay semantics during redesign

## Alternatives rejected

- purely local modal state for externally reachable flows: rejected because it breaks direct-entry and refresh behavior
