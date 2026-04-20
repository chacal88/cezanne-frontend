## Context

`canManageTaxonomy` and Platform / Taxonomy navigation already exist at the capability level, but taxonomy routes are not implemented. R5 needs a bounded frontend route/state foundation for sectors and subsectors before any API-backed taxonomy editing is introduced.

## Goals / Non-Goals

**Goals:**
- Register sectors and subsectors platform routes with `sysadmin.taxonomy` ownership.
- Expose live Platform / Taxonomy navigation after route implementation.
- Model list/detail/nested-list states and parent return behavior.
- Prove route metadata, navigation, and state helpers through tests.

**Non-Goals:**
- No real taxonomy API, creation/edit/delete persistence, company/agency edit dependency, or settings subsection routing.
- No changes to platform master-data or users/request ownership.

## Decisions

1. Taxonomy is read/write-ready in state vocabulary but frontend-only in this slice.
   - Routes expose ready, loading, empty, error, denied, not-found, stale, and mutation-success/error states.
   - Actual mutation persistence is deferred.

2. Nested subsector list is sector-owned.
   - `/sectors/:sector_id/subsectors` returns to `/sectors/:sector_id`.
   - `/subsectors/:id` returns to `/sectors` by default unless a sector parent is supplied by future state.

3. Navigation exposes the taxonomy list only.
   - Platform / Taxonomy links to `/sectors`; nested and detail pages are reached from taxonomy context, not shell top-level links.

## Risks / Trade-offs

- **Future APIs may need different mutation states** → keep state vocabulary broad and deterministic.
- **Subsector parent may be unknown on direct entry** → default subsector detail return to `/sectors` until API data can resolve a sector parent.
