# ADR 0005: OpenFeature provider abstraction

## Context

Feature visibility currently mixes identity, pivots, subscription capabilities, and rollout flags. Provider lock-in would make migration and future changes harder.

## Decision

Use an OpenFeature-style abstraction with a provider adapter.

Application code depends on the abstraction, not on a concrete flag vendor SDK.

## Consequences

- provider can change without rewriting call sites
- flag usage remains typed and centralized
- rollout behavior can evolve independently from domain code

## Alternatives rejected

- direct vendor SDK in product code: rejected due to lock-in and widespread coupling
