# ADR 0006: Domain isolation via folder boundaries

## Context

The legacy frontend mixes routes, permissions, data shaping, and UI across broad technical folders, which hides ownership and increases coupling.

## Decision

Start as a single app, but enforce domain isolation through folder boundaries and lint rules.

Only app/shell composition layers may compose across domains.

## Consequences

- simpler than a monorepo at R0–R2
- explicit ownership without package overhead
- easier future extraction once boundaries are already real

## Alternatives rejected

- monorepo at R0: rejected as premature complexity
- convention-only boundaries: rejected because they decay without enforcement
