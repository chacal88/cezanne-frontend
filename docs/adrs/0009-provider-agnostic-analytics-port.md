# ADR 0009: Provider-agnostic analytics port

## Context

The product needs analytics instrumentation, but provider choice should remain open.

## Decision

Define a stable internal `AnalyticsPort` and event contract. Product code depends only on this port.

Concrete analytics providers are adapters behind the port.

## Consequences

- provider choice can be deferred
- event taxonomy stays consistent
- no vendor-specific SDK leakage into domains or shell

## Alternatives rejected

- choosing a provider first and coding directly to it: rejected due to lock-in
