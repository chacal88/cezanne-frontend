# Authenticated account and settings depth closeout

## Confirmed docs-to-code gaps

Confirmed facts from the OpenSpec change and current source:
- `/user-profile`, `/hiring-company-profile`, and `/recruitment-agency-profile` were registered authenticated shell/account routes.
- `/hiring-company-profile` and `/recruitment-agency-profile` rendered placeholder copy instead of product-depth profile states.
- `settings/user-settings`, `settings/company-settings`, and `settings/agency-settings` were absent from source before this change.
- Existing settings routes already used route-level capability boundaries, so account settings should follow the same boundary model.

## Archived prerequisite specs

Confirmed archived prerequisites:
- `openspec/changes/archive/2026-04-21-r0-shell-navigation-notification-depth/specs/shell-navigation-notification-depth/spec.md`
- `auth-session-foundation-depth` is referenced by this change as a dependency, but no archived spec file with that exact capability name is present in the current `openspec/changes/archive` tree.

Related archived settings/profile context:
- `openspec/changes/archive/2026-04-18-r3-careers-application-settings/specs/careers-page-settings/spec.md`
- `openspec/changes/archive/2026-04-18-r4-custom-fields-settings/specs/custom-fields-settings-admin/spec.md`

## Backend contract status

Confirmed frontend contracts:
- Route-level capabilities are evaluated by `evaluateCapabilities` and consumed at router/shell boundaries.
- No confirmed backend profile/settings API contract is present in the current change context.

Known unknowns that must not be invented:
- Persisted user preference fields.
- Organization profile field ownership and validation rules.
- Company/agency settings persistence endpoints.
- Server-side stale/degraded/unavailable reasons.

Implementation uses deterministic fixtures and adapter seams so confirmed API contracts can replace them later without moving route ownership.
