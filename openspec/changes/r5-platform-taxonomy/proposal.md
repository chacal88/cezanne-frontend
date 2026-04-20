## Why

R5 platform master data and users/requests foundations make taxonomy the remaining SysAdmin platform group without route-heavy implementation. Sectors and subsectors should now be registered as platform taxonomy routes with explicit parent/child navigation and deterministic states.

## What Changes

- Implement platform taxonomy route contracts for `/sectors`, `/sectors/:id`, `/sectors/:sector_id/subsectors`, and `/subsectors/:id`.
- Add route ids, metadata, navigation links, fallback behavior, and deterministic taxonomy state helpers.
- Freeze parent/child navigation between sector lists, sector detail, nested subsector lists, and subsector detail.
- Keep taxonomy separate from settings subsection routing and company/agency master-data implementation.

## Capabilities

### New Capabilities
- `platform-taxonomy-routes`: SysAdmin sectors/subsectors route metadata, navigation, state, parent/child return, and fallback behavior.

### Modified Capabilities
- `frontend-testing-baseline`: Extend validation coverage to platform taxonomy route metadata, navigation links, state helpers, and parent/child behavior.

## Impact

- Affected docs: `docs/r5-master-plan.md`, `docs/r5-sysadmin-open-points.md`, `docs/screens.md`, `docs/capabilities.md`, `docs/navigation-and-return-behavior.md`, and `docs/testing.md`.
- Affected code: `src/domains/sysadmin/**`, `src/lib/platform/**`, `src/lib/routing/**`, `src/shell/navigation/**`, `src/app/router.tsx`, locale files, and tests.
- No backend taxonomy persistence, company/agency edit integration, or settings subsection behavior is included.
