## Context

R4 closed org team/invite/membership and org favorites/request behavior. R5 now owns only platform-scoped `/users*` CRUD foundations and `/favorites-request*` queues. The slice builds deterministic frontend foundations on top of SysAdmin shell/fallback/navigation behavior.

## Goals / Non-Goals

**Goals:**
- Register platform user and favorite-request queue routes with explicit route ids, metadata, capabilities, parents, and fallback.
- Define user list filters and return behavior for detail/edit/create.
- Define favorite-request queue/detail states and approve/reject/reopen readiness.
- Expose live Platform / Users and requests navigation links.

**Non-Goals:**
- No org user-management, `/users/invite`, team membership, or org favorite request implementation.
- No real backend persistence, invitation delivery, favorite fulfillment API, or cross-tenant user mutation.
- No taxonomy implementation.

## Decisions

1. `/users` is platform-owned only in R5.
   - Route-heavy `/users`, `/users/new`, `/users/edit/:id`, and `/users/:id` use `sysadmin.users` and `canManagePlatformUsers`.
   - Org-admin user management remains represented by R4 `/team*` and `/users/invite`; future org CRUD would require a separate route family or explicit compatibility decision.

2. User list filter state is URL-owned.
   - Supported filters are `page`, `search`, `hiringCompanyId`, and `recruitmentAgencyId`.
   - Invalid page values degrade to `1`; empty string filters are omitted.
   - Detail/edit/create return to the sanitized list URL.

3. `/favorites-request*` is platform queue-owned.
   - Queue/detail use `sysadmin.favorite-requests` and `canManageFavoriteRequests`.
   - Queue states include pending, resolved, rejected, stale, inaccessible, empty, and error.
   - Actions are approve, reject, and reopen with deterministic readiness reasons.

## Risks / Trade-offs

- **Legacy `/users` ambiguity** → Mitigation: docs and route metadata state that R5 `/users*` is platform-owned; org flows stay on R4 team routes.
- **Placeholder state mistaken for persistence** → Mitigation: page copy, docs, and tests label this as frontend foundation state only.
- **Favorite queue confused with org request task flows** → Mitigation: route ids, capability names, and tests prove `/favorites-request*` separation from `/favorites/request*`.
