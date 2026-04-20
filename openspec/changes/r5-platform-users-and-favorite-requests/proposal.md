## Why

R5 platform master data establishes the first route-heavy Platform group. The next ambiguous SysAdmin area is platform user management and the platform favorite-request queue, which must consume the accepted R4/R5 split instead of merging org invite, membership, or org favorites behavior back into Platform.

## What Changes

- Implement platform-owned `/users*` route contracts for list, create, edit, and view surfaces.
- Implement platform-owned `/favorites-request*` queue and detail route contracts.
- Freeze list filter semantics for platform users: `page`, `search`, `hiringCompanyId`, and `recruitmentAgencyId`.
- Keep org-scoped `/users/invite`, `/team*`, `/favorites*`, and `/favorites/request*` outside this slice.
- Add deterministic frontend state helpers for user CRUD and favorite-request queue states/actions without backend persistence.

## Capabilities

### New Capabilities
- `platform-users-routes`: Platform user list/create/edit/view routing, filter state, return behavior, and route-state handling.
- `platform-favorite-request-queue`: Platform favorite-request queue/detail routing, states, action readiness, and org-favorites separation.

### Modified Capabilities
- `frontend-testing-baseline`: Extend validation coverage to platform users/favorite-request route metadata, capability boundaries, filter-state helpers, action states, and org/platform separation.

## Impact

- Affected docs: `docs/r5-master-plan.md`, `docs/r5-sysadmin-open-points.md`, `docs/screens.md`, `docs/capabilities.md`, `docs/navigation-and-return-behavior.md`, and `docs/testing.md`.
- Affected code: `src/domains/sysadmin/**`, `src/lib/platform/**`, `src/lib/routing/**`, `src/shell/navigation/**`, `src/app/router.tsx`, locale files, and tests.
- No backend user-management API, cross-tenant persistence, email/invite delivery, or org-scoped user/favorite behavior is included.
