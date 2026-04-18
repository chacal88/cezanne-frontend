# ADR 0002: TanStack Router over React Router

## Context

The target frontend depends heavily on typed params, typed search state, route loaders, direct-entry validity, and routed overlay behavior.

## Decision

Adopt TanStack Router as the routing framework.

## Consequences

- typed path/search params become first-class
- route loaders can own access and entry validation
- stateful URLs are easier to model explicitly
- routed overlay and task-flow patterns fit the route tree cleanly

## Alternatives rejected

- React Router data mode: good option, but weaker fit for the desired typed-search discipline
