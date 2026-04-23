# Visual Evidence V5 SysAdmin Platform

## Purpose

This log records the first V5 SysAdmin/platform visual evidence capture pass before canonical Figma/screen-flow production.

It supports `v5-sysadmin-platform-visual-contract.md` and keeps screenshots as visual/state evidence only. Screenshots do not create backend schemas, mutation payloads, final table columns, or final platform admin data contracts.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-22; runtime hook update 2026-04-22; state-depth capture 2026-04-23 |
| Viewport | Desktop `1440x900`, device scale factor `1` |
| Current app | `http://localhost:5173` |
| Capture tool | Local Playwright script from `@playwright/test` / `playwright` dependency |
| Manifest | `visual-evidence-assets/v5/v5-capture-manifest.json`; `visual-evidence-assets/v5/state-hooks-2026-04-23/v5-state-hooks-manifest.json` |
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
| Platform users `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v5/state-hooks-2026-04-23/current/greenfield-v5-platform-users-list-loading-1440x900.png` and sibling manifest entries | List ready/loading/empty/error/denied; create editing/saving/success/cancelled/error/permission-denied; detail ready/loading/not-found/stale/permission-denied; edit editing/saving/success/cancelled/error/permission-denied | Captured for desktop current-app Figma drafting; final backend fields deferred |
| Platform favorite requests `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v5/state-hooks-2026-04-23/current/greenfield-v5-favorite-request-detail-action-failure-1440x900.png` and sibling manifest entries | Queue/detail pending/resolved/rejected/stale/inaccessible/empty/error/action-failure plus approve/reject/reopen readiness and retry labels | Captured for desktop current-app Figma drafting; action payloads deferred |
| Platform master data `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v5/state-hooks-2026-04-23/current/greenfield-v5-hiring-company-edit-saving-1440x900.png` and sibling manifest entries | Company/agency/subscription list loading/ready/empty/error/denied; detail loading/ready/not-found/stale/denied; edit editing/saving/success/cancelled/error/denied | Captured for desktop current-app Figma drafting; entity schemas deferred |
| Company subscription `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v5/state-hooks-2026-04-23/current/greenfield-v5-hiring-company-subscription-mutation-blocked-1440x900.png` and sibling manifest entries | Ready/loading/denied/not-found/stale/mutation-blocked/mutation-success/mutation-error with route-vs-mutation labels and refresh targets | Captured for desktop current-app Figma drafting; mutation payload deferred |
| Platform taxonomy `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | `visual-evidence-assets/v5/state-hooks-2026-04-23/current/greenfield-v5-sector-list-mutation-error-1440x900.png` and sibling manifest entries | Sector/subsector list/detail ready/loading/empty/error/denied/not-found/stale/mutation-success/mutation-error and parent-target variants | Captured for desktop current-app Figma drafting; taxonomy schemas deferred |

## Confirmed visual observations

- The SysAdmin platform landing is visible inside the authenticated shell through `/dashboard`, preserving the accepted R5 decision that there is no separate platform app or platform-dashboard route.
- Platform navigation groups for Master data, Users and requests, and Taxonomy are visible for the SysAdmin context.
- Platform `/users*` routes preserve URL-owned filter context and sanitized return targets, and remain visually separate from org `/team` and `/users/invite` flows.
- Platform `/favorites-request*` routes render as platform queue/detail surfaces, distinct from org `/favorites/request*`.
- Master-data routes share a common foundation layout for company, agency, and subscription list/detail/edit surfaces.
- Company subscription administration exposes the route capability and mutation capability as separate concepts.
- Taxonomy routes expose sector/subsector surfaces with explicit parent targets and remain separate from settings subsections.
- A non-SysAdmin authenticated context attempting `/users` falls back to `/dashboard`, confirming the platform denial boundary is visible.
- Runtime exposes deterministic fixture hooks for every V5 state family listed in the visual contract, including platform user create lifecycle, favorite-request action failure/retry, and company subscription loading. The hooks are query-param driven (`fixtureState`) and the 2026-04-23 capture pass records them as screenshots without inventing backend schemas.

## Accepted deviations in this pass

- This is a greenfield-only capture pass. No legacy SysAdmin visual reference was captured or treated as canonical in this pass.
- Current screens are foundation-level route/state shells and are accepted only as initial visual evidence for route ownership, navigation grouping, parent targets, and platform boundary behavior.
- The fixture hooks are accepted as desktop current-app state evidence for Figma drafting. They do not prove production APIs, mutation payloads, responsive/mobile scope, or final platform data fields.
- Sparse labels and placeholder ids such as `user-123`, `company-123`, `agency-123`, `subscription-123`, `sector-123`, and `subsector-123` are examples only. They are not backend schema evidence.
- The denied fallback screenshot confirms route fallback behavior, not final dashboard visual parity.

## Deferred visual debt

- Capture richer platform users list/detail/create/edit visuals once backend user columns, role assignment, tenant assignment, validation, and mutation contracts are confirmed.
- Capture richer favorite-request queue/detail layouts once queue item schemas and approve/reject/reopen payloads are confirmed.
- Capture master-data entity-specific field layouts once backend contracts are confirmed.
- Capture company subscription production mutation payload fields once backend contracts are confirmed.
- Capture taxonomy production field layouts once backend taxonomy contracts are confirmed.
- Capture narrow desktop/tablet variants if product decides V5 needs responsive Figma-ready coverage.
- Polish visible platform dashboard copy before Figma promotion; this pass captured concatenated dashboard copy in the activity/heading area that should be treated as visual debt, not as canonical content.

## State-hook capture update

The 2026-04-23 capture pass added `visual-evidence-assets/v5/state-hooks-2026-04-23/v5-state-hooks-manifest.json` and 124 desktop screenshots under `visual-evidence-assets/v5/state-hooks-2026-04-23/current/`.

| Family | Screenshot count | States captured | Figma-ready decision |
|---|---:|---|---|
| Platform users list/create/detail/edit | 22 | list ready/loading/empty/error/denied; create editing/saving/success/cancelled/error/permission-denied; detail ready/loading/not-found/stale/permission-denied; edit editing/saving/success/cancelled/error/permission-denied | Figma-ready for desktop current-app screen-flow/base-frame drafting |
| Favorite requests queue/detail | 16 | pending/resolved/rejected/stale/inaccessible/empty/error/action-failure across queue and detail, including retry and action-readiness labels | Figma-ready for desktop current-app screen-flow/base-frame drafting |
| Master data company/agency/subscription | 58 | company and agency list/detail/edit states; subscription list/detail states; loading/ready/empty/error/denied/not-found/stale/saving/success/cancelled variants as applicable | Figma-ready for desktop current-app screen-flow/base-frame drafting |
| Company subscription admin | 8 | ready/loading/denied/not-found/stale/mutation-blocked/mutation-success/mutation-error, route capability, mutation capability, mutation allowed, and refresh targets | Figma-ready for desktop current-app screen-flow/base-frame drafting |
| Taxonomy sectors/subsectors | 36 | sector list/detail and subsector list/detail ready/loading/empty/error/denied/not-found/stale/mutation-success/mutation-error | Figma-ready for desktop current-app screen-flow/base-frame drafting |

## Runtime reachability audit

This pass also reviewed the V5 runtime pages and state helpers to determine whether additional required states could be captured from the current app without changing product behavior.

| Family | State helper coverage | Runtime visual exposure today | Capture outcome |
|---|---|---|---|
| Platform users | List supports `ready`, `loading`, `empty`, `error`, `denied`; create supports `editing`, `saving`, `success`, `cancelled`, `error`, `permission-denied`; detail supports `ready`, `loading`, `not-found`, `permission-denied`, `stale`; edit supports `editing`, `saving`, `success`, `cancelled`, `error`, `permission-denied`. | `/users*?fixtureState=` exposes all list/create/detail/edit variants for deterministic capture. | Screenshot capture complete in the 2026-04-23 state-hook manifest. |
| Platform favorite requests | Queue/detail support `pending`, `resolved`, `rejected`, `stale`, `inaccessible`, `empty`, `error`, `action-failure`; actions support approve/reject/reopen readiness and retry exposure for stale/error/action-failure. | `/favorites-request*?fixtureState=` exposes queue/detail states, action readiness labels, and retry labels. | Screenshot capture complete in the 2026-04-23 state-hook manifest. |
| Platform master data | List supports `loading`, `empty`, `error`, `denied`, `ready`; detail supports `loading`, `not-found`, `stale`, `denied`, `ready`; edit supports `editing`, `saving`, `success`, `cancelled`, `error`, `denied`. | Company, agency, and subscription routes accept `?fixtureState=` for list/detail/edit variants. | Screenshot capture complete in the 2026-04-23 state-hook manifest. |
| Company subscription admin | Supports `ready`, `loading`, `stale`, `denied`, `not-found`, `mutation-blocked`, `mutation-success`, and `mutation-error`; denied records route capability failure separately from mutation capability failure. | `/hiring-company/:id/subscription?fixtureState=` exposes loading, route-vs-mutation blocked/success/error/stale/not-found states with refresh targets. | Screenshot capture complete in the 2026-04-23 state-hook manifest. |
| Platform taxonomy | Supports `ready`, `loading`, `empty`, `error`, `denied`, `not-found`, `stale`, `mutation-success`, and `mutation-error`. | Sector/subsector routes accept `?fixtureState=`; subsector detail also accepts `sectorId` for parent-target evidence. | Screenshot capture complete in the 2026-04-23 state-hook manifest. |
| Platform fallback | Access boundary falls back to `/dashboard` for non-SysAdmin platform route entry. | Non-SysAdmin `/users` entry is reachable through a local HC admin session. | Captured denied/fallback boundary. |

## V5 family closeout

| Family | First-pass evidence complete? | Figma-ready? | Closeout reason |
|---|---|---|---|
| Platform dashboard | Yes for current platform landing shell | No by itself | Platform landing and navigation groups are captured, but dashboard copy/polish and unavailable/denied platform variants remain unresolved. |
| Platform users | Yes for route shells and state-hook screenshots | Yes, desktop current-app base | Required list/create/detail/edit non-ready states are captured; backend-backed user fields remain deferred. |
| Platform favorite requests | Yes for pending queue/detail and state-hook screenshots | Yes, desktop current-app base | Terminal/action-failure/retry states are captured; action payload contracts remain deferred. |
| Platform master data | Yes for route shells and state-hook screenshots | Yes, desktop current-app base | Non-ready states are captured; entity-specific backend fields remain deferred. |
| Company subscription admin | Yes for ready route and state-hook screenshots | Yes, desktop current-app base | Loading, route denial, mutation block, mutation outcome, and stale/not-found states are captured; mutation payload remains deferred. |
| Platform taxonomy | Yes for ready route shells and state-hook screenshots | Yes, desktop current-app base | Non-ready and mutation states are captured; taxonomy schema remains deferred. |
| Platform access fallback | Yes for non-SysAdmin `/users` fallback | No by itself | This validates the boundary but does not satisfy family-specific visual state depth. |

V5 first-pass capture is complete for every currently reachable SysAdmin/platform runtime route, and the required state-hook screenshots now exist. The covered V5 SysAdmin route rows can move to desktop current-app `Figma-ready` for Figma/screen-flow drafting, while backend/API schemas remain deferred.

## Backend/API unknowns

- Platform user list/detail/create/edit schemas, role and tenant assignment payloads, favorite-request queue item schemas, approve/reject/reopen payloads, company/agency/subscription schemas, company subscription mutation payloads, and taxonomy list/detail/update payloads remain non-inventable.
- Current screenshots may show placeholder ids, counts, and generic state labels. Figma must label those as examples unless a backend contract confirms the fields.

## Figma-ready decision

| Area | Decision | Reason |
|---|---|---|
| Platform dashboard | Not yet | Platform navigation and landing are captured, but responsive and denied/unavailable platform variants are not complete. |
| Platform users | Figma-ready for desktop current-app base | List/create/detail/edit route shells, URL return behavior, and non-ready/lifecycle states are captured; backend field contracts remain pending. |
| Platform favorite requests | Figma-ready for desktop current-app base | Pending queue/detail, terminal/action-failure/retry states, and approve/reject/reopen readiness are captured; action payload contracts remain pending. |
| Platform master data | Figma-ready for desktop current-app base | Company/agency/subscription list/detail/edit shells and non-ready states are captured; entity-specific field contracts remain pending. |
| Company subscription admin | Figma-ready for desktop current-app base | Ready state, route/mutation capability labels, loading, mutation-blocked/success/error/stale/not-found/denied states, and refresh targets are captured; mutation payload remains pending. |
| Platform taxonomy | Figma-ready for desktop current-app base | Sector/subsector ready states, parent targets, mutation/not-found/stale/denied/error variants are captured; taxonomy schema remains pending. |

V5 can move from foundation verified to desktop current-app `Figma-ready` for the covered SysAdmin/platform route rows. It is not replacement-approved: backend schemas, responsive/mobile scope, platform dashboard copy polish, and legacy pixel-parity review where applicable remain blockers before production replacement.
