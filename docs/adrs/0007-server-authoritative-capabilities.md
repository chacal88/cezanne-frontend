# ADR 0007: Server-authoritative capabilities

## Context

Access decisions depend on a complex mix of identity, entitlements, entity state, workflow state, and business rules.

## Decision

Treat server-computed capability decisions as authoritative for entity and action behavior.

Frontend components consume capability objects and route decisions rather than re-deriving business rules locally.

## Consequences

- one primary source of truth for complex business access
- reduced divergence between backend and frontend
- easier testing of permission outcomes

## Alternatives rejected

- fully frontend-derived permissions: rejected due to parity and drift risk
