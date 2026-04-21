# Greenfield Frontend Navigation and Return Behavior

## Purpose

This document defines the navigation, deep-link, refresh, back-button, and close/cancel behavior contract for the greenfield frontend.

## Source baseline

Synthesized from:
- `./screens.md`
- `./notification-destinations.md`
- `../../docs/frontend-2/frontend-url-and-history-behavior-spec.md`
- `../../docs/frontend-2/frontend-deep-link-and-external-entry-inventory.md`
- `../../docs/frontend-2/frontend-modal-and-child-route-classification.md`
- `../../frontend/src/app/pages/job/job.route.js`
- `../../frontend/src/app/domain/job/candidate/candidate.route.js`
- `../../frontend/src/app/domain/user/user-profile/user-profile.route.js`

## Global rules

1. Every route must declare direct-entry support.
2. Every route must declare refresh behavior.
3. Every overlay/task route must declare close/cancel target.
4. Every notification destination must declare fallback behavior.
5. No route may rely on implicit browser history alone for critical return behavior.

## Behavior matrix by route class

| Route class | Direct entry | Refresh | Back button | Close / cancel |
|---|---|---|---|---|
| `Page` | fully supported | rebuild route state | normal page history | not applicable |
| `PageWithStatefulUrl` | fully supported | must rebuild from URL | restore prior page state where possible | not applicable |
| `RoutedOverlay` | supported when currently addressable | reload into usable parent + overlay state | one step should usually close overlay | return to stable parent route |
| `ShellOverlay` | supported only through shell-aware behavior | rebuild shell then overlay | one step should close overlay | return to prior shell page or dashboard |
| `TaskFlow` | supported if in current scope | reload into usable task context or explicit parent fallback | one step should leave the task and return | explicit parent return |
| `Public/Token` | fully supported | preserve token interpretation | standard page history | not modal-based |

## Route-family matrix

| Route family | Direct entry | Refresh | Back | Close/cancel |
|---|---|---|---|---|
| auth/token routes | full | preserve token/callback state | standard | route navigation only |
| dashboard | full | rebuild shell + dashboard | standard | n/a |
| notifications | full | rebuild shell + notifications | standard | n/a |
| inbox | full | preserve selected conversation from URL | respect conversation/page history | n/a |
| jobs list | full | preserve scope/page/search/asAdmin/label | return from detail should restore meaningful list state | n/a |
| job detail | full | preserve `section` and job context | back should respect prior source | child actions return here |
| candidate database/list | full | preserve query/page/sort/filter state from URL | return from detail should restore meaningful database state | n/a |
| candidate detail | full | preserve candidate/job/workflow context as far as encoded in URL | back should respect prior source | child actions return here |
| job overlays/tasks | direct URL supported | reconstruct parent + task context or parent fallback | one step closes task | return to job detail |
| candidate tasks | direct URL supported | reconstruct parent + task context or parent fallback | one step closes task | return to candidate detail |
| settings subsections | full | rebuild subsection and save-state/readiness context from URL when stateful; `/parameters*` resolves through the compatibility registry | back should remain within the active admin subsection when meaningful; compatibility redirects replace to avoid resolver loops | route navigation or parent subsection |
| reports | full | preserve family/filter state or explicit fallback | back should return to prior report family/index context | route navigation only |
| integrations admin | full | rebuild integrations index/detail context | detail close should return to integrations index | route navigation or parent index |
| user-profile | shell-aware direct entry only | rebuild shell then open overlay | one step closes overlay | return to prior route or dashboard |
| billing card | shell/billing-aware direct entry | rebuild billing context then overlay | one step closes overlay | return to billing overview |
| public/external token flows | full | preserve token state | standard | route navigation only |
| integrations token-entry | full | preserve token state | standard | route navigation only |
| sysadmin platform routes | full for implemented master-data routes | rebuild shell + platform capability context | denied entry falls back to `/dashboard`; implemented master-data routes rebuild list/detail/edit/subscription state from route params | route navigation only |

## Parent-return rules

### Job task flows

Parent target:
- `/job/:id?section`

Examples:
- CV view
- bid view
- schedule interview
- offer
- reject

Rule:
- if the task closes without redirecting elsewhere, return to the job hub
- refresh parent if the task may have changed visible state

### Candidate task flows

Parent target:
- `/candidate/:id/:job?/:status?/:order?/:filters?/:interview?`

Rule:
- preserve candidate/job/workflow params when returning
- do not drop back to a generic candidate surface if contextual params exist

### Shell overlays

Parent target:
- current shell route if known
- otherwise `/dashboard`

Rule:
- `user-profile` and similar shell overlays must not strand the user on an overlay-only URL


### SysAdmin platform routes

Parent/fallback target:
- `/dashboard`

Rules:
- SysAdmin platform fallback resolves to `/dashboard` platform mode.
- authenticated non-SysAdmin users who enter platform-only routes fall back to their normal dashboard state.
- `/hiring-companies`, `/recruitment-agencies`, and `/subscriptions` are implemented Platform / Master data entries in `r5-platform-master-data`.
- the shell exposes live navigation links only for implemented Platform / Master data routes; users/requests and taxonomy groups remain linkless until their slices ship.

## Notification-entry rules

- notification entry may land directly on a page, overlay, or task flow
- if the target is denied or missing, fallback must be typed and stable
- browser back from a notification-opened overlay should usually close one layer, not eject the user to an unrelated origin

## Required implementation helpers

- route-aware return target builder
- stateful URL serializer/parser for jobs, candidate, inbox
- typed parent-refresh rules for task success/cancel/failure
- notification fallback resolver

## Planning rule

No routed overlay or task flow is ready for implementation until its parent-return and refresh behavior is explicitly defined here or in a referenced extension.

## Implemented R2 candidate behavior

The current R2 baseline registers the contextual candidate hub route family and candidate task routes so that:
- direct entry and refresh preserve candidate/job/workflow interpretation from the route path
- candidate task close/cancel/success return to the contextual candidate hub path
- direct notification entry may append `?entry=notification` while preserving the frozen path contract
- stale sequence context degrades by removing sequence navigation instead of redirecting to an unrelated route

## Implemented R5 platform fallback and master-data behavior

The R5 SysAdmin foundation implements platform fallback as a route-capability outcome, and `r5-platform-master-data` adds the first route-heavy Platform group:
- SysAdmin direct entry to `/hiring-companies`, `/recruitment-agencies`, and `/subscriptions` renders implemented master-data foundation pages.
- Authenticated non-SysAdmin direct entry to platform master-data routes redirects to `/dashboard`.
- The fallback target is stable, but the dashboard content is context-sensitive: SysAdmin platform context renders platform mode, while HC/RA contexts render recruiter-core dashboard content.
- Platform / Master data exposes live links for companies, agencies, and subscriptions. Platform / Users and requests exposes live links for platform users and favorite-request queues. Platform / Taxonomy exposes a live `/sectors` link.
- master-data detail routes return to their list route, edit routes cancel/succeed to detail, and company subscription administration returns to `/hiring-companies/:id`.

## Implemented R4 candidate database return behavior

Candidate database navigation now follows these rules:
- Direct entry to `/candidates-database` rebuilds list interpretation from URL state.
- Invalid URL state is sanitized to stable defaults and valid values are preserved.
- `/candidates-old` and `/candidates-new` normalize to `/candidates-database`.
- Candidate detail opened from database uses `entry=database` and a sanitized `returnTo` target.
- Candidate task flows launched from database-origin detail close/cancel/succeed back to the same database-origin detail context, preserving the database `returnTo`.

## Implemented R4 integrations admin fallback behavior

Integrations admin navigation now follows these rules:
- `/integrations` supports direct entry for eligible HC admins.
- `/integrations/:id` supports direct entry and renders an explicit provider state.
- Provider detail always exposes `/integrations` as the parent-index return.
- Unknown provider ids render `unavailable` instead of redirecting to an unrelated admin route.
- Public/token `/integration/*` routes do not reuse internal admin-shell bootstrap.

## Implemented R4 org team/users fallback behavior

Org team/users navigation now follows these rules:
- `/team`, `/team/recruiters`, and `/users/invite` support direct entry for eligible org admins.
- Denied org team route entry falls back to `/dashboard`.
- Recruiter visibility and invite management remain recruiter-core/org scoped, not platform scoped.
- `/users/invite` presents org-scoped invite send/resend/revoke and membership readiness while keeping `/team` as parent target and `/dashboard` as denied fallback.
- Follow-on invite/membership and favorites slices should preserve `/team` as the parent foundation context.

## Implemented R4 org favorites fallback behavior

Org favorites navigation now follows these rules:
- `/favorites` and `/favorites/:id` support direct entry for eligible org users.
- Denied favorites route entry falls back to `/dashboard`.
- Favorite detail uses `/favorites` as the parent return target.
- Org favorites do not route through `/favorites-request*` or the platform favorite-request queue.

## Implemented R4 org favorite request fallback behavior

Org favorite request navigation now follows these rules:
- `/favorites/request` and `/favorites/request/:id` support direct entry for eligible org favorite users.
- Denied request route entry falls back to `/dashboard`.
- Request create/detail routes use `/favorites` as the parent return target.
- Unknown request ids render an unavailable task-flow state instead of redirecting to `/favorites-request*`.

## Implemented R4 billing fallback behavior

Billing navigation now follows these rules:
- `/billing` supports direct entry for eligible HC admins and falls back to `/dashboard` when denied.
- `/billing/upgrade`, `/billing/sms`, and `/billing/card/:id` use `/billing` as parent and fallback.
- Unknown billing cards render an unavailable billing-card state instead of redirecting to platform subscription administration.
- Billing routes do not route through `/subscriptions*` or SysAdmin company subscription routes.

## Implemented R4 marketplace RA fallback behavior

Marketplace navigation now follows these rules:
- `/jobmarket/:type` supports direct entry for eligible RA users/admins.
- Denied marketplace route entry falls back to `/dashboard`.
- Supported types are `fill`, `bidding`, `cvs`, and `assigned`.
- Unknown types render an unavailable marketplace state instead of redirecting to billing, HC-admin, or platform routes.

## Implemented R5 platform users and favorite-request behavior

- platform user detail/edit routes preserve sanitized `/users` return targets from list filters.
- invalid platform user list `page` values degrade to `1`, and empty `search`, `hiringCompanyId`, or `recruitmentAgencyId` filters are omitted.
- platform favorite-request queue/detail routes return to `/favorites-request` and remain separate from org `/favorites/request*` task flows.

## Implemented R5 platform taxonomy behavior

- `/sectors/:id` returns to `/sectors`.
- `/sectors/:sector_id/subsectors` returns to `/sectors/:sector_id`.
- `/subsectors/:id` returns to `/sectors` by default until API-backed parent-sector resolution exists.
- taxonomy routes stay under `sysadmin.taxonomy` and do not use settings subsection or master-data ownership.

## Implemented R5 requisition authoring behavior

- `/build-requisition` falls back to `/dashboard` when requisition branching is unavailable.
- `/job-requisitions/:jobWorkflowUuid` returns to `/jobs/open`.
- `/job-requisitions/:jobWorkflowUuid/:jobStageUuid` returns to `/job-requisitions/:jobWorkflowUuid`.
- `/requisition-workflows` returns to `/settings/hiring-flow` and stays settings-owned.
- workflow drift and stale workflow are explicit states, not generic errors.


## Implemented R5 settings leftovers behavior

The `r5-settings-leftovers` planning baseline defines these navigation rules for implementation:
- `/settings/api-endpoints` supports direct entry for eligible HC Admin users and falls back to `/dashboard` when denied.
- `/settings/api-endpoints` is a settings-owned route, not an integrations route and not a SysAdmin route.
- `/parameters/:settings_id?/:section?/:subsection?` remains a compatibility resolver only. It maps known authorized subsection keys to dedicated routes and replaces the compatibility URL when a dedicated route is selected.
- recognized compatibility subsection keys are `hiring-flow`, `custom-fields`, `templates`, `reject-reasons`, and `api-endpoints`.
- unknown, unauthorized, unavailable, and unimplemented subsection requests fall back to the first available recognized subsection for the actor, or `/dashboard` when no subsection is available.
- API endpoint validation and save/retry states stay on `/settings/api-endpoints`; failed validation does not navigate away.

## Implemented R5 public/token requisition forms behavior

Requisition forms/download navigation now follows these rules:
- `/job-requisition-forms/:id` supports direct public entry and refresh.
- `?download`, `?download=true`, and `?download=1` preserve download-focused mode but do not auto-start a download.
- the explicit download action keeps success and retryable failure states on the same public route.
- invalid, expired, inaccessible, unavailable, not-found, and already-downloaded outcomes render in the public/external shell and never redirect to authenticated recruiter-shell navigation.
- forms/download behavior remains separate from `/job-requisition-approval?token` approve/reject terminal states.

## Implemented provider-specific integrations depth behavior

For `provider-specific-integrations-depth`:
- `/integrations/:id` remains the direct-entry provider detail route.
- configuration, auth, and diagnostics sections preserve `/integrations` as parent return.
- unsupported provider families render unavailable/unimplemented states instead of redirecting.
- configuration validation/save failures, auth retry/failure states, and diagnostics remediation stay local to the provider detail route.
- refresh and parent-return behavior stay local to the provider detail route, with `/integrations` as the only parent return target.
- public/token `/integration/*` routes remain separate and do not reuse authenticated admin setup state.
- if section state becomes URL-owned later, it must sanitize invalid section values and preserve provider direct-entry behavior.
