## Why

R5 SysAdmin foundation is closed, so the first route-heavy platform slice can now ship without redefining platform landing, navigation, fallback, or telemetry behavior. Companies, recruitment agencies, and subscriptions are the least ambiguous platform-only surfaces and should become the first implemented Platform / Master data group.

## What Changes

- Implement platform master-data route contracts for hiring companies, recruitment agencies, and subscriptions.
- Add SysAdmin route metadata and registered routes for list, detail, edit, and company-subscription administration surfaces.
- Freeze shared list/detail/edit state models for loading, empty, error, denied, not-found, stale, success, cancel, and refresh behavior.
- Keep `/hiring-company/:id/subscription` under `sysadmin.companies` route ownership while requiring both company and subscription capabilities for subscription mutations.
- Update R5 docs so S3 and S4 are accepted for this slice and later platform users/favorite-request/taxonomy work does not redefine master-data behavior.

## Capabilities

### New Capabilities
- `platform-master-data-routes`: SysAdmin companies, agencies, and subscriptions route metadata, fallback, navigation, and page-state behavior.
- `platform-company-subscription-admin`: Company-owned subscription administration route behavior, capability split, mutation readiness, and refresh invalidation.

### Modified Capabilities
- `frontend-testing-baseline`: Extend validation coverage to platform master-data route metadata, capability boundaries, direct-entry/fallback behavior, and deterministic state helpers.

## Impact

- Affected docs: `docs/r5-master-plan.md`, `docs/r5-sysadmin-open-points.md`, `docs/screens.md`, `docs/capabilities.md`, `docs/navigation-and-return-behavior.md`, `docs/testing.md`, and `docs/telemetry-events.md` if new telemetry names are introduced.
- Affected code: `src/domains/sysadmin/**`, `src/lib/platform/**`, `src/lib/routing/**`, `src/lib/access-control/**`, `src/shell/navigation/**`, `src/app/router.tsx`, locale files, and related tests.
- No backend persistence, real company/agency/subscription APIs, payment processing, or cross-project changes are included in this slice.
