# ADR 0010: Adapter boundary is mandatory

## Context

Legacy contracts are mixed, inconsistent, and likely to evolve during the rewrite.

## Decision

All non-trivial backend payloads must pass through adapters before reaching UI components.

Components consume frontend-facing models only.

## Consequences

- contract churn stays localized
- UI code becomes more stable and readable
- domain models become explicit and testable

## Alternatives rejected

- using raw REST/GraphQL payloads in components: rejected due to tight coupling and unstable UI contracts
