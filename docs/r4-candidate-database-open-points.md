# R4 Candidate Database Open Points

## Purpose

This document records the planning boundary for `R4.2` candidate database work before implementation starts.

## Confirmed baseline

- Candidate database remains inside the `candidates` domain.
- The current R2 candidate detail route is job/workflow-context oriented and cannot be reused blindly as the database-origin detail contract.
- Candidate database routes are stateful URL pages and need an explicit return/restore contract.

## What must be frozen now

1. the canonical route family between `/candidates-old`, `/candidates-database`, and `/candidates-new`
2. the minimum URL state contract for search, paging, sorting, and filter restoration
3. the database → detail handoff contract
4. degraded behavior when list state or return context becomes stale

## Still open

- whether sequence navigation exists in a database context or degrades explicitly
- how much of bulk action behavior belongs in the first candidate database implementation wave
- the minimum advanced-search/boolean-search contract that must ship in the first database slice

## First change from this area

- `r4-candidate-database-contract-foundation`
