# Candidate Implementation Depth Closeout

## Purpose

This closeout records the candidate product-depth gap between archived route/foundation specs and the current `recruit-frontend` implementation. It is intentionally limited to authenticated recruiter-shell Candidate surfaces.

## Confirmed docs-to-code gaps

Confirmed from source and archived specs:

- Candidate database routes were registered and URL-state aware, but `/candidates-database`, `/candidates-old`, and `/candidates-new` still carried `foundation-placeholder` metadata before this closeout.
- Candidate database used deterministic records rather than confirmed API-backed list contracts; this is acceptable only behind a replaceable adapter seam and explicit unavailable/degraded UI states.
- Candidate detail already has aggregate sections, but product-depth acceptance requires route-owned states for database return, stale sequence, optional section degradation, ATS/source status, document truth, collaboration, and insights.
- Candidate task launchers already preserve parent return for schedule/offer/reject; closeout acceptance requires failure, retry, success, and parent-refresh behavior to remain route-local and to preserve database-origin detail return state.
- Move, hire/unhire, and review-request are represented as capability/action states but do not have confirmed backend route contracts in this package.

## Prerequisite archived specs

The implementation consumes these already-archived contracts instead of redefining them:

- `candidate-detail-hub` from `2026-04-18-r2-candidate-core`
- `candidate-task-flows` from `2026-04-18-r2-candidate-core`
- `candidate-document-truth` from `2026-04-18-r2-candidate-core`
- `candidate-product-depth` from `2026-04-21-r2-candidate-product-depth`
- `candidate-database-list-state` from `2026-04-20-r4-candidate-database-contract-foundation`
- `candidate-database-detail-handoff` from `2026-04-20-r4-candidate-database-contract-foundation`
- `ats-candidate-source-operational-depth` from `2026-04-21-ats-candidate-source-operational-depth`
- Scheduling, contract-signing, messaging, and survey/review operational-depth specs where Candidate consumes downstream normalized state.

## Confirmed backend contracts and unknowns

Confirmed contracts in this package are route and frontend-state contracts only:

- Canonical database route: `/candidates-database`.
- Compatibility routes: `/candidates-old` and `/candidates-new`, canonicalized with sanitized search state.
- Database URL state: `query`, `page`, `sort`, `order`, `stage`, and `tags`.
- Database-origin detail handoff: `/candidate/:id?entry=database&returnTo=<encoded-candidates-database-url>`.
- Candidate task parent return: `parent=<encoded-candidate-detail-url>` for database-origin actions.
- Authenticated Candidate capability keys stay separate from public/token survey, review, chat, and integration routes.

Unknown backend fields and APIs that must not be invented here:

- Candidate database search endpoint shape, pagination metadata, advanced boolean query syntax, and bulk action payloads.
- Candidate detail aggregate response fields for comments, tags, forms, custom fields, survey score, feedback, and ATS source identity.
- Document asset authorization, preview/download URL expiry, stale preview metadata, and post-upload refresh response payloads.
- Move, hire/unhire, review-request, and downstream signing payloads beyond normalized frontend state handoffs.
- Provider setup repair targets unless already supplied by integration readiness state.

## Closeout behavior

Candidate closeout behavior is considered product-depth complete when route metadata is no longer foundation-placeholder, route-owned state resolvers cover ready/empty/denied/unavailable/stale/degraded/saving/submitting/failed/retry/success outcomes, database-origin return state is preserved through actions, and optional panel failures do not collapse the candidate hub.
