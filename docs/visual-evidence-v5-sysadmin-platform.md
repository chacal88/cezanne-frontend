# Visual Evidence V5 SysAdmin Platform

## Purpose

This log records the first V5 SysAdmin/platform visual evidence capture pass before canonical Figma/screen-flow production.

It supports `v5-sysadmin-platform-visual-contract.md` and keeps screenshots as visual/state evidence only. Screenshots do not create backend schemas, mutation payloads, final table columns, or final platform admin data contracts.

## Capture metadata

| Field | Value |
|---|---|
| Capture date | 2026-04-22; runtime hook update 2026-04-22 |
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
| Platform users `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | List loading/empty/error/denied; detail loading/not-found/stale/permission-denied; edit saving/success/cancelled/error/permission-denied | Runtime/test-hook covered; final backend fields deferred |
| Platform favorite requests `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | Queue/detail pending/resolved/rejected/stale/inaccessible/empty/error plus approve/reject/reopen readiness labels | Runtime/test-hook covered; action payloads deferred |
| Platform master data `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | Company/agency/subscription list loading/ready/empty/error/denied; detail loading/ready/not-found/stale/denied; edit editing/saving/success/cancelled/error/denied | Runtime/test-hook covered; entity schemas deferred |
| Company subscription `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | Ready/loading/denied/not-found/stale/mutation-blocked/mutation-success/mutation-error with route-vs-mutation labels and refresh targets | Runtime/test-hook covered; mutation payload deferred |
| Platform taxonomy `?fixtureState=` | `v5-sysadmin-platform-visual-contract.md` | Current greenfield runtime | Pending screenshot capture | Sector/subsector list/detail ready/loading/empty/error/denied/not-found/stale/mutation-success/mutation-error and parent-target variants | Runtime/test-hook covered; taxonomy schemas deferred |

## Confirmed visual observations

- The SysAdmin platform landing is visible inside the authenticated shell through `/dashboard`, preserving the accepted R5 decision that there is no separate platform app or platform-dashboard route.
- Platform navigation groups for Master data, Users and requests, and Taxonomy are visible for the SysAdmin context.
- Platform `/users*` routes preserve URL-owned filter context and sanitized return targets, and remain visually separate from org `/team` and `/users/invite` flows.
- Platform `/favorites-request*` routes render as platform queue/detail surfaces, distinct from org `/favorites/request*`.
- Master-data routes share a common foundation layout for company, agency, and subscription list/detail/edit surfaces.
- Company subscription administration exposes the route capability and mutation capability as separate concepts.
- Taxonomy routes expose sector/subsector surfaces with explicit parent targets and remain separate from settings subsections.
- A non-SysAdmin authenticated context attempting `/users` falls back to `/dashboard`, confirming the platform denial boundary is visible.
- Runtime now exposes deterministic fixture hooks for every V5 state family listed in the visual contract. The hooks are intentionally query-param driven (`fixtureState`) so Figma capture can proceed without inventing backend schemas.

## Accepted deviations in this pass

- This is a greenfield-only capture pass. No legacy SysAdmin visual reference was captured or treated as canonical in this pass.
- Current screens are foundation-level route/state shells and are accepted only as initial visual evidence for route ownership, navigation grouping, parent targets, and platform boundary behavior.
- The new fixture hooks are accepted as runtime state coverage only until screenshots are captured. They do not prove production APIs, mutation payloads, or final platform data fields.
- Sparse labels and placeholder ids such as `user-123`, `company-123`, `agency-123`, `subscription-123`, `sector-123`, and `subsector-123` are examples only. They are not backend schema evidence.
- The denied fallback screenshot confirms route fallback behavior, not final dashboard visual parity.

## Deferred visual debt

- Capture the new `fixtureState` hooks for loading, empty, error, denied, not-found, stale, permission-denied, saving, success, cancelled, mutation-success, mutation-error, resolved, rejected, inaccessible, and action-failure-like retry/blocked labels.
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
| Platform users | List supports `ready`, `loading`, `empty`, `error`, `denied`; detail supports `ready`, `loading`, `not-found`, `permission-denied`, `stale`; edit supports `editing`, `saving`, `success`, `cancelled`, `error`, `permission-denied`. | `/users*?fixtureState=` exposes all non-ready/detail/edit variants for deterministic capture. | Runtime hook coverage complete; screenshot capture pending before Figma-ready promotion. |
| Platform favorite requests | Queue supports `pending`, `resolved`, `rejected`, `stale`, `inaccessible`, `empty`, `error`; actions support approve/reject/reopen readiness. | `/favorites-request*?fixtureState=` exposes queue/detail states and action readiness labels. | Runtime hook coverage complete; screenshot capture pending before Figma-ready promotion. |
| Platform master data | List supports `loading`, `empty`, `error`, `denied`, `ready`; detail supports `loading`, `not-found`, `stale`, `denied`, `ready`; edit supports `editing`, `saving`, `success`, `cancelled`, `error`, `denied`. | Company, agency, and subscription routes accept `?fixtureState=` for list/detail/edit variants. | Runtime hook coverage complete; screenshot capture pending before Figma-ready promotion. |
| Company subscription admin | Supports `ready`, `loading`, `stale`, `denied`, `not-found`, `mutation-blocked`, `mutation-success`, and `mutation-error`. | `/hiring-company/:id/subscription?fixtureState=` exposes route-vs-mutation blocked/success/error/stale/not-found states with refresh targets. | Runtime hook coverage complete; screenshot capture pending before Figma-ready promotion. |
| Platform taxonomy | Supports `ready`, `loading`, `empty`, `error`, `denied`, `not-found`, `stale`, `mutation-success`, and `mutation-error`. | Sector/subsector routes accept `?fixtureState=`; subsector detail also accepts `sectorId` for parent-target evidence. | Runtime hook coverage complete; screenshot capture pending before Figma-ready promotion. |
| Platform fallback | Access boundary falls back to `/dashboard` for non-SysAdmin platform route entry. | Non-SysAdmin `/users` entry is reachable through a local HC admin session. | Captured denied/fallback boundary. |

## V5 family closeout

| Family | First-pass evidence complete? | Figma-ready? | Closeout reason |
|---|---|---|---|
| Platform dashboard | Yes for current platform landing shell | No | Platform landing and navigation groups are captured, but dashboard copy/polish and unavailable/denied platform variants remain unresolved. |
| Platform users | Yes for exposed route shells and runtime fixture hooks | No | Required non-ready states are now reachable, but screenshot evidence and backend-backed user fields remain pending. |
| Platform favorite requests | Yes for exposed pending queue/detail and runtime fixture hooks | No | Terminal/action states are now reachable; screenshot evidence and action payload contracts remain pending. |
| Platform master data | Yes for exposed route shells and runtime fixture hooks | No | Non-ready states are now reachable; screenshot evidence and entity-specific backend fields remain pending. |
| Company subscription admin | Yes for ready route and runtime fixture hooks | No | Mutation and stale/not-found states are now reachable; screenshot evidence and mutation payload remain pending. |
| Platform taxonomy | Yes for ready route shells and runtime fixture hooks | No | Non-ready and mutation states are now reachable; screenshot evidence and taxonomy schema remain pending. |
| Platform access fallback | Yes for non-SysAdmin `/users` fallback | No by itself | This validates the boundary but does not satisfy family-specific visual state depth. |

V5 first-pass capture is complete for every currently reachable SysAdmin/platform runtime route, and the required fixture/test-hook exposure now exists. The remaining V5 work is capture/promotion work: record the new hook states as screenshots, keep backend/API schemas deferred, and only then promote rows to `Figma-ready`.

## Backend/API unknowns

- Platform user list/detail/create/edit schemas, role and tenant assignment payloads, favorite-request queue item schemas, approve/reject/reopen payloads, company/agency/subscription schemas, company subscription mutation payloads, and taxonomy list/detail/update payloads remain non-inventable.
- Current screenshots may show placeholder ids, counts, and generic state labels. Figma must label those as examples unless a backend contract confirms the fields.

## Figma-ready decision

| Area | Decision | Reason |
|---|---|---|
| Platform dashboard | Not yet | Platform navigation and landing are captured, but responsive and denied/unavailable platform variants are not complete. |
| Platform users | Runtime hook covered; not visual-ready | List/create/detail/edit route shells and URL return behavior are captured; non-ready states are hook-reachable, while screenshot evidence and backend field contracts remain pending. |
| Platform favorite requests | Runtime hook covered; not visual-ready | Pending queue/detail and approve readiness are captured; terminal/action states are hook-reachable, while screenshot evidence and action payload contracts remain pending. |
| Platform master data | Runtime hook covered; not visual-ready | Company/agency/subscription list/detail/edit shells are captured; non-ready states are hook-reachable, while screenshot evidence and entity-specific fields remain pending. |
| Company subscription admin | Runtime hook covered; not visual-ready | Ready state and route/mutation capability labels are captured; mutation-blocked/success/error/stale/not-found states are hook-reachable, while screenshot evidence and mutation payload remain pending. |
| Platform taxonomy | Runtime hook covered; not visual-ready | Sector/subsector ready states and parent targets are captured; mutation/not-found/stale/denied variants are hook-reachable, while screenshot evidence and taxonomy schema remain pending. |

V5 first-pass capture is complete for the runtime surface currently exposed by the app, but no V5 row should be promoted to `Figma-ready` from this pass alone.
