# R4 Candidate Database Open Points

## Purpose

This document records the R4.2 candidate database closeout boundary after the route, URL-state, and detail-handoff foundation moved into implementation.

## Confirmed baseline

- Candidate database remains inside the `candidates` domain.
- The current R2 candidate detail route is job/workflow-context oriented and cannot be reused blindly as the database-origin detail contract.
- Candidate database routes are stateful URL pages and need an explicit return/restore contract.

## What must be frozen now

1. the canonical `/candidates-database` route family
2. the minimum URL state contract for search, paging, sorting, and filter restoration
3. the database → detail handoff contract
4. degraded behavior when list state or return context becomes stale

## R4 closeout status

Resolved by the R4 candidate database foundation:
- database-origin sequence navigation degrades explicitly instead of reusing job-pipeline previous/next behavior;
- the first R4 slice is a route, URL-state, and detail-handoff foundation, not a full database product implementation;
- the baseline preserves `query`, paging, sorting, stage, and tag URL state without freezing advanced boolean-search semantics.

Intentionally deferred beyond R4:
- advanced search and boolean-query builders;
- bulk actions from database results;
- database-specific sequence behavior beyond explicit degradation;
- deeper list UI/data integration and API-backed result behavior.

R5 sync:
- no R5 package currently owns these candidate-database product depths; they should be opened as a dedicated later candidate database slice if needed.

## First change from this area

- `r4-candidate-database-contract-foundation`

## Foundation decisions implemented

The R4.2 foundation resolves the first set of route/navigation decisions:
- Canonical route: `/candidates-database`.
- Removed compatibility routes are not registered; `/candidates-database` is the only candidate database entry.
- Minimum URL state: `query`, `page`, `sort`, `order`, `stage`, and `tags`. Invalid or stale values are sanitized instead of crashing or redirecting to unrelated routes.
- Database → detail handoff: `/candidate/:id?entry=database&returnTo=<encoded-candidates-database-url>`.
- Detail → database return: detail renders a database return target/link when `entry=database` is present.
- Candidate task return: action routes launched from database-origin detail preserve the full database-origin detail URL in `parent`.

Still deferred to later implementation slices:
- full candidate database UI and bulk actions;
- advanced boolean-search behavior beyond URL-state preservation;
- database-specific previous/next sequence navigation, which currently degrades explicitly.
