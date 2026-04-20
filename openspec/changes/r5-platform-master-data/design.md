## Context

`r5-sysadmin-foundation` already established SysAdmin platform-mode dashboard entry, platform navigation grouping, `/dashboard` fallback, and telemetry conventions. It registered `/hiring-companies` only as a foundation placeholder. The next R5 slice turns Platform / Master data into the first route-heavy SysAdmin group: hiring companies, recruitment agencies, subscriptions, and company subscription administration.

This app currently has no backend persistence contract for these platform surfaces. The slice therefore implements deterministic frontend route, state, navigation, capability, telemetry, and test foundations without claiming real API integration.

## Goals / Non-Goals

**Goals:**
- Register and render master-data list/detail/edit routes for hiring companies, recruitment agencies, and subscriptions.
- Freeze common list/detail/edit states and return behavior for platform master data.
- Keep `/hiring-company/:id/subscription` owned by `sysadmin.companies` while separating route-entry and subscription-mutation capability checks.
- Expose live Platform / Master data navigation links after these routes are implemented.
- Add tests for route metadata, capabilities, direct-entry fallback, state helpers, and navigation links.

**Non-Goals:**
- No real backend API, persistence, payment processing, invoice management, or production subscription mutation.
- No platform `/users*`, `/favorites-request*`, or taxonomy implementation.
- No change to HC-admin billing self-service routes from R4.

## Decisions

1. **Use shared master-data state helpers.**
   - Decision: implement state builders for list, detail, edit, and company-subscription administration under `src/domains/sysadmin/master-data`.
   - Rationale: companies, agencies, and subscriptions share platform CRUD state vocabulary, and tests can prove behavior without coupling pages to future APIs.
   - Alternative considered: independent helpers per entity. Rejected because this would duplicate fallback, stale, empty, and edit outcome rules.

2. **Route ownership stays entity-specific.**
   - Decision: use `sysadmin.companies`, `sysadmin.agencies`, and `sysadmin.subscriptions` modules in route metadata.
   - Rationale: it preserves route-specific capability checks and keeps company subscription administration anchored to company context.
   - Alternative considered: a single `sysadmin.master-data` module for all routes. Rejected because `/hiring-company/:id/subscription` needs company ownership plus subscription action readiness.

3. **Company subscription route has split capability semantics.**
   - Decision: route entry requires `canManageHiringCompanies`; mutation readiness also requires `canManagePlatformSubscriptions`.
   - Rationale: the route is company-owned but subscription-specific actions must stay controlled by platform subscription administration.
   - Alternative considered: require both capabilities for route entry. Rejected because users who can manage companies should be able to see the company-owned subscription page in a denied-action state.

4. **Navigation exposes only implemented master-data links.**
   - Decision: Platform / Master data links become live for companies, agencies, and subscriptions; other platform groups remain linkless until their slices ship.
   - Rationale: this follows the foundation rule that unavailable entries must not link to unimplemented routes while allowing implemented routes to become discoverable.

## Risks / Trade-offs

- **Placeholder data can be mistaken for API parity** → Pages and docs must label the slice as frontend foundation behavior without persistence.
- **Shared state helpers may not match future backend errors exactly** → Keep helper vocabulary broad and deterministic: loading, empty, error, denied, not-found, stale, ready, success, cancel.
- **Subscription ownership can blur with R4 billing** → Route metadata, docs, and tests keep platform subscription administration separate from HC-admin billing self-service.
