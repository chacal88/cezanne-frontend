# ADR 0003: Zustand plus Jotai over Redux

## Context

The app needs two different client-state patterns:
- durable domain UI state
- transient task-flow state that should die with provider scope

## Decision

Use:
- Zustand for domain UI state
- Jotai for transient task-flow state

Do not use Redux as the default global state solution.

## Consequences

- domain UI state stays local and lightweight
- task-flow state is easy to scope and garbage-collect
- avoids creating a global store for data that belongs in routes or server cache

## Alternatives rejected

- Redux Toolkit: rejected as default because it encourages centralization of unrelated state
- Zustand-only: rejected because Jotai provider scoping is a better fit for transient flows
