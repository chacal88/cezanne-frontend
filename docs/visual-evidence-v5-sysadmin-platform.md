# Visual Evidence V5 SysAdmin Platform

## Purpose

This log records the first V5 SysAdmin/platform visual evidence capture pass before canonical Figma/screen-flow production.

It supports `v5-sysadmin-platform-visual-contract.md` and keeps screenshots as visual/state evidence only. Screenshots do not create backend schemas, mutation payloads, final table columns, or final platform admin data contracts.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-22 |
| Viewport | Desktop `1440x900`, device scale factor `1` |
| Current app | `http://localhost:5173` |
| Capture tool | Local Playwright script from `@playwright/test` / `playwright` dependency |
| Manifest | `visual-evidence-assets/v5/v5-capture-manifest.json` |
| Security exclusions | No credentials, raw tokens, tenant payloads, payment provider payloads, platform diagnostics, or raw PII payloads are stored in this log. |
| Local session | Dev-only local session seeded through `recruit.localAuthSession` with SysAdmin platform context. The stored token label is non-sensitive visual-evidence data only. |

## Evidence inventory

| Route/family | Visual contract | Evidence source | Screenshot | Captured states | Decision |
|---|---|---|---|---|---|
| `/dashboard` platform mode | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-platform-dashboard-1440x900.png` | SysAdmin platform landing, Platform navigation groups | Partial evidence only |
| `/users?page&search&hiringCompanyId&recruitmentAgencyId` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-platform-users-list-filtered-1440x900.png` | Platform users list with sanitized URL filters and return target | Partial evidence only |
| `/users/new` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-platform-user-create-1440x900.png` | Platform user create route shell and inherited filter context | Partial evidence only |
| `/users/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-platform-user-detail-1440x900.png` | Platform user detail route shell and sanitized parent return | Partial evidence only |
| `/users/edit/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-platform-user-edit-1440x900.png` | Platform user edit route shell and cancel target | Partial evidence only |
| `/favorites-request` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-favorite-requests-queue-1440x900.png` | Platform favorite-request queue pending state | Partial evidence only |
| `/favorites-request/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-favorite-request-detail-1440x900.png` | Favorite request detail pending state and approve readiness | Partial evidence only |
| `/hiring-companies` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-hiring-companies-list-1440x900.png` | Hiring company list ready state | Partial evidence only |
| `/hiring-companies/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-hiring-company-detail-1440x900.png` | Hiring company detail ready state and parent target | Partial evidence only |
| `/hiring-companies/edit/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-hiring-company-edit-1440x900.png` | Hiring company edit route shell and cancel target | Partial evidence only |
| `/hiring-company/:id/subscription` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-hiring-company-subscription-1440x900.png` | Company subscription ready state with route/mutation capability labels | Partial evidence only |
| `/recruitment-agencies` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-recruitment-agencies-list-1440x900.png` | Recruitment agency list ready state | Partial evidence only |
| `/recruitment-agencies/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-recruitment-agency-detail-1440x900.png` | Recruitment agency detail ready state and parent target | Partial evidence only |
| `/recruitment-agencies/edit/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-recruitment-agency-edit-1440x900.png` | Recruitment agency edit route shell and cancel target | Partial evidence only |
| `/subscriptions` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-subscriptions-list-1440x900.png` | Platform subscription list ready state | Partial evidence only |
| `/subscriptions/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-subscription-detail-1440x900.png` | Platform subscription detail ready state and parent target | Partial evidence only |
| `/sectors` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-sectors-list-1440x900.png` | Sector list ready state | Partial evidence only |
| `/sectors/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-sector-detail-1440x900.png` | Sector detail ready state and parent target | Partial evidence only |
| `/sectors/:sector_id/subsectors` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-subsectors-list-1440x900.png` | Sector-scoped subsector list ready state and parent target | Partial evidence only |
| `/subsectors/:id` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-subsector-detail-1440x900.png` | Subsector detail ready state and fallback parent target | Partial evidence only |
| non-SysAdmin `/users` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield app | `visual-evidence-assets/v5/current/greenfield-v5-platform-denied-fallback-1440x900.png` | Authenticated HC admin denied from platform `/users`, fallback to `/dashboard` | Partial evidence only |

## Confirmed visual observations

- The SysAdmin platform landing is visible inside the authenticated shell through `/dashboard`, preserving the accepted R5 decision that there is no separate platform app or platform-dashboard route.
- Platform navigation groups for Master data, Users and requests, and Taxonomy are visible for the SysAdmin context.
- Platform `/users*` routes preserve URL-owned filter context and sanitized return targets, and remain visually separate from org `/team` and `/users/invite` flows.
- Platform `/favorites-request*` routes render as platform queue/detail surfaces, distinct from org `/favorites/request*`.
- Master-data routes share a common foundation layout for company, agency, and subscription list/detail/edit surfaces.
- Company subscription administration exposes the route capability and mutation capability as separate concepts.
- Taxonomy routes expose sector/subsector surfaces with explicit parent targets and remain separate from settings subsections.
- A non-SysAdmin authenticated context attempting `/users` falls back to `/dashboard`, confirming the platform denial boundary is visible.

## Accepted deviations in this pass

- This is a greenfield-only capture pass. No legacy SysAdmin visual reference was captured or treated as canonical in this pass.
- Current screens are foundation-level route/state shells and are accepted only as initial visual evidence for route ownership, navigation grouping, parent targets, and platform boundary behavior.
- Sparse labels and placeholder ids such as `user-123`, `company-123`, `agency-123`, `subscription-123`, `sector-123`, and `subsector-123` are examples only. They are not backend schema evidence.
- The denied fallback screenshot confirms route fallback behavior, not final dashboard visual parity.

## Deferred visual debt

- Capture loading, empty, error, denied, not-found, stale, permission-denied, saving, success, cancelled, mutation-success, mutation-error, resolved, rejected, inaccessible, and action-failure variants where runtime exposes them or an explicit test hook/fixture is approved.
- Capture richer platform users list/detail/create/edit visuals once backend user columns, role assignment, tenant assignment, validation, and mutation contracts are confirmed.
- Capture favorite-request resolved/rejected/reopen and action failure states once the runtime can represent those states visually.
- Capture master-data list/detail/edit non-ready states and entity-specific field layouts once backend contracts are confirmed.
- Capture company subscription mutation-blocked, mutation-success, mutation-error, stale, and not-found states with explicit route-vs-mutation capability behavior.
- Capture taxonomy mutation/not-found/stale/denied states and any nested parent-sector resolution once runtime data contracts are confirmed.
- Capture narrow desktop/tablet variants if product decides V5 needs responsive Figma-ready coverage.
- Polish visible platform dashboard copy before Figma promotion; this pass captured concatenated dashboard copy in the activity/heading area that should be treated as visual debt, not as canonical content.

## Runtime reachability audit

This pass also reviewed the V5 runtime pages and state helpers to determine whether additional required states could be captured from the current app without changing product behavior.

| Family | State helper coverage | Runtime visual exposure today | Capture outcome |
|---|---|---|---|
| Platform users | List supports `ready`, `loading`, `empty`, `error`, `denied`; detail supports `ready`, `loading`, `not-found`, `permission-denied`, `stale`; edit supports `editing`, `saving`, `success`, `cancelled`, `error`, `permission-denied`. | `/users` renders `ready`; `/users/new` renders `ready`; `/users/:id` renders `ready`; `/users/edit/:id` renders `editing`. No URL or fixture selector exposes the other states. | Captured all currently exposed route shells; deeper states are blocked. |
| Platform favorite requests | Queue supports `pending`, `resolved`, `rejected`, `stale`, `inaccessible`, `empty`, `error`; actions support approve/reject/reopen readiness. | `/favorites-request` and `/favorites-request/:id` currently render `pending`; detail exposes approve readiness. No URL or fixture selector exposes resolved/rejected/stale/inaccessible/error. | Captured pending queue/detail; terminal/action-failure states are blocked. |
| Platform master data | List supports `loading`, `empty`, `error`, `denied`, `ready`; detail supports `loading`, `not-found`, `stale`, `denied`, `ready`; edit supports `editing`, `saving`, `success`, `cancelled`, `error`, `denied`. | Company, agency, and subscription list/detail/edit routes render only `ready` or `editing` shells. | Captured all currently exposed master-data shells; non-ready states are blocked. |
| Company subscription admin | Supports `ready`, `loading`, `stale`, `denied`, `not-found`, `mutation-blocked`, `mutation-success`, and `mutation-error`. | `/hiring-company/:id/subscription` renders `ready` for SysAdmin. Capability evaluation grants route and mutation capability together for platform context, so route-allowed/mutation-blocked is not reachable from current access context alone. | Captured ready state and route/mutation capability labels; mutation and stale/not-found states are blocked. |
| Platform taxonomy | Supports `ready`, `loading`, `empty`, `error`, `denied`, `not-found`, `stale`, `mutation-success`, and `mutation-error`. | Sector/subsector routes render `ready` only. No URL or fixture selector exposes alternate states. | Captured all currently exposed taxonomy shells; non-ready and mutation states are blocked. |
| Platform fallback | Access boundary falls back to `/dashboard` for non-SysAdmin platform route entry. | Non-SysAdmin `/users` entry is reachable through a local HC admin session. | Captured denied/fallback boundary. |

## V5 family closeout

| Family | First-pass evidence complete? | Figma-ready? | Closeout reason |
|---|---|---|---|
| Platform dashboard | Yes for current platform landing shell | No | Platform landing and navigation groups are captured, but dashboard copy/polish and unavailable/denied platform variants remain unresolved. |
| Platform users | Yes for exposed list/create/detail/edit route shells | No | Required non-ready states and final backend-backed user fields are not visually reachable today. |
| Platform favorite requests | Yes for exposed pending queue/detail | No | Resolved, rejected, stale, inaccessible, empty, error, reopen, and action-failure frames are not visually reachable today. |
| Platform master data | Yes for exposed company/agency/subscription route shells | No | Loading, empty, error, denied, not-found, stale, saving, success, and cancelled states are not visually reachable today. |
| Company subscription admin | Yes for exposed ready route | No | Mutation-blocked, mutation-success, mutation-error, stale, and not-found states are not visually reachable today. |
| Platform taxonomy | Yes for exposed sector/subsector route shells | No | Loading, empty, error, denied, not-found, stale, mutation-success, and mutation-error states are not visually reachable today. |
| Platform access fallback | Yes for non-SysAdmin `/users` fallback | No by itself | This validates the boundary but does not satisfy family-specific visual state depth. |

V5 first-pass capture is complete for every currently reachable SysAdmin/platform runtime route. The remaining V5 work is not more manual navigation; it requires either backend/API-backed states, explicit fixture/test-hook exposure, or product-approved omissions before any row can be promoted to `Figma-ready`.

## Backend/API unknowns

- Platform user list/detail/create/edit schemas, role and tenant assignment payloads, favorite-request queue item schemas, approve/reject/reopen payloads, company/agency/subscription schemas, company subscription mutation payloads, and taxonomy list/detail/update payloads remain non-inventable.
- Current screenshots may show placeholder ids, counts, and generic state labels. Figma must label those as examples unless a backend contract confirms the fields.

## Figma-ready decision

| Area | Decision | Reason |
|---|---|---|
| Platform dashboard | Not yet | Platform navigation and landing are captured, but responsive and denied/unavailable platform variants are not complete. |
| Platform users | Not yet | List/create/detail/edit route shells and URL return behavior are captured; non-ready states and backend field contracts remain missing. |
| Platform favorite requests | Not yet | Pending queue/detail and approve readiness are captured; resolved/rejected/reopen/action-failure states remain missing. |
| Platform master data | Not yet | Company/agency/subscription list/detail/edit shells are captured; non-ready states and entity-specific fields remain missing. |
| Company subscription admin | Not yet | Ready state and route/mutation capability labels are captured; mutation-blocked/success/error/stale/not-found states remain missing. |
| Platform taxonomy | Not yet | Sector/subsector ready states and parent targets are captured; mutation/not-found/stale/denied variants remain missing. |

V5 first-pass capture is complete for the runtime surface currently exposed by the app, but no V5 row should be promoted to `Figma-ready` from this pass alone.
