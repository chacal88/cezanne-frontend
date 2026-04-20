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

## Foundation decisions implemented

The R4.2 foundation resolves the first set of route/navigation decisions:
- Canonical route: `/candidates-database`.
- Compatibility routes: `/candidates-old` and `/candidates-new`; both normalize to the canonical route with sanitized state.
- Minimum URL state: `query`, `page`, `sort`, `order`, `stage`, and `tags`. Invalid or stale values are sanitized instead of crashing or redirecting to unrelated routes.
- Database → detail handoff: `/candidate/:id?entry=database&returnTo=<encoded-candidates-database-url>`.
- Detail → database return: detail renders a database return target/link when `entry=database` is present.
- Candidate task return: action routes launched from database-origin detail preserve the full database-origin detail URL in `parent`.

Still deferred to later implementation slices:
- full candidate database UI and bulk actions;
- advanced boolean-search behavior beyond URL-state preservation;
- database-specific previous/next sequence navigation, which currently degrades explicitly.
